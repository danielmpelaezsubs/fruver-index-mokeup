'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from '../../dashboards/fruver-index/dashboard.module.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface IocItem {
  producto: string
  ciudad: string
  precio_actual: number
  precio_hist_media: number
  semaforo: string
  variacion_vs_historico_pct: number
  grupo_alimentos: string
}

interface IagItem {
  producto: string
  grupo_alimentos: string
  iag_pct: number
  ciudad_mas_barata: string
  precio_ciudad_min: number
  ciudad_mas_cara: string
  precio_ciudad_max: number
  oportunidad: string
}

interface IraItem {
  producto: string
  grupo_alimentos: string
  cv_promedio: number
  nivel_riesgo: string
  ciudades: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPeso(v: number) {
  return '$' + Math.round(v).toLocaleString('es-CO')
}

function fmtPct(v: number, signo = true) {
  const s = signo && v > 0 ? '+' : ''
  return s + v.toFixed(1) + '%'
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function getSemanaActual() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
  return `Semana ${week} · ${now.getFullYear()}`
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

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

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RetailerPage() {
  const [ciudad, setCiudad] = useState('bogota')
  const [ciudades, setCiudades] = useState<string[]>([])
  const [iocVerde, setIocVerde] = useState<IocItem[]>([])
  const [iocRojo, setIocRojo] = useState<IocItem[]>([])
  const [iagData, setIagData] = useState<IagItem[]>([])
  const [iraData, setIraData] = useState<IraItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load city list once
  useEffect(() => {
    fetch('/api/fi?tipo=ciudades')
      .then(r => r.json())
      .then(d => { if (d.success) setCiudades(d.data) })
      .catch(() => {})
  }, [])

  // Reload all 4 sections whenever ciudad changes
  useEffect(() => {
    setLoading(true)
    setError('')

    Promise.all([
      fetch(`/api/ioc?ciudad=${encodeURIComponent(ciudad)}&semaforo=VERDE`).then(r => r.json()),
      fetch(`/api/ioc?ciudad=${encodeURIComponent(ciudad)}&semaforo=ROJO`).then(r => r.json()),
      fetch('/api/iag?anio=2025&min_pct=30').then(r => r.json()),
      fetch('/api/ira?anio=2025&nivel=ALTO').then(r => r.json()),
    ])
      .then(([verde, rojo, iag, ira]) => {
        if (verde.success) setIocVerde((verde.data || []).sort((a: IocItem, b: IocItem) => a.variacion_vs_historico_pct - b.variacion_vs_historico_pct))
        if (rojo.success) setIocRojo((rojo.data || []).sort((a: IocItem, b: IocItem) => b.variacion_vs_historico_pct - a.variacion_vs_historico_pct).slice(0, 8))
        if (iag.success) setIagData((iag.data || []).slice(0, 10))
        if (ira.success) setIraData((ira.data || []).slice(0, 8))
        if (!verde.success && !rojo.success) setError('No se pudo cargar información. Verifique la conexión.')
      })
      .catch(() => setError('Error de red al cargar los datos.'))
      .finally(() => setLoading(false))
  }, [ciudad])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>

      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/" className={styles.backButton}>← Inicio</Link>
          <div className={styles.headerInfo}>
            <h1>🛒 Vista Retailer — Inteligencia de Compras</h1>
            <p>Decisiones de abastecimiento basadas en 13 años de datos · SIPSA-DANE</p>
          </div>
          <div style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '0.4rem 0.9rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'white',
          }}>
            📅 {getSemanaActual()}
          </div>
        </div>

        <div className={styles.ciudadSelector}>
          <label>Ciudad de abastecimiento:</label>
          <select value={ciudad} onChange={e => setCiudad(e.target.value)}>
            {ciudades.length === 0
              ? <option value={ciudad}>{capitalize(ciudad)}</option>
              : ciudades.map(c => (
                <option key={c} value={c}>{capitalize(c)}</option>
              ))
            }
          </select>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className={styles.main}>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Cargando inteligencia de compras para {capitalize(ciudad)}…</span>
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

            {/* ── SECCIÓN 1: IOC VERDE ── */}
            <Section>
              <SectionTitle
                emoji="🟢"
                title="Oportunidades de Compra — Precios Bajo su Histórico"
                sub={`Productos con precio actual inferior a su media histórica en ${capitalize(ciudad)}`}
              />

