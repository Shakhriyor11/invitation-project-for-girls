export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

export const boxFromRect = ({ left, top, right, bottom }: DOMRect): Box => ({
  left,
  top,
  right,
  bottom,
})

export const inflate = (box: Box, by: number): Box => ({
  left: box.left - by,
  top: box.top - by,
  right: box.right + by,
  bottom: box.bottom + by,
})

export const overlapArea = (a: Box, b: Box): number => {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left)
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  return width > 0 && height > 0 ? width * height : 0
}

/** Nuqtadan to‘rtburchakkacha eng qisqa masofa (nuqta ichida bo‘lsa, 0). */
export const distanceToBox = (point: Point, box: Box): number =>
  Math.hypot(
    Math.max(box.left - point.x, 0, point.x - box.right),
    Math.max(box.top - point.y, 0, point.y - box.bottom),
  )

export interface EscapeSpotOptions {
  /** Tugma o‘lchami. */
  size: Size
  viewport: Size
  /** Tugmaning hozirgi o‘rni. */
  current: Box
  /** Ustiga chiqib bo‘lmaydigan elementlar. */
  avoid: Box[]
  /** Sichqoncha ko‘rsatkichi (sensorli ekranda `null`). */
  pointer: Point | null
  /** Ekran chetidan qoldiriladigan masofa. */
  margin: number
  /** Boshqa elementlar bilan orasidagi minimal bo‘shliq. */
  clearance?: number
  random?: () => number
}

interface Candidate extends Point {
  overlap: number
  score: number
}

/**
 * Tugma qochib borishi mumkin bo‘lgan yangi joyni tanlaydi (chap-yuqori burchak koordinatalari).
 *
 * - ekrandan chiqib ketmaydi;
 * - "avoid" ro‘yxatidagi elementlar bilan kesishmaydi (iloji bo‘lsa);
 * - sichqonchadan va hozirgi joyidan uzoqroq joylar afzal;
 * - tasodifiy qo‘shimcha ball natijani oldindan aytib bo‘lmaydigan qiladi.
 */
export function pickEscapeSpot(options: EscapeSpotOptions): Point {
  const { size, viewport, current, avoid, pointer, margin, clearance = 14, random = Math.random } = options

  const minX = margin
  const minY = margin
  const maxX = Math.max(minX, viewport.width - size.width - margin)
  const maxY = Math.max(minY, viewport.height - size.height - margin)
  const blockers = avoid.map((box) => inflate(box, clearance))

  const evaluate = (x: number, y: number, jitter: number): Candidate => {
    const box: Box = { left: x, top: y, right: x + size.width, bottom: y + size.height }
    const overlap = blockers.reduce((sum, blocker) => sum + overlapArea(box, blocker), 0)
    const fromPointer = pointer ? distanceToBox(pointer, box) : 360
    const fromCurrent = Math.hypot(x - current.left, y - current.top)

    let score = Math.min(fromPointer, 360) + Math.min(fromCurrent, 360) * 0.6 + random() * jitter
    if (fromPointer < 150) score -= 600
    if (fromCurrent < 80) score -= 300

    return { x, y, overlap, score }
  }

  const isBetter = (candidate: Candidate, best: Candidate | null): boolean =>
    best === null ||
    candidate.overlap < best.overlap ||
    (candidate.overlap === best.overlap && candidate.score > best.score)

  let best: Candidate | null = null

  for (let i = 0; i < 80; i += 1) {
    const candidate = evaluate(
      minX + random() * (maxX - minX),
      minY + random() * (maxY - minY),
      80,
    )
    if (isBetter(candidate, best)) best = candidate
  }

  // Tasodifiy tanlov bo‘sh joy topolmasa, ekranni to‘r bilan tekshirib chiqamiz.
  if (best === null || best.overlap > 0) {
    const columns = 20
    const rows = 14
    for (let row = 0; row <= rows; row += 1) {
      for (let column = 0; column <= columns; column += 1) {
        const candidate = evaluate(
          minX + ((maxX - minX) * column) / columns,
          minY + ((maxY - minY) * row) / rows,
          0,
        )
        if (isBetter(candidate, best)) best = candidate
      }
    }
  }

  return best ? { x: best.x, y: best.y } : { x: minX, y: minY }
}
