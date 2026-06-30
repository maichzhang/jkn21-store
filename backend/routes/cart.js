const router = require('express').Router();
const { pool } = require('../config/db');
const { auth } = require('../middleware/auth');

// GET cart
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ci.id, ci.qty, p.id as product_id, p.name, p.price, p.image, p.stock
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1 AND p.is_active = true
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD to cart
router.post('/', auth, async (req, res) => {
  try {
    const { product_id, qty = 1 } = req.body;
    const product = await pool.query('SELECT stock FROM products WHERE id=$1 AND is_active=true', [product_id]);
    if (!product.rows[0]) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    if (product.rows[0].stock < qty) return res.status(400).json({ message: 'Stok tidak cukup' });

    await pool.query(`
      INSERT INTO cart_items (user_id, product_id, qty) VALUES ($1,$2,$3)
      ON CONFLICT (user_id, product_id) DO UPDATE SET qty = cart_items.qty + $3
    `, [req.user.id, product_id, qty]);

    res.json({ message: 'Produk ditambahkan ke keranjang' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE qty
router.put('/:id', auth, async (req, res) => {
  try {
    const { qty } = req.body;
    if (qty < 1) {
      await pool.query('DELETE FROM cart_items WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
      return res.json({ message: 'Item dihapus dari keranjang' });
    }
    await pool.query('UPDATE cart_items SET qty=$1 WHERE id=$2 AND user_id=$3', [qty, req.params.id, req.user.id]);
    res.json({ message: 'Keranjang diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REMOVE item
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Item dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CLEAR cart
router.delete('/', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id=$1', [req.user.id]);
    res.json({ message: 'Keranjang dikosongkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
