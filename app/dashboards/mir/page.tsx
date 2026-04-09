'use client'

import Link from 'next/link'
import styles from '../fruver-index/dashboard.module.css'

export default function MIRDashboard() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Volver
        </Link>
        <h1>MIR v2.0 — Monitor de Inflación Real</h1>
        <p>Comparativa SIPSA vs IPC DANE (2013-2026)</p>
      </header>

      <main className={styles.main}>
        <div className={styles.placeholder}>
          <h2>📈 Dashboard MIR v2.0</h2>
          <p>Análisis de inflación real con 363 productos y 8 grupos alimenticios</p>
          <p>Resultados acumulados: <strong>+174.5% (SIPSA) vs +139.6% (DANE)</strong></p>

          <div className={styles.steps}>
            <h3>Hallazgos clave:</h3>
            <ul style={{ textAlign: 'left', marginLeft: '2rem' }}>
              <li>SIPSA detecta +34.9pp más inflación que el IPC oficial</li>
              <li>2022: año más inflacionario (+31.8% MIR vs +27.8% DANE)</li>
              <li>2024: deflación en mayoreo (-1.1%)</li>
              <li>Café molido: +239% (2013-2026)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
