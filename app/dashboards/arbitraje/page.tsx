'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import styles from '../fruver-index/dashboard.module.css'

// ─── Types ───────────────────────────────────────────────────────────────────
interface IAGRow {
  producto: string
  grupo_alimentos: string
  precio_min: number
  precio_max: number
  precio_media: number
  iag_pct: number
  ciudad_mas_cara: string
  precio_ciudad_max: number
  ciudad_mas_barata: string
  precio_ciudad_min: number
  oportunidad: string
  n_ciudades: number
}

interface APIResponse {
  success: boolean
  data: IAGRow[]
  grupos: string[]
  anio: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ANIOS = [2022, 2023, 2024, 2025]
const MIN_PCT_OPTIONS = [
  { label: 'Todas', value: 0 },
  { label: '≥ 20%', value: 20 },
  { label: '≥ 50%', value: 50 },
  { label: '≥ 100%', value: 100 },
  { label: '≥ 200%', value: 200 },
]

function nivelColor(nivel: string): string {
  if (!nivel) return '#f5f5f5'
  const n = nivel.toUpperCase()
  if (n === 'ALTA') return '#fde8e8'
  if (n === 'MEDIA') return '#fff8e1'
  return '#f5f5f5'
}

function nivelBadgeStyle(nivel: string): React.CSSProperties {
  const n = (nivel || '').toUpperCase()
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.03em',
  }
  if (n === 'ALTA') return { ...base, background: '#e74c3c', color: 'white' }
  if (n === 'MEDIA') return { ...base, background: '#f39c12', color: 'white' }
  return { ...base, background: '#95a5a6', color: 'white' }
}

function barColor(pct: number): string {
  if (pct >= 100) return '#e74c3c'
  if (pct >= 50) return '#f39c12'
  if (pct >= 20) return '#2980b9'
  return '#7f8c8d'
}

