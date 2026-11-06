import { motion, useReducedMotion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { isCompactViewport, randomBetween } from '../utils/viewport'

interface FloatingHeartsProps {
  /** Yuraklar soni. Berilmasa, ekran o‘lchamiga qarab tanlanadi. */
  count?: number
  /** Bayram rejimi: yuraklar ko‘proq va tezroq. */
  festive?: boolean
}

interface HeartSpec {
  id: number
  left: number
  top: number
  size: number
  duration: number
  delay: number
  drift: number
  opacity: number
  color: string
}

const COLORS = ['#ff8fb1', '#ffb3c8', '#f06292', '#ffc6d6', '#ff9eb9'] as const

const createHearts = (count: number, festive: boolean): HeartSpec[] =>
  Array.from({ length: count }, (_, id) => ({
    id,
    left: randomBetween(2, 96),
    top: randomBetween(5, 90),
    size: randomBetween(festive ? 16 : 14, festive ? 42 : 36),
    duration: randomBetween(festive ? 7 : 11, festive ? 12 : 19),
    delay: randomBetween(0, festive ? 6 : 12),
    drift: randomBetween(14, 40),
    opacity: randomBetween(0.25, festive ? 0.7 : 0.5),
    color: COLORS[id % COLORS.length],
  }))

export default function FloatingHearts({ count, festive = false }: FloatingHeartsProps) {
  const reduceMotion = useReducedMotion()
  const [hearts] = useState(() => {
    const base = count ?? (isCompactViewport() ? 9 : 16)
    return createHearts(festive && count === undefined ? Math.round(base * 1.6) : base, festive)
  })

  return (
    <motion.div
      className="floating-hearts"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {hearts.map((heart) =>
        reduceMotion ? (
          <span
            key={heart.id}
            className="floating-hearts__item floating-hearts__item--static"
            style={{
              left: `${heart.left}%`,
              top: `${heart.top}%`,
              width: heart.size,
              height: heart.size,
              color: heart.color,
              opacity: heart.opacity * 0.6,
            }}
          >
            <Heart size="100%" fill="currentColor" strokeWidth={0} />
          </span>
        ) : (
          <motion.span
            key={heart.id}
            className="floating-hearts__item"
            style={{
              left: `${heart.left}%`,
              width: heart.size,
              height: heart.size,
              color: heart.color,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: ['0vh', '-125vh'],
              x: [0, heart.drift, -heart.drift, 0],
              rotate: [-12, 12, -12],
              opacity: [0, heart.opacity, heart.opacity, 0],
            }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Heart size="100%" fill="currentColor" strokeWidth={0} />
          </motion.span>
        ),
      )}
    </motion.div>
  )
}
