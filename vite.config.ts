import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

interface ApiHandler {
  (
    req: { method?: string; body?: unknown },
    res: { status(code: number): unknown; json(body: unknown): void },
  ): Promise<void>
}

const readBody = async (req: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return undefined
  }
}

/**
 * `npm run dev` paytida `/api/notify` ni Vercel'dagi kabi ishlatadi,
 * shuning uchun hisobot yuborishni lokal kompyuterda ham sinab ko‘rish mumkin
 * (`.env.local` faylidagi TELEGRAM_* qiymatlari o‘qiladi).
 */
function devApi(): Plugin {
  return {
    name: 'dev-api-notify',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''))

      server.middlewares.use('/api/notify', async (req: IncomingMessage, res: ServerResponse) => {
        const module = (await server.ssrLoadModule('/api/notify.ts')) as { default: ApiHandler }
        const body = await readBody(req)

        const reply = {
          status(code: number) {
            res.statusCode = code
            return reply
          },
          json(payload: unknown) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(payload))
          },
        }

        await module.default({ method: req.method, body }, reply)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi()],
})
