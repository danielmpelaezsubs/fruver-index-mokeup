'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import styles from '../fruver-index/dashboard.module.css'

const GRUPOS = ['frutas frescas','verduras y hortalizas','tuberculos raices y platanos','carnes','pescados','huevos y lacteos','granos y cereales','productos procesados']

export default function SemaforoDashboard() {
  const [data, setData]       = useState<any[]>([])
  const [resumen, setResumen] = useState<any>({})
  const [ciudad, setCiudad]   = useState('')
  const [grupo, setGrupo]     = useState('')
  const [filtro, setFiltro]   = useState<'TODOS'|'ROJO'|'AMARILLO'|'VERDE'>('TODOS')
  const [ciudades, setCiudades] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [pagina, setPagina]   = useState(0)
  const [selectedProducto, setSelectedProducto] = useState<string | null>(null)
  const tablaRef = useRef<HTMLDivElement>(null)
  const POR_PAGINA = 20

  useEffect(() => {
    fetch('/api/fi?tipo=ciudades')
      .then(r => r.json())
      .then(d => { if (d.success) setCiudades(d.data) })
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (ciudad) params.set('ciudad', ciudad)
    if (grupo)  params.set('grupo', grupo)
    fetch(`/api/ioc?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setData(d.data)
          setResumen(d.resumen)
          setPagina(0)
        }
      })
      .finally(() => setLoading(false))
  }, [ciudad, grupo])

  const filtrados = data
    .filter(r => filtro === 'TODOS' || r.semaforo === filtro)
    .filter(r => !selectedProducto || r.producto === selectedProducto)
  const pagina_data = filtrados.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA)
  const total_paginas = Math.ceil(filtrados.length / POR_PAGINA)

  // Top 10 para gráfica
  const top10rojos  = [...data].filter(r => r.semaforo === 'ROJO').slice(0, 10)
  const top10verdes = [...data].filter(r => r.semaforo === 'VERDE').sort((a,b) => a.variacion_vs_historico_pct - b.variacion_vs_historico_pct).slice(0, 10)

  const totalProductos = (resumen.ROJO || 0) + (resumen.AMARILLO || 0) + (resumen.VERDE || 0)
  const pctRojo = totalProductos > 0 ? Math.round((resumen.ROJO || 0) / totalProductos * 100) : 0

  const handleBarClick = (data: any) => {
    const producto = data?.activePayload?.[0]?.payload?.producto || data?.producto
    if (!producto) return
    setSelectedProducto(prev => prev === producto ? null : producto)
    setTimeout(() => {
      tablaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/" className={styles.backButton}>← Volver</Link>
          <div className={styles.headerInfo}>
            <h1>🚦 IOC — Semáforo de Precios</h1>
            <p>402 productos · Precio actual vs historial 2013-2026 · Z-score de desviación</p>
          </div>
        </div>
        <div className={styles.ciudadSelector} style={{ marginTop: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', opacity: 0.85 }}>Ciudad:</label>
            <select value={ciudad} onChange={e => setCiudad(e.target.value)} style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none', fontSize: '0.9rem', color: '#1a5276', fontWeight: 600 }}>
              <option value="">🌎 Nacional</option>
              {ciudades.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', opacity: 0.85 }}>Grupo:</label>
            <select value={grupo} onChange={e => setGrupo(e.target.value)} style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none', fontSize: '0.9rem', color: '#1a5276', fontWeight: 600 }}>
              <option value="">Todos los grupos</option>
              {GRUPOS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase()+g.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        {loading ? (
          <div className={styles.loading}><div className={styles.spinner}/><p>Consultando precios...</p></div>
        ) : (
          <>
            {/* KPIs */}
            <div className={styles.kpiGrid}>
              <div className={`${styles.kpiCard} ${styles.rojo}`}>
                <div className={styles.kpiLabel}>🔴 CARO — Sobre histórico</div>
                <div className={styles.kpiValue}>{resumen.ROJO ?? 0}</div>
                <div className={styles.kpiSub}>{pctRojo}% de los productos analizados</div>
              </div>
              <div className={styles.kpiCard} style={{ borderLeftColor: '#f39c12' }}>
                <div className={styles.kpiLabel}>🟡 NORMAL — En rango histórico</div>
                <div className={styles.kpiValue}>{resumen.AMARILLO ?? 0}</div>
                <div className={styles.kpiSub}>Precio dentro de lo esperado</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.verde}`}>
                <div className={styles.kpiLabel}>🟢 BARATO — Oportunidad</div>
                <div className={styles.kpiValue}>{resumen.VERDE ?? 0}</div>
                <div className={styles.kpiSub}>Por debajo de su promedio histórico</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiLabel}>📦 Total productos analizados</div>
                <div className={styles.kpiValue}>{totalProductos}</div>
                <div className={styles.kpiSub}>{ciudad ? ciudad : 'Nivel nacional'} · {grupo || 'todos los grupos'}</div>
              </div>
            </div>

            {/* Gráficas top alertas y oportunidades */}
            <div className={styles.chartsGridFull} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>🔴 Top 10 — Más caros vs histórico</div>
                <div className={styles.chartSub}>% de variación sobre precio promedio 2013-2026</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={top10rojos} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `+${v}%`} />
                    <YAxis type="category" dataKey="producto" tick={{ fontSize: 10 }} width={130} tickFormatter={v => v.length > 18 ? v.slice(0,18)+'…' : v} />
                    <Tooltip formatter={(v: any) => [`+${v?.toFixed(1)}%`, 'Variación vs histórico']} cursor={{ fill: 'rgba(0,0,0,0.08)' }} />
                    <Bar dataKey="variacion_vs_historico_pct" radius={[0,4,4,0]} cursor="pointer">
                      {top10rojos.map((_, i) => <Cell key={i} fill={i < 3 ? '#c0392b' : '#e74c3c'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.chartCard}>
                <div className={styles.chartTitle}>🟢 Oportunidades — Más baratos vs histórico</div>
                <div className={styles.chartSub}>% bajo su precio promedio histórico — Compre ahora</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={top10verdes} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="producto" tick={{ fontSize: 10 }} width={130} tickFormatter={v => v.length > 18 ? v.slice(0,18)+'…' : v} />
                    <Tooltip formatter={(v: any) => [`${v?.toFixed(1)}%`, 'Variación vs histórico']} cursor={{ fill: 'rgba(0,0,0,0.08)' }} />
                    <Bar dataKey="variacion_vs_historico_pct" radius={[0,4,4,0]} cursor="pointer">
                      {top10verdes.map((_, i) => <Cell key={i} fill={i < 3 ? '#1e8449' : '#27ae60'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel de detalle drill-down */}
            {selectedProducto && (() => {
              const item = data.find(r => r.producto === selectedProducto)
              if (!item) return null
              const esRojo = item.semaforo === 'ROJO'
              return (
                <div style={{
                  background: esRojo ? '#fff5f5' : '#f0fdf4',
                  border: `2px solid ${esRojo ? '#e74c3c' : '#27ae60'}`,
                  borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem',
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7f8c8d', fontWeight: 700, textTransform: 'uppercase' }}>Producto</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2c3e50', textTransform: 'capitalize' }}>{item.producto}</div>
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d', textTransform: 'capitalize' }}>{item.grupo_alimentos}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7f8c8d', fontWeight: 700, textTransform: 'uppercase' }}>Precio Actual</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: esRojo ? '#e74c3c' : '#27ae60' }}>${item.precio_actual?.toLocaleString('es-CO')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7f8c8d', fontWeight: 700, textTransform: 'uppercase' }}>Precio Histórico</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2c3e50' }}>${item.precio_hist_media?.toLocaleString('es-CO')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7f8c8d', fontWeight: 700, textTransform: 'uppercase' }}>Variación</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: esRojo ? '#e74c3c' : '#27ae60' }}>
                      {item.variacion_vs_historico_pct > 0 ? '+' : ''}{item.variacion_vs_historico_pct?.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7f8c8d', fontWeight: 700, textTransform: 'uppercase' }}>Z-score</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2c3e50' }}>{item.z_score?.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={() => setSelectedProducto(null)} style={{
                      background: '#f0f0f0', border: 'none', borderRadius: 8, padding: '0.5rem 1rem',
                      cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#555'
                    }}>✕ Ver todos</button>
                  </div>
                </div>
              )
            })()}

            {/* Tabla completa */}
            <div className={styles.chartCard} ref={tablaRef}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <div className={styles.chartTitle}>{selectedProducto ? `Detalle: ${selectedProducto.charAt(0).toUpperCase() + selectedProducto.slice(1)}` : 'Tabla Completa de Precios'}</div>
                  <div className={styles.chartSub}>{filtrados.length} productos · ordenados por desviación</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['TODOS','ROJO','AMARILLO','VERDE'] as const).map(f => (
                    <button key={f} onClick={() => { setFiltro(f); setPagina(0) }}
                      style={{
                        padding: '0.35rem 0.8rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                        background: filtro === f ? (f==='ROJO'?'#e74c3c':f==='VERDE'?'#27ae60':f==='AMARILLO'?'#f39c12':'#1a5276') : '#f0f0f0',
                        color: filtro === f ? 'white' : '#555',
                      }}>
                      {f === 'TODOS' ? `Todo (${data.length})` : f === 'ROJO' ? `🔴 ${resumen.ROJO||0}` : f === 'AMARILLO' ? `🟡 ${resumen.AMARILLO||0}` : `🟢 ${resumen.VERDE||0}`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                      {['Semáforo','Producto','Grupo','Precio Actual','Precio Histórico','Variación','Z-score'].map(h => (
                        <th key={h} style={{ padding: '0.6rem 0.8rem', color: '#7f8c8d', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagina_data.map((r, i) => {
                      const esSeleccionado = r.producto === selectedProducto
                      const bg = esSeleccionado
                        ? (r.semaforo === 'ROJO' ? '#fecaca' : r.semaforo === 'VERDE' ? '#bbf7d0' : '#fef9c3')
                        : (r.semaforo === 'ROJO' ? '#fff5f5' : r.semaforo === 'VERDE' ? '#f0fdf4' : 'white')
                      const borderLeft = esSeleccionado
                        ? `4px solid ${r.semaforo === 'ROJO' ? '#e74c3c' : r.semaforo === 'VERDE' ? '#27ae60' : '#f39c12'}`
                        : undefined
                      const pctColor = r.variacion_vs_historico_pct > 0 ? '#e74c3c' : '#27ae60'
                      return (
                        <tr key={i} style={{ background: bg, borderBottom: '1px solid #f0f0f0', borderLeft }}>
                          <td style={{ padding: '0.6rem 0.8rem' }}>
                            <span style={{ fontSize: '1.1rem' }}>{r.semaforo==='ROJO'?'🔴':r.semaforo==='VERDE'?'🟢':'🟡'}</span>
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#2c3e50', textTransform: 'capitalize' }}>{r.producto}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: '#7f8c8d', textTransform: 'capitalize', fontSize: '0.8rem' }}>{r.grupo_alimentos}</td>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>${r.precio_actual?.toLocaleString('es-CO')}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: '#7f8c8d' }}>${r.precio_hist_media?.toLocaleString('es-CO')}</td>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 800, color: pctColor }}>
                            {r.variacion_vs_historico_pct > 0 ? '+' : ''}{r.variacion_vs_historico_pct?.toFixed(1)}%
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: '#7f8c8d' }}>{r.z_score?.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {total_paginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={() => setPagina(p => Math.max(0, p-1))} disabled={pagina === 0}
                    style={{ padding: '0.4rem 1rem', borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: pagina===0?'default':'pointer', opacity: pagina===0?0.4:1 }}>
                    ← Anterior
                  </button>
                  <span style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: '#7f8c8d' }}>
                    {pagina+1} / {total_paginas}
                  </span>
                  <button onClick={() => setPagina(p => Math.min(total_paginas-1, p+1))} disabled={pagina===total_paginas-1}
                    style={{ padding: '0.4rem 1rem', borderRadius: 8, border: '1px solid #ddd', background: 'white', cursor: pagina===total_paginas-1?'default':'pointer', opacity: pagina===total_paginas-1?0.4:1 }}>
                    Siguiente →
                  </button>
                </div>
              )}
            </div>

            <div className={styles.fuente}>
              Fuente: Fruver Index / SIPSA-DANE · Historial 2013-2026 · fruverindex.com
            </div>
          </>
        )}
      </div>
    </div>
  )
}
