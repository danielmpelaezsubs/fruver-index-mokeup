# Fruver Index — Dashboard Web

Inteligencia de precios agrícolas para Colombia

## Stack Tecnológico

- **Frontend:** Next.js 14 + React 18 + TypeScript
- **Styling:** CSS Modules + Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Charts:** Recharts
- **Hosting:** Vercel

## Estructura del Proyecto

```
fruver-index-web/
├── app/
│   ├── api/                    # API routes
│   │   ├── datos/route.ts      # GET datos maestros
│   │   ├── indices/route.ts    # GET índices calculados
│   │   └── mir/route.ts        # GET MIR v2.0
│   ├── dashboards/
│   │   ├── fruver-index/       # Dashboard FI
│   │   ├── mir/                # Dashboard MIR
│   │   └── comparativa/        # Dashboard Canasta DANE
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Home
│   └── globals.css             # Estilos globales
├── lib/
│   └── supabase.ts             # Cliente Supabase
├── package.json
├── tsconfig.json
└── .env.local                  # Variables de entorno

## Instalación

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Variables de Entorno

Crear archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<tu-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_KEY=<tu-service-key>
```

Las credenciales se configuran en Vercel durante el deploy.

## Próximos Pasos

1. Cargar datos maestros a Supabase (script Python)
2. Crear visualizaciones con Recharts
3. Agregar filtros interactivos
4. Implementar exportación a PDF
5. Agregar autenticación

## Datos

- **Período:** 2013-2026
- **Ciudades:** 87
- **Productos:** 402
- **Registros:** 3.1M
- **Fuente:** SIPSA-DANE

## Deploy

```bash
git push origin main
# Vercel auto-deploya automáticamente
```

## Licencia

Confidencial - Fruver Index 2026
