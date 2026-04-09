import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ciudad = searchParams.get('ciudad')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  try {
    // Usar vista pre-agregada v_ipaa_tendencia (14 filas, mucho más rápido)
    const { data: tendenciaData, error } = await supabase
      .from('v_ipaa_tendencia')
      .select('anio, ipaa_promedio, idx_precios, idx_smmlv, ciudades, estado')
      .order('anio', { ascending: true })

    if (error) throw error

    const tendencia = (tendenciaData || []).map((r: any) => ({
      anio: r.anio,
      ipaa_mediana: r.ipaa_promedio,
      idx_precios: r.idx_precios,
      idx_smmlv: r.idx_smmlv,
      ciudades: r.ciudades,
      estado: r.estado,
    }))

    // Serie de ciudad específica si la piden
    let serieCiudad = null
    if (ciudad) {
      const { data: ciudadData } = await supabase
        .from('ipaa_index')
        .select('anio, ipaa')
        .eq('ciudad', ciudad.toLowerCase())
        .order('anio', { ascending: true })
        .limit(2000)

      const porAnio: Record<number, number[]> = {}
      for (const r of ciudadData || []) {
        if (!porAnio[r.anio]) porAnio[r.anio] = []
        if (r.ipaa != null) porAnio[r.anio].push(r.ipaa)
      }
      serieCiudad = Object.entries(porAnio)
        .map(([anio, vals]) => ({
          anio: parseInt(anio),
          ipaa: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
        }))
        .sort((a, b) => a.anio - b.anio)
    }

    return NextResponse.json({ success: true, tendencia, serieCiudad, ciudad })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
