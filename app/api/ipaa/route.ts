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
    // Tendencia nacional anual del IPAA
    const { data, error } = await supabase
      .from('ipaa_index')
      .select('anio, ciudad, ipaa, idx_precios, idx_smmlv, interpretacion')
      .order('anio', { ascending: true })
      .limit(5000)

    if (error) throw error

    // Agrupar por año — mediana nacional
    const porAnio: Record<number, number[]> = {}
    for (const r of data || []) {
      if (!porAnio[r.anio]) porAnio[r.anio] = []
      if (r.ipaa != null) porAnio[r.anio].push(r.ipaa)
    }
    const tendencia = Object.entries(porAnio)
      .map(([anio, vals]) => {
        const sorted = [...vals].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        const mediana = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
        return {
          anio: parseInt(anio),
          ipaa_mediana: Math.round(mediana * 10) / 10,
          estado: mediana >= 105 ? 'MEJORO' : mediana >= 95 ? 'ESTABLE' : 'DETERIORO',
        }
      })
      .sort((a, b) => a.anio - b.anio)

    // Si pidieron ciudad específica, también devolver serie de esa ciudad
    let serieCiudad = null
    if (ciudad) {
      const ciudadData = (data || [])
        .filter((r: any) => r.ciudad === ciudad.toLowerCase())
      const porAnioCiudad: Record<number, number[]> = {}
      for (const r of ciudadData) {
        if (!porAnioCiudad[r.anio]) porAnioCiudad[r.anio] = []
        if (r.ipaa != null) porAnioCiudad[r.anio].push(r.ipaa)
      }
      serieCiudad = Object.entries(porAnioCiudad)
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
