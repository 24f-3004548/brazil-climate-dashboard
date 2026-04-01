import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function devChatApiPlugin() {
  return {
    name: 'dev-chat-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        const chunks = []

        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', async () => {
          const rawBody = Buffer.concat(chunks).toString('utf8')

          if (rawBody) {
            try {
              req.body = JSON.parse(rawBody)
            } catch {
              req.body = rawBody
            }
          }

          try {
            const { default: chatHandler } = await import('./api/chat.js')
            await chatHandler(req, res)
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: error?.message || 'Failed to execute local /api/chat handler.',
              })
            )
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  Object.entries(env)
    .filter(([key]) => key.startsWith('GEMINI_'))
    .forEach(([key, value]) => {
      process.env[key] = value
    })

  return {
    plugins: [react(), devChatApiPlugin()],
  }
})
