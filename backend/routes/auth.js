const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Semua field wajib diisi' });
    if (password.length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter' });

    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows[0]) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const hash = await bcrypt.hash(password, 10);
    const userRole = ['seller'].includes(role) ? role : 'user';
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
      [name, email, hash, userRole]
    );

    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ message: 'Registrasi berhasil', user: result.rows[0], token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email=$1 AND is_active=true', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Email atau password salah' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const { password: _, ...safeUser } = user;
    res.json({ message: 'Login berhasil', user: safeUser, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, phone, address, avatar, created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

    const fields = ['name=$2', 'phone=$3', 'address=$4', 'updated_at=NOW()'];
    const values = [req.user.id, name, phone, address];

    if (avatar) { fields.push(`avatar=$${values.length + 1}`); values.push(avatar); }

    await pool.query(`UPDATE users SET ${fields.join(',')} WHERE id=$1`, values);
    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await pool.query('SELECT password FROM users WHERE id=$1', [req.user.id]);
    const valid = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!valid) return res.status(400).json({ message: 'Password lama salah' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2', [hash, req.user.id]);
    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
