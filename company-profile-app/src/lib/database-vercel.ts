import bcrypt from 'bcryptjs'

// Environment detection
const isVercel = process.env.VERCEL === '1'
const isProduction = process.env.NODE_ENV === 'production'

// Database interface
interface DatabaseAdapter {
  query: (sql: string, params?: any[]) => Promise<any>
  exec: (sql: string) => Promise<void>
}

// SQLite adapter for local development
class SQLiteAdapter implements DatabaseAdapter {
  private db: any
  
  constructor() {
    if (!isVercel) {
      const Database = require('better-sqlite3')
      const path = require('path')
      const dbPath = path.join(process.cwd(), 'company.db')
      this.db = new Database(dbPath)
    }
  }
  
  async query(sql: string, params: any[] = []): Promise<any> {
    if (sql.toLowerCase().includes('select')) {
      return this.db.prepare(sql).all(...params)
    } else {
      return this.db.prepare(sql).run(...params)
    }
  }
  
  async exec(sql: string): Promise<void> {
    this.db.exec(sql)
  }
}

// Vercel Postgres adapter
class PostgresAdapter implements DatabaseAdapter {
  private sql: any
  
  constructor() {
    const { sql } = require('@vercel/postgres')
    this.sql = sql
  }
  
  async query(sqlQuery: string, params: any[] = []): Promise<any> {
    // Convert SQLite syntax to PostgreSQL
    const pgQuery = sqlQuery
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
      .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
      .replace(/BOOLEAN/g, 'BOOLEAN')
    
    const { rows } = await this.sql.query(pgQuery, params)
    return rows
  }
  
  async exec(sqlQuery: string): Promise<void> {
    await this.query(sqlQuery)
  }
}

// Create database instance based on environment
const db: DatabaseAdapter = isVercel ? new PostgresAdapter() : new SQLiteAdapter()

// Initialize database tables
export async function initDatabase() {
  try {
    // Users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Contact messages table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'unread'
      )
    `)

    // Settings table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Check if default data exists
    const userCount = await db.query('SELECT COUNT(*) as count FROM users')
    const count = Array.isArray(userCount) ? userCount[0].count : userCount.count
    
    if (count === 0) {
      const users = [
        { email: 'jasezikeye50@gmail.com', password: 'Sezikeye@12', name: 'Jase Zikeye' },
        { email: 'yvesmuhire@gmail.com', password: 'Muhire@12', name: 'Yves Muhire' },
        { email: 'admin@gmail.com', password: 'Admin@12', name: 'Administrator' }
      ]
      
      for (const user of users) {
        const hashedPassword = bcrypt.hashSync(user.password, 10)
        await db.query(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [user.email, hashedPassword, user.name, 'admin']
        )
      }
    }

  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

export { db }