function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ArbitrajePage() {
  const [anio, setAnio] = useState(2025)
  const [grupo, setGrupo] = useState('')
  const [minPct, setMinPct] = useState(0)
  const [data, setData] = useState<IAGRow[]>([])
  const [grupos, setGrupos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        anio: String(anio),
        grupo,
        min_pct: String(minPct),
      })
      const res = await fetch(`/api/iag?${params}`)
      const json: APIResponse = await res.json()
      if (!json.success) throw new Error(json.grupos?.toString() || 'Error al cargar datos')
      setData(json.data)
      setGrupos(json.grupos)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [anio, grupo, minPct])

  useEffect(() => { fetchData() }, [fetchData])

  // KPIs
  const altaCount = data.filter(r => (r.oportunidad || '').toUpperCase() === 'ALTA').length
  const maxBrecha = data.length > 0 ? Math.max(...data.map(r => r.iag_pct)) : 0
  const topProducto = data.length > 0 ? data[0] : null

  // Chart: top 15
  const chartData = data.slice(0, 15).map(r => ({
    name: r.producto.length > 22 ? r.producto.slice(0, 22) + '…' : r.producto,
    fullName: r.producto,
    pct: Math.round(r.iag_pct * 10) / 10,
    oportunidad: r.oportunidad,
  }))

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/dashboards" className={styles.backButton}>← Volver</Link>
          <div className={styles.headerInfo}>
            <h1>🗺️ IAG — Arbitraje Geográfico</h1>
            <p>Diferencial de precios entre ciudades · Dónde comprar y dónde vender</p>
          </div>
        </div>

        {/* Año */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginRight: '0.3rem' }}>Año:</span>
          {ANIOS.map(a => (
            <button
              key={a}
              className={`${styles.anioBtn} ${anio === a ? styles.active : ''}`}
              onClick={() => setAnio(a)}
            >
              {a}
            </button>
          ))}

          {/* Grupo */}
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginLeft: '1rem', marginRight: '0.3rem' }}>Grupo:</span>
          <select
            value={grupo}
            onChange={e => setGrupo(e.target.value)}
            style={{
              padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none',
              fontSize: '0.88rem', background: 'white', color: '#1a5276', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <option value="">Todos los grupos</option>
            {grupos.map(g => (
              <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
            ))}
          </select>

          {/* Margen mínimo */}
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginLeft: '1rem', marginRight: '0.3rem' }}>Margen mín.:</span>
          <select
            value={minPct}
            onChange={e => setMinPct(Number(e.target.value))}
            style={{
              padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none',
              fontSize: '0.88rem', background: 'white', color: '#1a5276', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {MIN_PCT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </header>

      <main className={styles.main}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Cargando oportunidades de arbitraje…</span>
          </div>
        )}

        {error && (
          <div style={{ background: '#fde8e8', border: '1px solid #f5c6cb', borderRadius: 10, padding: '1rem 1.5rem', color: '#e74c3c', marginBottom: '1.5rem' }}>
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── KPI Cards ── */}
            <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div className={`${styles.kpiCard} ${styles.rojo}`}>
                <div className={styles.kpiLabel}>Oportunidades ALTA</div>
                <div className={styles.kpiValue}>{altaCount}</div>
                <div className={styles.kpiSub}>productos con brecha elevada</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.naranja}`}>
                <div className={styles.kpiLabel}>Mayor brecha encontrada</div>
                <div className={styles.kpiValue}>{maxBrecha > 0 ? `${maxBrecha.toFixed(1)}%` : '—'}</div>
                <div className={styles.kpiSub}>diferencia precio máx. vs mín.</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.morado}`}>
                <div className={styles.kpiLabel}>Producto con mayor spread</div>
                <div className={styles.kpiValue} style={{ fontSize: '1.2rem', lineHeight: 1.2 }}>
                  {topProducto ? topProducto.producto : '—'}
                </div>
                <div className={styles.kpiSub}>
                  {topProducto
                    ? `${topProducto.ciudad_mas_barata} → ${topProducto.ciudad_mas_cara}`
                    : 'sin datos'}
                </div>
              </div>
            </div>

            {/* ── Chart: Top 15 productos por brecha ── */}
            <div className={styles.chartCard} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.chartTitle}>Top 15 productos por brecha de precio (IAG%)</div>
              <div className={styles.chartSub}>
                Diferencia porcentual entre la ciudad más cara y la más barata · {anio}
              </div>
              {chartData.length === 0 ? (
                <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '2rem' }}>
                  No hay datos para los filtros seleccionados.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 60, left: 10, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={v => `${v}%`}
                      tick={{ fontSize: 11, fill: '#7f8c8d' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={160}
                      tick={{ fontSize: 11, fill: '#2c3e50' }}
                    />
                    <Tooltip
                      formatter={(value: number, _: string, entry: any) => [
                        `${value}%`,
                        `Brecha IAG · ${entry.payload.fullName}`,
                      ]}
                      contentStyle={{ borderRadius: 8, fontSize: '0.83rem' }}
                    />
                    <Bar dataKey="pct" radius={[0, 6, 6, 0]} label={{ position: 'right', formatter: (v: number) => `${v}%`, fontSize: 11, fill: '#1a5276' }}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={barColor(entry.pct)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Table ── */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>Detalle de todas las oportunidades · {data.length} productos</div>
              <div className={styles.chartSub}>Ordenados por brecha % descendente</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                  <thead>
                    <tr style={{ background: '#1a5276', color: 'white' }}>
                      {['Producto', 'Grupo', 'Ciudad Barata', 'Precio Mín', 'Ciudad Cara', 'Precio Máx', 'Brecha %', 'Nivel'].map(h => (
                        <th key={h} style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          background: nivelColor(row.oportunidad),
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                        }}
                      >
                        <td style={{ padding: '0.5rem 0.8rem', fontWeight: 600, color: '#2c3e50', textTransform: 'capitalize' }}>
                          {row.producto}
                        </td>
                        <td style={{ padding: '0.5rem 0.8rem', color: '#7f8c8d', textTransform: 'capitalize' }}>
                          {row.grupo_alimentos}
                        </td>
                        <td style={{ padding: '0.5rem 0.8rem', color: '#27ae60', fontWeight: 600, textTransform: 'capitalize' }}>
                          {row.ciudad_mas_barata || '—'}
                        </td>
                        <td style={{ padding: '0.5rem 0.8rem', color: '#27ae60', fontWeight: 700 }}>
                          {fmt(row.precio_ciudad_min)}
                        </td>
                        <td style={{ padding: '0.5rem 0.8rem', color: '#e74c3c', fontWeight: 600, textTransform: 'capitalize' }}>
                          {row.ciudad_mas_cara || '—'}
                        </td>
                        <td style={{ padding: '0.5rem 0.8rem', color: '#e74c3c', fontWeight: 700 }}>
                          {fmt(row.precio_ciudad_max)}
                        </td>
                        <td style={{ padding: '0.5rem 0.8rem', fontWeight: 700, color: '#1a5276' }}>
                          {row.iag_pct != null ? `${row.iag_pct.toFixed(1)}%` : '—'}
                        </td>
                        <td style={{ padding: '0.5rem 0.8rem' }}>
                          <span style={nivelBadgeStyle(row.oportunidad)}>{row.oportunidad || '—'}</span>
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>
                          No hay resultados para los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className={styles.fuente}>Fuente: Fruver Index / SIPSA-DANE · Actualizado {anio}</p>
          </>
        )}
      </main>
    </div>
  )
}
