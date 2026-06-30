const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'jkn21_store',
  user: 'postgres',
  password: 'mrxm28'
});

bcrypt.hash('admin123', 10).then(hash => {
  pool.query('UPDATE users SET password=$1 WHERE email=$2', [hash, 'admin@jkn21.com'])
    .then(() => {
      console.log('✅ Password berhasil direset!');
      console.log('Login dengan: admin@jkn21.com / admin123');
      pool.end();
    });
});