'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import styles from '../fruver-index/dashboard.module.css'

// ─── Types ───────────────────────────────────────────────────────────────────
interface IEPRow {
  producto: string
  semana: number
  grupo_alimentos: string
  precio_hist_semana: number
  precio_anual: number
  iep: number
  tipo_semana: string
}

interface IEPStats {
  min: number
  max: number
  semanaMin: number
  semanaMax: number
  ahorro: number
}

interface APIResponse {
  success: boolean
  productos: string[]
  data: IEPRow[]
  stats?: IEPStats
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function tipoColor(tipo: string): string {
  const t = (tipo || '').toUpperCase()
  if (t === 'BARATO' || t === 'MUY BARATO') return '#27ae60'
  if (t === 'CARO' || t === 'MUY CARO') return '#e74c3c'
  return '#f39c12'
}

function tipoBg(tipo: string): string {
  const t = (tipo || '').toUpperCase()
  if (t === 'BARATO' || t === 'MUY BARATO') return '#f0fdf4'
  if (t === 'CARO' || t === 'MUY CARO') return '#fde8e8'
  return '#fff8e1'
}

function tipoBorder(tipo: string): string {
  const t = (tipo || '').toUpperCase()
  if (t === 'BARATO' || t === 'MUY BARATO') return '#bbf7d0'
  if (t === 'CARO' || t === 'MUY CARO') return '#f5c6cb'
  return '#fde68a'
}

function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

// ─── Calendar Grid (52 weeks, 7 columns) ─────────────────────────────────────
function CalendarioGrid({ data }: { data: IEPRow[] }) {
  // Build map week → tipo_semana
  const weekMap: Record<number, string> = {}
  for (const r of data) weekMap[r.semana] = r.tipo_semana

  const cells = Array.from({ length: 52 }, (_, i) => i + 1)

  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: '#7f8c8d', marginBottom: '0.6rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 12, height: 12, background: '#27ae60', borderRadius: 3, display: 'inline-block' }} /> Barato
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 12, height: 12, background: '#f39c12', borderRadius: 3, display: 'inline-block' }} /> Normal
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 12, height: 12, background: '#e74c3c', borderRadius: 3, display: 'inline-block' }} /> Caro
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: '3px' }}>
        {cells.map(w => {
          const tipo = weekMap[w] || ''
          const color = tipoColor(tipo)
          return (
            <div
              key={w}
              title={`Semana ${w}: ${tipo || 'sin dato'}`}
              style={{
                width: '100%',
                aspectRatio: '1',
                background: color,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                color: 'white',
                fontWeight: 700,
                opacity: tipo ? 1 : 0.2,
                cursor: 'default',
              }}
            >
              {w}
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: '0.72rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
        Semanas 1–52 del año. Pasa el cursor sobre cada celda para ver el detalle.
      </div>
    </div>
  )
}

// ─── Custom Area fill by tipo ─────────────────────────────────────────────────
// We use a single Area with custom dots but color coded via gradient isn't straightforward;
// instead we render the line in one color and use reference areas per type range.
// Simpler: just use one Area with stroke color #2980b9 and fill via gradient.

// ─── Top estacionales cuando no hay producto seleccionado ─────────────────────
function TopEstacionales({ productos }: { productos: string[] }) {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>Selecciona un producto para ver su calendario estacional</div>
      <div className={styles.chartSub}>
        {productos.length} productos disponibles en la base de datos. Aquí los primeros 10 en orden alfabético:
      </div>
      <ul className={styles.rankingList}>
        {productos.slice(0, 10).map((p, i) => (
          <li key={p} className={styles.rankingItem}>
            <span
              className={`${styles.rankingPos} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ''}`}
            >
              {i + 1}
            </span>
            <span className={styles.rankingCiudad} style={{ textTransform: 'capitalize' }}>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CalendarioPage() {
  const [productoInput, setProductoInput] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [data, setData] = useState<IEPRow[]>([])
  const [stats, setStats] = useState<IEPStats | null>(null)
  const [productos, setProductos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Initial load — get product list
  useEffect(() => {
    fetch('/api/iep')
      .then(r => r.json())
      .then((json: APIResponse) => {
        if (json.success) setProductos(json.productos)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fetchProducto = useCallback(async (prod: string) => {
    if (!prod) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/iep?producto=${encodeURIComponent(prod.toLowerCase())}`)
      const json: APIResponse = await res.json()
      if (!json.success) throw new Error(json.error || 'Error al cargar')
      setData(json.data)
      setStats(json.stats || null)
      setProductos(json.productos)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Suggestions filtered
  const suggestions = productoInput.length >= 2
    ? productos.filter(p => p.toLowerCase().includes(productoInput.toLowerCase())).slice(0, 12)
    : []

  const handleSelect = (p: string) => {
    setProductoInput(p)
    setProductoSeleccionado(p)
    setShowSuggestions(false)
    fetchProducto(p)
  }

  // Chart data
  const chartData = data.map(r => ({
    semana: r.semana,
    precio: r.precio_hist_semana,
    tipo: r.tipo_semana,
    iep: r.iep,
  }))

  // Insight text
  let insightText = ''
  if (stats && productoSeleccionado) {
    insightText = `Si compra "${productoSeleccionado}" en la semana ${stats.semanaMin} (${fmt(stats.min)}) en vez de la semana ${stats.semanaMax} (${fmt(stats.max)}), ahorra el ${stats.ahorro}% del precio.`
  }

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/dashboards" className={styles.backButton}>← Volver</Link>
          <div className={styles.headerInfo}>
            <h1>📅 IEP — Calendario de Precios Estacionales</h1>
            <p>¿En qué semana del año está más barato cada producto?</p>
          </div>
        </div>

        {/* Product search */}
        <div style={{ marginTop: '1rem', position: 'relative', maxWidth: 480 }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Buscar producto:</span>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={productoInput}
                onChange={e => {
                  setProductoInput(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                placeholder="Ej: tomate de árbol, naranja…"
                style={{
                  width: '100%',
                  padding: '0.45rem 0.9rem',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: '0.9rem',
                  color: '#1a5276',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  maxHeight: 220,
                  overflowY: 'auto',
                  zIndex: 100,
                  listStyle: 'none',
                  padding: '0.3rem 0',
                  margin: 0,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}>
                  {suggestions.map(p => (
                    <li
                      key={p}
                      onMouseDown={() => handleSelect(p)}
                      style={{
                        padding: '0.45rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: '#2c3e50',
                        textTransform: 'capitalize',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#eaf2fb')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Cargando datos estacionales…</span>
          </div>
        )}

        {error && (
          <div style={{ background: '#fde8e8', border: '1px solid #f5c6cb', borderRadius: 10, padding: '1rem 1.5rem', color: '#e74c3c', marginBottom: '1.5rem' }}>
            Error: {error}
          </div>
        )}

        {!loading && !error && !productoSeleccionado && (
          <TopEstacionales productos={productos} />
        )}

        {!loading && !error && productoSeleccionado && data.length > 0 && stats && (
          <>
            {/* ── KPI Cards ── */}
            <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className={`${styles.kpiCard} ${styles.verde}`}>
                <div className={styles.kpiLabel}>Semana más barata</div>
                <div className={styles.kpiValue}>S{stats.semanaMin}</div>
                <div className={styles.kpiSub}>{fmt(stats.min)} · precio mínimo histórico</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.verde}`}>
                <div className={styles.kpiLabel}>Precio mínimo histórico</div>
                <div className={styles.kpiValue} style={{ fontSize: '1.4rem' }}>{fmt(stats.min)}</div>
                <div className={styles.kpiSub}>precio más bajo del año</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.rojo}`}>
                <div className={styles.kpiLabel}>Semana más cara</div>
                <div className={styles.kpiValue}>S{stats.semanaMax}</div>
                <div className={styles.kpiSub}>{fmt(stats.max)} · precio máximo histórico</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.naranja}`}>
                <div className={styles.kpiLabel}>Ahorro potencial</div>
                <div className={styles.kpiValue}>{stats.ahorro}%</div>
                <div className={styles.kpiSub}>comprando en la semana óptima</div>
              </div>
            </div>

            {/* ── Insight box ── */}
            {insightText && (
              <div style={{
                background: '#eaf6fb',
                border: '1px solid #aed6f1',
                borderRadius: 10,
                padding: '0.9rem 1.3rem',
                color: '#1a5276',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
              }}>
                <span style={{ fontSize: '1.1rem' }}>💡</span>
                <span>{insightText}</span>
              </div>
            )}

            {/* ── Area Chart ── */}
            <div className={styles.chartCard} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.chartTitle} style={{ textTransform: 'capitalize' }}>
                Precio histórico semanal · {productoSeleccionado}
              </div>
              <div className={styles.chartSub}>Promedio histórico por semana del año (semanas 1–52)</div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 8, right: 20, left: 10, bottom: 4 }}>
                  <defs>
                    <linearGradient id="colorPrecio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2980b9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2980b9" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="semana"
                    tick={{ fontSize: 11, fill: '#7f8c8d' }}
                    label={{ value: 'Semana del año', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#7f8c8d' }}
                    height={36}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#7f8c8d' }}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                    width={55}
                  />
                  <Tooltip
                    formatter={(value: number, _: string, entry: any) => [
                      fmt(value),
                      `Semana ${entry.payload.semana} · ${entry.payload.tipo || ''}`,
                    ]}
                    contentStyle={{ borderRadius: 8, fontSize: '0.82rem' }}
                  />
                  {stats && <ReferenceLine x={stats.semanaMin} stroke="#27ae60" strokeDasharray="4 2" label={{ value: '✓ Barato', fill: '#27ae60', fontSize: 10 }} />}
                  {stats && <ReferenceLine x={stats.semanaMax} stroke="#e74c3c" strokeDasharray="4 2" label={{ value: '✗ Caro', fill: '#e74c3c', fontSize: 10 }} />}
                  <Area
                    type="monotone"
                    dataKey="precio"
                    stroke="#2980b9"
                    strokeWidth={2}
                    fill="url(#colorPrecio)"
                    dot={(props: any) => {
                      const tipo = (props.payload?.tipo || '').toUpperCase()
                      const fill = tipo === 'BARATO' || tipo === 'MUY BARATO' ? '#27ae60'
                        : tipo === 'CARO' || tipo === 'MUY CARO' ? '#e74c3c'
                        : '#f39c12'
                      return <circle key={props.key} cx={props.cx} cy={props.cy} r={4} fill={fill} stroke="white" strokeWidth={1.5} />
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* ── Calendario visual ── */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>Calendario visual · 52 semanas</div>
              <div className={styles.chartSub}>
                Verde = semana barata · Amarillo = normal · Rojo = semana cara
              </div>
              <CalendarioGrid data={data} />
            </div>

            <p className={styles.fuente}>Fuente: Fruver Index / SIPSA-DANE · Datos históricos 2013–2026</p>
          </>
        )}

        {!loading && !error && productoSeleccionado && data.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
            No se encontraron datos estacionales para &quot;{productoSeleccionado}&quot;.
          </div>
        )}
      </main>
    </div>
  )
}
