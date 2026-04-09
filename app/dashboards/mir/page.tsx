'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import styles from '../fruver-index/dashboard.module.css'

export default function MIRDashboard() {
  const [mirData, setMirData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mir')
      .then(r => r.json())
      .then(d => { if (d.success) setMirData(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const ultimo = mirData[mirData.length - 1]
  const peorAnio = [...mirData].sort((a, b) => b.mir_pct - a.mir_pct)[0]
  const mirAcum = ultimo ? (ultimo.mir_idx - 100).toFixed(1) : '—'
  const ipcAcum = ultimo ? (ultimo.ipc_idx - 100).toFixed(1) : '—'
  const brechaAcum = ultimo ? ultimo.diferencia_pp.toFixed(1) : '—'

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/" className={styles.backButton}>← Volver</Link>
          <div className={styles.headerInfo}>
            <h1>📈 MIR v2.0 — Monitor de Inflación Real</h1>
            <p>363 productos · 8 grupos alimenticios · Pesos IPC DANE base 2018 · 2013-2026</p>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        {loading ? (
          <div className={styles.loading}><div className={styles.spinner} /><p>Cargando MIR...</p></div>
        ) : (
          <>
            {/* KPIs */}
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard} style={{ borderLeftColor: '#8e44ad' }}>
                <div className={styles.kpiLabel}>Inflación SIPSA acumulada</div>
                <div className={styles.kpiValue}>+{mirAcum}%</div>
                <div className={styles.kpiSub}>2013 → 2025</div>
              </div>
              <div className={styles.kpiCard} style={{ borderLeftColor: '#7f8c8d' }}>
                <div className={styles.kpiLabel}>IPC Oficial DANE acumulado</div>
                <div className={styles.kpiValue}>+{ipcAcum}%</div>
                <div className={styles.kpiSub}>2013 → 2025</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.rojo}`}>
                <div className={styles.kpiLabel}>Brecha SIPSA vs DANE</div>
                <div className={styles.kpiValue}>+{brechaAcum}pp</div>
                <div className={styles.kpiSub}>SIPSA detecta más inflación</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.naranja}`}>
                <div className={styles.kpiLabel}>Peor año inflacionario</div>
                <div className={styles.kpiValue}>{peorAnio?.anio}</div>
                <div className={styles.kpiSub}>MIR: +{peorAnio?.mir_pct}% vs DANE: +{peorAnio?.ipc_dane_pct}%</div>
              </div>
              <div className={`${styles.kpiCard} ${styles.verde}`}>
                <div className={styles.kpiLabel}>Deflación en mayoreo</div>
                <div className={styles.kpiValue}>2024</div>
                <div className={styles.kpiSub}>MIR: -1.1% — compresión de márgenes</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiLabel}>Productos analizados</div>
                <div className={styles.kpiValue}>363</div>
                <div className={styles.kpiSub}>de 8 grupos · filtro ≥500 registros</div>
              </div>
            </div>

            {/* Gráfica principal: barras MIR% + línea IPC% */}
            <div className={styles.chartCard} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.chartTitle}>Inflación Anual: MIR SIPSA vs IPC Oficial DANE</div>
              <div className={styles.chartSub}>Variación % año a año · Barras = SIPSA · Línea = DANE · Diferencia acumulada 2013→2025: +{brechaAcum}pp</div>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={mirData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    formatter={(v: any, name: string) => [`${v}%`, name]}
                    labelFormatter={l => `Año ${l}`}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#ccc" strokeWidth={1} />
                  <Bar dataKey="mir_pct" name="MIR SIPSA %" radius={[4,4,0,0]}>
                    {mirData.map((r, i) => (
                      <Cell key={i} fill={r.mir_pct < 0 ? '#27ae60' : r.mir_pct > 20 ? '#e74c3c' : '#8e44ad'} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="ipc_dane_pct" name="IPC DANE %" stroke="#7f8c8d" strokeWidth={2.5} dot={{ r: 4 }} strokeDasharray="6 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Índice acumulado base 100 */}
            <div className={styles.chartCard} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.chartTitle}>Índice Acumulado Base 2013 = 100</div>
              <div className={styles.chartSub}>Si en 2013 la canasta costaba $100 · SIPSA: ${mirAcum ? (100 + parseFloat(mirAcum)).toFixed(0) : '—'} · DANE: ${ipcAcum ? (100 + parseFloat(ipcAcum)).toFixed(0) : '—'}</div>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={mirData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
                  <YAxis domain={[90, 300]} tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={l => `Año ${l}`} />
                  <Legend />
                  <ReferenceLine y={100} stroke="#27ae60" strokeDasharray="4 4" label={{ value: 'Base 2013', position: 'right', fontSize: 10, fill: '#27ae60' }} />
                  <Line type="monotone" dataKey="mir_idx" name="SIPSA Acumulado" stroke="#8e44ad" strokeWidth={3} dot={{ r: 4, fill: '#8e44ad' }} />
                  <Line type="monotone" dataKey="ipc_idx" name="IPC DANE Acumulado" stroke="#7f8c8d" strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="6 3" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Insights clave */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>💡 Hallazgos Clave para Decisiones Comerciales</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {[
                  { icon: '⚠️', color: '#e74c3c', titulo: 'Subregistro del IPC', texto: 'El SIPSA detecta +34.9pp más inflación acumulada que el IPC oficial. Los mayoristas absorben más inflación de la que reporta el DANE.' },
                  { icon: '🔥', color: '#f39c12', titulo: '2022: Crisis histórica', texto: 'El peor año en 13 años: MIR +31.8% vs IPC +27.8%. Crisis de insumos post-pandemia golpeó a los mayoristas antes que al consumidor.' },
                  { icon: '📉', color: '#27ae60', titulo: '2024: Deflación mayorista', texto: 'MIR -1.1% — primera deflación en mayoreo desde 2013. Señal de compresión de márgenes en la cadena agrícola.' },
                  { icon: '☕', color: '#8e44ad', titulo: 'Café: el más inflacionario', texto: '+239% entre 2013 y 2026. Líder absoluto en inflación, impulsado por fenómeno climático y demanda global.' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: 10, borderLeft: `4px solid ${item.color}` }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, color: '#1a5276', marginBottom: '0.4rem', fontSize: '0.9rem' }}>{item.titulo}</div>
                    <div style={{ fontSize: '0.82rem', color: '#5d6d7e', lineHeight: 1.5 }}>{item.texto}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.fuente}>
              Fuente: Fruver Index / SIPSA-DANE · 363 productos · 8 grupos · Pesos IPC base 2018 · fruverindex.com
            </div>
          </>
        )}
      </div>
    </div>
  )
}
