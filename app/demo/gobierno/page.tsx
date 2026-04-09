'use client'

import { useEffect, useState } from 'react'

// ── Tipos ──────────────────────────────────────────────────────────────────
interface IpaaRow {
  anio: number
  ipaa_mediana: number
  idx_precios: number
  idx_smmlv: number
  ciudades: number
  estado: string
}

interface MirRow {
  anio: number
  mir_pct: number
  ipc_dane_pct: number
  diferencia_pp: number
  mir_idx: number
  ipc_idx: number
}

interface FiRow {
  ciudad: string
  fi_promedio: number
  productos_cubiertos: number
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
function estadoColor(estado: string) {
  if (!estado) return C.gris
  const e = estado.toLowerCase()
  if (e.includes('críti') || e.includes('criti') || e.includes('bajo')) return C.rojo
  if (e.includes('alerta') || e.includes('moderado') || e.includes('medio')) return C.naranja
  if (e.includes('estable') || e.includes('normal') || e.includes('bueno') || e.includes('alto')) return C.verde
  return C.gris
}

function Spinner({ color }: { color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem', color: C.gris }}>
      <div style={{
        width: 36, height: 36,
        border: '4px solid #e0e0e0',
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 1rem',
      }} />
      Cargando datos...
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────
export default function DemoGobierno() {
  const [ipaaData, setIpaaData] = useState<IpaaRow[]>([])
  const [mirData,  setMirData]  = useState<MirRow[]>([])
  const [fiData,   setFiData]   = useState<FiRow[]>([])
  const [loadingI, setLoadingI] = useState(true)
  const [loadingM, setLoadingM] = useState(true)
  const [loadingF, setLoadingF] = useState(true)

  useEffect(() => {
    fetch('/api/ipaa')
      .then(r => r.json())
      .then(d => {
        const rows: IpaaRow[] = d.tendencia ?? d.data ?? []
        setIpaaData(rows.filter(r => r.anio >= 2018 && r.anio <= 2025))
      })
      .finally(() => setLoadingI(false))

    fetch('/api/mir')
      .then(r => r.json())
      .then(d => { if (d.success) setMirData(d.data) })
      .finally(() => setLoadingM(false))

    fetch('/api/fi?tipo=ranking&anio=2025')
      .then(r => r.json())
      .then(d => { if (d.success) setFiData(d.data) })
      .finally(() => setLoadingF(false))
  }, [])

  const top10Caras    = [...fiData].sort((a, b) => b.fi_promedio - a.fi_promedio).slice(0, 10)
  const top10Baratas  = [...fiData].sort((a, b) => a.fi_promedio - b.fi_promedio).slice(0, 10)
  const maxFi         = top10Caras[0]?.fi_promedio ?? 1

  const waLink = 'https://wa.me/573XXXXXXXXX?text=Vi%20el%20demo%20gobierno%20y%20quiero%20una%20presentacion'

  return (
    <div style={{ minHeight: '100vh', background: C.fondo, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, #0d3349 0%, ${C.primario} 50%, ${C.secundario} 100%)`,
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
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', fontWeight: 800, margin: '0 0 0.8rem', lineHeight: 1.2 }}>
          🏛️ Demo Exclusivo — Inteligencia de Seguridad Alimentaria
        </h1>
        <p style={{ opacity: 0.88, fontSize: '1.05rem', maxWidth: 700, margin: '0 auto 1.5rem' }}>
          Datos SIPSA-DANE procesados · Inflación real vs IPC oficial · Poder adquisitivo alimentario · Acceso para gobierno y organismos internacionales
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { val: '87', label: 'ciudades monitoreadas' },
            { val: '402', label: 'productos agrícolas' },
            { val: '13', label: 'años de historia' },
            { val: '3.1M', label: 'registros procesados' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{item.val}</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1150, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ── IPAA: Poder Adquisitivo Alimentario ──────────────────────── */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          marginBottom: '2rem',
        }}>
          <h2 style={{ color: C.primario, fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.3rem' }}>
            💰 IPAA — Poder Adquisitivo Alimentario (2018-2025)
          </h2>
          <p style={{ color: C.gris, fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
            Capacidad del salario mínimo SMMLV para cubrir la canasta alimentaria · Índice base 2013=100
          </p>
          {loadingI ? <Spinner color={C.secundario} /> : ipaaData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: C.gris }}>No hay datos disponibles.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: C.primario, color: 'white' }}>
                    {['Año', 'IPAA Mediana', 'Índice Precios', 'Índice SMMLV', 'Ciudades', 'Estado'].map((h, i, arr) => (
                      <th key={h} style={{
                        padding: '0.7rem 1rem',
                        textAlign: i === 0 || i === arr.length - 1 ? 'left' : 'center',
                        borderRadius: i === 0 ? '8px 0 0 0' : i === arr.length - 1 ? '0 8px 0 0' : 0,
                        fontWeight: 700,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ipaaData.map((row, i) => {
                    const color = estadoColor(row.estado)
                    return (
                      <tr key={row.anio} style={{ background: i % 2 === 0 ? C.fondo : 'white' }}>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: C.primario }}>{row.anio}</td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center', fontWeight: 700, color: C.secundario }}>
                          {row.ipaa_mediana?.toFixed(2) ?? '—'}
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                          {row.idx_precios?.toFixed(1) ?? '—'}
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                          {row.idx_smmlv?.toFixed(1) ?? '—'}
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                          {row.ciudades ?? '—'}
                        </td>
                        <td style={{ padding: '0.65rem 1rem' }}>
                          <span style={{
                            background: `${color}18`,
                            color: color,
                            border: `1px solid ${color}40`,
                            borderRadius: 20,
                            padding: '0.2rem 0.7rem',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                          }}>
                            {row.estado || '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── MIR vs IPC ───────────────────────────────────────────────── */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          marginBottom: '2rem',
        }}>
          <h2 style={{ color: C.primario, fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.3rem' }}>
            📈 MIR vs IPC DANE — Inflación real de alimentos (2013-2025)
          </h2>
          <p style={{ color: C.gris, fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
            Monitor de Inflación Real · 363 productos · Precios mayoreo SIPSA vs IPC oficial del DANE
          </p>
          {loadingM ? <Spinner color={C.morado} /> : mirData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: C.gris }}>No hay datos disponibles.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: C.primario, color: 'white' }}>
                    {['Año', 'MIR SIPSA %', 'IPC DANE %', 'Diferencia (pp)', 'SIPSA Acum.', 'IPC Acum.', 'Señal'].map((h, i, arr) => (
                      <th key={h} style={{
                        padding: '0.7rem 1rem',
                        textAlign: i === 0 ? 'left' : 'center',
                        borderRadius: i === 0 ? '8px 0 0 0' : i === arr.length - 1 ? '0 8px 0 0' : 0,
                        fontWeight: 700,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mirData.map((row, i) => {
                    const esCrisis = row.mir_pct > 20
                    const esDefl   = row.mir_pct < 0
                    const color    = esDefl ? C.verde : esCrisis ? C.rojo : C.gris
                    const senal    = esDefl ? '📉 Deflación' : esCrisis ? '🔥 Crisis' : '→ Normal'
                    return (
                      <tr key={row.anio} style={{ background: i % 2 === 0 ? C.fondo : 'white' }}>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: C.primario }}>{row.anio}</td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center', fontWeight: 700, color: esCrisis ? C.rojo : esDefl ? C.verde : C.secundario }}>
                          {row.mir_pct > 0 ? '+' : ''}{row.mir_pct?.toFixed(1)}%
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                          {row.ipc_dane_pct > 0 ? '+' : ''}{row.ipc_dane_pct?.toFixed(1)}%
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center', fontWeight: 700, color: row.diferencia_pp > 3 ? C.rojo : C.gris }}>
                          {row.diferencia_pp > 0 ? '+' : ''}{row.diferencia_pp?.toFixed(1)}pp
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                          {row.mir_idx?.toFixed(1)}
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                          {row.ipc_idx?.toFixed(1)}
                        </td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                          <span style={{
                            background: `${color}18`,
                            color: color,
                            border: `1px solid ${color}40`,
                            borderRadius: 20,
                            padding: '0.15rem 0.6rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}>
                            {senal}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── FI Ranking ciudades ───────────────────────────────────────── */}
        {!loadingF && fiData.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {/* Top 10 más caras */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: '2rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            }}>
              <h2 style={{ color: C.primario, fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.3rem' }}>
                🔴 Top 10 ciudades más caras — 2025
              </h2>
              <p style={{ color: C.gris, fontSize: '0.8rem', margin: '0 0 1.2rem' }}>
                Fruver Index (FI) promedio · Canasta familiar DANE en mayoreo
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {top10Caras.map((row, i) => (
                  <div key={row.ciudad} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.85rem' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? C.rojo : i === 1 ? C.naranja : i === 2 ? '#e67e22' : '#e0e0e0',
                      color: i < 3 ? 'white' : '#555',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.72rem',
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#2c3e50', textTransform: 'capitalize' }}>{row.ciudad}</div>
                      <div style={{ height: 5, background: '#f0f0f0', borderRadius: 3, marginTop: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          background: C.rojo,
                          borderRadius: 3,
                          width: `${(row.fi_promedio / maxFi) * 100}%`,
                        }} />
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: C.primario, fontSize: '0.88rem', minWidth: 50, textAlign: 'right' }}>
                      {row.fi_promedio?.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 más baratas */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: '2rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            }}>
              <h2 style={{ color: C.primario, fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.3rem' }}>
                🟢 Top 10 ciudades más baratas — 2025
              </h2>
              <p style={{ color: C.gris, fontSize: '0.8rem', margin: '0 0 1.2rem' }}>
                Mayor acceso alimentario · Menor presión sobre el salario mínimo
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {top10Baratas.map((row, i) => (
                  <div key={row.ciudad} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.85rem' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? C.verde : i === 1 ? '#1e8449' : i === 2 ? '#148f49' : '#e0e0e0',
                      color: i < 3 ? 'white' : '#555',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.72rem',
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#2c3e50', textTransform: 'capitalize' }}>{row.ciudad}</div>
                      <div style={{ height: 5, background: '#f0f0f0', borderRadius: 3, marginTop: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          background: C.verde,
                          borderRadius: 3,
                          width: `${(row.fi_promedio / maxFi) * 100}%`,
                        }} />
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: C.primario, fontSize: '0.88rem', minWidth: 50, textAlign: 'right' }}>
                      {row.fi_promedio?.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {loadingF && (
          <div style={{
            background: 'white', borderRadius: 16, padding: '2rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '2rem',
          }}>
            <Spinner color={C.secundario} />
          </div>
        )}

        {/* ── Propuesta de valor gobierno ───────────────────────────────── */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          marginBottom: '2.5rem',
        }}>
          <h2 style={{ color: C.primario, fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1.2rem' }}>
            🏛️ ¿Qué puede hacer su institución con Fruver Index?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            {[
              {
                icon: '🛡️',
                color: C.secundario,
                titulo: 'Monitoreo de seguridad alimentaria',
                texto: 'Seguimiento semanal del IPAA en 87 ciudades. Detecte zonas en riesgo alimentario antes de que se convierta en crisis.',
              },
              {
                icon: '📊',
                color: C.morado,
                titulo: 'IPC real vs oficial',
                texto: 'El MIR compara la inflación real del mayoreo contra el IPC DANE. Un termómetro adicional para la política monetaria y social.',
              },
              {
                icon: '📋',
                color: C.naranja,
                titulo: 'Política pública basada en datos',
                texto: 'Identifique qué ciudades y qué productos requieren intervención. Información de alta frecuencia para decisiones de Estado.',
              },
              {
                icon: '🔗',
                color: C.verde,
                titulo: 'Integración con sus sistemas',
                texto: 'API REST, exportación CSV/Excel, reportes automatizados. Compatible con sistemas DANE, MinAgricultura, ICBF y plataformas internacionales.',
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
          background: `linear-gradient(135deg, ${C.primario} 0%, ${C.secundario} 100%)`,
          borderRadius: 16,
          padding: '2.5rem 2rem',
          marginBottom: '2.5rem',
          color: 'white',
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.6rem' }}>
            ¿Su institución necesita esta información?
          </h2>
          <p style={{ opacity: 0.9, margin: '0 0 1.5rem', fontSize: '0.95rem' }}>
            Solicitemos una presentación personalizada a su equipo técnico — sin compromiso.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'white',
              color: C.primario,
              fontWeight: 800,
              fontSize: '1.05rem',
              padding: '1rem 2.5rem',
              borderRadius: 12,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            🏛️ Solicitar Presentación Institucional
          </a>
        </div>

        {/* ── Formulario de contacto ────────────────────────────────────── */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          maxWidth: 560,
          margin: '0 auto 2rem',
        }}>
          <h2 style={{ color: C.primario, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', textAlign: 'center' }}>
            O déjenos sus datos institucionales
          </h2>
          <p style={{ color: C.gris, fontSize: '0.84rem', textAlign: 'center', margin: '0 0 1.5rem' }}>
            Coordinamos presentación técnica en menos de 48 horas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {[
              { label: 'Nombre completo', placeholder: 'Ej. Carlos Rodríguez', type: 'text' },
              { label: 'Institución / Entidad', placeholder: 'Ej. MinAgricultura, WFP, DANE...', type: 'text' },
              { label: 'Cargo', placeholder: 'Ej. Director de Política Alimentaria', type: 'text' },
              { label: 'Correo institucional', placeholder: 'nombre@entidad.gov.co', type: 'email' },
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
              }}
            >
              Enviar — Solicitar presentación institucional
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
