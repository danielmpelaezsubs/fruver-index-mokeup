'use client'

import { useEffect, useState } from 'react'

// ── Tipos ──────────────────────────────────────────────────────────────────
interface IocItem {
  producto: string
  semaforo: string
  variacion_vs_historico_pct: number
  precio_actual: number
  precio_hist_media: number
  grupo_alimentos: string
}

// ── Paleta ────────────────────────────────────────────────────────────────
const C = {
  primario:  '#1a5276',
  secundario:'#2980b9',
  verde:     '#27ae60',
  rojo:      '#e74c3c',
  naranja:   '#f39c12',
  morado:    '#8e44ad',
  gris:      '#7f8c8d',
  fondo:     '#f8f9fa',
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatCOP(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

function PrecioCard({ item, tipo }: { item: IocItem; tipo: 'verde' | 'rojo' }) {
  const esVerde = tipo === 'verde'
  const color   = esVerde ? C.verde : C.rojo
  const bg      = esVerde ? '#f0fdf4' : '#fff5f5'
  const borde   = esVerde ? '#bbf7d0' : '#fde8e8'
  const signo   = item.variacion_vs_historico_pct > 0 ? '+' : ''

  return (
    <div style={{
      background: bg,
      border: `2px solid ${borde}`,
      borderRadius: 14,
      padding: '1.2rem 1.4rem',
      borderLeft: `5px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#2c3e50', fontSize: '1rem', textTransform: 'capitalize', marginBottom: '0.3rem' }}>
            {item.producto}
          </div>
          <div style={{
            fontSize: '0.72rem',
            background: `${color}18`,
            color: color,
            border: `1px solid ${color}40`,
            borderRadius: 12,
            padding: '0.1rem 0.5rem',
            display: 'inline-block',
            fontWeight: 600,
          }}>
            {item.grupo_alimentos}
          </div>
        </div>
        <div style={{
          background: color,
          color: 'white',
          borderRadius: 10,
          padding: '0.5rem 0.8rem',
          textAlign: 'center',
          minWidth: 70,
          flexShrink: 0,
        }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            {signo}{item.variacion_vs_historico_pct.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>vs histórico</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.9rem', fontSize: '0.82rem' }}>
        <div>
          <div style={{ color: C.gris, marginBottom: '0.2rem' }}>Precio actual</div>
          <div style={{ fontWeight: 700, color: C.primario }}>{formatCOP(item.precio_actual)}/kg</div>
        </div>
        <div>
          <div style={{ color: C.gris, marginBottom: '0.2rem' }}>Media histórica</div>
          <div style={{ fontWeight: 600, color: '#5d6d7e' }}>{formatCOP(item.precio_hist_media)}/kg</div>
        </div>
        <div>
          <div style={{ color: C.gris, marginBottom: '0.2rem' }}>Señal</div>
          <div style={{ fontWeight: 700, color: color }}>
            {esVerde ? '🟢 Comprar ahora' : '🔴 Precio alto'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────
export default function DemoRetail() {
  const [oportunidades, setOportunidades] = useState<IocItem[]>([])
  const [alertas, setAlertas] = useState<IocItem[]>([])
  const [loadingV, setLoadingV] = useState(true)
  const [loadingR, setLoadingR] = useState(true)

  useEffect(() => {
    fetch('/api/ioc?semaforo=VERDE')
      .then(r => r.json())
      .then(d => { if (d.success) setOportunidades(d.data.slice(0, 8)) })
      .finally(() => setLoadingV(false))

    fetch('/api/ioc?semaforo=ROJO')
      .then(r => r.json())
      .then(d => { if (d.success) setAlertas(d.data.slice(0, 8)) })
      .finally(() => setLoadingR(false))
  }, [])

  const waLink = 'https://wa.me/573XXXXXXXXX?text=Vi%20el%20demo%20retail%20y%20quiero%20acceso%20completo'

  return (
    <div style={{ minHeight: '100vh', background: C.fondo, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primario} 0%, ${C.secundario} 100%)`,
        padding: '2.5rem 2rem',
        color: 'white',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 20,
          padding: '0.35rem 1rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '1.2rem',
          letterSpacing: '0.05em',
        }}>
          🔒 ACCESO DE DEMOSTRACIÓN — FRUVER INDEX
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, margin: '0 0 0.8rem', lineHeight: 1.2 }}>
          🛒 Demo Exclusivo — Inteligencia de Precios para Retail
        </h1>
        <p style={{ opacity: 0.88, fontSize: '1.05rem', maxWidth: 680, margin: '0 auto 1.5rem' }}>
          Datos reales de mayoreo SIPSA-DANE · 87 ciudades de Colombia · Actualización semanal
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { val: '3.1M', label: 'registros históricos' },
            { val: '402', label: 'productos monitoreados' },
            { val: '87', label: 'ciudades de Colombia' },
            { val: '13', label: 'años de historia' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{item.val}</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ── Oportunidades VERDE ───────────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: C.verde }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: C.primario, margin: 0 }}>
              🟢 Oportunidades de Compra Esta Semana
            </h2>
          </div>
          <p style={{ color: C.gris, fontSize: '0.88rem', margin: '0 0 1.2rem' }}>
            Productos con precio actual por debajo de su media histórica — momento óptimo para comprar y reponer inventario.
          </p>
          {loadingV ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: C.gris }}>
              <div style={{ width: 36, height: 36, border: `4px solid #e0e0e0`, borderTopColor: C.verde, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
              Cargando oportunidades...
            </div>
          ) : oportunidades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: C.gris, background: 'white', borderRadius: 12 }}>
              No hay datos de oportunidades disponibles en este momento.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {oportunidades.map((item, i) => (
                <PrecioCard key={i} item={item} tipo="verde" />
              ))}
            </div>
          )}
        </div>

        {/* ── Alertas ROJO ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: C.rojo }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: C.primario, margin: 0 }}>
              🔴 Alertas de Precio — Productos Caros vs Histórico
            </h2>
          </div>
          <p style={{ color: C.gris, fontSize: '0.88rem', margin: '0 0 1.2rem' }}>
            Productos con precio superior a su media histórica — evaluar sustitutos o renegociar con proveedores.
          </p>
          {loadingR ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: C.gris }}>
              <div style={{ width: 36, height: 36, border: `4px solid #e0e0e0`, borderTopColor: C.rojo, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
              Cargando alertas...
            </div>
          ) : alertas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: C.gris, background: 'white', borderRadius: 12 }}>
              No hay alertas disponibles en este momento.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {alertas.map((item, i) => (
                <PrecioCard key={i} item={item} tipo="rojo" />
              ))}
            </div>
          )}
        </div>

        {/* ── Propuesta de valor ────────────────────────────────────────── */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          marginBottom: '2.5rem',
        }}>
          <h2 style={{ color: C.primario, fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.2rem' }}>
            💼 Con Fruver Index usted puede...
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            {[
              {
                icon: '📉',
                color: C.verde,
                titulo: 'Reducir costo de inventario',
                texto: 'Compre en el momento óptimo usando el semáforo IOC. Sepa cuándo un producto está barato vs su historia.',
              },
              {
                icon: '📊',
                color: C.secundario,
                titulo: 'Negociar con proveedores',
                texto: 'Use datos de precios mayoreo vs minoreo de 87 ciudades para tener poder de negociación real.',
              },
              {
                icon: '⚠️',
                color: C.naranja,
                titulo: 'Anticipar escasez y alzas',
                texto: 'El riesgo agrícola IRA detecta volatilidad antes de que suba el precio al consumidor.',
              },
              {
                icon: '🗺️',
                color: C.morado,
                titulo: 'Encontrar mejores fuentes',
                texto: 'El arbitraje geográfico IAG muestra diferencias de precio entre ciudades para optimizar su cadena de abasto.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '1.2rem',
                background: C.fondo,
                borderRadius: 12,
                borderLeft: `4px solid ${item.color}`,
              }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, color: C.primario, marginBottom: '0.4rem', fontSize: '0.92rem' }}>
                  {item.titulo}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#5d6d7e', lineHeight: 1.5 }}>{item.texto}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA principal ─────────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center',
          background: `linear-gradient(135deg, ${C.verde} 0%, #1e8449 100%)`,
          borderRadius: 16,
          padding: '2.5rem 2rem',
          marginBottom: '2.5rem',
          color: 'white',
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.6rem' }}>
            ¿Listo para tomar decisiones basadas en datos reales?
          </h2>
          <p style={{ opacity: 0.9, margin: '0 0 1.5rem', fontSize: '0.95rem' }}>
            Break-even con 1 cliente. Acceso completo desde $500K/mes.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'white',
              color: C.verde,
              fontWeight: 800,
              fontSize: '1.05rem',
              padding: '1rem 2.5rem',
              borderRadius: 12,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s',
            }}
          >
            📱 Solicitar Acceso Completo
          </a>
        </div>

        {/* ── Formulario de contacto ────────────────────────────────────── */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          marginBottom: '2rem',
          maxWidth: 560,
          margin: '0 auto 2rem',
        }}>
          <h2 style={{ color: C.primario, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', textAlign: 'center' }}>
            O déjenos sus datos y le contactamos
          </h2>
          <p style={{ color: C.gris, fontSize: '0.84rem', textAlign: 'center', margin: '0 0 1.5rem' }}>
            Respuesta en menos de 24 horas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {[
              { label: 'Nombre completo', placeholder: 'Ej. María González', type: 'text' },
              { label: 'Empresa / Cadena', placeholder: 'Ej. Éxito, D1, Ara...', type: 'text' },
              { label: 'Cargo', placeholder: 'Ej. Director de Compras', type: 'text' },
              { label: 'Correo electrónico', placeholder: 'compras@empresa.com', type: 'email' },
            ].map(field => (
              <div key={field.label}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: C.primario, marginBottom: '0.35rem' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    border: '1.5px solid #dde3ea',
                    borderRadius: 8,
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    color: '#2c3e50',
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              style={{
                background: C.primario,
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '0.85rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginTop: '0.3rem',
                transition: 'background 0.2s',
              }}
            >
              Enviar — Quiero acceso completo
            </button>
          </div>
        </div>

      </div>

      {/* ── Footer standalone ────────────────────────────────────────────── */}
      <div style={{
        background: C.primario,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        padding: '1.2rem',
        fontSize: '0.8rem',
      }}>
        Fruver Index © 2026 · Demo confidencial · fruverindex.com
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
