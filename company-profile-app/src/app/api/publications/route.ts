import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { db, initDatabase, trackChange } from '@/lib/database-vercel'
import { cache, cacheKeys } from '@/lib/cache'

initDatabase()

export async function POST(request: NextRequest) {
  try {
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

      const result = await db.query(
        'INSERT INTO publications (title, description, content, published_date) VALUES ($1, $2, $3, $4) RETURNING id',
        [title, description || null, content || null, published_date || new Date().toISOString().split('T')[0]]
      )

      await trackChange('publications', result[0].id, 'INSERT', null, { title, description, content, published_date })
      cache.delete(cacheKeys.publications())

      return NextResponse.json({
        success: true,
        message: 'Publication created successfully'
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
    const result = await db.query(
      'INSERT INTO publications (title, description, pdf_path, published_date) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, description || null, publicPath, published_date || new Date().toISOString().split('T')[0]]
    )

    await trackChange('publications', result[0].id, 'INSERT', null, { title, description, pdf_path: publicPath, published_date })
    cache.delete(cacheKeys.publications())

    return NextResponse.json({
      success: true,
      message: 'Publication uploaded successfully',
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
    const cacheKey = cacheKeys.publications()
    const publications = await db.query(
      'SELECT * FROM publications WHERE is_active = true ORDER BY published_date DESC, created_at DESC'
    )

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

    // Get old data for tracking
    const oldData = await db.query('SELECT * FROM publications WHERE id = $1', [id])

    await db.query('UPDATE publications SET is_active = false WHERE id = $1', [id])
    
    await trackChange('publications', id, 'UPDATE', oldData[0], { ...oldData[0], is_active: false })
    cache.delete(cacheKeys.publications())
    
    return NextResponse.json({ success: true, message: 'Publication deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete publication' }, { status: 500 })
  }
}