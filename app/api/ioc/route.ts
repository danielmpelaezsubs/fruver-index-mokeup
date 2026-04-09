import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ciudad = searchParams.get('ciudad')
  const semaforo = searchParams.get('semaforo') // ROJO | VERDE | AMARILLO
  const grupo = searchParams.get('grupo')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  try {
    let query = supabase
      .from('ioc_index')
      .select('producto, ciudad, precio_actual, grupo_alimentos, precio_hist_media, z_score, semaforo, variacion_vs_historico_pct, fecha_actualizacion')
      .order('variacion_vs_historico_pct', { ascending: false })
      .limit(1000)

    if (ciudad) query = query.eq('ciudad', ciudad.toLowerCase())
    if (semaforo) query = query.eq('semaforo', semaforo)
    if (grupo) query = query.eq('grupo_alimentos', grupo.toLowerCase())

    const { data, error } = await query
    if (error) throw error

    // Resumen por semáforo
    const resumen = { ROJO: 0, AMARILLO: 0, VERDE: 0, SIN_DATOS: 0 }
    for (const r of data || []) {
      resumen[r.semaforo as keyof typeof resumen] = (resumen[r.semaforo as keyof typeof resumen] || 0) + 1
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      resumen,
      total: data?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
