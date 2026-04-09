'use client'

import Link from 'next/link'

const PLANES = [
  {
    nombre: 'Básico',
    precio: '$500K',
    periodo: 'mes',
    color: '#2980b9',
    descripcion: 'Para equipos de compras y análisis de precios',
    caracteristicas: [
      'Acceso a 7 dashboards principales',
      'Semáforo IOC — 402 productos',
      'Fruver Index — 87 ciudades',
      'Datos históricos 2018-2026',
      'Actualización semanal',
      '1 usuario',
    ],
    cta: 'Empezar',
    destacado: false,
  },
  {
    nombre: 'Pro',
    precio: '$2.5M',
    periodo: 'mes',
    color: '#1a5276',
    descripcion: 'Para retailers, distribuidores y gremios',
    caracteristicas: [
      'Todo lo del plan Básico',
      'Vista Retailer personalizada',
      'Alertas por WhatsApp y email',
      'Datos históricos 2013-2026 completos',
      'Exportación Excel de cualquier dashboard',
      'Reporte semanal en PDF automático',
      'API con 500K llamadas/mes',
      '5 usuarios',
      'Soporte prioritario',
    ],
    cta: 'Solicitar Demo',
    destacado: true,
  },
  {
    nombre: 'Enterprise',
    precio: 'A medida',
    periodo: '',
    color: '#8e44ad',
    descripcion: 'Para gobierno, organismos internacionales e industria',
    caracteristicas: [
      'Todo lo del plan Pro',
      'Integración con sus sistemas (API)',
      'Dashboard personalizado por sector',
      'White-label con su marca',
      'Capacitación y onboarding',
      'Datos actualizados en tiempo real',
      'SLA garantizado 99.9%',
      'Usuarios ilimitados',
      'Gerente de cuenta dedicado',
    ],
    cta: 'Contactar',
    destacado: false,
  },
]

const SECTORES = [
  { icon: '🛒', nombre: 'Retail', ejemplos: 'Éxito, D1, Ara, Corabastos', valor: 'Optimice compras semanales, negocie con proveedores con datos reales, identifique oportunidades de margen.' },
  { icon: '🏭', nombre: 'Agroindustria', ejemplos: 'Alpina, Nutresa, Postobón, Asohofrucol', valor: 'Planee compras de materias primas, minimice volatilidad de costos, anticipe escasez estacional.' },
  { icon: '🚛', nombre: 'Distribución', ejemplos: 'Mayoristas, transportadores, brokers', valor: 'Identifique arbitraje geográfico, optimice rutas de compra, maximice márgenes por ciudad.' },
  { icon: '🏛️', nombre: 'Gobierno', ejemplos: 'MinAgricultura, DANE, ICBF, Gobernaciones', valor: 'Monitoree seguridad alimentaria, compare inflación real vs IPC oficial, diseñe política pública con datos.' },
  { icon: '🌍', nombre: 'Internacional', ejemplos: 'WFP, FAO, BID, USAID, GIZ', valor: 'Evalúe riesgo alimentario en Colombia, acceda a series históricas completas, integre en sus modelos.' },
]

const HALLAZGOS = [
  { numero: '+174.5%', label: 'Inflación real SIPSA 2013-2026', sub: 'vs +139.6% del IPC oficial DANE' },
  { numero: '87', label: 'Ciudades monitoreadas', sub: 'en tiempo real, todas las semanas' },
  { numero: '1.852%', label: 'Brecha máxima entre ciudades', sub: 'Villavicencio vs Chiquinquirá' },
  { numero: '-17%', label: 'Poder adquisitivo en 2022', sub: 'el colombiano compró menos con el mismo salario' },
]

