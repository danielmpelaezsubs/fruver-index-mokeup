import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ciudad = searchParams.get('ciudad') || 'Bogotá'
  const anio = searchParams.get('anio') || '2026'
  const limit = searchParams.get('limit') || '100'

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    )

    const { data, error } = await supabase
      .from('fruver_maestro')
      .select('*')
      .eq('ciudad', ciudad)
      .eq('anio', parseInt(anio))
      .limit(parseInt(limit))
      .order('semana', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error: any) {
    console.error('Error fetching datos:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error fetching data',
      },
      { status: 500 }
    )
  }
}
