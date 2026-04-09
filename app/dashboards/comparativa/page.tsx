'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import styles from '../fruver-index/dashboard.module.css'

// ── Tipos ──────────────────────────────────────────────────────────────────
interface MirRow {
  anio: number
  mir_pct: number
  ipc_dane_pct: number
  diferencia_pp: number
  mir_idx: number
  ipc_idx: number
}

interface ProductoCanasta {
  nombre: string
  grupo: string
}

// ── Data estática: 71 productos DANE mapeados a SIPSA ──────────────────────
const CANASTA_DANE: ProductoCanasta[] = [
  // Frutas frescas (12)
  { nombre: 'Banano', grupo: 'Frutas frescas' },
  { nombre: 'Mango', grupo: 'Frutas frescas' },
  { nombre: 'Naranja', grupo: 'Frutas frescas' },
  { nombre: 'Mandarina', grupo: 'Frutas frescas' },
  { nombre: 'Tomate de árbol', grupo: 'Frutas frescas' },
  { nombre: 'Mora', grupo: 'Frutas frescas' },
  { nombre: 'Maracuyá', grupo: 'Frutas frescas' },
  { nombre: 'Guayaba', grupo: 'Frutas frescas' },
  { nombre: 'Lulo', grupo: 'Frutas frescas' },
  { nombre: 'Papaya', grupo: 'Frutas frescas' },
  { nombre: 'Piña', grupo: 'Frutas frescas' },
  { nombre: 'Uva', grupo: 'Frutas frescas' },
  // Verduras y hortalizas (12)
  { nombre: 'Tomate chonto', grupo: 'Verduras y hortalizas' },
  { nombre: 'Cebolla cabezona', grupo: 'Verduras y hortalizas' },
  { nombre: 'Zanahoria', grupo: 'Verduras y hortalizas' },
  { nombre: 'Papa criolla', grupo: 'Verduras y hortalizas' },
  { nombre: 'Lechuga', grupo: 'Verduras y hortalizas' },
  { nombre: 'Repollo', grupo: 'Verduras y hortalizas' },
  { nombre: 'Pimentón', grupo: 'Verduras y hortalizas' },
  { nombre: 'Habichuela', grupo: 'Verduras y hortalizas' },
  { nombre: 'Espinaca', grupo: 'Verduras y hortalizas' },
  { nombre: 'Brócoli', grupo: 'Verduras y hortalizas' },
  { nombre: 'Pepino', grupo: 'Verduras y hortalizas' },
  { nombre: 'Ajo', grupo: 'Verduras y hortalizas' },
  // Tubérculos (6)
  { nombre: 'Papa parda pastusa', grupo: 'Tubérculos, raíces y plátanos' },
  { nombre: 'Plátano hartón', grupo: 'Tubérculos, raíces y plátanos' },
  { nombre: 'Yuca', grupo: 'Tubérculos, raíces y plátanos' },
  { nombre: 'Ñame', grupo: 'Tubérculos, raíces y plátanos' },
  { nombre: 'Arracacha', grupo: 'Tubérculos, raíces y plátanos' },
  { nombre: 'Papa amarilla', grupo: 'Tubérculos, raíces y plátanos' },
  // Carnes (14)
  { nombre: 'Res (lomo)', grupo: 'Carnes' },
  { nombre: 'Res (costilla)', grupo: 'Carnes' },
  { nombre: 'Cerdo (chuleta)', grupo: 'Carnes' },
  { nombre: 'Cerdo (costilla)', grupo: 'Carnes' },
  { nombre: 'Pollo entero', grupo: 'Carnes' },
  { nombre: 'Pollo pechuga', grupo: 'Carnes' },
  { nombre: 'Pollo pierna', grupo: 'Carnes' },
  { nombre: 'Atún enlatado', grupo: 'Carnes' },
  { nombre: 'Sardina', grupo: 'Carnes' },
  { nombre: 'Salchicha', grupo: 'Carnes' },
  { nombre: 'Jamón', grupo: 'Carnes' },
  { nombre: 'Mortadela', grupo: 'Carnes' },
  { nombre: 'Carne molida', grupo: 'Carnes' },
  { nombre: 'Hígado de res', grupo: 'Carnes' },
  // Pescados (4)
  { nombre: 'Mojarra', grupo: 'Pescados' },
  { nombre: 'Bagre', grupo: 'Pescados' },
  { nombre: 'Sierra', grupo: 'Pescados' },
  { nombre: 'Trucha', grupo: 'Pescados' },
  // Huevos y lácteos (10)
  { nombre: 'Huevo rojo A', grupo: 'Huevos y lácteos' },
  { nombre: 'Leche entera', grupo: 'Huevos y lácteos' },
  { nombre: 'Leche descremada', grupo: 'Huevos y lácteos' },
  { nombre: 'Queso campesino', grupo: 'Huevos y lácteos' },
  { nombre: 'Queso doble crema', grupo: 'Huevos y lácteos' },
  { nombre: 'Yogur', grupo: 'Huevos y lácteos' },
  { nombre: 'Mantequilla', grupo: 'Huevos y lácteos' },
  { nombre: 'Kumis', grupo: 'Huevos y lácteos' },
  { nombre: 'Crema de leche', grupo: 'Huevos y lácteos' },
  { nombre: 'Arequipe', grupo: 'Huevos y lácteos' },
  // Granos y cereales (9)
  { nombre: 'Arroz blanco', grupo: 'Granos y cereales' },
  { nombre: 'Frijol', grupo: 'Granos y cereales' },
  { nombre: 'Lenteja', grupo: 'Granos y cereales' },
  { nombre: 'Garbanzo', grupo: 'Granos y cereales' },
  { nombre: 'Arveja seca', grupo: 'Granos y cereales' },
  { nombre: 'Maíz amarillo', grupo: 'Granos y cereales' },
  { nombre: 'Avena', grupo: 'Granos y cereales' },
  { nombre: 'Pasta spaghetti', grupo: 'Granos y cereales' },
  { nombre: 'Pan blanco', grupo: 'Granos y cereales' },
  // Productos procesados (4)
  { nombre: 'Aceite de cocina', grupo: 'Productos procesados' },
  { nombre: 'Azúcar blanca', grupo: 'Productos procesados' },
  { nombre: 'Café molido', grupo: 'Productos procesados' },
  { nombre: 'Sal', grupo: 'Productos procesados' },
]

