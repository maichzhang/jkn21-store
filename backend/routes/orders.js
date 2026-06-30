const router = require('express').Router();
const { pool } = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// CREATE order + Midtrans payment
router.post('/', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { items, shipping_name, shipping_phone, shipping_address, notes } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Keranjang kosong' });

    // Validate stock & calculate total
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const p = await client.query('SELECT * FROM products WHERE id=$1 AND is_active=true FOR UPDATE', [item.product_id]);
      if (!p.rows[0]) throw new Error(`Produk ID ${item.product_id} tidak ditemukan`);
      if (p.rows[0].stock < item.qty) throw new Error(`Stok ${p.rows[0].name} tidak cukup`);
      total += p.rows[0].price * item.qty;
      orderItems.push({ ...p.rows[0], qty: item.qty });
    }

    const orderId = 'JKN-' + Date.now();

    // Create Midtrans transaction
    const midtransParam = {
      transaction_details: { order_id: orderId, gross_amount: total },
      customer_details: {
        first_name: shipping_name || req.user.name,
        phone: shipping_phone,
        shipping_address: { address: shipping_address }
      },
      item_details: orderItems.map(i => ({
        id: i.id.toString(),
        price: i.price,
        quantity: i.qty,
        name: i.name.substring(0, 50)
      }))
    };

    const snapToken = await snap.createTransaction(midtransParam);

    // Insert order
    await client.query(`
      INSERT INTO orders (id, user_id, total, status, snap_token, payment_url, shipping_name, shipping_phone, shipping_address, notes)
      VALUES ($1,$2,$3,'pending',$4,$5,$6,$7,$8,$9)
    `, [orderId, req.user.id, total, snapToken.token, snapToken.redirect_url, shipping_name, shipping_phone, shipping_address, notes]);

    // Insert order items & reduce stock
    for (const item of orderItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, product_image, price, qty) VALUES ($1,$2,$3,$4,$5,$6)',
        [orderId, item.id, item.name, item.image, item.price, item.qty]
      );
      await client.query('UPDATE products SET stock=stock-$1 WHERE id=$2', [item.qty, item.id]);
    }

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id=$1', [req.user.id]);

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Order berhasil dibuat',
      order_id: orderId,
      snap_token: snapToken.token,
      payment_url: snapToken.redirect_url,
      total
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

// GET my orders
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT o.*, json_agg(json_build_object(
        'product_id', oi.product_id, 'product_name', oi.product_name,
        'product_image', oi.product_image, 'price', oi.price, 'qty', oi.qty
      )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json(orders.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all orders (admin)
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    if (status) { where.push(`o.status=$${params.length+1}`); params.push(status); }
    params.push(limit, offset);

    const result = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email,
        json_agg(json_build_object('product_name',oi.product_name,'qty',oi.qty,'price',oi.price)) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
      LIMIT $${params.length-1} OFFSET $${params.length}
    `, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE order status (admin)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2', [status, req.params.id]);
    res.json({ message: 'Status pesanan diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Midtrans webhook notification
router.post('/webhook/midtrans', async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body);
    const { order_id, transaction_status, fraud_status } = notification;

    let status = 'pending';
    if (transaction_status === 'capture' && fraud_status === 'accept') status = 'paid';
    else if (transaction_status === 'settlement') status = 'paid';
    else if (['cancel','deny','expire'].includes(transaction_status)) status = 'cancelled';

    await pool.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2', [status, order_id]);
    if (status === 'paid') {
      // Restore stock if cancelled — handled separately
    }
    res.json({ message: 'OK' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
