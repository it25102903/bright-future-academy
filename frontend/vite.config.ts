import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:8081'
  const heroSectionPath = path.resolve(import.meta.dirname, '../hero-section')

  return {
    plugins: [
      react(),
      {
        name: 'serve-hero-frames',
        configureServer(server) {
          server.middlewares.use('/hero-frames', (req, res, next) => {
            const requestedFile = req.url ? req.url.replace(/^\//, '').split('?')[0] : ''
            if (!requestedFile || !requestedFile.endsWith('.png')) {
              return next()
            }
            const filePath = path.join(heroSectionPath, requestedFile)
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'image/png')
              res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
              fs.createReadStream(filePath).pipe(res)
            } else {
              res.statusCode = 404
              res.end('Frame not found')
            }
          })
        },
      },
    ],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
