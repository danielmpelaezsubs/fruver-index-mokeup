import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface IocRecord {
  producto: string
  semaforo: string
  variacion_vs_historico_pct: number
  precio_actual: number
  precio_hist_media: number
  ciudad?: string
}

interface MirRecord {
  anio: number
  mir_pct: number
  ipc_dane_pct: number
  diferencia_pp?: number
}

// Datos MIR de fallback (MIR v2.0 — 363 productos, 8 grupos, pesos IPC)
const MIR_FALLBACK: MirRecord[] = [
  { anio: 2013, mir_pct: 0,    ipc_dane_pct: 0,    diferencia_pp: 0 },
  { anio: 2014, mir_pct: 5.2,  ipc_dane_pct: 4.7,  diferencia_pp: 0.5 },
  { anio: 2015, mir_pct: 12.4, ipc_dane_pct: 10.8, diferencia_pp: 1.6 },
  { anio: 2016, mir_pct: 18.1, ipc_dane_pct: 14.2, diferencia_pp: 3.9 },
  { anio: 2017, mir_pct: 4.3,  ipc_dane_pct: 4.1,  diferencia_pp: 0.2 },
  { anio: 2018, mir_pct: 3.8,  ipc_dane_pct: 3.2,  diferencia_pp: 0.6 },
  { anio: 2019, mir_pct: 4.1,  ipc_dane_pct: 3.8,  diferencia_pp: 0.3 },
  { anio: 2020, mir_pct: 8.9,  ipc_dane_pct: 7.5,  diferencia_pp: 1.4 },
  { anio: 2021, mir_pct: 14.2, ipc_dane_pct: 12.4, diferencia_pp: 1.8 },
  { anio: 2022, mir_pct: 31.8, ipc_dane_pct: 27.8, diferencia_pp: 4.0 },
  { anio: 2023, mir_pct: 8.1,  ipc_dane_pct: 6.9,  diferencia_pp: 1.2 },
  { anio: 2024, mir_pct: -1.1, ipc_dane_pct: 2.1,  diferencia_pp: -3.2 },
  { anio: 2025, mir_pct: 3.2,  ipc_dane_pct: 2.9,  diferencia_pp: 0.3 },
]

function calcularSemana(): number {
  const ahora = new Date()
  const inicioAnio = new Date(ahora.getFullYear(), 0, 1)
  return Math.ceil((ahora.getTime() - inicioAnio.getTime()) / (7 * 24 * 60 * 60 * 1000))
}

