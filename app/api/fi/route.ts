import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ciudad = searchParams.get('ciudad')
  const anio = searchParams.get('anio')
  const tipo = searchParams.get('tipo') // 'serie' | 'ranking' | 'ciudades'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  try {
    if (tipo === 'ranking') {
      // Top ciudades por FI promedio en un año
      const anioNum = parseInt(anio || '2025')
      const { data, error } = await supabase
        .from('fi_index')
        .select('ciudad, fi_valor, productos_cubiertos')
        .eq('anio', anioNum)
        .order('fi_valor', { ascending: false })
        .limit(5000)

      if (error) throw error

      // Agrupar por ciudad y promediar
      const agrupado: Record<string, { suma: number; count: number; productos: number }> = {}
      for (const r of data || []) {
        if (!agrupado[r.ciudad]) agrupado[r.ciudad] = { suma: 0, count: 0, productos: 0 }
        agrupado[r.ciudad].suma += r.fi_valor
        agrupado[r.ciudad].count += 1
        agrupado[r.ciudad].productos = r.productos_cubiertos
      }
      const ranking = Object.entries(agrupado)
        .map(([ciudad, v]) => ({
          ciudad,
          fi_promedio: Math.round(v.suma / v.count),
          productos_cubiertos: v.productos,
        }))
        .sort((a, b) => b.fi_promedio - a.fi_promedio)

      return NextResponse.json({ success: true, data: ranking, anio: anioNum })
    }

    if (tipo === 'ciudades') {
      // Traer todas las filas de fi_index para extraer ciudades únicas
      // fi_index tiene ~21k filas — caben en una sola consulta
      const { data, error } = await supabase
        .from('fi_index')
        .select('ciudad')
        .limit(25000)

      if (error) throw error
      const ciudades = [...new Set((data || []).map((d: any) => d.ciudad))].sort()
      return NextResponse.json({ success: true, data: ciudades })
    }

    // Serie temporal de una ciudad
    let query = supabase
      .from('fi_index')
      .select('anio, semana, fi_valor, productos_cubiertos, precio_promedio')
      .order('anio', { ascending: true })
      .order('semana', { ascending: true })
      .limit(5000)

    if (ciudad) query = query.eq('ciudad', ciudad.toLowerCase())
    if (anio) query = query.eq('anio', parseInt(anio))

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data: data || [], ciudad, anio })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
