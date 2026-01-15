import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-vercel'

// GET - Fetch change logs with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const table = searchParams.get('table')
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM change_log'
    let params: any[] = []
    
    if (table) {
      query += ' WHERE table_name = $1'
      params.push(table)
      query += ' ORDER BY changed_at DESC LIMIT $2 OFFSET $3'
      params.push(limit, offset)
    } else {
      query += ' ORDER BY changed_at DESC LIMIT $1 OFFSET $2'
      params.push(limit, offset)
    }

    const changes = await db.query(query, params)

    // Get total count
    const countQuery = table 
      ? 'SELECT COUNT(*) as count FROM change_log WHERE table_name = $1'
      : 'SELECT COUNT(*) as count FROM change_log'
    const countParams = table ? [table] : []
    const totalResult = await db.query(countQuery, countParams)
    const total = parseInt(totalResult[0].count)

    return NextResponse.json({
      success: true,
      changes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Change log fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch change logs' }, { status: 500 })
  }
}