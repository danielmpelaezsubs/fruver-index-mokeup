'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import styles from '../../dashboards/fruver-index/dashboard.module.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface IraItem {
  producto: string
  grupo_alimentos: string
  cv: number
  nivel_riesgo: string
}

interface IraResumen {
  ALTO: number
  MEDIO: number
  BAJO: number
}

interface IocItem {
  producto: string
  semaforo: string
  variacion_vs_historico_pct: number
  precio_actual: number
  precio_hist_media: number
  grupo_alimentos: string
}

interface IepDataPoint {
  semana: number
  precio_hist_semana: number
  tipo_semana: string
  iep: number
}

interface IepStats {
  min: number
  max: number
  semanaMin: number
  semanaMax: number
  ahorroPct: number
}

interface IagItem {
  producto: string
  iag_pct: number
  ciudad_mas_barata: string
  precio_ciudad_min: number
  ciudad_mas_cara: string
  precio_ciudad_max: number
  grupo_alimentos: string
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

const GRUPOS_FRUVER = [
  'frutas frescas',
  'verduras y hortalizas',
  'tuberculos raices y platanos',
  'granos y cereales',
]

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

function InsightBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff8f0',
      border: '1px solid #fddcb5',
      borderLeft: '4px solid #f39c12',
      borderRadius: '8px',
      padding: '0.85rem 1.1rem',
      fontSize: '0.86rem',
      color: '#7d3c00',
      marginTop: '1rem',
      lineHeight: 1.5,
    }}>
      {children}
    </div>
  )
}

// ─── Tooltip personalizado para AreaChart ─────────────────────────────────────

