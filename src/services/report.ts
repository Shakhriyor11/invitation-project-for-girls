/** "Yo‘q" tugmasi va javob berish bo‘yicha statistika. */
export interface AnswerStats {
  /** "Yo‘q" tugmasini bosishga (tegishga) urinishlar soni. */
  noPresses: number
  /** Tugma necha marta qochib ketgani (sichqoncha yaqinlashganda ham). */
  noEscapes: number
  /** Taklif ko‘ringanidan "Ha" bosilguncha o‘tgan soniyalar. */
  secondsToDecide: number
}

/** Qiz tanlagan uchrashuv. */
export interface MeetingPlan {
  /** Sana, `YYYY-MM-DD` ko‘rinishida. */
  date: string
  /** Ko‘rsatish uchun sana, masalan "Shanba, 7-noyabr". */
  dateLabel: string
  /** Vaqt, `HH:MM` ko‘rinishida. */
  time: string
  place: string
}

export type Report =
  | { type: 'answer'; stats: AnswerStats; view: number }
  | { type: 'plan'; stats: AnswerStats; view: number; plan: MeetingPlan }

export interface ReportSettings {
  enabled: boolean
  endpoint: string
}

export const EMPTY_STATS: AnswerStats = { noPresses: 0, noEscapes: 0, secondsToDecide: 0 }

/**
 * Hisobotni serverga yuboradi. Xato bo‘lsa, jimgina e'tiborsiz qoldiriladi —
 * hisobot yuborilmagani sababli taklifnoma ishlamay qolmasligi kerak.
 */
export async function sendReport(settings: ReportSettings, report: Report): Promise<void> {
  if (!settings.enabled) return

  try {
    await fetch(settings.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
      keepalive: true,
    })
  } catch {
    // Tarmoq xatosi — e'tiborsiz.
  }
}
