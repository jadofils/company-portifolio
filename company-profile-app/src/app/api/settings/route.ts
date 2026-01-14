import { NextRequest, NextResponse } from 'next/server'
import { db, initDatabase } from '@/lib/database-vercel'

initDatabase()

export async function GET() {
  try {
    const settings = await db.query('SELECT * FROM settings')
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

    await db.query(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [key, value]
    )
    
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
    
    // Use individual statements for better compatibility
    for (const [key, value] of Object.entries(settings)) {
      try {
        console.log(`Updating setting: ${key} = ${value}`)
        await db.query(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          [key, String(value)]
        )
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