const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT id, name, email, role, avatar FROM users WHERE id=$1 AND is_active=true', [decoded.id]);
    if (!result.rows[0]) return res.status(401).json({ message: 'User tidak ditemukan' });

    req.user = result.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Akses ditolak' });
  next();
};

const sellerOrAdmin = (req, res, next) => {
  if (!['seller','admin'].includes(req.user?.role)) return res.status(403).json({ message: 'Akses ditolak' });
  next();
};

module.exports = { auth, adminOnly, sellerOrAdmin };
