import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { db, initDatabase } from '@/lib/database-vercel'
import { getCurrentUser } from '@/lib/auth'

initDatabase()

// Ensure is_url column exists (PostgreSQL compatible)
try {
  // This will be handled by the database adapter
  console.log('Database schema will be managed by the adapter')
} catch (error) {
  console.error('Database migration error:', error)
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    const contentType = request.headers.get('content-type')
    
    // Handle URL submission
    if (contentType?.includes('application/json')) {
      const { imageUrl, section, subsection, title, description } = await request.json()
      
      if (!imageUrl || !section) {
        return NextResponse.json(
          { error: 'Image URL and section are required' },
          { status: 400 }
        )
      }

      // Validate URL format
      try {
        new URL(imageUrl)
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        )
      }

      // Check hero section limit and remove oldest if needed
      if (section === 'hero') {
        const heroImages = db.prepare('SELECT * FROM images WHERE section = ? AND is_active = 1 ORDER BY uploaded_at ASC').all('hero')
        if (heroImages.length >= 4) {
          const oldestImage = heroImages[0] as any
          db.prepare('UPDATE images SET is_active = 0 WHERE id = ?').run(oldestImage.id)
        }
      }

      // Save URL to database
      const stmt = db.prepare(`
        INSERT INTO images (filename, original_name, section, subsection, title, description, file_path, file_size, mime_type, is_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const result = stmt.run(
        'url-image',
        title || 'URL Image',
        section,
        subsection || null,
        title || null,
        description || null,
        imageUrl,
        0,
        'image/url',
        1
      )

      return NextResponse.json({
        success: true,
        message: 'Image URL saved successfully',
        id: result.lastInsertRowid,
        path: imageUrl
      })
    }
    
    // Handle file upload
    const formData = await request.formData()
    const file = formData.get('file') as File
    const section = formData.get('section') as string
    const subsection = formData.get('subsection') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file || !section) {
      return NextResponse.json(
        { error: 'File and section are required' },
        { status: 400 }
      )
    }

    // Check hero section limit and remove oldest if needed
    if (section === 'hero') {
      const heroImages = db.prepare('SELECT * FROM images WHERE section = ? AND is_active = 1 ORDER BY uploaded_at ASC').all('hero')
      if (heroImages.length >= 4) {
        const oldestImage = heroImages[0] as any
        db.prepare('UPDATE images SET is_active = 0 WHERE id = ?').run(oldestImage.id)
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', section)
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(uploadsDir, filename)
    const publicPath = `/uploads/${section}/${filename}`

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO images (filename, original_name, section, subsection, title, description, file_path, file_size, mime_type, is_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      filename,
      file.name,
      section,
      subsection || null,
      title || null,
      description || null,
      publicPath,
      file.size,
      file.type,
      0
    )

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      id: result.lastInsertRowid,
      path: publicPath
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Check if it's a database column error
    if (error instanceof Error && error.message.includes('no such column: is_url')) {
      return NextResponse.json(
        { error: 'Database schema error. Please restart the server.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    const subsection = searchParams.get('subsection')

    let query = 'SELECT * FROM images WHERE is_active = 1'
    const params: any[] = []

    if (section) {
      query += ' AND section = ?'
      params.push(section)
    }

    if (subsection) {
      query += ' AND subsection = ?'
      params.push(subsection)
    }

    query += ' ORDER BY uploaded_at DESC'

    const images = db.prepare(query).all(...params)

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { section, id } = await request.json()
    
    if (id) {
      // Delete individual image by ID
      const stmt = db.prepare('UPDATE images SET is_active = 0 WHERE id = ?')
      stmt.run(id)
      return NextResponse.json({ success: true, message: 'Image deleted successfully' })
    }
    
    if (section) {
      // Delete all images in section
      const stmt = db.prepare('UPDATE images SET is_active = 0 WHERE section = ?')
      stmt.run(section)
      return NextResponse.json({ success: true, message: 'Images deleted successfully' })
    }
    
    return NextResponse.json({ error: 'ID or section is required' }, { status: 400 })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete images' }, { status: 500 })
  }
}