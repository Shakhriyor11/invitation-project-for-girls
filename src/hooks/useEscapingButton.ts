import { animate, useMotionValue } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { boxFromRect, distanceToBox, pickEscapeSpot } from '../utils/geometry'
import type { Point } from '../utils/geometry'

interface Options {
  /** Tugma ustiga chiqmasligi kerak bo‘lgan elementlar. */
  avoid: ReadonlyArray<RefObject<HTMLElement | null>>
  reduceMotion: boolean
  /** Ekran chetidan qoldiriladigan masofa (px). */
  margin?: number
  /** Sichqoncha shu masofaga yaqinlashganda tugma qochadi (px). */
  triggerDistance?: number
}

interface EscapingButton {
  ref: RefObject<HTMLButtonElement>
  x: MotionValue<number>
  y: MotionValue<number>
  rotate: MotionValue<number>
  /** Tugma necha marta "qochgani" (tez-tez qaytarilmasligi uchun cheklangan). */
  escapes: number
  /** To‘liq statistika: bosishga urinishlar va qochishlar soni. */
  getStats: () => { presses: number; escapes: number }
  handlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
    onClick: () => void
  }
}

interface MoveOptions {
  /** Kutish vaqtini (cooldown) e'tiborsiz qoldirish. */
  force?: boolean
  /** Animatsiyasiz, bir zumda ko‘chirish. */
  instant?: boolean
  /** Hisoblagichga qo‘shmaslik (masalan, ekran o‘lchami o‘zgarganda). */
  silent?: boolean
}

const MOVE_COOLDOWN_MS = 160
const COUNT_COOLDOWN_MS = 900
/** Sensorli ekranda `pointerdown` dan keyin kelgan `click` ni ikkinchi bosish deb sanamaslik uchun. */
const CLICK_AFTER_POINTER_MS = 600
const ROTATION_ALLOWANCE = 12

const SPRING = { type: 'spring', stiffness: 240, damping: 18, mass: 0.7 } as const

/**
 * "Yo‘q" tugmasini qochadigan qiladi.
 *
 * Tugma o‘z joyida (oqimda) qoladi va faqat `transform` orqali siljiydi,
 * shuning uchun sahifa maketi hech qachon o‘zgarmaydi.
 */
export function useEscapingButton({
  avoid,
  reduceMotion,
  margin = 16,
  triggerDistance = 90,
}: Options): EscapingButton {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)
  const [escapes, setEscapes] = useState(0)

  const avoidRef = useRef(avoid)
  avoidRef.current = avoid

  const pointer = useRef<Point | null>(null)
  const lastMoveAt = useRef(0)
  const lastCountAt = useRef(0)
  const hasMoved = useRef(false)
  const pressCount = useRef(0)
  const escapeCount = useRef(0)
  const lastPressAt = useRef(-Infinity)
  const running = useRef<Array<ReturnType<typeof animate>>>([])

  const stopRunning = useCallback(() => {
    running.current.forEach((controls) => controls.stop())
    running.current = []
  }, [])

  const moveAway = useCallback(
    ({ force = false, instant = false, silent = false }: MoveOptions = {}) => {
      const element = ref.current
      if (!element) return

      const now = performance.now()
      if (!force && now - lastMoveAt.current < MOVE_COOLDOWN_MS) return
      lastMoveAt.current = now

      const rect = element.getBoundingClientRect()
      const size = {
        width: element.offsetWidth + ROTATION_ALLOWANCE,
        height: element.offsetHeight + ROTATION_ALLOWANCE,
      }

      const avoidBoxes = avoidRef.current
        .map((target) => target.current)
        .filter((node): node is HTMLElement => node !== null)
        .map((node) => boxFromRect(node.getBoundingClientRect()))

      const spot = pickEscapeSpot({
        size,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        current: boxFromRect(rect),
        avoid: avoidBoxes,
        pointer: pointer.current,
        margin,
      })

      // Tugmaning "uy" markazi = hozirgi markaz − joriy siljish.
      const homeX = rect.left + rect.width / 2 - x.get()
      const homeY = rect.top + rect.height / 2 - y.get()
      const nextX = spot.x + size.width / 2 - homeX
      const nextY = spot.y + size.height / 2 - homeY
      const nextRotate = (Math.random() * 2 - 1) * 14

      stopRunning()
      if (instant || reduceMotion) {
        x.set(nextX)
        y.set(nextY)
        rotate.set(nextRotate)
      } else {
        running.current = [
          animate(x, nextX, SPRING),
          animate(y, nextY, SPRING),
          animate(rotate, nextRotate, { duration: 0.5, ease: 'easeOut' }),
        ]
      }

      hasMoved.current = true
      if (!silent) escapeCount.current += 1
      if (!silent && (now - lastCountAt.current > COUNT_COOLDOWN_MS || lastCountAt.current === 0)) {
        lastCountAt.current = now
        setEscapes((count) => count + 1)
      }
    },
    [margin, reduceMotion, rotate, stopRunning, x, y],
  )

  // Kompyuterda: sichqoncha yaqinlashganda yoki ustiga kelganda qochadi.
  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer.current = { x: event.clientX, y: event.clientY }

      const element = ref.current
      if (!element) return
      const distance = distanceToBox(pointer.current, boxFromRect(element.getBoundingClientRect()))
      if (distance < triggerDistance) moveAway()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [moveAway, triggerDistance])

  // Ekran o‘lchami yoki yo‘nalishi o‘zgarganda tugma ekranda qolishi uchun qayta joylashtiramiz.
  useEffect(() => {
    const onResize = () => {
      if (hasMoved.current) moveAway({ force: true, instant: true, silent: true })
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [moveAway])

  useEffect(() => stopRunning, [stopRunning])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      // Sensorli ekranda tegilgan zahoti qochadi; bosish hodisasi ishlamasligi uchun to‘xtatamiz.
      event.preventDefault()
      pressCount.current += 1
      lastPressAt.current = performance.now()
      pointer.current = event.pointerType === 'touch' ? null : { x: event.clientX, y: event.clientY }
      moveAway({ force: true })
    },
    [moveAway],
  )

  // Klaviatura (Enter/Space) bilan "bosilganda" ham qochadi.
  const onClick = useCallback(() => {
    if (performance.now() - lastPressAt.current > CLICK_AFTER_POINTER_MS) pressCount.current += 1
    moveAway()
  }, [moveAway])

  const getStats = useCallback(
    () => ({ presses: pressCount.current, escapes: escapeCount.current }),
    [],
  )

  return { ref, x, y, rotate, escapes, getStats, handlers: { onPointerDown, onClick } }
}
