import bcrypt from 'bcryptjs'
import { sql } from '@vercel/postgres'

// Database interface
interface DatabaseAdapter {
  query: (sqlQuery: string, params?: any[]) => Promise<any>
  exec: (sqlQuery: string) => Promise<void>
}

// Vercel Postgres adapter
class PostgresAdapter implements DatabaseAdapter {
  async query(sqlQuery: string, params: any[] = []): Promise<any> {
    // Convert SQLite syntax to PostgreSQL
    const pgQuery = sqlQuery
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
      .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
      .replace(/BOOLEAN/g, 'BOOLEAN')
    
    const { rows } = await sql.query(pgQuery, params)
    return rows
  }
  
  async exec(sqlQuery: string): Promise<void> {
    await this.query(sqlQuery)
  }
}

// Use Postgres adapter (configured for Vercel)
const db: DatabaseAdapter = new PostgresAdapter()

// Change tracking table
export async function initDatabase() {
  try {
    // Change tracking table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS change_log (
        id SERIAL PRIMARY KEY,
        table_name VARCHAR(50) NOT NULL,
        record_id INTEGER,
        action VARCHAR(10) NOT NULL,
        old_data JSONB,
        new_data JSONB,
        changed_by VARCHAR(100),
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Contact messages table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'unread'
      )
    `)

    // Company content table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS company_content (
        id SERIAL PRIMARY KEY,
        section VARCHAR(50) NOT NULL,
        subsection VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Images table
    await db.exec(`
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
    `)

    // Settings table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Publications table
    await db.exec(`
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
    `)

    // Seed default data
    await seedDefaultData()

  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

// Track changes function
export async function trackChange(tableName: string, recordId: number | null, action: string, oldData: any = null, newData: any = null, changedBy: string = 'system') {
  try {
    await db.query(
      'INSERT INTO change_log (table_name, record_id, action, old_data, new_data, changed_by) VALUES ($1, $2, $3, $4, $5, $6)',
      [tableName, recordId, action, JSON.stringify(oldData), JSON.stringify(newData), changedBy]
    )
  } catch (error) {
    console.error('Change tracking error:', error)
  }
}

async function seedDefaultData() {
  // Check and seed users
  const userCount = await db.query('SELECT COUNT(*) as count FROM users')
  if (userCount[0].count === '0') {
    const users = [
      { 
        email: process.env.ADMIN_EMAIL_1 || 'admin1@example.com', 
        password: process.env.ADMIN_PASSWORD_1 || 'DefaultPass123!', 
        name: process.env.ADMIN_NAME_1 || 'Admin User 1' 
      },
      { 
        email: process.env.ADMIN_EMAIL_2 || 'admin2@example.com', 
        password: process.env.ADMIN_PASSWORD_2 || 'DefaultPass123!', 
        name: process.env.ADMIN_NAME_2 || 'Admin User 2' 
      },
      { 
        email: process.env.ADMIN_EMAIL_3 || 'admin@example.com', 
        password: process.env.ADMIN_PASSWORD_3 || 'DefaultPass123!', 
        name: process.env.ADMIN_NAME_3 || 'Administrator' 
      }
    ]
    
    for (const user of users) {
      const hashedPassword = bcrypt.hashSync(user.password, 10)
      await db.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        [user.email, hashedPassword, user.name, 'admin']
      )
    }
  }

  // Check and seed settings
  const settingsCount = await db.query('SELECT COUNT(*) as count FROM settings')
  if (settingsCount[0].count === '0') {
    const defaultSettings = [
      ['company_name', 'MineralsCorp'],
      ['company_logo', '/logo.png'],
      ['company_address', '123 Mining District\nKigali, Rwanda'],
      ['company_phone', '+250 788 123 456'],
      ['company_email', 'info@mineralscorp.com']
    ]
    
    for (const [key, value] of defaultSettings) {
      await db.query('INSERT INTO settings (key, value) VALUES ($1, $2)', [key, value])
    }
  }
}

export { db }