function TooltipIep({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: number
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '0.6rem 0.9rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontSize: '0.83rem',
    }}>
      <div style={{ fontWeight: 700, color: '#1a5276', marginBottom: '0.2rem' }}>
        Semana {label}
      </div>
      <div style={{ color: '#2980b9' }}>
        Precio histórico: <strong>{fmtPeso(payload[0]?.value ?? 0)}</strong>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AgroindustriaPage() {
  // ── Sección 1: IRA ──
  const [iraData, setIraData] = useState<IraItem[]>([])
  const [iraResumen, setIraResumen] = useState<IraResumen | null>(null)

  // ── Sección 2: IOC Verde filtrado ──
  const [iocVerde, setIocVerde] = useState<IocItem[]>([])

  // ── Sección 3: IEP ──
  const [productosIep, setProductosIep] = useState<string[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [iepData, setIepData] = useState<IepDataPoint[]>([])
  const [iepStats, setIepStats] = useState<IepStats | null>(null)
  const [loadingIep, setLoadingIep] = useState(false)

  // ── Sección 4: IAG ──
  const [iagData, setIagData] = useState<IagItem[]>([])

  // ── Global ──
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Carga paralela de secciones 1, 2 y 4
  useEffect(() => {
    setLoading(true)
    setError('')

    Promise.all([
      fetch('/api/ira?anio=2025&nivel=ALTO').then(r => r.json()),
      fetch('/api/ioc').then(r => r.json()),
      fetch('/api/iag?anio=2025&min_pct=20').then(r => r.json()),
      fetch('/api/iep').then(r => r.json()),
    ])
      .then(([ira, ioc, iag, iepLista]) => {
        // Sección 1 — Top 10 productos mayor CV
        if (ira.success) {
          const sorted = (ira.data as IraItem[])
            .sort((a, b) => b.cv - a.cv)
            .slice(0, 10)
          setIraData(sorted)
          setIraResumen(ira.resumen || null)
        }

        // Sección 2 — Solo grupos fruver, semaforo VERDE
        if (ioc.success) {
          const filtrado = (ioc.data as IocItem[])
            .filter(item =>
              item.semaforo === 'VERDE' &&
              GRUPOS_FRUVER.includes(item.grupo_alimentos?.toLowerCase())
            )
            .sort((a, b) => a.variacion_vs_historico_pct - b.variacion_vs_historico_pct)
            .slice(0, 12)
          setIocVerde(filtrado)
        }

        // Sección 4 — IAG arbitraje
        if (iag.success) {
          setIagData((iag.data as IagItem[]).slice(0, 15))
        }

        // Lista de productos IEP para selector
        if (iepLista.success && iepLista.productos) {
          const lista = iepLista.productos as string[]
          setProductosIep(lista)
          if (lista.length > 0) setProductoSeleccionado(lista[0])
        }

        if (!ira.success && !ioc.success) {
          setError('No se pudo cargar la información. Verifique la conexión.')
        }
      })
      .catch(() => setError('Error de red al cargar los datos.'))
      .finally(() => setLoading(false))
  }, [])

  // Carga IEP cuando cambia el producto seleccionado
  useEffect(() => {
    if (!productoSeleccionado) return
    setLoadingIep(true)
    fetch(`/api/iep?producto=${encodeURIComponent(productoSeleccionado)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setIepData(d.data || [])
          setIepStats(d.stats || null)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingIep(false))
  }, [productoSeleccionado])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>

      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/" className={styles.backButton}>← Inicio</Link>
          <div className={styles.headerInfo}>
            <h1>🏭 Vista Agroindustria — Gestión de Materias Primas</h1>
            <p>Inteligencia de compras para procesadores de alimentos · SIPSA-DANE · Colombia 2013-2026</p>
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

        {/* KPI strip */}
        <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Productos monitoreados', value: '402', color: '#f39c12' },
            { label: 'Ciudades analizadas', value: '87', color: '#27ae60' },
            { label: 'Años de historial', value: '13', color: '#2980b9' },
            { label: 'Registros en el dataset', value: '3.1M', color: '#8e44ad' },
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

          {iraResumen && (
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: 'white',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
            }}>
              <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Riesgo materias primas 2025</div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <span style={{ fontWeight: 800, color: '#e74c3c', fontSize: '0.9rem' }}>
                  {iraResumen.ALTO} alto
                </span>
                <span style={{ fontWeight: 800, color: '#f39c12', fontSize: '0.9rem' }}>
                  {iraResumen.MEDIO} medio
                </span>
                <span style={{ fontWeight: 800, color: '#27ae60', fontSize: '0.9rem' }}>
                  {iraResumen.BAJO} bajo
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className={styles.main}>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Cargando inteligencia agroindustrial…</span>
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

            {/* ═══════════════════════════════════════════════════════════════
                SECCIÓN 1 — MATERIAS PRIMAS CON MAYOR RIESGO (IRA)
            ═══════════════════════════════════════════════════════════════ */}
            <Section>
              <SectionTitle
                emoji="⚡"
                title="Materias Primas con Mayor Riesgo de Volatilidad"
                sub="Top 10 productos de mayor coeficiente de variación histórico · 2025 · Considere contratos a precio fijo o coberturas"
              />

              {iraData.length === 0 ? (
                <div style={{ padding: '1.5rem', color: '#7f8c8d', textAlign: 'center', fontSize: '0.9rem' }}>
                  No hay productos de alto riesgo disponibles en este momento.
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '0.85rem',
                  }}>
                    {iraData.map((item, i) => {
                      const cvPct = item.cv != null ? (item.cv * 100).toFixed(1) : '0.0'
                      const cvNum = item.cv != null ? item.cv * 100 : 0
                      // Bar scaled: CV of 60% = 100% width
                      const barWidth = Math.min(100, (cvNum / 60) * 100)
                      return (
                        <div key={i} style={{
                          background: '#fffbf0',
                          border: '1px solid #fde68a',
                          borderLeft: '4px solid #f39c12',
                          borderRadius: '10px',
                          padding: '1rem',
                          position: 'relative',
                        }}>
                          {/* Número de ranking */}
                          <div style={{
                            position: 'absolute',
                            top: '0.6rem',
                            right: '0.7rem',
                            width: '22px',
                            height: '22px',
                            background: '#f39c12',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: 'white',
                          }}>
                            {i + 1}
                          </div>

                          <div style={{
                            fontSize: '0.7rem',
                            color: '#f39c12',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginBottom: '0.3rem',
                          }}>
                            {item.grupo_alimentos}
                          </div>

                          <div style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#1a5276',
                            marginBottom: '0.7rem',
                            textTransform: 'capitalize',
                            paddingRight: '1.5rem',
                          }}>
                            {item.producto}
                          </div>

                          {/* Barra CV */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <div style={{ flex: 1, height: '8px', background: '#fde68a', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${barWidth}%`,
                                height: '100%',
                                background: cvNum >= 40 ? '#e74c3c' : cvNum >= 25 ? '#f39c12' : '#f39c12',
                                borderRadius: '4px',
                                transition: 'width 0.6s ease',
                              }} />
                            </div>
                            <span style={{
                              fontSize: '0.9rem',
                              fontWeight: 800,
                              color: cvNum >= 40 ? '#e74c3c' : '#f39c12',
                              minWidth: '48px',
                              textAlign: 'right',
                            }}>
                              {cvPct}%
                            </span>
                          </div>

                          <div style={{ fontSize: '0.72rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
                            Coeficiente de variación histórico (escala 0-60%)
                          </div>

                          {/* Badge */}
                          <div style={{
                            display: 'inline-block',
                            background: '#f39c12',
                            color: 'white',
                            borderRadius: '6px',
                            padding: '0.2rem 0.55rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}>
                            ⚡ RIESGO ALTO
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <InsightBox>
                    💼 <strong>Acción recomendada:</strong> Para estos productos, considere contratos de suministro
                    a precio fijo, cobertura con futuros o stock de seguridad preventivo. La alta volatilidad
                    impacta directamente sus márgenes de producción.
                  </InsightBox>
                </>
              )}
            </Section>

            {/* ═══════════════════════════════════════════════════════════════
                SECCIÓN 2 — OPORTUNIDADES DE COMPRA (IOC VERDE)
            ═══════════════════════════════════════════════════════════════ */}
            <Section>
              <SectionTitle
                emoji="🟢"
                title="Compre Ahora — Materias Primas Baratas vs su Histórico"
                sub="Frutas, verduras, tubérculos y cereales con precio actual bajo su media histórica · Oportunidad de stock preventivo"
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
                  Esta semana no hay materias primas significativamente baratas en los grupos monitoreados.
                  Consulte la sección de Arbitraje para identificar ciudades de compra convenientes.
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                    gap: '0.85rem',
                  }}>
                    {iocVerde.map((item, i) => (
                      <div key={i} style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderLeft: '4px solid #27ae60',
                        borderRadius: '10px',
                        padding: '1rem',
                      }}>
                        <div style={{
                          fontSize: '0.7rem',
                          color: '#27ae60',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '0.3rem',
                        }}>
                          {item.grupo_alimentos}
                        </div>

                        <div style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: '#1a5276',
                          marginBottom: '0.5rem',
                          textTransform: 'capitalize',
                        }}>
                          {item.producto}
                        </div>

                        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#27ae60', lineHeight: 1 }}>
                          {fmtPct(item.variacion_vs_historico_pct)}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#7f8c8d', marginTop: '0.3rem', marginBottom: '0.6rem' }}>
                          vs precio histórico
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
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

                  <InsightBox>
                    📦 <strong>Acción recomendada:</strong> Estos productos están por debajo de su precio histórico.
                    Es una ventana para hacer stock preventivo si su proceso productivo lo permite y la vida útil
                    de la materia prima lo admite.
                  </InsightBox>
                </>
              )}
            </Section>

            {/* ═══════════════════════════════════════════════════════════════
                SECCIÓN 3 — ESTACIONALIDAD (IEP)
            ═══════════════════════════════════════════════════════════════ */}
            <Section>
              <SectionTitle
                emoji="📅"
                title="Estacionalidad — Mejor Semana para Comprar su Materia Prima"
                sub="Patrón histórico de precios por semana del año · 52 semanas · Planifique sus compras con anticipación"
              />

              {/* Selector de producto */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                marginBottom: '1.2rem',
                flexWrap: 'wrap',
              }}>
                <label style={{ fontSize: '0.9rem', color: '#1a5276', fontWeight: 600 }}>
                  Seleccione materia prima:
                </label>
                <select
                  value={productoSeleccionado}
                  onChange={e => setProductoSeleccionado(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '2px solid #2980b9',
                    fontSize: '0.93rem',
                    background: 'white',
                    color: '#1a5276',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minWidth: '220px',
                  }}
                >
                  {productosIep.length === 0 ? (
                    <option value="">Cargando productos…</option>
                  ) : (
                    productosIep.map(p => (
                      <option key={p} value={p}>{capitalize(p)}</option>
                    ))
                  )}
                </select>
              </div>

              {loadingIep ? (
                <div className={styles.loading} style={{ padding: '2rem' }}>
                  <div className={styles.spinner} />
                  <span>Cargando estacionalidad de {capitalize(productoSeleccionado)}…</span>
                </div>
              ) : iepData.length > 0 && iepStats ? (
                <>
                  {/* KPIs de estacionalidad */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.2rem',
                  }}>
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderLeft: '4px solid #27ae60',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#27ae60', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                        Semana mas barata
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#27ae60', lineHeight: 1 }}>
                        Sem. {iepStats.semanaMin}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '0.3rem' }}>
                        Precio min: {fmtPeso(iepStats.min)}
                      </div>
                    </div>

                    <div style={{
                      background: '#fff5f5',
                      border: '1px solid #fde8e8',
                      borderLeft: '4px solid #e74c3c',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#e74c3c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                        Semana mas cara
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e74c3c', lineHeight: 1 }}>
                        Sem. {iepStats.semanaMax}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '0.3rem' }}>
                        Precio max: {fmtPeso(iepStats.max)}
                      </div>
                    </div>

                    <div style={{
                      background: '#eaf2fb',
                      border: '1px solid #aed6f1',
                      borderLeft: '4px solid #2980b9',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#2980b9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                        Ahorro potencial
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2980b9', lineHeight: 1 }}>
                        {iepStats.ahorroPct.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '0.3rem' }}>
                        comprando en semana {iepStats.semanaMin}
                      </div>
                    </div>
                  </div>

                  {/* Frase de accion */}
                  <div style={{
                    background: '#1a5276',
                    borderRadius: '8px',
                    padding: '0.8rem 1.2rem',
                    color: 'white',
                    fontSize: '0.88rem',
                    marginBottom: '1.2rem',
                    lineHeight: 1.5,
                  }}>
                    💡 Si compra <strong>{capitalize(productoSeleccionado)}</strong> en la{' '}
                    <strong>semana {iepStats.semanaMin}</strong> ahorra{' '}
                    <strong style={{ color: '#f39c12' }}>{iepStats.ahorroPct.toFixed(1)}%</strong>{' '}
                    vs comprar en la semana {iepStats.semanaMax} (la mas cara del año).
                  </div>

                  {/* AreaChart 52 semanas */}
                  <div style={{ height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={iepData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorIep" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2980b9" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#2980b9" stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="semana"
                          tick={{ fontSize: 11, fill: '#7f8c8d' }}
                          label={{
                            value: 'Semana del año',
                            position: 'insideBottomRight',
                            offset: -5,
                            fontSize: 11,
                            fill: '#7f8c8d',
                          }}
                          tickCount={13}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#7f8c8d' }}
                          tickFormatter={v => '$' + Math.round(v / 1000) + 'k'}
                          width={55}
                        />
                        <Tooltip content={<TooltipIep />} />
                        <Area
                          type="monotone"
                          dataKey="precio_hist_semana"
                          stroke="#2980b9"
                          strokeWidth={2}
                          fill="url(#colorIep)"
                          dot={false}
                          activeDot={{ r: 5, fill: '#1a5276' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#7f8c8d', marginTop: '0.4rem' }}>
                    Precio histórico semanal promedio · {capitalize(productoSeleccionado)} · 2013-2026
                  </div>
                </>
              ) : (
                <div style={{ padding: '1.5rem', color: '#7f8c8d', textAlign: 'center', fontSize: '0.9rem' }}>
                  Seleccione un producto para ver su patrón de estacionalidad.
                </div>
              )}
            </Section>

            {/* ═══════════════════════════════════════════════════════════════
                SECCIÓN 4 — ARBITRAJE DE PROVEEDURIA (IAG)
            ═══════════════════════════════════════════════════════════════ */}
            <Section>
              <SectionTitle
                emoji="🗺️"
                title="Arbitraje de Proveeduria — Optimice su Red de Proveedores por Ciudad"
                sub="Materias primas con mayor diferencial de precio entre ciudades · 2025 · Diferencial ≥ 20%"
              />

              {iagData.length === 0 ? (
                <div style={{ padding: '1rem', color: '#7f8c8d', textAlign: 'center', fontSize: '0.9rem' }}>
                  No se encontraron oportunidades de arbitraje con los filtros actuales.
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                      <thead>
                        <tr style={{ background: '#eaf2fb' }}>
                          {[
                            'Materia Prima',
                            'Compre en',
                            'Precio',
                            'vs Precio nacional max',
                            'Ahorro %',
                            'Grupo',
                          ].map(h => (
                            <th key={h} style={{
                              padding: '0.65rem 0.9rem',
                              textAlign: 'left',
                              color: '#1a5276',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap',
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {iagData.map((item, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: '1px solid #f5f5f5',
                              background: i % 2 === 0 ? 'white' : '#fafafa',
                            }}
                          >
                            <td style={{ padding: '0.65rem 0.9rem', fontWeight: 700, color: '#2c3e50', textTransform: 'capitalize' }}>
                              {item.producto}
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem', color: '#27ae60', fontWeight: 600, textTransform: 'capitalize' }}>
                              📍 {item.ciudad_mas_barata}
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem', fontWeight: 700, color: '#27ae60' }}>
                              {fmtPeso(item.precio_ciudad_min)}
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                <span style={{ color: '#e74c3c', fontWeight: 600, fontSize: '0.83rem' }}>
                                  {capitalize(item.ciudad_mas_cara)}: {fmtPeso(item.precio_ciudad_max)}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem' }}>
                              <span style={{
                                background: item.iag_pct >= 40 ? '#27ae60' : '#2980b9',
                                color: 'white',
                                borderRadius: '12px',
                                padding: '0.22rem 0.65rem',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                whiteSpace: 'nowrap',
                              }}>
                                {item.iag_pct.toFixed(1)}% menos
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.9rem', fontSize: '0.78rem', color: '#7f8c8d', textTransform: 'capitalize' }}>
                              {item.grupo_alimentos}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <InsightBox>
                    🚚 <strong>Acción recomendada:</strong> Evalúe integrar proveedores de estas ciudades a su
                    cadena de suministro. El diferencial de precio puede cubrir ampliamente los costos de
                    transporte y generar ahorros netos significativos en su costo de produccion.
                  </InsightBox>
                </>
              )}
            </Section>

            {/* ── FOOTER CTA ── */}
            <div style={{
              background: '#1a5276',
              borderRadius: '12px',
              padding: '1.5rem 2rem',
              color: 'white',
              marginBottom: '1rem',
            }}>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.7 }}>
                🏭 <strong>Este dashboard es una muestra del plan Profesional Fruver Index para agroindustria.</strong>{' '}
                Con acceso completo: alertas automaticas por WhatsApp cuando sus materias primas bajen del
                historico, reportes semanales por grupo de productos, y exportacion de datos para su ERP.{' '}
                <a href="https://fruverindex.com" style={{ color: '#f39c12', fontWeight: 700 }}>
                  fruverindex.com
                </a>
              </p>
            </div>

            <p className={styles.fuente}>
              Fuente: Fruver Index / SIPSA-DANE · fruverindex.com · 3.1M registros · 87 ciudades · 402 productos · 2013-2026
            </p>

          </>
        )}
      </div>
    </div>
  )
}
