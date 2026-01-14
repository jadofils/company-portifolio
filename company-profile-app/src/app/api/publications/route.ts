import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import db, { initDatabase } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'

initDatabase()

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    const contentType = request.headers.get('content-type')
    
    // Handle form submission (text content)
    if (contentType?.includes('application/json')) {
      const { title, description, content, published_date } = await request.json()
      
      if (!title) {
        return NextResponse.json(
          { error: 'Title is required' },
          { status: 400 }
        )
      }

      const stmt = db.prepare(`
        INSERT INTO publications (title, description, content, published_date, created_by)
        VALUES (?, ?, ?, ?, ?)
      `)

      const result = stmt.run(title, description || null, content || null, published_date || new Date().toISOString().split('T')[0], currentUser?.id || null)

      return NextResponse.json({
        success: true,
        message: 'Publication created successfully',
        id: result.lastInsertRowid
      })
    }
    
    // Handle PDF upload
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const published_date = formData.get('published_date') as string

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      )
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'publications')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(uploadsDir, filename)
    const publicPath = `/uploads/publications/${filename}`

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO publications (title, description, pdf_path, published_date, created_by)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      title,
      description || null,
      publicPath,
      published_date || new Date().toISOString().split('T')[0],
      currentUser?.id || null
    )

    return NextResponse.json({
      success: true,
      message: 'Publication uploaded successfully',
      id: result.lastInsertRowid,
      path: publicPath
    })

  } catch (error) {
    console.error('Publication error:', error)
    return NextResponse.json(
      { error: 'Failed to create publication' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    const { searchParams } = new URL(request.url)
    const manage = searchParams.get('manage') === 'true'

    let query = `
      SELECT p.*, u.name as created_by_name 
      FROM publications p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.is_active = 1
    `
    const params: any[] = []

    // If user is logged in and managing, show only their publications
    if (currentUser && manage) {
      query += ' AND p.created_by = ?'
      params.push(currentUser.id)
    }

    query += ' ORDER BY p.published_date DESC, p.created_at DESC'

    const publications = db.prepare(query).all(...params)

    return NextResponse.json({ publications })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const stmt = db.prepare('UPDATE publications SET is_active = 0 WHERE id = ?')
    stmt.run(id)
    
    return NextResponse.json({ success: true, message: 'Publication deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete publication' }, { status: 500 })
  }
}