'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

const SECTORES = [
  { href: '/sectores/retailer', icon: '🛒', titulo: 'Vista Retailer', desc: 'Compre barato esta semana · Evite caros · Arbitraje nacional · Riesgo de precio', color: '#27ae60' },
  { href: '/sectores/gobierno', icon: '🏛️', titulo: 'Vista Gobierno', desc: 'IPAA · MIR vs IPC DANE · Ranking ciudades · Seguridad alimentaria', color: '#8e44ad' },
]

const DASHBOARDS = [
  { href: '/dashboards/fruver-index', icon: '📊', titulo: 'Fruver Index (FI)', desc: '71 productos · Canasta DANE · Precio referencia por ciudad', color: '#2980b9' },
  { href: '/dashboards/semaforo',     icon: '🚦', titulo: 'Semáforo IOC',        desc: '402 productos · ¿Está caro o barato vs su historial?', color: '#e74c3c' },
  { href: '/dashboards/arbitraje',    icon: '🗺️', titulo: 'Arbitraje IAG',       desc: '87 ciudades · Dónde comprar y dónde vender', color: '#27ae60' },
  { href: '/dashboards/calendario',   icon: '📅', titulo: 'Calendario IEP',      desc: '52 semanas · Mejor momento para comprar cada producto', color: '#f39c12' },
  { href: '/dashboards/riesgo',       icon: '⚡', titulo: 'Riesgo IRA',          desc: '402 productos · Volatilidad de precios por ciudad', color: '#8e44ad' },
  { href: '/dashboards/mir',          icon: '📈', titulo: 'Inflación MIR v2.0',  desc: '363 productos · SIPSA vs IPC oficial DANE 2013-2026', color: '#7f8c8d' },
  { href: '/dashboards/comparativa',  icon: '🔄', titulo: 'Canasta DANE',        desc: '71 categorías IPC · 100% cobertura 8 grupos', color: '#1a5276' },
]

const STATS = [
  { valor: '3.1M', label: 'Registros' },
  { valor: '87',   label: 'Ciudades' },
  { valor: '402',  label: 'Productos' },
  { valor: '687',  label: 'Semanas' },
  { valor: '9',    label: 'Índices' },
  { valor: '13',   label: 'Años' },
]

export default function Home() {
  const [alertas, setAlertas] = useState<any[]>([])
  const [oportunidades, setOportunidades] = useState<any[]>([])
  const [tickerIdx, setTickerIdx] = useState(0)

  useEffect(() => {
    fetch('/api/ioc')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setAlertas(d.data.filter((r: any) => r.semaforo === 'ROJO').slice(0, 8))
          setOportunidades(d.data.filter((r: any) => r.semaforo === 'VERDE').slice(0, 4))
        }
      }).catch(() => {})
  }, [])

  useEffect(() => {
    if (alertas.length === 0) return
    const t = setInterval(() => setTickerIdx(i => (i + 1) % alertas.length), 3000)
    return () => clearInterval(t)
  }, [alertas])

  const tickerItems = [
    ...alertas.map(a => ({ texto: `🔴 ${a.producto?.toUpperCase()} +${a.variacion_vs_historico_pct?.toFixed(0)}% sobre histórico`, tipo: 'rojo' })),
    ...oportunidades.map(o => ({ texto: `🟢 ${o.producto?.toUpperCase()} ${o.variacion_vs_historico_pct?.toFixed(0)}% bajo histórico`, tipo: 'verde' })),
  ]

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>🥕</div>
          <h1 className={styles.title}>Fruver Index</h1>
          <p className={styles.subtitle}>Inteligencia de precios agrícolas para Colombia</p>

          {/* Stats bar */}
          <div className={styles.statsBar}>
            {STATS.map(s => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statValor}>{s.valor}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Ticker de alertas */}
      {tickerItems.length > 0 && (
        <div className={styles.ticker}>
          <span className={styles.tickerLabel}>ALERTA PRECIO</span>
          <span className={styles.tickerText} style={{ color: tickerItems[tickerIdx % tickerItems.length]?.tipo === 'verde' ? '#27ae60' : '#e74c3c' }}>
            {tickerItems[tickerIdx % tickerItems.length]?.texto}
          </span>
        </div>
      )}

      {/* Vistas por Sector */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🎯 Vistas por Sector</h2>
        <div className={styles.dashboardGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {SECTORES.map(s => (
            <Link key={s.href} href={s.href} className={styles.dashboardCard} style={{ '--accent': s.color, background: 'rgba(255,255,255,0.97)' } as any}>
              <div className={styles.dashboardIcon}>{s.icon}</div>
              <h3 className={styles.dashboardTitulo}>{s.titulo}</h3>
              <p className={styles.dashboardDesc}>{s.desc}</p>
              <div className={styles.dashboardArrow} style={{ color: s.color }}>Abrir vista →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dashboards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Centro de Inteligencia</h2>
        <div className={styles.dashboardGrid}>
          {DASHBOARDS.map(d => (
            <Link key={d.href} href={d.href} className={styles.dashboardCard} style={{ '--accent': d.color } as any}>
              <div className={styles.dashboardIcon}>{d.icon}</div>
              <h3 className={styles.dashboardTitulo}>{d.titulo}</h3>
              <p className={styles.dashboardDesc}>{d.desc}</p>
              <div className={styles.dashboardArrow}>Ver análisis →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Alertas en tiempo real */}
      {alertas.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔴 Alertas de Precio — Esta semana</h2>
          <div className={styles.alertasGrid}>
            {alertas.slice(0, 6).map((a, i) => (
              <div key={i} className={styles.alertaCard}>
                <div className={styles.alertaProducto}>{a.producto}</div>
                <div className={styles.alertaPct}>+{a.variacion_vs_historico_pct?.toFixed(0)}%</div>
                <div className={styles.alertaDesc}>sobre su promedio histórico</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Precios */}
      <section style={{ padding: '2rem', textAlign: 'center' }}>
        <Link href="/precios" style={{ display: 'inline-block', background: '#f39c12', color: 'white', padding: '0.9rem 2.5rem', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 16px rgba(243,156,18,0.4)' }}>
          💰 Ver Planes y Precios →
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Fruver Index © 2026 · Datos SIPSA-DANE · fruverindex.com</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
          3.1M registros · 87 ciudades · 402 productos · 2013-2026
        </p>
      </footer>
    </div>
  )
}
