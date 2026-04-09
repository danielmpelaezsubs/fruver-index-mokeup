'use client'

import { useEffect, useState } from 'react'

interface IocRecord {
  producto: string
  variacion_vs_historico_pct: number
  precio_actual: number
  precio_hist_media: number
  semaforo: string
  ciudad?: string
}

interface MirRecord {
  anio: number
  mir_pct: number
  ipc_dane_pct: number
  diferencia_pp: number
}

interface IocResumen {
  ROJO: number
  VERDE: number
  AMARILLO: number
  SIN_DATOS: number
}

export default function ReportePage() {
  const [iocData, setIocData] = useState<IocRecord[]>([])
  const [iocResumen, setIocResumen] = useState<IocResumen>({ ROJO: 0, VERDE: 0, AMARILLO: 0, SIN_DATOS: 0 })
  const [mirData, setMirData] = useState<MirRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const semanaActual = Math.ceil(
    (new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
    (7 * 24 * 60 * 60 * 1000)
  )

  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [iocRes, mirRes] = await Promise.all([
          fetch('/api/ioc'),
          fetch('/api/mir'),
        ])
        const iocJson = await iocRes.json()
        const mirJson = await mirRes.json()

        if (iocJson.success) {
          setIocData(iocJson.data || [])
          setIocResumen(iocJson.resumen || { ROJO: 0, VERDE: 0, AMARILLO: 0, SIN_DATOS: 0 })
        }
        if (mirJson.success) {
          const filtrado = (mirJson.data || []).filter((r: MirRecord) => r.anio >= 2023)
          setMirData(filtrado)
        }
      } catch (e: any) {
        setError('Error cargando datos. Verifique la conexión.')
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  const rojos = iocData
    .filter((r) => r.semaforo === 'ROJO')
    .sort((a, b) => b.variacion_vs_historico_pct - a.variacion_vs_historico_pct)
    .slice(0, 5)

  const verdes = iocData
    .filter((r) => r.semaforo === 'VERDE')
    .sort((a, b) => a.variacion_vs_historico_pct - b.variacion_vs_historico_pct)
    .slice(0, 5)

  const totalAnalizados = iocResumen.ROJO + iocResumen.VERDE + iocResumen.AMARILLO + iocResumen.SIN_DATOS

  const mirUltimo = mirData.length > 0 ? mirData[mirData.length - 1] : null

  const fmt = (n: number) =>
    n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`

  const fmtMoneda = (n: number) =>
    n > 0
      ? `$${n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : '—'

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { margin: 0; padding: 20px; }
          @page { margin: 15mm; size: A4 portrait; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; background: #f0f2f5; font-family: 'Segoe UI', Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 6px 10px; text-align: left; border-bottom: 1px solid #e8ecef; font-size: 12px; }
        th { background: #f8f9fa; font-weight: 600; color: #1a5276; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #fafbfc; }
      `}</style>

      {/* Botón imprimir — solo pantalla */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 999,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <a
          href="/"
          style={{
            padding: '8px 16px',
            background: '#fff',
            color: '#1a5276',
            border: '1px solid #1a5276',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          ← Volver
        </a>
        <button
          onClick={() => window.print()}
          style={{
            padding: '8px 20px',
            background: '#1a5276',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(26,82,118,0.3)',
          }}
        >
          🖨 Imprimir / Guardar PDF
        </button>
      </div>

      {/* Página principal */}
      <div
        className="page"
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: '32px 24px',
          background: '#fff',
          minHeight: '100vh',
        }}
      >
        {/* ENCABEZADO */}
        <div
          style={{
            borderBottom: '3px solid #1a5276',
            paddingBottom: 14,
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 26 }}>🥕</span>
                <div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: '#1a5276',
                      letterSpacing: '-0.3px',
                      lineHeight: 1.1,
                    }}
                  >
                    FRUVER INDEX
                  </div>
                  <div style={{ fontSize: 12, color: '#2980b9', fontWeight: 500 }}>
                    Inteligencia de Precios Agrícolas · Colombia
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#5d6d7e', marginTop: 6 }}>
                <strong>Reporte Semanal</strong> — Semana {semanaActual} · {fechaHoy}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 11,
                  color: '#7f8c8d',
                  marginBottom: 2,
                }}
              >
                fruverindex.com
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: '#aab7b8',
                }}
              >
                SIPSA-DANE · 3.1M registros
              </div>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  padding: '3px 8px',
                  background: '#eaf4fb',
                  color: '#1a5276',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  border: '1px solid #aed6f1',
                }}
              >
                CONFIDENCIAL — SOLO PARA PROSPECTOS
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#7f8c8d', fontSize: 14 }}>
            Cargando datos en tiempo real...
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fdf2f8',
              border: '1px solid #e74c3c',
              borderRadius: 6,
              padding: '10px 14px',
              color: '#e74c3c',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* SECCIÓN 1: KPIs */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1a5276',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>📊</span> Resumen Ejecutivo
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 10,
                }}
              >
                {[
                  {
                    valor: fmt(totalAnalizados),
                    etiqueta: 'Productos analizados',
                    color: '#1a5276',
                    bg: '#eaf4fb',
                    border: '#aed6f1',
                    icon: '📦',
                  },
                  {
                    valor: fmt(iocResumen.ROJO),
                    etiqueta: 'Precios altos',
                    color: '#e74c3c',
                    bg: '#fdedec',
                    border: '#f1948a',
                    icon: '🔴',
                  },
                  {
                    valor: fmt(iocResumen.VERDE),
                    etiqueta: 'Oportunidades',
                    color: '#27ae60',
                    bg: '#eafaf1',
                    border: '#82e0aa',
                    icon: '🟢',
                  },
                  {
                    valor: mirUltimo ? fmtPct(mirUltimo.mir_pct) : '—',
                    etiqueta: `Inflación MIR ${mirUltimo?.anio ?? ''}`,
                    color: mirUltimo && mirUltimo.mir_pct > 5 ? '#e74c3c' : mirUltimo && mirUltimo.mir_pct < 0 ? '#27ae60' : '#f39c12',
                    bg: '#fef9e7',
                    border: '#f9e79f',
                    icon: '📈',
                  },
                ].map((kpi, i) => (
                  <div
                    key={i}
                    style={{
                      background: kpi.bg,
                      border: `1px solid ${kpi.border}`,
                      borderRadius: 8,
                      padding: '12px 14px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 16, marginBottom: 2 }}>{kpi.icon}</div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: kpi.color,
                        lineHeight: 1.1,
                        marginBottom: 4,
                      }}
                    >
                      {kpi.valor}
                    </div>
                    <div style={{ fontSize: 10, color: '#5d6d7e', fontWeight: 600, textTransform: 'uppercase' }}>
                      {kpi.etiqueta}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 2: TOP 5 ALERTAS */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#e74c3c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  paddingBottom: 6,
                  borderBottom: '2px solid #f1948a',
                }}
              >
                <span>🔴</span> Top 5 Alertas — Productos más caros esta semana
              </div>
              {rojos.length === 0 ? (
                <p style={{ color: '#7f8c8d', fontSize: 12, fontStyle: 'italic' }}>
                  Sin datos de alertas disponibles.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Producto</th>
                      <th style={{ textAlign: 'center' }}>Variación</th>
                      <th style={{ textAlign: 'right' }}>Precio Actual</th>
                      <th style={{ textAlign: 'right' }}>Precio Histórico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rojos.map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: '#7f8c8d', fontWeight: 600, width: 28 }}>{i + 1}</td>
                        <td style={{ fontWeight: 600, color: '#1a5276', textTransform: 'capitalize' }}>
                          {r.producto}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              background: '#fdedec',
                              color: '#e74c3c',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontWeight: 700,
                              fontSize: 12,
                              border: '1px solid #f1948a',
                            }}
                          >
                            {fmtPct(r.variacion_vs_historico_pct)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#e74c3c' }}>
                          {fmtMoneda(r.precio_actual)}
                        </td>
                        <td style={{ textAlign: 'right', color: '#7f8c8d' }}>
                          {fmtMoneda(r.precio_hist_media)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* SECCIÓN 3: TOP 5 OPORTUNIDADES */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#27ae60',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  paddingBottom: 6,
                  borderBottom: '2px solid #82e0aa',
                }}
              >
                <span>🟢</span> Top 5 Oportunidades — Compre ahora
              </div>
              {verdes.length === 0 ? (
                <p style={{ color: '#7f8c8d', fontSize: 12, fontStyle: 'italic' }}>
                  Sin datos de oportunidades disponibles.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Producto</th>
                      <th style={{ textAlign: 'center' }}>Descuento</th>
                      <th style={{ textAlign: 'right' }}>Precio Actual</th>
                      <th style={{ textAlign: 'right' }}>Precio Histórico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verdes.map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: '#7f8c8d', fontWeight: 600, width: 28 }}>{i + 1}</td>
                        <td style={{ fontWeight: 600, color: '#1a5276', textTransform: 'capitalize' }}>
                          {r.producto}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              background: '#eafaf1',
                              color: '#27ae60',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontWeight: 700,
                              fontSize: 12,
                              border: '1px solid #82e0aa',
                            }}
                          >
                            {fmtPct(r.variacion_vs_historico_pct)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#27ae60' }}>
                          {fmtMoneda(r.precio_actual)}
                        </td>
                        <td style={{ textAlign: 'right', color: '#7f8c8d' }}>
                          {fmtMoneda(r.precio_hist_media)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* SECCIÓN 4: MIR — INFLACIÓN REAL */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#8e44ad',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  paddingBottom: 6,
                  borderBottom: '2px solid #d2b4de',
                }}
              >
                <span>📈</span> Inflación Real vs IPC Oficial DANE — Últimos 3 años
              </div>
              {mirData.length === 0 ? (
                <p style={{ color: '#7f8c8d', fontSize: 12, fontStyle: 'italic' }}>
                  Sin datos MIR disponibles.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Año</th>
                      <th style={{ textAlign: 'center' }}>MIR Fruver Index</th>
                      <th style={{ textAlign: 'center' }}>IPC Oficial DANE</th>
                      <th style={{ textAlign: 'center' }}>Diferencia</th>
                      <th>Interpretación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mirData.map((r, i) => {
                      const diff = r.diferencia_pp ?? (r.mir_pct - r.ipc_dane_pct)
                      const signo = diff > 0 ? '+' : ''
                      const colorDiff = diff > 0 ? '#e74c3c' : '#27ae60'
                      const nota =
                        diff > 5
                          ? 'SIPSA detecta más inflación que DANE'
                          : diff < 0
                          ? 'Deflación en mayoreo · compresión de márgenes'
                          : 'Convergencia con IPC oficial'
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 700, color: '#1a5276' }}>{r.anio}</td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: r.mir_pct < 0 ? '#27ae60' : r.mir_pct > 10 ? '#e74c3c' : '#2980b9' }}>
                            {fmtPct(r.mir_pct)}
                          </td>
                          <td style={{ textAlign: 'center', color: '#5d6d7e' }}>
                            {fmtPct(r.ipc_dane_pct)}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: colorDiff }}>
                            {signo}{diff.toFixed(1)} pp
                          </td>
                          <td style={{ fontSize: 11, color: '#7f8c8d', fontStyle: 'italic' }}>
                            {nota}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
              <div style={{ marginTop: 6, fontSize: 10, color: '#aab7b8', textAlign: 'right' }}>
                MIR v2.0 · 363 productos · 8 grupos · pesos IPC DANE 2018 · base 2013=100
              </div>
            </div>

            {/* SECCIÓN 5: CONTACTO */}
            <div
              style={{
                marginTop: 24,
                borderTop: '2px solid #1a5276',
                paddingTop: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#1a5276',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>💬</span> Para más información y acceso completo
                </div>
                <div style={{ fontSize: 12, color: '#2c3e50', lineHeight: 1.7 }}>
                  <strong>Daniel Mauricio Morales Peláez</strong> · CEO Fruver Index<br />
                  WhatsApp: <strong>+57 3XX XXX XXXX</strong><br />
                  <strong>fruverindex.com</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '10px 18px',
                    background: '#1a5276',
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    textAlign: 'center',
                  }}
                >
                  Plan Básico desde<br />
                  <span style={{ fontSize: 20, fontWeight: 800 }}>$500.000 COP</span><br />
                  <span style={{ fontSize: 10, opacity: 0.85 }}>/ mes · sin permanencia</span>
                </div>
              </div>
            </div>

            {/* PIE DE PÁGINA */}
            <div
              style={{
                marginTop: 16,
                fontSize: 9,
                color: '#bfc9ca',
                textAlign: 'center',
                paddingTop: 10,
                borderTop: '1px solid #eaf0f6',
              }}
            >
              Fuente: Fruver Index / SIPSA-DANE · 3.1M registros · 87 ciudades · 402 productos · 2013–2026 ·
              Este reporte es confidencial y ha sido generado automáticamente por Fruver Index.
            </div>
          </>
        )}
      </div>
    </>
  )
}
