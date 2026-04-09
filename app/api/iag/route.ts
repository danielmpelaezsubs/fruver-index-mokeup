import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const anio = parseInt(searchParams.get('anio') || '2025')
  const grupo = searchParams.get('grupo') || ''
  const minPct = parseFloat(searchParams.get('min_pct') || '0')

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

  try {
    let query = supabase
      .from('iag_index')
      .select('producto, grupo_alimentos, precio_min, precio_max, precio_media, iag_pct, ciudad_mas_cara, precio_ciudad_max, ciudad_mas_barata, precio_ciudad_min, oportunidad, n_ciudades')
      .eq('anio', anio)
      .gte('iag_pct', minPct)
      .order('iag_pct', { ascending: false })
      .limit(200)

    if (grupo) query = query.eq('grupo_alimentos', grupo.toLowerCase())

    const { data, error } = await query
    if (error) throw error

    // Also get list of grupos
    const { data: grupos } = await supabase
      .from('iag_index')
      .select('grupo_alimentos')
      .eq('anio', anio)
      .limit(1000)
    const gruposList = [...new Set((grupos || []).map((g: any) => g.grupo_alimentos))].sort()

    return NextResponse.json({ success: true, data: data || [], grupos: gruposList, anio })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
