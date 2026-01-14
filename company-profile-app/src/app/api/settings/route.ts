import { NextRequest, NextResponse } from 'next/server'
import db, { initDatabase } from '@/lib/database'

initDatabase()

export async function GET() {
  try {
    const settings = db.prepare('SELECT * FROM settings').all()
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {})
    
    return NextResponse.json({ settings: settingsObj })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json()
    
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `)
    
    stmt.run(key, value)
    
    return NextResponse.json({ success: true, message: 'Setting updated successfully' })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Ensure database is initialized
    initDatabase()
    
    const settings = await request.json()
    console.log('Received settings for update:', settings)
    
    // Check if database is accessible
    try {
      db.prepare('SELECT 1').get()
    } catch (dbError) {
      console.error('Database not accessible:', dbError)
      return NextResponse.json({ error: 'Database not accessible' }, { status: 500 })
    }
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `)
    
    // Use individual statements instead of transaction for better compatibility
    for (const [key, value] of Object.entries(settings)) {
      try {
        console.log(`Updating setting: ${key} = ${value}`)
        stmt.run(key, String(value))
      } catch (stmtError) {
        console.error(`Error updating ${key}:`, stmtError)
        const errorMessage = stmtError instanceof Error ? stmtError.message : 'Unknown error'
        return NextResponse.json({ error: `Failed to update ${key}: ${errorMessage}` }, { status: 500 })
      }
    }
    
    return NextResponse.json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Database error in PUT:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to update settings: ' + errorMessage }, { status: 500 })
  }
}