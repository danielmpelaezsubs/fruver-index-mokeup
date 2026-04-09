'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './dashboard.module.css'

export default function FruverIndexDashboard() {
  const searchParams = useSearchParams()
  const ciudad = searchParams.get('ciudad') || 'Bogotá'

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Volver
        </Link>
        <h1>Fruver Index — {ciudad}</h1>
        <p>Índice de precios tipo Big Mac</p>
      </header>

      <main className={styles.main}>
        <div className={styles.placeholder}>
          <h2>📊 Dashboard Fruver Index</h2>
          <p>Ciudad: <strong>{ciudad}</strong></p>
          <p>Este dashboard se llenará con datos reales una vez que cargues los CSVs a Supabase.</p>

          <div className={styles.steps}>
            <h3>Próximos pasos:</h3>
            <ol>
              <li>Ejecutar el script Python para cargar datos a Supabase</li>
              <li>Crear visualizaciones con Recharts</li>
              <li>Agregar filtros por rango de fechas</li>
              <li>Integrar todos los índices</li>
            </ol>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Fruver Index © 2026 | Datos SIPSA-DANE</p>
      </footer>
    </div>
  )
}
