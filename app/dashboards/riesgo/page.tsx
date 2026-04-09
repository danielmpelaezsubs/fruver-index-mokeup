'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import styles from '../fruver-index/dashboard.module.css'

// ─── Types ───────────────────────────────────────────────────────────────────
interface IRARow {
  producto: string
  grupo_alimentos: string
  cv_promedio: number
  nivel_riesgo: 'ALTO' | 'MEDIO' | 'BAJO'
  ciudades: number
}

interface IRAResumen {
  ALTO: number
  MEDIO: number
  BAJO: number
}

interface APIResponse {
  success: boolean
  data: IRARow[]
  resumen: IRAResumen
  anio: number
  grupos: string[]
  error?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────
const ANIOS = [2022, 2023, 2024, 2025]
const CV_MAX = 0.6 // scale max for bars

// ─── Helpers ─────────────────────────────────────────────────────────────────
function nivelColor(nivel: string): string {
  if (nivel === 'ALTO') return '#e74c3c'
  if (nivel === 'MEDIO') return '#f39c12'
  return '#27ae60'
}

function nivelBg(nivel: string): string {
  if (nivel === 'ALTO') return '#fde8e8'
  if (nivel === 'MEDIO') return '#fff8e1'
  return '#f0fdf4'
}

function nivelLabel(nivel: string): string {
  if (nivel === 'ALTO') return 'Riesgo ALTO'
  if (nivel === 'MEDIO') return 'Riesgo MEDIO'
  return 'Riesgo BAJO'
}

// ─── CV Bar component ─────────────────────────────────────────────────────────
function CVBar({ cv, nivel }: { cv: number; nivel: string }) {
  const pct = Math.min((cv / CV_MAX) * 100, 100)
  const color = nivelColor(nivel)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
      <div style={{
        flex: 1,
        height: 10,
        background: '#f0f0f0',
        borderRadius: 5,
        overflow: 'hidden',
        minWidth: 80,
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 5,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{
        fontSize: '0.78rem',
        fontWeight: 700,
        color,
        minWidth: 36,
        textAlign: 'right',
      }}>
        {(cv * 100).toFixed(1)}%
      </span>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function RiesgoPage() {
  const [anio, setAnio] = useState(2025)
  const [nivel, setNivel] = useState('')
  const [grupo, setGrupo] = useState('')
  const [data, setData] = useState<IRARow[]>([])
  const [resumen, setResumen] = useState<IRAResumen>({ ALTO: 0, MEDIO: 0, BAJO: 0 })
  const [grupos, setGrupos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagina, setPagina] = useState(0)

  const POR_PAGINA = 50

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    setPagina(0)
    try {
      const params = new URLSearchParams({ anio: String(anio), nivel, grupo })
      const res = await fetch(`/api/ira?${params}`)
      const json: APIResponse = await res.json()
      if (!json.success) throw new Error(json.error || 'Error al cargar')
      setData(json.data)
      setResumen(json.resumen)
      setGrupos(json.grupos || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [anio, nivel, grupo])

  useEffect(() => { fetchData() }, [fetchData])

  // Pagination
  const totalPaginas = Math.ceil(data.length / POR_PAGINA)
  const paginaData = data.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA)

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/dashboards" className={styles.backButton}>← Volver</Link>
          <div className={styles.headerInfo}>
            <h1>⚡ IRA — Mapa de Riesgo Agrícola</h1>
            <p>Volatilidad de precios por producto · Coeficiente de variación 2013–2026</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
          {/* Año */}
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

          {/* Nivel de riesgo */}
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginLeft: '1rem', marginRight: '0.3rem' }}>Riesgo:</span>
          <select
            value={nivel}
            onChange={e => setNivel(e.target.value)}
            style={{
              padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none',
              fontSize: '0.88rem', background: 'white', color: '#1a5276', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <option value="">Todos</option>
            <option value="ALTO">ALTO</option>
            <option value="MEDIO">MEDIO</option>
            <option value="BAJO">BAJO</option>
          </select>

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
        </div>
      </header>

      <main className={styles.main}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Calculando niveles de riesgo agrícola…</span>
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
            <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className={`${styles.kpiCard} ${styles.rojo}`}>
                <div className={styles.kpiLabel}>Productos ALTO riesgo</div>
                <div className={styles.kpiValue}>{resumen.ALTO}</div>
                <div className={styles.kpiSub}>CV {'>'} 30% · precios muy volátiles</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.naranja}`}>
                <div className={styles.kpiLabel}>Productos MEDIO riesgo</div>
                <div className={styles.kpiValue}>{resumen.MEDIO}</div>
                <div className={styles.kpiSub}>CV 15–30% · volatilidad moderada</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.verde}`}>
                <div className={styles.kpiLabel}>Productos BAJO riesgo</div>
                <div className={styles.kpiValue}>{resumen.BAJO}</div>
                <div className={styles.kpiSub}>CV {'<'} 15% · precios estables</div>
              </div>
            </div>

            {/* ── Insight box ── */}
            <div style={{
              background: '#fff8e1',
              border: '1px solid #fde68a',
              borderRadius: 10,
              padding: '0.9rem 1.3rem',
              color: '#92400e',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
              <span>
                Productos con CV {'>'} 0.30 no deben contratarse a precio fijo. Su alta volatilidad implica riesgo de pérdida para proveedores y compradores en acuerdos de largo plazo.
              </span>
            </div>

            {/* ── CV Scale legend ── */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.78rem', color: '#7f8c8d' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 16, height: 10, background: '#27ae60', borderRadius: 3, display: 'inline-block' }} />
                BAJO (CV {'<'} 15%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 16, height: 10, background: '#f39c12', borderRadius: 3, display: 'inline-block' }} />
                MEDIO (CV 15–30%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 16, height: 10, background: '#e74c3c', borderRadius: 3, display: 'inline-block' }} />
                ALTO (CV {'>'} 30%)
              </span>
              <span style={{ marginLeft: 'auto' }}>Escala: 0% → 60%</span>
            </div>

            {/* ── Product list ── */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>
                Ranking de volatilidad · {data.length} productos · {anio}
              </div>
              <div className={styles.chartSub}>
                Coeficiente de variación promedio entre ciudades. Mayor CV = mayor riesgo de precio.
              </div>

              {paginaData.length === 0 ? (
                <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '2rem' }}>
                  No hay resultados para los filtros seleccionados.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {paginaData.map((row, i) => (
                    <div
                      key={`${row.producto}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.7rem',
                        padding: '0.55rem 0.8rem',
                        borderRadius: 8,
                        background: nivelBg(row.nivel_riesgo),
                        border: `1px solid ${nivelColor(row.nivel_riesgo)}22`,
                      }}
                    >
                      {/* Rank */}
                      <span style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: nivelColor(row.nivel_riesgo),
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {pagina * POR_PAGINA + i + 1}
                      </span>

                      {/* Product name */}
                      <div style={{ minWidth: 180, flex: '0 0 180px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2c3e50', textTransform: 'capitalize', lineHeight: 1.2 }}>
                          {row.producto}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#7f8c8d', textTransform: 'capitalize' }}>
                          {row.grupo_alimentos} · {row.ciudades} ciudades
                        </div>
                      </div>

                      {/* CV bar */}
                      <CVBar cv={row.cv_promedio} nivel={row.nivel_riesgo} />

                      {/* Badge */}
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: nivelColor(row.nivel_riesgo),
                        color: 'white',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {nivelLabel(row.nivel_riesgo)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.2rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setPagina(p => Math.max(0, p - 1))}
                    disabled={pagina === 0}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: 8,
                      border: '1px solid #ddd',
                      background: pagina === 0 ? '#f5f5f5' : 'white',
                      cursor: pagina === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      color: '#1a5276',
                    }}
                  >
                    ← Anterior
                  </button>
                  <span style={{ fontSize: '0.83rem', color: '#7f8c8d' }}>
                    Página {pagina + 1} de {totalPaginas} ({data.length} productos)
                  </span>
                  <button
                    onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
                    disabled={pagina === totalPaginas - 1}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: 8,
                      border: '1px solid #ddd',
                      background: pagina === totalPaginas - 1 ? '#f5f5f5' : 'white',
                      cursor: pagina === totalPaginas - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      color: '#1a5276',
                    }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>

            <p className={styles.fuente}>Fuente: Fruver Index / SIPSA-DANE · CV calculado sobre datos históricos 2013–2026</p>
          </>
        )}
      </main>
    </div>
  )
}
