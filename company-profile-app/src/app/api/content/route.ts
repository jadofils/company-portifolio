import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database-vercel'

// GET - Fetch content with optional section filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    
    let content
    if (section) {
      const { rows } = await sql`
        SELECT * FROM company_content WHERE section = ${section} ORDER BY subsection, updated_at DESC
      `
      content = rows
    } else {
      const { rows } = await sql`
        SELECT * FROM company_content ORDER BY section, subsection, updated_at DESC
      `
      content = rows
    }

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

    await sql`
      INSERT INTO company_content (section, subsection, title, content, image_url) 
      VALUES (${section}, ${subsection || null}, ${title}, ${content}, ${image_url || null})
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Content created successfully'
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

    await sql`
      UPDATE company_content 
      SET section = ${section}, subsection = ${subsection || null}, title = ${title}, 
          content = ${content}, image_url = ${image_url || null}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
    `

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

    await sql`DELETE FROM company_content WHERE id = ${id}`

    return NextResponse.json({ success: true, message: 'Content deleted successfully' })
  } catch (error) {
    console.error('Content deletion error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete content' }, { status: 500 })
  }
}