function formatearTextoWhatsApp(
  semana: number,
  alertasRojas: IocRecord[],
  oportunidades: IocRecord[],
  mirUltimo: MirRecord | null
): string {
  const anio = new Date().getFullYear()

  const lineasRojas = alertasRojas
    .map((r) => {
      const pct = r.variacion_vs_historico_pct
      const signo = pct > 0 ? '+' : ''
      const nombre = r.producto.charAt(0).toUpperCase() + r.producto.slice(1)
      return `• ${nombre}: ${signo}${pct.toFixed(1)}% sobre histórico`
    })
    .join('\n')

  const lineasVerdes = oportunidades
    .map((r) => {
      const pct = r.variacion_vs_historico_pct
      const signo = pct > 0 ? '+' : ''
      const nombre = r.producto.charAt(0).toUpperCase() + r.producto.slice(1)
      return `• ${nombre}: ${signo}${pct.toFixed(1)}% bajo histórico`
    })
    .join('\n')

  const mirLinea = mirUltimo
    ? `\n📊 *Inflación MIR ${mirUltimo.anio}:* ${mirUltimo.mir_pct > 0 ? '+' : ''}${mirUltimo.mir_pct.toFixed(1)}% vs IPC DANE: ${mirUltimo.ipc_dane_pct.toFixed(1)}%`
    : ''

  return (
    `🥕 *FRUVER INDEX — Semana ${semana} de ${anio}*\n` +
    `Inteligencia de Precios Agrícolas · Colombia\n\n` +
    `🔴 *MÁS CAROS esta semana:*\n${lineasRojas || '• Sin alertas críticas'}\n\n` +
    `🟢 *OPORTUNIDADES:*\n${lineasVerdes || '• Sin oportunidades destacadas'}` +
    mirLinea +
    `\n\n📲 Acceso completo en *fruverindex.com*\n` +
    `Plan Básico desde $500.000 COP/mes`
  )
}

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const semana = calcularSemana()
  const fecha = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  try {
    // ── Consultar IOC (top alertas y oportunidades) ──────────────────────────
    const { data: iocRaw, error: iocError } = await supabase
      .from('ioc_index')
      .select(
        'producto, semaforo, variacion_vs_historico_pct, precio_actual, precio_hist_media, ciudad'
      )
      .order('variacion_vs_historico_pct', { ascending: false })
      .limit(500)

    if (iocError) throw iocError

    // Deduplicar por producto (mayor variación absoluta)
    const porProducto: Record<string, IocRecord> = {}
    for (const r of iocRaw || []) {
      const key = r.producto
      if (
        !porProducto[key] ||
        Math.abs(r.variacion_vs_historico_pct) >
          Math.abs(porProducto[key].variacion_vs_historico_pct)
      ) {
        porProducto[key] = r
      }
    }
    const deduplicado = Object.values(porProducto)

    const alertasRojas: IocRecord[] = deduplicado
      .filter((r) => r.semaforo === 'ROJO')
      .sort((a, b) => b.variacion_vs_historico_pct - a.variacion_vs_historico_pct)
      .slice(0, 5)

    const oportunidades: IocRecord[] = deduplicado
      .filter((r) => r.semaforo === 'VERDE')
      .sort((a, b) => a.variacion_vs_historico_pct - b.variacion_vs_historico_pct)
      .slice(0, 5)

    // ── Consultar MIR (último año disponible) ───────────────────────────────
    let mirUltimo: MirRecord | null = null

    const { data: mirRaw, error: mirError } = await supabase
      .from('fruver_mir')
      .select('anio, mir_pct, ipc_dane_pct, diferencia_pp')
      .order('anio', { ascending: false })
      .limit(1)

    if (!mirError && mirRaw && mirRaw.length > 0) {
      mirUltimo = mirRaw[0] as MirRecord
    } else {
      // Fallback al dato más reciente del MIR calculado
      mirUltimo = MIR_FALLBACK[MIR_FALLBACK.length - 1]
    }

    // ── Construir respuesta ─────────────────────────────────────────────────
    const resumenTexto = formatearTextoWhatsApp(semana, alertasRojas, oportunidades, mirUltimo)

    return NextResponse.json({
      success: true,
      semana,
      fecha,
      alertas_rojas: alertasRojas.map((r) => ({
        producto: r.producto,
        variacion_pct: r.variacion_vs_historico_pct,
        precio_actual: r.precio_actual,
        precio_hist: r.precio_hist_media,
        ciudad: r.ciudad ?? null,
      })),
      oportunidades: oportunidades.map((r) => ({
        producto: r.producto,
        variacion_pct: r.variacion_vs_historico_pct,
        precio_actual: r.precio_actual,
        precio_hist: r.precio_hist_media,
        ciudad: r.ciudad ?? null,
      })),
      mir_ultimo: mirUltimo
        ? {
            anio: mirUltimo.anio,
            mir_pct: mirUltimo.mir_pct,
            ipc_dane_pct: mirUltimo.ipc_dane_pct,
            diferencia_pp: mirUltimo.diferencia_pp ?? mirUltimo.mir_pct - mirUltimo.ipc_dane_pct,
          }
        : null,
      resumen_texto: resumenTexto,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        semana,
        fecha,
      },
      { status: 500 }
    )
  }
}
