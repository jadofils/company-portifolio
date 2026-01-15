import bcrypt from 'bcryptjs'
import { sql } from '@vercel/postgres'

// Initialize database tables for Vercel Postgres
export async function initDatabase() {
  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Contact messages table
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'unread'
      )
    `

    // Company content table
    await sql`
      CREATE TABLE IF NOT EXISTS company_content (
        id SERIAL PRIMARY KEY,
        section VARCHAR(50) NOT NULL,
        subsection VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Images table
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        section VARCHAR(50) NOT NULL,
        subsection VARCHAR(50),
        title VARCHAR(255),
        description TEXT,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        is_url BOOLEAN DEFAULT false,
        uploaded_by INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `

    // Settings table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Publications table
    await sql`
      CREATE TABLE IF NOT EXISTS publications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        pdf_path VARCHAR(500),
        published_date DATE,
        created_by INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Seed default data
    await seedDefaultData()

  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

async function seedDefaultData() {
  // Check and seed users
  const { rows: userCount } = await sql`SELECT COUNT(*) as count FROM users`
  if (userCount[0].count === '0') {
    const users = [
      { email: 'jasezikeye50@gmail.com', password: 'Sezikeye@12', name: 'Jase Zikeye' },
      { email: 'yvesmuhire@gmail.com', password: 'Muhire@12', name: 'Yves Muhire' },
      { email: 'admin@gmail.com', password: 'Admin@12', name: 'Administrator' }
    ]
    
    for (const user of users) {
      const hashedPassword = bcrypt.hashSync(user.password, 10)
      await sql`
        INSERT INTO users (email, password, name, role) 
        VALUES (${user.email}, ${hashedPassword}, ${user.name}, 'admin')
      `
    }
  }

  // Check and seed settings
  const { rows: settingsCount } = await sql`SELECT COUNT(*) as count FROM settings`
  if (settingsCount[0].count === '0') {
    const defaultSettings = [
      ['company_name', 'MineralsCorp'],
      ['company_logo', '/logo.png'],
      ['company_address', '123 Mining District\nKigali, Rwanda'],
      ['company_phone', '+250 788 123 456'],
      ['company_email', 'info@mineralscorp.com']
    ]
    
    for (const [key, value] of defaultSettings) {
      await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value})`
    }
  }
}

export { sql }