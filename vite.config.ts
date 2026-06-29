import { defineConfig } from 'vite'
import type { ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { spawn, ChildProcess } from 'child_process'

function runBunServer() {
  let child: ChildProcess | null = null

  return {
    name: 'run-bun-server',
    configureServer(server: ViteDevServer) {
      console.log('[Vite Plugin] Starting Bun API server (server.ts)...')
      child = spawn('bun', ['run', 'server.ts'], {
        stdio: 'inherit',
        env: { ...process.env }
      })

      child.on('error', (err) => {
        console.error('[Vite Plugin] Failed to start Bun API server:', err)
      })

      server.httpServer?.on('close', () => {
        if (child) {
          console.log('[Vite Plugin] Stopping Bun API server...')
          child.kill()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), runBunServer()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})

