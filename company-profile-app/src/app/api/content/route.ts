import { NextRequest, NextResponse } from 'next/server'
import { db, initDatabase, trackChange } from '@/lib/database-vercel'
import { cache, cacheKeys } from '@/lib/cache'

// Initialize database
initDatabase()

// GET - Fetch all content with caching
export async function GET() {
  try {
    const cacheKey = cacheKeys.content()
    const content = await db.query(
      'SELECT * FROM company_content ORDER BY section, subsection, updated_at DESC',
      [],
      cacheKey
    )

    return NextResponse.json({ success: true, content })
  } catch (error) {
    console.error('Content fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch content' }, { status: 500 })
  }
}

// POST - Create new content with change tracking
export async function POST(request: NextRequest) {
  try {
    const { section, subsection, title, content, image_url } = await request.json()

    if (!section || !title || !content) {
      return NextResponse.json({ success: false, error: 'Section, title, and content are required' }, { status: 400 })
    }

    const result = await db.query(
      'INSERT INTO company_content (section, subsection, title, content, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [section, subsection || null, title, content, image_url || null]
    )

    // Track change
    await trackChange('company_content', result[0].id, 'INSERT', null, { section, subsection, title, content, image_url })
    
    // Invalidate cache
    cache.clear()

    return NextResponse.json({ 
      success: true, 
      message: 'Content created successfully',
      id: result[0].id
    })
  } catch (error) {
    console.error('Content creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create content' }, { status: 500 })
  }
}

// PUT - Update existing content with change tracking
export async function PUT(request: NextRequest) {
  try {
    const { id, section, subsection, title, content, image_url } = await request.json()

    if (!id || !section || !title || !content) {
      return NextResponse.json({ success: false, error: 'ID, section, title, and content are required' }, { status: 400 })
    }

    // Get old data for tracking
    const oldData = await db.query('SELECT * FROM company_content WHERE id = $1', [id])
    
    await db.query(
      'UPDATE company_content SET section = $1, subsection = $2, title = $3, content = $4, image_url = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
      [section, subsection || null, title, content, image_url || null, id]
    )

    // Track change
    await trackChange('company_content', id, 'UPDATE', oldData[0], { section, subsection, title, content, image_url })
    
    // Invalidate cache
    cache.clear()

    return NextResponse.json({ success: true, message: 'Content updated successfully' })
  } catch (error) {
    console.error('Content update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update content' }, { status: 500 })
  }
}

// DELETE - Delete content with change tracking
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'Content ID is required' }, { status: 400 })
    }

    // Get old data for tracking
    const oldData = await db.query('SELECT * FROM company_content WHERE id = $1', [id])
    
    await db.query('DELETE FROM company_content WHERE id = $1', [id])

    // Track change
    await trackChange('company_content', id, 'DELETE', oldData[0], null)
    
    // Invalidate cache
    cache.clear()

    return NextResponse.json({ success: true, message: 'Content deleted successfully' })
  } catch (error) {
    console.error('Content deletion error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete content' }, { status: 500 })
  }
}