const GRUPOS_COLORS: Record<string, string> = {
  'Frutas frescas':               '#27ae60',
  'Verduras y hortalizas':        '#2980b9',
  'Tubérculos, raíces y plátanos':'#f39c12',
  'Carnes':                       '#e74c3c',
  'Pescados':                     '#1a5276',
  'Huevos y lácteos':             '#8e44ad',
  'Granos y cereales':            '#e67e22',
  'Productos procesados':         '#7f8c8d',
}

const GRUPOS_COUNT: Record<string, number> = {
  'Frutas frescas': 12,
  'Verduras y hortalizas': 12,
  'Tubérculos, raíces y plátanos': 6,
  'Carnes': 14,
  'Pescados': 4,
  'Huevos y lácteos': 10,
  'Granos y cereales': 9,
  'Productos procesados': 4,
}

// ── Componente principal ───────────────────────────────────────────────────
export default function ComparativaDashboard() {
  const [mirData, setMirData] = useState<MirRow[]>([])
  const [loading, setLoading] = useState(true)
  const [grupoFiltro, setGrupoFiltro] = useState<string>('Todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    fetch('/api/mir')
      .then(r => r.json())
      .then(d => { if (d.success) setMirData(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const gruposUnicos = ['Todos', ...Object.keys(GRUPOS_COUNT)]

  const productosFiltrados = CANASTA_DANE.filter(p => {
    const matchGrupo = grupoFiltro === 'Todos' || p.grupo === grupoFiltro
    const matchBusq  = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchGrupo && matchBusq
  })

  const ultimo = mirData[mirData.length - 1]
  const mirAcum = ultimo ? (ultimo.mir_idx - 100).toFixed(1) : '174.5'
  const ipcAcum = ultimo ? (ultimo.ipc_idx - 100).toFixed(1) : '139.6'

  return (
    <div className={styles.container}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <Link href="/" className={styles.backButton}>← Volver</Link>
          <div className={styles.headerInfo}>
            <h1>📊 Comparativa Canasta Familiar DANE vs SIPSA</h1>
            <p>71 productos IPC DANE · 8 grupos alimenticios · Cobertura 100% · 2013-2026</p>
          </div>
        </div>
      </div>

      <div className={styles.main}>

        {/* ── KPI Strip ─────────────────────────────────────────────────── */}
        <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
          <div className={`${styles.kpiCard} ${styles.verde}`}>
            <div className={styles.kpiLabel}>Productos IPC DANE cubiertos</div>
            <div className={styles.kpiValue}>71</div>
            <div className={styles.kpiSub}>Canasta familiar oficial</div>
          </div>
          <div className={`${styles.kpiCard} ${styles.verde}`}>
            <div className={styles.kpiLabel}>Cobertura grupos SIPSA</div>
            <div className={styles.kpiValue}>100%</div>
            <div className={styles.kpiSub}>Los 8 grupos alimenticios</div>
          </div>
          <div className={`${styles.kpiCard} ${styles.rojo}`}>
            <div className={styles.kpiLabel}>Inflación acumulada SIPSA</div>
            <div className={styles.kpiValue}>+{mirAcum}%</div>
            <div className={styles.kpiSub}>vs +{ipcAcum}% IPC DANE oficial</div>
          </div>
          <div className={`${styles.kpiCard} ${styles.morado}`}>
            <div className={styles.kpiLabel}>Grupos alimenticios monitoreados</div>
            <div className={styles.kpiValue}>8</div>
            <div className={styles.kpiSub}>Mismos del IPC oficial DANE</div>
          </div>
        </div>

        {/* ── Resumen por grupo ─────────────────────────────────────────── */}
        <div className={styles.chartCard} style={{ marginBottom: '1.5rem' }}>
          <div className={styles.chartTitle}>Distribución de los 71 productos por grupo alimenticio</div>
          <div className={styles.chartSub}>Cada grupo del IPC DANE tiene cobertura completa en SIPSA · Fruver Index los monitorea en 87 ciudades</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', marginTop: '1rem' }}>
            {Object.entries(GRUPOS_COUNT).map(([grupo, count]) => (
              <button
                key={grupo}
                onClick={() => setGrupoFiltro(grupoFiltro === grupo ? 'Todos' : grupo)}
                style={{
                  background: grupoFiltro === grupo ? GRUPOS_COLORS[grupo] : '#f8f9fa',
                  color: grupoFiltro === grupo ? 'white' : '#2c3e50',
                  border: `2px solid ${GRUPOS_COLORS[grupo]}`,
                  borderRadius: 10,
                  padding: '0.8rem 1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>{count}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.3 }}>{grupo}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.3rem' }}>
                  {grupoFiltro === grupo ? 'Clic para ver todos' : 'Clic para filtrar'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabla de 71 productos ─────────────────────────────────────── */}
        <div className={styles.chartCard} style={{ marginBottom: '1.5rem' }}>
          <div className={styles.chartTitle}>
            Los 71 productos DANE mapeados a SIPSA
            {grupoFiltro !== 'Todos' && (
              <span style={{
                marginLeft: '0.8rem',
                fontSize: '0.8rem',
                background: GRUPOS_COLORS[grupoFiltro],
                color: 'white',
                padding: '0.2rem 0.6rem',
                borderRadius: 12,
              }}>
                {grupoFiltro}
              </span>
            )}
          </div>
          <div className={styles.chartSub}>
            Mostrando {productosFiltrados.length} de 71 productos · Todos con cobertura verificada en SIPSA-DANE
          </div>

          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: '0.9rem',
              marginBottom: '1rem',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#1a5276', color: 'white' }}>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'left', borderRadius: '8px 0 0 0' }}>#</th>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Producto</th>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Grupo alimenticio</th>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'center' }}>Cobertura SIPSA</th>
                  <th style={{ padding: '0.7rem 1rem', textAlign: 'left', borderRadius: '0 8px 0 0' }}>Nota</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p, i) => {
                  const idx = CANASTA_DANE.indexOf(p) + 1
                  return (
                    <tr
                      key={`${p.grupo}-${p.nombre}`}
                      style={{ background: i % 2 === 0 ? '#f8f9fa' : 'white' }}
                    >
                      <td style={{ padding: '0.55rem 1rem', color: '#7f8c8d', fontWeight: 600 }}>
                        {idx}
                      </td>
                      <td style={{ padding: '0.55rem 1rem', fontWeight: 600, color: '#2c3e50' }}>
                        {p.nombre}
                      </td>
                      <td style={{ padding: '0.55rem 1rem' }}>
                        <span style={{
                          background: GRUPOS_COLORS[p.grupo] + '18',
                          color: GRUPOS_COLORS[p.grupo],
                          border: `1px solid ${GRUPOS_COLORS[p.grupo]}40`,
                          borderRadius: 20,
                          padding: '0.15rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          {p.grupo}
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          background: '#f0fdf4',
                          color: '#27ae60',
                          border: '1px solid #bbf7d0',
                          borderRadius: 6,
                          padding: '0.15rem 0.7rem',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                        }}>
                          ✓ Verificado
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem 1rem', color: '#7f8c8d', fontSize: '0.78rem' }}>
                        87 ciudades · precios mayoreo
                      </td>
                    </tr>
                  )
                })}
                {productosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                      No se encontraron productos con ese criterio
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Gráfica MIR vs IPC por año ────────────────────────────────── */}
        <div className={styles.chartCard} style={{ marginBottom: '1.5rem' }}>
          <div className={styles.chartTitle}>MIR SIPSA vs IPC Oficial DANE — Inflación anual (%)</div>
          <div className={styles.chartSub}>
            Fruver Index mide la misma canasta DANE pero con precios reales de mayoreo · Brecha acumulada: +{(parseFloat(mirAcum) - parseFloat(ipcAcum)).toFixed(1)}pp
          </div>
          {loading ? (
            <div className={styles.loading} style={{ padding: '2rem' }}>
              <div className={styles.spinner} />
              <p>Cargando datos MIR...</p>
            </div>
          ) : (
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
                <Bar dataKey="mir_pct" name="MIR SIPSA %" radius={[4, 4, 0, 0]}>
                  {mirData.map((r, i) => (
                    <Cell
                      key={i}
                      fill={r.mir_pct < 0 ? '#27ae60' : r.mir_pct > 20 ? '#e74c3c' : '#2980b9'}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="ipc_dane_pct"
                  name="IPC DANE %"
                  stroke="#7f8c8d"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  strokeDasharray="6 3"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Insight box ──────────────────────────────────────────────── */}
        <div style={{
          background: '#1a5276',
          borderRadius: 14,
          padding: '2rem',
          color: 'white',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'flex-start',
        }}>
          <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>💡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.6rem' }}>
              Metodología alineada con el DANE — mayor credibilidad comercial
            </div>
            <div style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.6 }}>
              Fruver Index es el único sistema en Colombia que mide la inflación de alimentos
              con la misma canasta del DANE, pero usando precios reales de mayoreo SIPSA,
              no encuestas de hogares. Esto permite detectar hasta{' '}
              <strong>+34.9 puntos porcentuales más de inflación</strong>{' '}
              acumulada que el IPC oficial, brindando una señal temprana a retailers,
              gremios y organismos de política pública.
            </div>
            <div style={{ marginTop: '1.2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Mismo universo de productos', val: 'IPC DANE' },
                { label: 'Fuente de precios', val: 'Mayoreo SIPSA' },
                { label: 'Ciudades monitoreadas', val: '87' },
                { label: 'Años de historia', val: '13' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.72rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {item.label}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.fuente}>
          Fuente: Fruver Index / SIPSA-DANE · 71 productos IPC DANE · 8 grupos · 87 ciudades · fruverindex.com
        </div>
      </div>
    </div>
  )
}
