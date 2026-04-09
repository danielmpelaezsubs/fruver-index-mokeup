import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const anio = parseInt(searchParams.get('anio') || '2025')
  const nivel = searchParams.get('nivel') || ''
  const grupo = searchParams.get('grupo') || ''

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

  try {
    let query = supabase
      .from('ira_index')
      .select('producto, ciudad, grupo_alimentos, cv, rango_pct, nivel_riesgo, media, std, precio_mediana')
      .eq('anio', anio)
      .order('cv', { ascending: false })
      .limit(2000)

    if (nivel) query = query.eq('nivel_riesgo', nivel)
    if (grupo) query = query.eq('grupo_alimentos', grupo.toLowerCase())

    const { data, error } = await query
    if (error) throw error

    // Aggregate by product: average CV across cities
    const porProducto: Record<string, { producto: string; grupo_alimentos: string; cvs: number[]; nivel_riesgo: string }> = {}
    for (const r of data || []) {
      if (!porProducto[r.producto]) {
        porProducto[r.producto] = {
          producto: r.producto,
          grupo_alimentos: r.grupo_alimentos,
          cvs: [],
          nivel_riesgo: r.nivel_riesgo,
        }
      }
      porProducto[r.producto].cvs.push(r.cv)
    }

    const ranking = Object.values(porProducto).map((p) => {
      const cvPromedio = p.cvs.reduce((a, b) => a + b, 0) / p.cvs.length
      return {
        producto: p.producto,
        grupo_alimentos: p.grupo_alimentos,
        cv_promedio: Math.round(cvPromedio * 1000) / 1000,
        nivel_riesgo: cvPromedio > 0.30 ? 'ALTO' : cvPromedio > 0.15 ? 'MEDIO' : 'BAJO',
        ciudades: p.cvs.length,
      }
    }).sort((a, b) => b.cv_promedio - a.cv_promedio)

    const resumen = { ALTO: 0, MEDIO: 0, BAJO: 0 }
    for (const r of ranking) resumen[r.nivel_riesgo as keyof typeof resumen]++

    // Get list of grupos for filters
    const { data: gruposData } = await supabase
      .from('ira_index')
      .select('grupo_alimentos')
      .eq('anio', anio)
      .limit(1000)
    const gruposList = [...new Set((gruposData || []).map((g: any) => g.grupo_alimentos))].sort()

    return NextResponse.json({ success: true, data: ranking, resumen, anio, grupos: gruposList })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
