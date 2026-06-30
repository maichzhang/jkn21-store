const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','seller','admin')),
        phone VARCHAR(20),
        address TEXT,
        avatar VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        icon VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        category_id INTEGER REFERENCES categories(id),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price BIGINT NOT NULL,
        stock INTEGER DEFAULT 0,
        sold INTEGER DEFAULT 0,
        image VARCHAR(255),
        images TEXT[],
        rating DECIMAL(2,1) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        qty INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(20) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total BIGINT NOT NULL,
        status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','paid','processed','shipped','delivered','cancelled')),
        payment_method VARCHAR(50),
        payment_token VARCHAR(255),
        payment_url VARCHAR(500),
        snap_token VARCHAR(255),
        shipping_name VARCHAR(100),
        shipping_phone VARCHAR(20),
        shipping_address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(20) REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(200),
        product_image VARCHAR(255),
        price BIGINT NOT NULL,
        qty INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        order_id VARCHAR(20) REFERENCES orders(id),
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Seed categories
      INSERT INTO categories (name, slug, icon) VALUES
        ('Fashion', 'fashion', '👔'),
        ('Elektronik', 'elektronik', '💻'),
        ('Digital', 'digital', '📱'),
        ('Jasa', 'jasa', '🔧'),
        ('Makanan', 'makanan', '🍜')
      ON CONFLICT (slug) DO NOTHING;

      -- Seed admin user (password: admin123)
      INSERT INTO users (name, email, password, role) VALUES
        ('Admin JKN21', 'admin@jkn21.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
