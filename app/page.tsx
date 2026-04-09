'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export default function Home() {
  const [ciudades, setCiudades] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('fruver_maestro')
          .select('ciudad', { count: 'exact' })
          .limit(0)

        if (error) throw error

        // Fetch unique cities via metadata or direct query
        const { data: ciudadesData } = await supabase
          .from('fruver_maestro')
          .select('ciudad')
          .order('ciudad')
          .limit(5000)

        if (ciudadesData) {
          const uniqueCiudades = [...new Set(ciudadesData.map((d: any) => d.ciudad))].sort()
          setCiudades(uniqueCiudades)
        }
      } catch (error) {
        console.error('Error fetching ciudades:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>🥕 Fruver Index</h1>
          <p className={styles.subtitle}>
            Inteligencia de precios agrícolas para Colombia
          </p>
          <p className={styles.description}>
            3.1M registros | 87 ciudades | 402 productos | 687 semanas (2013-2026)
          </p>
        </div>
      </header>

      {/* Dashboards Grid */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dashboards</h2>
        <div className={styles.dashboardGrid}>
          <Link href="/dashboards/fruver-index" className={styles.dashboardCard}>
            <div className={styles.dashboardIcon}>📊</div>
            <h3>Fruver Index</h3>
            <p>Índice de precios tipo Big Mac</p>
          </Link>

          <Link href="/dashboards/mir" className={styles.dashboardCard}>
            <div className={styles.dashboardIcon}>📈</div>
            <h3>MIR v2.0</h3>
            <p>Inflación real vs IPC oficial</p>
          </Link>

          <Link href="/dashboards/comparativa" className={styles.dashboardCard}>
            <div className={styles.dashboardIcon}>🔄</div>
            <h3>Canasta DANE</h3>
            <p>71 productos mapeados</p>
          </Link>
        </div>
      </section>

      {/* Ciudades */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Explora por ciudad</h2>
        {loading ? (
          <p className={styles.loading}>Cargando ciudades...</p>
        ) : ciudades.length > 0 ? (
          <div className={styles.ciudadesGrid}>
            {ciudades.map((ciudad) => (
              <Link
                key={ciudad}
                href={`/dashboards/fruver-index?ciudad=${encodeURIComponent(ciudad)}`}
                className={styles.ciudadCard}
              >
                {ciudad}
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            No hay datos disponibles. Por favor, carga los datos primero.
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Fruver Index © 2026 | Datos SIPSA-DANE</p>
      </footer>
    </div>
  )
}
