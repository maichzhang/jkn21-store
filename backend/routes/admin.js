const router = require('express').Router();
const { pool } = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [revenue, orders, products, users, recentOrders, topProducts] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(total),0) as total FROM orders WHERE status IN ('paid','processed','shipped','delivered')"),
      pool.query('SELECT COUNT(*) as total FROM orders'),
      pool.query('SELECT COUNT(*) as total FROM products WHERE is_active=true'),
      pool.query("SELECT COUNT(*) as total FROM users WHERE role != 'admin'"),
      pool.query(`
        SELECT o.id, o.total, o.status, o.created_at, u.name as user_name
        FROM orders o JOIN users u ON o.user_id=u.id
        ORDER BY o.created_at DESC LIMIT 5
      `),
      pool.query(`
        SELECT p.id, p.name, p.image, p.sold, p.price
        FROM products p ORDER BY p.sold DESC LIMIT 5
      `)
    ]);

    res.json({
      revenue: parseInt(revenue.rows[0].total),
      orders: parseInt(orders.rows[0].total),
      products: parseInt(products.rows[0].total),
      users: parseInt(users.rows[0].total),
      recentOrders: recentOrders.rows,
      topProducts: topProducts.rows
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    if (role) { where.push(`role=$${params.length+1}`); params.push(role); }
    params.push(limit, offset);

    const result = await pool.query(`
      SELECT id, name, email, role, phone, is_active, created_at
      FROM users ${where.length ? 'WHERE '+where.join(' AND ') : ''}
      ORDER BY created_at DESC
      LIMIT $${params.length-1} OFFSET $${params.length}
    `, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle user active
router.put('/users/:id/toggle', auth, adminOnly, async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = NOT is_active WHERE id=$1', [req.params.id]);
    res.json({ message: 'Status user diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change user role
router.put('/users/:id/role', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user','seller','admin'].includes(role)) return res.status(400).json({ message: 'Role tidak valid' });
    await pool.query('UPDATE users SET role=$1 WHERE id=$2', [role, req.params.id]);
    res.json({ message: 'Role user diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
