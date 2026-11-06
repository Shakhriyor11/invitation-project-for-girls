/**
 * Vercel serverless funksiyasi: taklifnoma hisobotini Telegram'ga yuboradi.
 *
 * Bot tokeni va chat ID faqat serverda (muhit o‘zgaruvchilarida) saqlanadi,
 * brauzerga hech qachon chiqmaydi.
 *
 *   TELEGRAM_BOT_TOKEN  — @BotFather bergan token
 *   TELEGRAM_CHAT_ID    — hisobot yuboriladigan chat ID (sizniki)
 *
 * Bu fayl o‘zi mustaqil ishlaydi (boshqa fayllardan import qilmaydi), shuning uchun
 * Vercel uni to‘g‘ridan-to‘g‘ri joylay oladi.
 */

interface ApiRequest {
  method?: string
  body?: unknown
}

interface ApiResponse {
  status(code: number): ApiResponse
  json(body: unknown): void
}

interface Stats {
  noPresses: number
  noEscapes: number
  secondsToDecide: number
}

interface Plan {
  dateLabel: string
  time: string
  place: string
}

type Report =
  | { type: 'answer'; stats: Stats; view: number }
  | { type: 'plan'; stats: Stats; view: number; plan: Plan }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toCount = (value: unknown, max: number): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Math.max(Math.round(value), 0), max)
    : 0

/** Matnni tozalaydi: bo‘sh joylarni bittaga keltiradi va uzunligini cheklaydi. */
const toText = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : ''

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/** So‘rov tanasini tekshiradi; noto‘g‘ri bo‘lsa `null` qaytaradi. */
export function parseReport(body: unknown): Report | null {
  const data = typeof body === 'string' ? parseJson(body) : body
  if (!isRecord(data) || !isRecord(data.stats)) return null

  const stats: Stats = {
    noPresses: toCount(data.stats.noPresses, 9999),
    noEscapes: toCount(data.stats.noEscapes, 9999),
    secondsToDecide: toCount(data.stats.secondsToDecide, 86400),
  }
  const view = Math.max(1, toCount(data.view, 999))

  if (data.type === 'answer') return { type: 'answer', stats, view }

  if (data.type === 'plan' && isRecord(data.plan)) {
    const plan: Plan = {
      dateLabel: toText(data.plan.dateLabel, 60),
      time: toText(data.plan.time, 20),
      place: toText(data.plan.place, 80),
    }
    if (plan.dateLabel === '' || plan.time === '' || plan.place === '') return null
    return { type: 'plan', stats, view, plan }
  }

  return null
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds} soniya`
  return `${Math.floor(seconds / 60)} daqiqa ${seconds % 60} soniya`
}

function statLines(stats: Stats, view: number): string[] {
  const lines: string[] = []

  if (stats.noPresses === 0 && stats.noEscapes === 0) {
    lines.push('😍 Birinchi urinishdayoq “Ha” dedi!')
  } else {
    lines.push(`🙈 “Yo‘q” tugmasini bosishga urinish: ${stats.noPresses} marta`)
    lines.push(`🏃 Tugma qochib ketgan: ${stats.noEscapes} marta (yaqinlashganda ham)`)
  }

  lines.push(`⏱ Javob berish vaqti: ${formatDuration(stats.secondsToDecide)}`)
  if (view > 1) lines.push(`🔁 Taklifnomani ${view}-marta ko‘rmoqda`)
  return lines
}

/** Telegram'ga yuboriladigan matn (oddiy matn, formatlashsiz). */
export function buildMessage(report: Report): string {
  if (report.type === 'answer') {
    return [
      '💌 Taklifnomangizga javob keldi!',
      '',
      '✅ Javob: HA ❤️',
      ...statLines(report.stats, report.view),
    ].join('\n')
  }

  return [
    '📅 Uchrashuv tanlandi!',
    '',
    `🗓 Sana: ${report.plan.dateLabel}`,
    `🕒 Vaqt: ${report.plan.time}`,
    `📍 Joy: ${report.plan.place}`,
    '',
    ...statLines(report.stats, report.view),
  ].join('\n')
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' })
    return
  }

  const report = parseReport(req.body)
  if (!report) {
    res.status(400).json({ ok: false, error: 'invalid_report' })
    return
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    // Sozlanmagan bo‘lsa, foydalanuvchiga hech narsa sezdirmaymiz.
    res.status(200).json({ ok: false, error: 'not_configured' })
    return
  }

  const apiBase = process.env.TELEGRAM_API_BASE ?? 'https://api.telegram.org'

  try {
    const response = await fetch(`${apiBase}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage(report),
        disable_web_page_preview: true,
      }),
    })
    res.status(response.ok ? 200 : 502).json({ ok: response.ok })
  } catch {
    res.status(502).json({ ok: false, error: 'telegram_unreachable' })
  }
}
