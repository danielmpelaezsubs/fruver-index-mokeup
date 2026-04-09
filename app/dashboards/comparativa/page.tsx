'use client'

import Link from 'next/link'
import styles from '../fruver-index/dashboard.module.css'

export default function ComparativaDashboard() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Volver
        </Link>
        <h1>Canasta Familiar DANE vs SIPSA</h1>
        <p>71 categorías del IPC mapeadas a productos SIPSA</p>
      </header>

      <main className={styles.main}>
        <div className={styles.placeholder}>
          <h2>🔄 Comparativa Canasta Familiar</h2>
          <p>100% de cobertura de los 8 grupos alimenticios SIPSA</p>

          <div className={styles.steps}>
            <h3>Cobertura por grupo:</h3>
            <ul style={{ textAlign: 'left', marginLeft: '2rem' }}>
              <li>Carnes: 100%</li>
              <li>Frutas frescas: 100%</li>
              <li>Granos y cereales: 100%</li>
              <li>Huevos y lácteos: 100%</li>
              <li>Pescados: 100%</li>
              <li>Productos procesados: 100%</li>
              <li>Tubérculos, raíces y plátanos: 100%</li>
              <li>Verduras y hortalizas: 100%</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
