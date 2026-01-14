import bcrypt from 'bcryptjs'

// Vercel serverless functions don't support better-sqlite3
// Use environment-based database selection
const isProduction = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'

if (isVercel) {
  throw new Error('better-sqlite3 is not supported on Vercel. Please use Vercel Postgres, Supabase, or PlanetScale instead.')
}

// Only use SQLite in development
let db: any = null
if (!isVercel) {
  const Database = require('better-sqlite3')
  const path = require('path')
  const dbPath = path.join(process.cwd(), 'company.db')
  db = new Database(dbPath)
}

// Initialize database tables
export function initDatabase() {
  // Users table for admin login
  db.exec(`
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
  db.exec(`
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

  // Images table for section images
  db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      section TEXT NOT NULL,
      subsection TEXT,
      title TEXT,
      description TEXT,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      is_url BOOLEAN DEFAULT 0,
      uploaded_by INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    )
  `)

  // Settings table for company configuration
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Navigation items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS nav_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      parent_id INTEGER,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Company content table (for dynamic content management)
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      subsection TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Publications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      pdf_path TEXT,
      published_date DATE,
      created_by INTEGER,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Initialize default settings
  const settingsExist = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number }
  if (settingsExist.count === 0) {
    const defaultSettings = [
      ['company_name', 'MineralsCorp'],
      ['company_logo', '/logo.png'],
      ['company_address', '123 Mining District\nKigali, Rwanda'],
      ['company_phone', '+250 788 123 456'],
      ['company_email', 'info@mineralscorp.com'],
      ['footer_description', 'Leading mineral processing company specializing in sustainable mining practices and high-quality mineral extraction.'],
      ['facebook_url', '#'],
      ['twitter_url', '#'],
      ['linkedin_url', '#'],
      ['instagram_url', '#'],
      ['youtube_url', '#']
    ]
    
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
    defaultSettings.forEach(([key, value]) => {
      insertSetting.run(key, value)
    })
  }

  // Initialize default navigation
  const navExists = db.prepare('SELECT COUNT(*) as count FROM nav_items').get() as { count: number }
  if (navExists.count === 0) {
    const defaultNav = [
      ['Home', 'home', null, 1],
      ['About Us', 'about', null, 2],
      ['Services', 'services', null, 3],
      ['Products', 'products', null, 4],
      ['Policies', 'policies', null, 5],
      ['Contact', 'contact', null, 6]
    ]
    
    const insertNav = db.prepare('INSERT INTO nav_items (title, slug, parent_id, order_index) VALUES (?, ?, ?, ?)')
    defaultNav.forEach(([title, slug, parent_id, order_index]) => {
      insertNav.run(title, slug, parent_id, order_index)
    })
  }

  // Create default admin users if not exists
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  
  if (adminExists.count === 0) {
    console.log('Seeding users with bcrypt hashed passwords...')
    const users = [
      { email: 'jasezikeye50@gmail.com', password: 'Sezikeye@12', name: 'Jase Zikeye' },
      { email: 'yvesmuhire@gmail.com', password: 'Muhire@12', name: 'Yves Muhire' },
      { email: 'admin@gmail.com', password: 'Admin@12', name: 'Administrator' }
    ]
    
    const insertUser = db.prepare(`
      INSERT INTO users (email, password, name, role) 
      VALUES (?, ?, ?, ?)
    `)
    
    users.forEach(user => {
      const hashedPassword = bcrypt.hashSync(user.password, 10)
      console.log(`Seeding user: ${user.email} with hash: ${hashedPassword.substring(0, 20)}...`)
      insertUser.run(user.email, hashedPassword, user.name, 'admin')
    })
    console.log('Users seeded successfully!')
  } else {
    console.log(`Found ${adminExists.count} existing users in database`)
  }
}

export default db