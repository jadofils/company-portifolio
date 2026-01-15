import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { sql } from '@/lib/database-vercel'

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

      // Check hero section limit
      if (section === 'hero') {
        const { rows: heroImages } = await sql`SELECT * FROM images WHERE section = 'hero' AND is_active = true ORDER BY uploaded_at ASC`
        if (heroImages.length >= 4) {
          const oldestImage = heroImages[0]
          await sql`UPDATE images SET is_active = false WHERE id = ${oldestImage.id}`
        }
      }

      // Save URL to database
      await sql`
        INSERT INTO images (filename, original_name, section, subsection, title, description, file_path, file_size, mime_type, is_url)
        VALUES ('url-image', ${title || 'URL Image'}, ${section}, ${subsection || null}, ${title || null}, ${description || null}, ${imageUrl}, 0, 'image/url', true)
      `

      return NextResponse.json({
        success: true,
        message: 'Image URL saved successfully',
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
      const { rows: heroImages } = await sql`SELECT * FROM images WHERE section = ${section} AND is_active = true ORDER BY uploaded_at ASC`
      if (heroImages.length >= 4) {
        const oldestImage = heroImages[0]
        await sql`UPDATE images SET is_active = false WHERE id = ${oldestImage.id}`
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
    await sql`
      INSERT INTO images (filename, original_name, section, subsection, title, description, file_path, file_size, mime_type, is_url)
      VALUES (${filename}, ${file.name}, ${section}, ${subsection || null}, ${title || null}, ${description || null}, ${publicPath}, ${file.size}, ${file.type}, false)
    `

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
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
    
    let images
    let retries = 3
    
    while (retries > 0) {
      try {
        if (section && subsection) {
          const { rows } = await sql`SELECT * FROM images WHERE is_active = true AND section = ${section} AND subsection = ${subsection} ORDER BY uploaded_at DESC`
          images = rows
        } else if (section) {
          const { rows } = await sql`SELECT * FROM images WHERE is_active = true AND section = ${section} ORDER BY uploaded_at DESC`
          images = rows
        } else {
          const { rows } = await sql`SELECT * FROM images WHERE is_active = true ORDER BY uploaded_at DESC`
          images = rows
        }
        break // Success, exit retry loop
      } catch (dbError) {
        retries--
        console.error(`Database error (${3 - retries}/3):`, dbError)
        if (retries === 0) {
          // Return empty array instead of error to prevent infinite loops
          console.log('All retries failed, returning empty images array')
          return NextResponse.json({ images: [] })
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({ images: images || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ images: [] }) // Return empty array instead of error
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { section, id } = await request.json()
    
    if (id) {
      await sql`UPDATE images SET is_active = false WHERE id = ${id}`
      return NextResponse.json({ success: true, message: 'Image deleted successfully' })
    }
    
    if (section) {
      await sql`UPDATE images SET is_active = false WHERE section = ${section}`
      return NextResponse.json({ success: true, message: 'Images deleted successfully' })
    }
    
    return NextResponse.json({ error: 'ID or section is required' }, { status: 400 })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete images' }, { status: 500 })
  }
}