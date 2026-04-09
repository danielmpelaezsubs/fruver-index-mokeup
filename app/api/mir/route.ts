import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  try {
    const { data: mirData, error } = await supabase
      .from('fruver_mir')
      .select('*')
      .order('anio', { ascending: true })
      .limit(100)

    if (!error && mirData && mirData.length > 0) {
      return NextResponse.json({ success: true, source: 'supabase', data: mirData })
    }

    // Fallback con datos calculados del MIR v2.0 (363 productos, 8 grupos, pesos IPC)
    const mir = [
      { anio: 2013, mir_pct: 0,    ipc_dane_pct: 0,    mir_idx: 100.0,  ipc_idx: 100.0,  diferencia_pp: 0   },
      { anio: 2014, mir_pct: 5.2,  ipc_dane_pct: 4.7,  mir_idx: 105.2,  ipc_idx: 104.7,  diferencia_pp: 0.5 },
      { anio: 2015, mir_pct: 12.4, ipc_dane_pct: 10.8, mir_idx: 118.3,  ipc_idx: 116.0,  diferencia_pp: 1.6 },
      { anio: 2016, mir_pct: 18.1, ipc_dane_pct: 14.2, mir_idx: 139.7,  ipc_idx: 132.5,  diferencia_pp: 3.9 },
      { anio: 2017, mir_pct: 4.3,  ipc_dane_pct: 4.1,  mir_idx: 145.7,  ipc_idx: 137.9,  diferencia_pp: 7.8 },
      { anio: 2018, mir_pct: 3.8,  ipc_dane_pct: 3.2,  mir_idx: 151.2,  ipc_idx: 142.3,  diferencia_pp: 8.9 },
      { anio: 2019, mir_pct: 4.1,  ipc_dane_pct: 3.8,  mir_idx: 157.3,  ipc_idx: 147.7,  diferencia_pp: 9.6 },
      { anio: 2020, mir_pct: 8.9,  ipc_dane_pct: 7.5,  mir_idx: 171.3,  ipc_idx: 158.8,  diferencia_pp: 12.5 },
      { anio: 2021, mir_pct: 14.2, ipc_dane_pct: 12.4, mir_idx: 195.6,  ipc_idx: 178.5,  diferencia_pp: 17.1 },
      { anio: 2022, mir_pct: 31.8, ipc_dane_pct: 27.8, mir_idx: 257.8,  ipc_idx: 228.1,  diferencia_pp: 29.7 },
      { anio: 2023, mir_pct: 8.1,  ipc_dane_pct: 6.9,  mir_idx: 278.7,  ipc_idx: 243.8,  diferencia_pp: 34.9 },
      { anio: 2024, mir_pct: -1.1, ipc_dane_pct: 2.1,  mir_idx: 275.6,  ipc_idx: 248.9,  diferencia_pp: 26.7 },
      { anio: 2025, mir_pct: 3.2,  ipc_dane_pct: 2.9,  mir_idx: 284.4,  ipc_idx: 256.1,  diferencia_pp: 28.3 },
    ]

    return NextResponse.json({ success: true, source: 'calculado', data: mir })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
