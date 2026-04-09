'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import styles from './dashboard.module.css'

const ANIOS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
const COLORES_IPAA: Record<string, string> = {
  MEJORO: '#27ae60', ESTABLE: '#f39c12', DETERIORO: '#e74c3c'
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ciudadParam = searchParams.get('ciudad') || 'bogota'
  const anioParam = parseInt(searchParams.get('anio') || '2025')

  const [ciudad, setCiudad] = useState(ciudadParam)
  const [anio, setAnio] = useState(anioParam)
  const [ciudades, setCiudades] = useState<string[]>([])

  const [serieFI, setSerieFI] = useState<any[]>([])
  const [rankingFI, setRankingFI] = useState<any[]>([])
  const [iocData, setIocData] = useState<any>({ resumen: {}, data: [] })
  const [ipaaData, setIpaaData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Cargar lista de ciudades
  useEffect(() => {
    fetch('/api/fi?tipo=ciudades')
      .then(r => r.json())
      .then(d => { if (d.success) setCiudades(d.data) })
      .catch(() => {})
  }, [])

  // Cargar datos del dashboard
  const cargarDatos = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [resFI, resRanking, resIOC, resIPAA] = await Promise.all([
        fetch(`/api/fi?ciudad=${encodeURIComponent(ciudad)}&anio=${anio}`),
        fetch(`/api/fi?tipo=ranking&anio=${anio}`),
        fetch(`/api/ioc?ciudad=${encodeURIComponent(ciudad)}`),
        fetch(`/api/ipaa?ciudad=${encodeURIComponent(ciudad)}`),
      ])

      const [fi, ranking, ioc, ipaa] = await Promise.all([
        resFI.json(), resRanking.json(), resIOC.json(), resIPAA.json()
      ])

      if (fi.success)      setSerieFI(fi.data || [])
      if (ranking.success) setRankingFI(ranking.data || [])
      if (ioc.success)     setIocData(ioc)
      if (ipaa.success)    setIpaaData(ipaa.tendencia || [])
    } catch (e: any) {
      setError('Error cargando datos. Verifique la conexión.')
    } finally {
      setLoading(false)
    }
  }, [ciudad, anio])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // KPIs
  const fiActual = serieFI.length > 0
    ? Math.round(serieFI.reduce((s, r) => s + r.fi_valor, 0) / serieFI.length)
    : null
  const rankPos = rankingFI.findIndex(r => r.ciudad === ciudad.toLowerCase()) + 1
  const productosOK = serieFI.length > 0 ? serieFI[serieFI.length - 1]?.productos_cubiertos : null
  const ipaaActual = ipaaData.find(r => r.anio === 2025)?.ipaa_mediana
  const maxFI = rankingFI.length > 0 ? rankingFI[0].fi_promedio : 1

  // IOC alertas
  const rojos = (iocData.data || [])
    .filter((r: any) => r.semaforo === 'ROJO')
    .sort((a: any, b: any) => b.variacion_vs_historico_pct - a.variacion_vs_historico_pct)
    .slice(0, 6)
  const verdes = (iocData.data || [])
    .filter((r: any) => r.semaforo === 'VERDE')
    .sort((a: any, b: any) => a.variacion_vs_historico_pct - b.variacion_vs_historico_pct)
    .slice(0, 4)

  const handleCiudad = (c: string) => {
    setCiudad(c)
    router.push(`/dashboards/fruver-index?ciudad=${encodeURIComponent(c)}&anio=${anio}`)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <Link href="/" className={styles.backButton}>← Volver</Link>
            <div className={styles.headerInfo}>
              <h1>🥕 Fruver Index</h1>
              <p>Cargando datos...</p>
            </div>
          </div>
        </div>
        <div className={styles.loading}><div className={styles.spinner} /><p>Consultando Supabase...</p></div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/" className={styles.backButton}>← Volver</Link>
          <div className={styles.headerInfo}>
            <h1>🥕 Fruver Index — {ciudad.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h1>
            <p>Índice de precios tipo Big Mac · 71 productos canasta familiar DANE · {anio}</p>
          </div>
        </div>

        {/* Selector de ciudad */}
        <div className={styles.ciudadSelector}>
          <label>Ciudad:</label>
          <select value={ciudad} onChange={e => handleCiudad(e.target.value)}>
            {ciudades.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.main}>
        {/* Selector de año */}
        <div className={styles.anioSelector}>
          {ANIOS.map(a => (
            <button
              key={a}
              className={`${styles.anioBtn} ${a === anio ? styles.active : ''}`}
              onClick={() => setAnio(a)}
            >{a}</button>
          ))}
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>FI Promedio {anio}</div>
            <div className={styles.kpiValue}>{fiActual ? fiActual.toLocaleString('es-CO') : '—'}</div>
            <div className={styles.kpiSub}>Puntos índice ponderado</div>
          </div>
          <div className={`${styles.kpiCard} ${styles.naranja}`}>
            <div className={styles.kpiLabel}>Ranking Nacional</div>
            <div className={styles.kpiValue}>{rankPos > 0 ? `#${rankPos}` : '—'}</div>
            <div className={styles.kpiSub}>de {rankingFI.length} ciudades</div>
          </div>
          <div className={`${styles.kpiCard} ${styles.verde}`}>
            <div className={styles.kpiLabel}>Productos Cubiertos</div>
            <div className={styles.kpiValue}>{productosOK ?? '—'}</div>
            <div className={styles.kpiSub}>de 71 canasta DANE</div>
          </div>
          <div className={`${styles.kpiCard} ${ipaaActual && ipaaActual >= 95 ? styles.verde : styles.rojo}`}>
            <div className={styles.kpiLabel}>IPAA 2025 (base 2013=100)</div>
            <div className={styles.kpiValue}>{ipaaActual ?? '—'}</div>
            <div className={styles.kpiSub}>{ipaaActual && ipaaActual >= 100 ? 'Mejoró vs 2013' : 'Perdió poder adquisitivo'}</div>
          </div>
          <div className={`${styles.kpiCard} ${styles.rojo}`}>
            <div className={styles.kpiLabel}>Alertas Precio ROJO</div>
            <div className={styles.kpiValue}>{iocData.resumen?.ROJO ?? '—'}</div>
            <div className={styles.kpiSub}>Productos sobre su precio histórico</div>
          </div>
          <div className={`${styles.kpiCard} ${styles.morado}`}>
            <div className={styles.kpiLabel}>Semanas de datos</div>
            <div className={styles.kpiValue}>{serieFI.length}</div>
            <div className={styles.kpiSub}>en {anio} para {ciudad}</div>
          </div>
        </div>

        {/* Gráfica serie FI + Ranking */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Evolución FI {anio} — {ciudad.charAt(0).toUpperCase() + ciudad.slice(1)}</div>
            <div className={styles.chartSub}>Valor semanal del Fruver Index (71 productos ponderados)</div>
            {serieFI.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={serieFI} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="semana" tick={{ fontSize: 11 }} label={{ value: 'Semana', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString('es-CO')} width={75} />
                  <Tooltip
                    formatter={(v: any) => [v.toLocaleString('es-CO'), 'FI Valor']}
                    labelFormatter={l => `Semana ${l}`}
                  />
                  <Line type="monotone" dataKey="fi_valor" stroke="#2980b9" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.loading} style={{ padding: '2rem' }}>
                <p>Sin datos para {ciudad} en {anio}</p>
              </div>
            )}
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Ranking de Ciudades {anio}</div>
            <div className={styles.chartSub}>FI promedio anual — ciudades con más datos primero</div>
            <ul className={styles.rankingList}>
              {rankingFI.slice(0, 15).map((r, i) => {
                const pct = Math.round((r.fi_promedio / maxFI) * 100)
                const esCiudadActual = r.ciudad === ciudad.toLowerCase()
                return (
                  <li
                    key={r.ciudad}
                    className={styles.rankingItem}
                    onClick={() => handleCiudad(r.ciudad)}
                    title={`Ver datos de ${r.ciudad}`}
                    style={{
                      background: esCiudadActual ? '#eaf4fb' : 'transparent',
                      cursor: 'pointer',
                      borderLeft: esCiudadActual ? '4px solid #f39c12' : '4px solid transparent',
                      paddingLeft: '0.4rem',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!esCiudadActual) (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
                    onMouseLeave={e => { if (!esCiudadActual) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <span className={`${styles.rankingPos} ${i === 0 ? styles.gold : i === 1 ? styles.silver : i === 2 ? styles.bronze : ''}`}>
                      {i + 1}
                    </span>
                    <span className={styles.rankingCiudad} style={{ fontWeight: esCiudadActual ? 800 : 600 }}>
                      {esCiudadActual ? '▶ ' : ''}{r.ciudad}
                    </span>
                    <div className={styles.rankingBarra}>
                      <div className={styles.rankingBarraFill} style={{ width: `${pct}%`, background: esCiudadActual ? '#f39c12' : '#2980b9' }} />
                    </div>
                    <span className={styles.rankingValor}>{r.fi_promedio.toLocaleString('es-CO')}</span>
                  </li>
                )
              })}
            </ul>
            <div style={{ marginTop: '0.8rem', fontSize: '0.78rem', color: '#7f8c8d', textAlign: 'center' }}>
              💡 Haz clic en cualquier ciudad para cargar sus datos
            </div>
          </div>
        </div>

        {/* IOC Semáforo + IPAA */}
        <div className={styles.chartsGridFull}>
          {/* Semáforo */}
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>🚦 IOC — Semáforo de Precios</div>
            <div className={styles.chartSub}>Precio actual vs historial 2013-2026 · {ciudad.charAt(0).toUpperCase() + ciudad.slice(1)}</div>

            <div className={styles.semaforoGrid}>
              <div className={`${styles.semaforoCard} ${styles.rojo}`}>
                <div className={styles.semaforoNum}>{iocData.resumen?.ROJO ?? 0}</div>
                <div className={styles.semaforoLabel}>🔴 CARO</div>
              </div>
              <div className={`${styles.semaforoCard} ${styles.amarillo}`}>
                <div className={styles.semaforoNum}>{iocData.resumen?.AMARILLO ?? 0}</div>
                <div className={styles.semaforoLabel}>🟡 NORMAL</div>
              </div>
              <div className={`${styles.semaforoCard} ${styles.verde}`}>
                <div className={styles.semaforoNum}>{iocData.resumen?.VERDE ?? 0}</div>
                <div className={styles.semaforoLabel}>🟢 BARATO</div>
              </div>
            </div>

            <div style={{ marginBottom: '0.8rem', fontSize: '0.82rem', fontWeight: 700, color: '#e74c3c' }}>
              ▲ Más caros que su promedio histórico
            </div>
            <ul className={styles.alertasList}>
              {rojos.map((r: any) => (
                <li key={r.producto} className={styles.alertaItem}>
                  <span className={styles.alertaDot} />
                  <span className={styles.alertaProducto}>{r.producto}</span>
                  <span className={styles.alertaPct}>+{r.variacion_vs_historico_pct?.toFixed(0)}%</span>
                </li>
              ))}
              {verdes.length > 0 && (
                <>
                  <div style={{ margin: '0.6rem 0 0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#27ae60' }}>
                    ▼ Oportunidad de compra
                  </div>
                  {verdes.map((r: any) => (
                    <li key={r.producto} className={`${styles.alertaItem} ${styles.verde}`}>
                      <span className={`${styles.alertaDot} ${styles.verde}`} />
                      <span className={styles.alertaProducto}>{r.producto}</span>
                      <span className={`${styles.alertaPct} ${styles.verde}`}>{r.variacion_vs_historico_pct?.toFixed(0)}%</span>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* IPAA */}
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>📉 IPAA — Poder Adquisitivo Alimentario</div>
            <div className={styles.chartSub}>Base 2013=100 · &gt;100 mejoró · &lt;100 empeoró</div>

            {ipaaData.filter(r => r.anio >= 2018).map(r => {
              const pct = Math.min(Math.round((r.ipaa_mediana / 120) * 100), 100)
              const color = r.estado === 'MEJORO' ? '#27ae60' : r.estado === 'ESTABLE' ? '#f39c12' : '#e74c3c'
              return (
                <div key={r.anio} className={styles.ipaaBar}>
                  <span className={styles.ipaaAnio}>{r.anio}</span>
                  <div className={styles.ipaaTrack}>
                    <div className={styles.ipaaFill} style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className={styles.ipaaValor}>{r.ipaa_mediana}</span>
                </div>
              )
            })}

            <div style={{ marginTop: '1.2rem', padding: '0.8rem', background: '#f8f9fa', borderRadius: 8, fontSize: '0.82rem', color: '#7f8c8d' }}>
              <strong style={{ color: '#2c3e50' }}>Lectura:</strong> En 2022, el colombiano tenía un 17% menos de poder adquisitivo alimentario que en 2013. En 2025 aún no se ha recuperado al nivel base.
            </div>

            {/* Mini gráfica IPAA */}
            <div style={{ marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={ipaaData.filter(r => r.anio >= 2018)} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="anio" tick={{ fontSize: 10 }} />
                  <YAxis domain={[70, 115]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => [v, 'IPAA']} />
                  <Bar dataKey="ipaa_mediana" radius={[4, 4, 0, 0]}>
                    {ipaaData.filter(r => r.anio >= 2018).map((r, i) => (
                      <Cell key={i} fill={COLORES_IPAA[r.estado] || '#2980b9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={styles.fuente}>
          Fuente: Fruver Index / SIPSA-DANE · 3.1M registros · 2013-2026 · fruverindex.com
        </div>
      </div>
    </div>
  )
}

export default function FruverIndexDashboard() {
  return (
    <Suspense fallback={
      <div style={{ padding: '3rem', color: 'white', background: 'linear-gradient(135deg,#1a5276,#2980b9)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🥕</div>
          <p>Cargando Fruver Index...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
