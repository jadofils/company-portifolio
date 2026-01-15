import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { db, initDatabase, trackChange } from '@/lib/database-vercel'
import { cache, cacheKeys } from '@/lib/cache'

initDatabase()

export async function POST(request: NextRequest) {
  try {
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
        const heroImages = await db.query('SELECT * FROM images WHERE section = $1 AND is_active = true ORDER BY uploaded_at ASC', [section])
        if (heroImages.length >= 4) {
          const oldestImage = heroImages[0]
          await db.query('UPDATE images SET is_active = false WHERE id = $1', [oldestImage.id])
          await trackChange('images', oldestImage.id, 'UPDATE', oldestImage, { ...oldestImage, is_active: false })
        }
      }

      // Save URL to database
      const result = await db.query(`
        INSERT INTO images (filename, original_name, section, subsection, title, description, file_path, file_size, mime_type, is_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
      `, [
        'url-image',
        title || 'URL Image',
        section,
        subsection || null,
        title || null,
        description || null,
        imageUrl,
        0,
        'image/url',
        true
      ])

      await trackChange('images', result[0].id, 'INSERT', null, { imageUrl, section, subsection, title, description })

      return NextResponse.json({
        success: true,
        message: 'Image URL saved successfully',
        id: result[0].id,
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
      const heroImages = await db.query('SELECT * FROM images WHERE section = $1 AND is_active = true ORDER BY uploaded_at ASC', [section])
      if (heroImages.length >= 4) {
        const oldestImage = heroImages[0]
        await db.query('UPDATE images SET is_active = false WHERE id = $1', [oldestImage.id])
        await trackChange('images', oldestImage.id, 'UPDATE', oldestImage, { ...oldestImage, is_active: false })
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
    const result = await db.query(`
      INSERT INTO images (filename, original_name, section, subsection, title, description, file_path, file_size, mime_type, is_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
    `, [
      filename,
      file.name,
      section,
      subsection || null,
      title || null,
      description || null,
      publicPath,
      file.size,
      file.type,
      false
    ])

    await trackChange('images', result[0].id, 'INSERT', null, { filename, section, subsection, title, description })

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      id: result[0].id,
      path: publicPath
    })

  } catch (error) {
    console.error('Upload error:', error)
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
    
    let query = 'SELECT * FROM images WHERE is_active = true'
    const params: any[] = []
    let paramIndex = 1

    if (section) {
      query += ` AND section = $${paramIndex++}`
      params.push(section)
    }

    if (subsection) {
      query += ` AND subsection = $${paramIndex++}`
      params.push(subsection)
    }

    query += ' ORDER BY uploaded_at DESC'

    const images = await db.query(query, params)

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
      // Get old data for tracking
      const oldData = await db.query('SELECT * FROM images WHERE id = $1', [id])
      
      // Delete individual image by ID
      await db.query('UPDATE images SET is_active = false WHERE id = $1', [id])
      
      await trackChange('images', id, 'UPDATE', oldData[0], { ...oldData[0], is_active: false })
      
      return NextResponse.json({ success: true, message: 'Image deleted successfully' })
    }
    
    if (section) {
      // Delete all images in section
      const oldData = await db.query('SELECT * FROM images WHERE section = $1', [section])
      await db.query('UPDATE images SET is_active = false WHERE section = $1', [section])
      
      for (const image of oldData) {
        await trackChange('images', image.id, 'UPDATE', image, { ...image, is_active: false })
      }
      
      return NextResponse.json({ success: true, message: 'Images deleted successfully' })
    }
    
    return NextResponse.json({ error: 'ID or section is required' }, { status: 400 })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete images' }, { status: 500 })
  }
}