import { NextRequest, NextResponse } from 'next/server'
import { db, initDatabase, trackChange } from '@/lib/database-vercel'
import { cache, cacheKeys } from '@/lib/cache'

initDatabase()

export async function GET() {
  try {
    const cacheKey = cacheKeys.settings()
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

    // Get old value for tracking
    const oldData = await db.query('SELECT * FROM settings WHERE key = $1', [key])
    
    await db.query(
      'INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
      [key, value]
    )
    
    await trackChange('settings', null, oldData.length ? 'UPDATE' : 'INSERT', oldData[0] || null, { key, value })
    cache.delete(cacheKeys.settings())
    
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
    
    // Use individual statements for better compatibility
    for (const [key, value] of Object.entries(settings)) {
      try {
        console.log(`Updating setting: ${key} = ${value}`)
        
        // Get old value for tracking
        const oldData = await db.query('SELECT * FROM settings WHERE key = $1', [key])
        
        await db.query(
          'INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
          [key, String(value)]
        )
        
        await trackChange('settings', null, oldData.length ? 'UPDATE' : 'INSERT', oldData[0] || null, { key, value })
      } catch (stmtError) {
        console.error(`Error updating ${key}:`, stmtError)
        const errorMessage = stmtError instanceof Error ? stmtError.message : 'Unknown error'
        return NextResponse.json({ error: `Failed to update ${key}: ${errorMessage}` }, { status: 500 })
      }
    }
    
    cache.delete(cacheKeys.settings())
    
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