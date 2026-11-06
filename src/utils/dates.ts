const WEEKDAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'] as const

const MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
] as const

const pad = (value: number): string => String(value).padStart(2, '0')

/** Sanani mahalliy vaqt bo‘yicha `YYYY-MM-DD` ko‘rinishiga o‘tkazadi (UTC siljishisiz). */
export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const todayISO = (): string => toISODate(new Date())

/** `YYYY-MM-DD` ni mahalliy `Date` ga aylantiradi; noto‘g‘ri bo‘lsa `null`. */
export function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null

  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(year, month - 1, day)
  const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  return valid ? date : null
}

/** "Shanba, 7-noyabr" ko‘rinishida. */
export function formatDate(iso: string): string {
  const date = parseISODate(iso)
  if (!date) return iso
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()}-${MONTHS[date.getMonth()]}`
}

export interface DayOption {
  iso: string
  /** "Bugun", "Ertaga" yoki hafta kuni. */
  weekday: string
  /** "7-noyabr". */
  label: string
}

/** Bugundan boshlab `count` kunlik ro‘yxat. */
export function upcomingDays(count: number, from: Date = new Date()): DayOption[] {
  return Array.from({ length: Math.max(1, count) }, (_, offset) => {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset)
    const weekday = offset === 0 ? 'Bugun' : offset === 1 ? 'Ertaga' : WEEKDAYS[date.getDay()]
    return {
      iso: toISODate(date),
      weekday,
      label: `${date.getDate()}-${MONTHS[date.getMonth()]}`,
    }
  })
}
