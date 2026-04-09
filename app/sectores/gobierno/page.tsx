'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from '../../dashboards/fruver-index/dashboard.module.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface IpaaRow {
  anio: number
  ipaa_mediana: number
  idx_precios: number
  idx_smmlv: number
  ciudades: number
  estado: string
}

interface MirRow {
  anio: number
  mir_pct: number
  ipc_dane_pct: number
  diferencia_pp: number
}

interface FiCiudad {
  ciudad: string
  fi_promedio: number
  productos_cubiertos: number
}

interface IocItem {
  producto: string
  ciudad: string
  semaforo: string
  variacion_vs_historico_pct: number
  grupo_alimentos: string
  precio_actual: number
  precio_hist_media: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function capitalize(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function fmtPeso(v: number) {
  return '$' + Math.round(v).toLocaleString('es-CO')
}

function fmtPct(v: number, signo = true) {
  const s = signo && v > 0 ? '+' : ''
  return s + v.toFixed(1) + '%'
}

function estadoColor(estado: string) {
  if (!estado) return '#7f8c8d'
  const e = estado.toUpperCase()
  if (e.includes('MEJOR')) return '#27ae60'
  if (e.includes('DETERIORO')) return '#e74c3c'
  return '#f39c12'
}

function estadoEmoji(estado: string) {
  if (!estado) return '—'
  const e = estado.toUpperCase()
  if (e.includes('MEJOR')) return '↑ Mejora'
  if (e.includes('DETERIORO')) return '↓ Deterioro'
  return '→ Estable'
}

function quienDetecto(mir: number, ipc: number) {
  if (mir > ipc + 0.5) return { texto: 'SIPSA más alto', color: '#e74c3c' }
  if (ipc > mir + 0.5) return { texto: 'DANE más alto', color: '#2980b9' }
  return { texto: 'Similar', color: '#7f8c8d' }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionTitle({ emoji, title, sub }: { emoji: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a5276', margin: 0 }}>
        {emoji} {title}
      </h2>
      {sub && <p style={{ fontSize: '0.83rem', color: '#7f8c8d', margin: '0.25rem 0 0' }}>{sub}</p>}
    </div>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.chartCard} style={{ marginBottom: '1.5rem' }}>
      {children}
    </div>
  )
}

function InsightBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#eaf2fb',
      border: '1px solid #aed6f1',
      borderLeft: '4px solid #2980b9',
      borderRadius: '8px',
      padding: '0.85rem 1.1rem',
      fontSize: '0.86rem',
      color: '#1a5276',
      marginTop: '1rem',
      lineHeight: 1.5,
    }}>
      {children}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function GobiernoPage() {
  const [ipaaData, setIpaaData] = useState<IpaaRow[]>([])
  const [mirData, setMirData] = useState<MirRow[]>([])
  const [fiRanking, setFiRanking] = useState<FiCiudad[]>([])
  const [iocRojo, setIocRojo] = useState<IocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/ipaa').then(r => r.json()),
      fetch('/api/mir').then(r => r.json()),
      fetch('/api/fi?tipo=ranking&anio=2025').then(r => r.json()),
      fetch('/api/ioc?semaforo=ROJO').then(r => r.json()),
    ])
      .then(([ipaa, mir, fi, ioc]) => {
        if (ipaa.success) {
          // Only show 2018-2025 in the table
          const filtrado = (ipaa.tendencia || []).filter((r: IpaaRow) => r.anio >= 2018)
          setIpaaData(filtrado)
        }
        if (mir.success) setMirData(mir.data || [])
        if (fi.success) setFiRanking(fi.data || [])
        if (ioc.success) {
          // Deduplicate by product, take top 10 by variacion desc
          const map: Record<string, IocItem> = {}
          for (const item of (ioc.data || []) as IocItem[]) {
            if (!map[item.producto] || item.variacion_vs_historico_pct > map[item.producto].variacion_vs_historico_pct) {
              map[item.producto] = item
            }
          }
          const dedup = Object.values(map)
            .sort((a, b) => b.variacion_vs_historico_pct - a.variacion_vs_historico_pct)
            .slice(0, 10)
          setIocRojo(dedup)
        }
        if (!ipaa.success) setError('No se pudo cargar información de Supabase.')
      })
      .catch(() => setError('Error de red al cargar los datos.'))
      .finally(() => setLoading(false))
  }, [])

  // Derived ranking data
  const top10caras = fiRanking.slice(0, 10)
  const top10baratas = [...fiRanking].reverse().slice(0, 10)

  // MIR: filter years with real data (exclude 2013 base)
  const mirTabla = mirData.filter(r => r.anio > 2013)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>

      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/" className={styles.backButton}>← Inicio</Link>
          <div className={styles.headerInfo}>
            <h1>🏛️ Vista Gobierno — Seguridad Alimentaria y Precios</h1>
            <p>Monitor de política pública alimentaria · Colombia 2013-2026 · SIPSA-DANE</p>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Inflación acumulada SIPSA', value: '+174.5%', color: '#e74c3c' },
            { label: 'IPC oficial alimentos', value: '+139.6%', color: '#f39c12' },
            { label: 'Brecha detectada', value: '+34.9 pp', color: '#8e44ad' },
            { label: 'Año más inflacionario', value: '2022 (+31.8%)', color: '#e74c3c' },
          ].map(k => (
            <div key={k.label} style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: 'white',
            }}>
              <div style={{ fontSize: '0.72rem', opacity: 0.8, marginBottom: '0.2rem' }}>{k.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className={styles.main}>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Cargando datos de seguridad alimentaria…</span>
          </div>
        )}

        {!loading && error && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fde8e8',
            borderRadius: '10px',
            padding: '1.5rem',
            color: '#e74c3c',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <>

            {/* ── SECCIÓN 1: IPAA ── */}
            <Section>
              <SectionTitle
                emoji="📉"
                title="IPAA — Evolución del Poder Adquisitivo Alimentario (base 2013=100)"
                sub="Capacidad real de compra de alimentos vs SMMLV · Años seleccionados 2018-2025"
              />

              {ipaaData.length === 0 ? (
                <div style={{ padding: '1rem', color: '#7f8c8d', textAlign: 'center', fontSize: '0.9rem' }}>
                  No hay datos IPAA disponibles.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
                    <thead>
                      <tr style={{ background: '#eaf2fb' }}>
                        {['Año', 'IPAA', 'Índice Precios', 'Índice SMMLV', 'Estado', 'Interpretación'].map(h => (
                          <th key={h} style={{
                            padding: '0.65rem 0.9rem',
                            textAlign: 'left',
                            color: '#1a5276',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ipaaData.map((row, i) => {
                        const es2022 = row.anio === 2022
                        const rowBg = es2022 ? '#fff5f5' : i % 2 === 0 ? 'white' : '#fafafa'
                        const ipaaNum = typeof row.ipaa_mediana === 'number' ? row.ipaa_mediana : 0
                        const ipaaColor = ipaaNum >= 100 ? '#27ae60' : ipaaNum >= 90 ? '#f39c12' : '#e74c3c'
                        return (
                          <tr key={row.anio} style={{ borderBottom: '1px solid #f0f0f0', background: rowBg }}>
                            <td style={{ padding: '0.65rem 0.9rem', fontWeight: 700, color: es2022 ? '#e74c3c' : '#1a5276' }}>
                              {row.anio} {es2022 && '⚠️'}
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem', fontWeight: 800, color: ipaaColor, fontSize: '1rem' }}>
                              {ipaaNum.toFixed(1)}
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem', color: '#2c3e50' }}>
                              {row.idx_precios != null ? row.idx_precios.toFixed(1) : '—'}
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem', color: '#2c3e50' }}>
                              {row.idx_smmlv != null ? row.idx_smmlv.toFixed(1) : '—'}
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem' }}>
                              <span style={{
                                background: estadoColor(row.estado),
                                color: 'white',
                                borderRadius: '10px',
                                padding: '0.18rem 0.6rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}>
                                {estadoEmoji(row.estado)}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem', color: '#7f8c8d', fontSize: '0.82rem' }}>
                              {es2022
                                ? 'Peor año: pérdida máxima de poder de compra'
                                : ipaaNum < 90
                                  ? `Colombiano promedio con ${(100 - ipaaNum).toFixed(0)}% menos poder de compra vs 2013`
                                  : ipaaNum < 100
                                    ? `Leve deterioro vs 2013 (base 100)`
                                    : 'Poder adquisitivo sostenido o mejorado'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <InsightBox>
                📌 En 2022, el colombiano promedio perdió el 17% de su poder adquisitivo alimentario vs 2013.
                El IPAA mide cuántos kilos de canasta alimentaria puede comprar el salario mínimo en cada año.
              </InsightBox>
            </Section>

            {/* ── SECCIÓN 2: MIR vs IPC ── */}
            <Section>
              <SectionTitle
                emoji="📊"
                title="MIR — Inflación Real SIPSA vs IPC Oficial DANE"
                sub="Monitor de Inflación Real v2.0 · 363 productos · 8 grupos · Pesos IPC base 2018"
              />

              {mirTabla.length === 0 ? (
                <div style={{ padding: '1rem', color: '#7f8c8d', textAlign: 'center', fontSize: '0.9rem' }}>
                  No hay datos MIR disponibles.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
                    <thead>
                      <tr style={{ background: '#eaf2fb' }}>
                        {['Año', 'MIR SIPSA %', 'IPC DANE %', 'Diferencia pp', '¿Quién detectó más?'].map(h => (
                          <th key={h} style={{
                            padding: '0.65rem 0.9rem',
                            textAlign: 'left',
                            color: '#1a5276',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mirTabla.map((row, i) => {
                        const es2022 = row.anio === 2022
                        const es2024 = row.anio === 2024
                        const diff = row.mir_pct - row.ipc_dane_pct
                        const detector = quienDetecto(row.mir_pct, row.ipc_dane_pct)
                        const rowBg = es2022 ? '#fff5f5' : es2024 ? '#f0fdf4' : i % 2 === 0 ? 'white' : '#fafafa'
                        return (
                          <tr key={row.anio} style={{ borderBottom: '1px solid #f0f0f0', background: rowBg }}>
                            <td style={{ padding: '0.65rem 0.9rem', fontWeight: 700, color: es2022 ? '#e74c3c' : es2024 ? '#27ae60' : '#1a5276' }}>
                              {row.anio}
                              {es2022 && ' ⚠️'}
                              {es2024 && ' ↓'}
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem', fontWeight: 800, color: row.mir_pct < 0 ? '#27ae60' : row.mir_pct > 20 ? '#e74c3c' : '#2c3e50' }}>
                              {fmtPct(row.mir_pct)}
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem', color: '#2c3e50' }}>
                              {fmtPct(row.ipc_dane_pct)}
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem' }}>
                              <span style={{
                                fontWeight: 700,
                                color: diff > 1 ? '#e74c3c' : diff < -1 ? '#27ae60' : '#7f8c8d',
                              }}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)} pp
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem' }}>
                              <span style={{
                                background: detector.color,
                                color: 'white',
                                borderRadius: '10px',
                                padding: '0.18rem 0.6rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}>
                                {detector.texto}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <InsightBox>
                📌 El SIPSA detecta <strong>+34.9 puntos porcentuales más inflación acumulada</strong> que el IPC oficial
                desde 2013. En 2024, se registró deflación mayorista (−1.1%) mientras el IPC oficial subió +2.1% —
                señal de compresión de márgenes en la cadena.
              </InsightBox>
            </Section>

            {/* ── SECCIÓN 3: FI CIUDADES ── */}
            <Section>
              <SectionTitle
                emoji="🗺️"
                title="FI — Ciudades con Mayor y Menor Costo Alimentario (2025)"
                sub="Fruver Index promedio anual · Canasta familiar DANE · 71 productos"
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
              }}>
                {/* Top 10 más caras */}
                <div>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#e74c3c',
                    marginBottom: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <span style={{ fontSize: '1rem' }}>🔴</span> 10 Ciudades Más Caras
                  </div>
                  <ul className={styles.rankingList}>
                    {top10caras.map((c, i) => (
                      <li key={c.ciudad} className={styles.rankingItem}>
                        <span className={`${styles.rankingPos} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ''}`}>
                          {i + 1}
                        </span>
                        <span className={styles.rankingCiudad}>{capitalize(c.ciudad)}</span>
                        <span className={styles.rankingBarra}>
                          <span
                            className={styles.rankingBarraFill}
                            style={{
                              width: `${Math.round((c.fi_promedio / (top10caras[0]?.fi_promedio || 1)) * 100)}%`,
                              background: '#e74c3c',
                            }}
                          />
                        </span>
                        <span className={styles.rankingValor} style={{ color: '#e74c3c' }}>
                          {c.fi_promedio.toLocaleString('es-CO')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Top 10 más baratas */}
                <div>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#27ae60',
                    marginBottom: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <span style={{ fontSize: '1rem' }}>🟢</span> 10 Ciudades Más Baratas
                  </div>
                  <ul className={styles.rankingList}>
                    {top10baratas.map((c, i) => (
                      <li key={c.ciudad} className={styles.rankingItem}>
                        <span className={`${styles.rankingPos}`} style={{ background: '#27ae60' }}>
                          {i + 1}
                        </span>
                        <span className={styles.rankingCiudad}>{capitalize(c.ciudad)}</span>
                        <span className={styles.rankingBarra}>
                          <span
                            className={styles.rankingBarraFill}
                            style={{
                              width: `${Math.round((c.fi_promedio / (top10caras[0]?.fi_promedio || 1)) * 100)}%`,
                              background: '#27ae60',
                            }}
                          />
                        </span>
                        <span className={styles.rankingValor} style={{ color: '#27ae60' }}>
                          {c.fi_promedio.toLocaleString('es-CO')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <InsightBox>
                📌 La ciudad más cara es <strong>Arauca</strong> y la más barata es <strong>Sonsón (Antioquia)</strong>.
                Esta brecha territorial es insumo clave para focalización de programas de seguridad alimentaria.
              </InsightBox>
            </Section>

            {/* ── SECCIÓN 4: PRODUCTOS MAYOR ALZA ── */}
            <Section>
              <SectionTitle
                emoji="🔴"
                title="Productos con Mayor Alza de Precio — Riesgo de Seguridad Alimentaria"
                sub="Top 10 productos nacionales con mayor precio vs histórico · Señal de alerta temprana"
              />

              {iocRojo.length === 0 ? (
                <div style={{ padding: '1rem', color: '#7f8c8d', textAlign: 'center', fontSize: '0.9rem' }}>
                  No se encontraron alertas de precios en este momento.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {iocRojo.map((item, i) => {
                    const barWidth = Math.min(100, Math.abs(item.variacion_vs_historico_pct) / 2)
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        padding: '0.65rem 1rem',
                        background: '#fff5f5',
                        border: '1px solid #fde8e8',
                        borderRadius: '8px',
                      }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          background: '#e74c3c',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>{i + 1}</span>
                        <span style={{ fontWeight: 700, color: '#2c3e50', textTransform: 'capitalize', minWidth: '160px', fontSize: '0.87rem' }}>
                          {item.producto}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#7f8c8d', minWidth: '120px' }}>
                          {item.grupo_alimentos}
                        </span>
                        <div style={{ flex: 1, height: '8px', background: '#fde8e8', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${barWidth}%`, height: '100%', background: '#e74c3c', borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontWeight: 800, color: '#e74c3c', minWidth: '55px', textAlign: 'right', fontSize: '0.9rem' }}>
                          {fmtPct(item.variacion_vs_historico_pct)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#7f8c8d', minWidth: '80px', textAlign: 'right' }}>
                          vs histórico
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              <InsightBox>
                📌 Los productos con mayor alza sostenida representan riesgo real de inseguridad alimentaria para
                hogares de menores ingresos. Esta señal es insumo para el ICBF, el PAPSIVI y programas de
                transferencias condicionadas.
              </InsightBox>
            </Section>

            {/* ── FOOTER POLICY BOX ── */}
            <div style={{
              background: '#1a5276',
              borderRadius: '12px',
              padding: '1.5rem 2rem',
              color: 'white',
              marginBottom: '1rem',
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.7 }}>
                🏛️ <strong>Datos disponibles para MinAgricultura, DANE, ICBF, gobernaciones y organismos
                internacionales.</strong>{' '}
                Metodología alineada con canasta familiar oficial DANE. 3.1M registros · 87 ciudades ·
                402 productos · 2013-2026. Contacte:{' '}
                <a href="https://fruverindex.com" style={{ color: '#f39c12', fontWeight: 700 }}>
                  fruverindex.com
                </a>
              </p>
            </div>

            <p className={styles.fuente}>
              Fuente: Fruver Index / SIPSA-DANE · MIR v2.0 · 363 productos · 8 grupos · Pesos IPC base 2018
            </p>

          </>
        )}
      </div>
    </div>
  )
}
