import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const producto = searchParams.get('producto') || ''
  const grupo = searchParams.get('grupo') || ''

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

  try {
    // Get list of products
    const { data: prods } = await supabase
      .from('iep_index')
      .select('producto, grupo_alimentos')
      .limit(5000)

    const productosMap: Record<string, string> = {}
    for (const p of prods || []) productosMap[p.producto] = p.grupo_alimentos
    const productos = Object.keys(productosMap).sort()

    if (!producto) {
      return NextResponse.json({ success: true, productos, data: [] })
    }

    let query = supabase
      .from('iep_index')
      .select('producto, semana, grupo_alimentos, precio_hist_semana, precio_anual, iep, tipo_semana')
      .eq('producto', producto.toLowerCase())
      .order('semana', { ascending: true })
      .limit(60)

    const { data, error } = await query
    if (error) throw error

    // Stats
    const precios = (data || []).map((r: any) => r.precio_hist_semana).filter(Boolean)
    const min = Math.min(...precios)
    const max = Math.max(...precios)
    const semanaMin = data?.find((r: any) => r.precio_hist_semana === min)?.semana
    const semanaMax = data?.find((r: any) => r.precio_hist_semana === max)?.semana
    const ahorro = max > 0 ? Math.round((max - min) / max * 100) : 0

    return NextResponse.json({
      success: true,
      productos,
      data: data || [],
      stats: { min, max, semanaMin, semanaMax, ahorro }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