              {iocVerde.length === 0 ? (
                <div style={{
                  padding: '1.5rem',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  color: '#27ae60',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                }}>
                  Esta semana no hay productos significativamente baratos en {capitalize(ciudad)}.
                  Considere ampliar a otras ciudades usando la sección de Arbitraje.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '0.8rem',
                }}>
                  {iocVerde.map((item, i) => (
                    <div key={i} style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderLeft: '4px solid #27ae60',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#27ae60', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                        {item.grupo_alimentos}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a5276', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                        {item.producto}
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#27ae60', lineHeight: 1 }}>
                        {fmtPct(item.variacion_vs_historico_pct)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '0.4rem' }}>
                        vs histórico
                      </div>
                      <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#2c3e50' }}>
                          Actual: <strong style={{ color: '#27ae60' }}>{fmtPeso(item.precio_actual)}</strong>
                        </span>
                        <span style={{ color: '#7f8c8d' }}>
                          Hist.: {fmtPeso(item.precio_hist_media)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ── SECCIÓN 2: IOC ROJO ── */}
            <Section>
              <SectionTitle
                emoji="🔴"
                title="Alertas — Precios Sobre su Histórico · Negocie con Proveedores"
                sub={`Top 8 productos más caros vs su historia en ${capitalize(ciudad)}`}
              />

              {iocRojo.length === 0 ? (
                <div style={{ padding: '1rem', color: '#7f8c8d', textAlign: 'center', fontSize: '0.9rem' }}>
                  No se encontraron alertas rojas para {capitalize(ciudad)} en este momento.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '0.8rem',
                }}>
                  {iocRojo.map((item, i) => (
                    <div key={i} style={{
                      background: '#fff5f5',
                      border: '1px solid #fde8e8',
                      borderLeft: '4px solid #e74c3c',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#e74c3c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                        {item.grupo_alimentos}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a5276', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                        {item.producto}
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e74c3c', lineHeight: 1 }}>
                        {fmtPct(item.variacion_vs_historico_pct)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '0.4rem' }}>
                        sobre histórico — negocie precio
                      </div>
                      <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#2c3e50' }}>
                          Actual: <strong style={{ color: '#e74c3c' }}>{fmtPeso(item.precio_actual)}</strong>
                        </span>
                        <span style={{ color: '#7f8c8d' }}>
                          Hist.: {fmtPeso(item.precio_hist_media)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ── SECCIÓN 3: ARBITRAJE IAG ── */}
            <Section>
              <SectionTitle
                emoji="🗺️"
                title="Arbitraje — Dónde Comprar Más Barato Nacionalmente"
                sub="Top 10 oportunidades de arbitraje geográfico · 2025 · Ahorro ≥ 30%"
              />

              {iagData.length === 0 ? (
                <div style={{ padding: '1rem', color: '#7f8c8d', textAlign: 'center', fontSize: '0.9rem' }}>
                  No se encontraron oportunidades de arbitraje con los filtros actuales.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
                    <thead>
                      <tr style={{ background: '#eaf2fb' }}>
                        {['Producto', 'Compre en', 'Precio min', 'Venda en', 'Precio max', 'Ahorro %'].map(h => (
                          <th key={h} style={{
                            padding: '0.6rem 0.8rem',
                            textAlign: 'left',
                            color: '#1a5276',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {iagData.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#2c3e50', textTransform: 'capitalize' }}>
                            {item.producto}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: '#27ae60', fontWeight: 600, textTransform: 'capitalize' }}>
                            {item.ciudad_mas_barata}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: '#27ae60', fontWeight: 700 }}>
                            {fmtPeso(item.precio_ciudad_min)}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: '#e74c3c', fontWeight: 600, textTransform: 'capitalize' }}>
                            {item.ciudad_mas_cara}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: '#e74c3c', fontWeight: 700 }}>
                            {fmtPeso(item.precio_ciudad_max)}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem' }}>
                            <span style={{
                              background: '#27ae60',
                              color: 'white',
                              borderRadius: '12px',
                              padding: '0.2rem 0.6rem',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                            }}>
                              {item.iag_pct.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* ── SECCIÓN 4: RIESGO IRA ── */}
            <Section>
              <SectionTitle
                emoji="⚡"
                title="Riesgo — Productos con Alta Volatilidad de Precio"
                sub="No contrate a precio fijo · Coeficiente de variación histórico · 2025"
              />

              {iraData.length === 0 ? (
                <div style={{ padding: '1rem', color: '#7f8c8d', textAlign: 'center', fontSize: '0.9rem' }}>
                  No se encontraron productos de alto riesgo con los filtros actuales.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '0.8rem',
                }}>
                  {iraData.map((item, i) => {
                    const cvPct = (item.cv_promedio * 100).toFixed(1)
                    const barWidth = Math.min(100, item.cv_promedio * 250)
                    return (
                      <div key={i} style={{
                        background: '#fffbf0',
                        border: '1px solid #fde68a',
                        borderLeft: '4px solid #f39c12',
                        borderRadius: '10px',
                        padding: '1rem',
                      }}>
                        <div style={{ fontSize: '0.72rem', color: '#f39c12', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                          {item.grupo_alimentos}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a5276', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                          {item.producto}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                          <div style={{ flex: 1, height: '8px', background: '#fde68a', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${barWidth}%`, height: '100%', background: '#f39c12', borderRadius: '4px' }} />
                          </div>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f39c12', minWidth: '40px', textAlign: 'right' }}>
                            {cvPct}%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                          Volatilidad CV · {item.ciudades} ciudad{item.ciudades !== 1 ? 'es' : ''} analizadas
                        </div>
                        <div style={{
                          marginTop: '0.5rem',
                          fontSize: '0.75rem',
                          background: '#f39c12',
                          color: 'white',
                          borderRadius: '6px',
                          padding: '0.2rem 0.5rem',
                          display: 'inline-block',
                          fontWeight: 700,
                        }}>
                          ⚡ RIESGO ALTO
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Section>

            {/* ── FOOTER INSIGHT ── */}
            <div style={{
              background: '#1a5276',
              borderRadius: '12px',
              padding: '1.5rem 2rem',
              color: 'white',
              marginBottom: '1rem',
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
                💡 <strong>Este dashboard se actualiza semanalmente con datos del SIPSA-DANE.</strong>{' '}
                Con el plan Pro accede a alertas automáticas por WhatsApp y reportes personalizados para su categoría.{' '}
                <a href="https://fruverindex.com" style={{ color: '#f39c12', fontWeight: 700 }}>
                  fruverindex.com
                </a>
              </p>
            </div>

            <p className={styles.fuente}>
              Fuente: Fruver Index / SIPSA-DANE · 3.1M registros · 87 ciudades · 402 productos · 2013-2026
            </p>

          </>
        )}
      </div>
    </div>
  )
}
