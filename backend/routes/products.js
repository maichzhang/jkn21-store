const router = require('express').Router();
const { pool } = require('../config/db');
const { auth, adminOnly, sellerOrAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET all products
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let where = ['p.is_active = true'];
    let params = [];
    let idx = 1;

    if (category) { where.push(`c.slug = $${idx++}`); params.push(category); }
    if (search) { where.push(`p.name ILIKE $${idx++}`); params.push(`%${search}%`); }

    const orderMap = { low: 'p.price ASC', high: 'p.price DESC', rating: 'p.rating DESC', sold: 'p.sold DESC' };
    const orderBy = orderMap[sort] || 'p.created_at DESC';

    params.push(limit, offset);
    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon,
             u.name as seller_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE ${where.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${where.join(' AND ')}
    `;

    const [products, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({
      products: products.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug, u.name as seller_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = $1 AND p.is_active = true
    `, [req.params.id]);

    if (!result.rows[0]) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    // Get reviews
    const reviews = await pool.query(`
      SELECT r.*, u.name as user_name, u.avatar as user_avatar
      FROM reviews r JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT 10
    `, [req.params.id]);

    res.json({ ...result.rows[0], reviews: reviews.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE product (seller/admin)
router.post('/', auth, sellerOrAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Nama dan harga wajib diisi' });

    const images = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const image = images[0] || null;

    const result = await pool.query(`
      INSERT INTO products (seller_id, category_id, name, description, price, stock, image, images)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [req.user.id, category_id, name, description, price, stock || 0, image, images]);

    res.status(201).json({ message: 'Produk berhasil ditambahkan', product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE product
router.put('/:id', auth, sellerOrAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, category_id, is_active } = req.body;
    const product = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
    if (!product.rows[0]) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    if (req.user.role !== 'admin' && product.rows[0].seller_id !== req.user.id)
      return res.status(403).json({ message: 'Akses ditolak' });

    const newImages = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const images = newImages.length ? newImages : product.rows[0].images;
    const image = images?.[0] || product.rows[0].image;

    await pool.query(`
      UPDATE products SET name=$2, description=$3, price=$4, stock=$5, category_id=$6,
      image=$7, images=$8, is_active=$9, updated_at=NOW() WHERE id=$1
    `, [req.params.id, name, description, price, stock, category_id, image, images, is_active !== undefined ? is_active : true]);

    res.json({ message: 'Produk berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE product
router.delete('/:id', auth, sellerOrAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active=false WHERE id=$1', [req.params.id]);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment, order_id } = req.body;
    await pool.query(
      'INSERT INTO reviews (user_id, product_id, order_id, rating, comment) VALUES ($1,$2,$3,$4,$5)',
      [req.user.id, req.params.id, order_id, rating, comment]
    );
    // Update product rating
    await pool.query(`
      UPDATE products SET
        rating = (SELECT AVG(rating) FROM reviews WHERE product_id=$1),
        rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id=$1)
      WHERE id=$1
    `, [req.params.id]);
    res.status(201).json({ message: 'Review berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET categories
router.get('/meta/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
