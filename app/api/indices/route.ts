import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo') || 'FI'
  const ciudad = searchParams.get('ciudad')
  const anio = searchParams.get('anio') || '2026'

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    )

    let query = supabase
      .from('fruver_indices')
      .select('*')
      .eq('tipo_indice', tipo)
      .eq('anio', parseInt(anio))

    if (ciudad) {
      query = query.eq('ciudad', ciudad)
    }

    const { data, error } = await query.order('semana', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      tipo_indice: tipo,
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error: any) {
    console.error('Error fetching indices:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error fetching indices',
      },
      { status: 500 }
    )
  }
}
