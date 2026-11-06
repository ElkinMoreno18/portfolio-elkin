import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/** Dirección que index.html trae escrita para canonical, og:url y og:image. */
const DEFAULT_SITE_URL = 'https://elkin-moreno.pages.dev'

/**
 * index.html con los datos del despliegue, sin tocar código:
 *  - VITE_SITE_URL (p. ej. https://elkin-moreno.tu-subdominio.workers.dev)
 *    sustituye la dirección de canonical, og:url y og:image, que LinkedIn
 *    necesita absoluta.
 *  - Con Supabase configurado, la conexión a su dominio se abre mientras se
 *    descarga el JavaScript (preconnect): el contenido llega antes.
 */
function deployHtml(env: Record<string, string>): Plugin {
  const site = (env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '')
  const supabase = (env.VITE_SUPABASE_URL ?? '').trim().replace(/\/+$/, '')
  return {
    name: 'deploy-html',
    transformIndexHtml(html) {
      let out = site ? html.replaceAll(DEFAULT_SITE_URL, site) : html
      if (/^https:\/\//.test(supabase)) {
        const origin = new URL(supabase).origin
        out = out.replace('</head>', `  <link rel="preconnect" href="${origin}" crossorigin />\n  </head>`)
      }
      return out
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), deployHtml(env)],
    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, './src') },
    },
    build: {
      rollupOptions: {
        output: {
          // React y GSAP cambian mucho menos que el código del sitio:
          // separarlos hace que un redeploy no invalide su caché.
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'vendor-react'
            if (/[\\/]node_modules[\\/](gsap|@gsap)[\\/]/.test(id)) return 'vendor-gsap'
          },
        },
      },
    },
  }
})
