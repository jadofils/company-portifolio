import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database-vercel'

export async function GET() {
  try {
    const { rows: settings } = await sql`SELECT * FROM settings`
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

    await sql`
      INSERT INTO settings (key, value, updated_at) 
      VALUES (${key}, ${value}, CURRENT_TIMESTAMP) 
      ON CONFLICT (key) 
      DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP
    `
    
    return NextResponse.json({ success: true, message: 'Setting updated successfully' })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json()
    console.log('Received settings for update:', settings)
    
    // Update each setting individually
    for (const [key, value] of Object.entries(settings)) {
      try {
        console.log(`Updating setting: ${key} = ${value}`)
        
        await sql`
          INSERT INTO settings (key, value, updated_at) 
          VALUES (${key}, ${String(value)}, CURRENT_TIMESTAMP) 
          ON CONFLICT (key) 
          DO UPDATE SET value = ${String(value)}, updated_at = CURRENT_TIMESTAMP
        `
      } catch (stmtError) {
        console.error(`Error updating ${key}:`, stmtError)
        const errorMessage = stmtError instanceof Error ? stmtError.message : 'Unknown error'
        return NextResponse.json({ error: `Failed to update ${key}: ${errorMessage}` }, { status: 500 })
      }
    }
    
    // Create response with cache-busting headers
    const response = NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      timestamp: Date.now()
    })
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Database error in PUT:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to update settings: ' + errorMessage }, { status: 500 })
  }
}