export default function PreciosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ background: '#1a5276', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '1.2rem' }}>
          🥕 Fruver Index
        </Link>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Volver al Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0d3349 0%, #1a5276 50%, #2980b9 100%)', color: 'white', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(243,156,18,0.2)', border: '1px solid rgba(243,156,18,0.5)', borderRadius: 20, padding: '0.3rem 1rem', fontSize: '0.85rem', color: '#f39c12', marginBottom: '1.5rem', fontWeight: 600 }}>
            🇨🇴 La inteligencia de precios agrícolas más completa de Colombia
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1 }}>
            Tome mejores decisiones<br />con datos reales del mercado
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem', lineHeight: 1.6 }}>
            3.1M registros · 87 ciudades · 402 productos · 13 años de historial<br />
            Transformamos los datos del SIPSA-DANE en inteligencia comercial accionable.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://wa.me/573XXXXXXXXX?text=Hola,%20quiero%20una%20demo%20de%20Fruver%20Index"
              target="_blank" rel="noopener noreferrer"
              style={{ background: '#27ae60', color: 'white', padding: '0.9rem 2rem', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>
              📱 Solicitar Demo por WhatsApp
            </a>
            <Link href="/" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.9rem 2rem', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '1rem', border: '1px solid rgba(255,255,255,0.3)' }}>
              Ver Dashboards →
            </Link>
          </div>
        </div>
      </section>

      {/* Hallazgos clave */}
      <section style={{ background: 'white', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#1a5276', marginBottom: '2.5rem' }}>
            Hallazgos que no encontrará en ningún otro lado
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {HALLAZGOS.map((h, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8f9fa', borderRadius: 16, borderTop: '4px solid #2980b9' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1a5276', marginBottom: '0.5rem' }}>{h.numero}</div>
                <div style={{ fontWeight: 700, color: '#2c3e50', marginBottom: '0.3rem' }}>{h.label}</div>
                <div style={{ fontSize: '0.82rem', color: '#7f8c8d' }}>{h.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectores */}
      <section style={{ padding: '3rem 2rem', background: '#f8f9fa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#1a5276', marginBottom: '0.5rem' }}>
            ¿Para quién es Fruver Index?
          </h2>
          <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '2.5rem' }}>
            Inteligencia específica para cada sector de la cadena agroalimentaria
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem' }}>
            {SECTORES.map((s, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.7rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a5276', marginBottom: '0.3rem' }}>{s.nombre}</div>
                <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '0.8rem' }}>{s.ejemplos}</div>
                <div style={{ fontSize: '0.88rem', color: '#5d6d7e', lineHeight: 1.6 }}>{s.valor}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#1a5276', marginBottom: '0.5rem' }}>
            Planes y Precios
          </h2>
          <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '3rem' }}>
            Break-even con 1 solo cliente. ROI desde el primer mes.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {PLANES.map((p, i) => (
              <div key={i} style={{
                background: p.destacado ? '#1a5276' : 'white',
                color: p.destacado ? 'white' : '#2c3e50',
                borderRadius: 20,
                padding: '2rem',
                boxShadow: p.destacado ? '0 8px 32px rgba(26,82,118,0.35)' : '0 2px 12px rgba(0,0,0,0.08)',
                border: p.destacado ? 'none' : '2px solid #e8e8e8',
                position: 'relative',
                transform: p.destacado ? 'scale(1.03)' : 'none',
              }}>
                {p.destacado && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#f39c12', color: 'white', padding: '0.3rem 1.2rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    ⭐ MÁS POPULAR
                  </div>
                )}
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem', color: p.destacado ? '#7fb3d3' : '#7f8c8d' }}>{p.nombre}</div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '0.2rem' }}>{p.precio}</div>
                {p.periodo && <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.8rem' }}>por {p.periodo}</div>}
                <div style={{ fontSize: '0.88rem', opacity: 0.85, marginBottom: '1.5rem', lineHeight: 1.5 }}>{p.descripcion}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {p.caracteristicas.map((c, j) => (
                    <li key={j} style={{ fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ color: p.destacado ? '#7fb3d3' : '#27ae60', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ opacity: 0.9 }}>{c}</span>
                    </li>
                  ))}
                </ul>
                <a href="https://wa.me/573XXXXXXXXX?text=Hola,%20me%20interesa%20el%20plan%20" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'block', textAlign: 'center', padding: '0.9rem',
                    background: p.destacado ? '#f39c12' : '#1a5276',
                    color: 'white', borderRadius: 10, textDecoration: 'none',
                    fontWeight: 800, fontSize: '0.95rem',
                    transition: 'opacity 0.2s',
                  }}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ background: 'linear-gradient(135deg, #1a5276, #2980b9)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>
            ¿Listo para tomar decisiones con datos reales?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
            Break-even con 1 cliente. Demo en 30 minutos. Sin compromisos.
          </p>
          <a href="https://wa.me/573XXXXXXXXX?text=Hola%20Daniel,%20quiero%20una%20demo%20de%20Fruver%20Index"
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#27ae60', color: 'white', padding: '1.1rem 3rem', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            📱 Agendar Demo — WhatsApp
          </a>
          <div style={{ marginTop: '1.5rem', fontSize: '0.88rem', opacity: 0.7 }}>
            Daniel Morales · CEO Fruver Index · Pereira, Colombia · fruverindex.com
          </div>
        </div>
      </section>

      <footer style={{ background: '#0d3349', color: 'rgba(255,255,255,0.5)', padding: '1.5rem', textAlign: 'center', fontSize: '0.82rem' }}>
        Fruver Index © 2026 · Datos SIPSA-DANE · 3.1M registros · 87 ciudades · 402 productos · 2013-2026
      </footer>
    </div>
  )
}
