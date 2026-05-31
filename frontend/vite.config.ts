import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const datasetsDir = path.resolve(__dirname, '../datasets')

function datasetsStaticPlugin() {
  return {
    name: 'roadwatch-datasets-static',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/datasets', (req, res, next) => {
        const urlPath = (req.url ?? '/').split('?')[0]
        const filePath = path.join(datasetsDir, decodeURIComponent(urlPath))
        if (!filePath.startsWith(datasetsDir)) {
          res.statusCode = 403
          res.end('Forbidden')
          return
        }
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          next()
          return
        }
        const ext = path.extname(filePath).toLowerCase()
        const type =
          ext === '.json' || ext === '.geojson'
            ? 'application/json'
            : ext === '.csv'
              ? 'text/csv'
              : 'application/octet-stream'
        res.setHeader('Content-Type', type)
        fs.createReadStream(filePath).pipe(res)
      })
    },
    closeBundle() {
      const target = path.resolve(__dirname, 'dist/datasets')
      fs.mkdirSync(target, { recursive: true })

      const skipPatterns = [
        /\.pbf$/i,
        /\.png$/i,
        /india-osm\.geojson/i,
        /india_state\.geojson/i,
        /^india-.*\.osm/i,
      ]
      const maxDeployBytes = 65 * 1024 * 1024

      for (const file of fs.readdirSync(datasetsDir)) {
        const src = path.join(datasetsDir, file)
        if (!fs.statSync(src).isFile()) continue
        if (skipPatterns.some((pattern) => pattern.test(file))) continue
        const size = fs.statSync(src).size
        if (size > maxDeployBytes) {
          console.warn(`[roadwatch-datasets] Skipped ${file} (${Math.round(size / 1024 / 1024)}MB) — host externally for full coverage`)
          continue
        }
        fs.copyFileSync(src, path.join(target, file))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), datasetsStaticPlugin()],
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
