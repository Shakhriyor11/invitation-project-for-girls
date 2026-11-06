import { motion, useReducedMotion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { isCompactViewport, pickRandom, randomBetween } from '../utils/viewport'

type Shape = 'rect' | 'circle' | 'heart'

interface RainPiece {
  id: number
  left: number
  size: number
  color: string
  shape: Shape
  delay: number
  duration: number
  drift: number
  spin: number
}

interface BurstPiece {
  id: number
  dx: number
  dy: number
  size: number
  color: string
  shape: Shape
  duration: number
  spin: number
}

const COLORS = ['#ff6b95', '#ffa3bd', '#ffd1dc', '#ffffff', '#ffd98e', '#f9a8d4', '#e8446f'] as const
const SHAPES: readonly Shape[] = ['rect', 'rect', 'circle', 'heart']

const createRain = (count: number): RainPiece[] =>
  Array.from({ length: count }, (_, id) => ({
    id,
    left: randomBetween(0, 100),
    size: randomBetween(9, 16),
    color: pickRandom(COLORS),
    shape: pickRandom(SHAPES),
    delay: randomBetween(0.3, 3.5),
    duration: randomBetween(4.5, 8),
    drift: randomBetween(15, 55),
    spin: randomBetween(360, 1080) * (Math.random() > 0.5 ? 1 : -1),
  }))

const createBurst = (count: number): BurstPiece[] => {
  const reach = Math.min(window.innerWidth * 0.46, 380)
  return Array.from({ length: count }, (_, id) => {
    const angle = randomBetween(0, Math.PI * 2)
    const power = randomBetween(0.35, 1)
    return {
      id,
      dx: Math.cos(angle) * reach * power,
      dy: Math.sin(angle) * reach * power * 0.8 - randomBetween(40, 160),
      size: randomBetween(9, 16),
      color: pickRandom(COLORS),
      shape: pickRandom(SHAPES),
      duration: randomBetween(1.6, 2.6),
      spin: randomBetween(240, 720) * (Math.random() > 0.5 ? 1 : -1),
    }
  })
}

interface PieceShapeProps {
  shape: Shape
  size: number
  color: string
}

function PieceShape({ shape, size, color }: PieceShapeProps) {
  if (shape === 'heart') {
    return <Heart size={size + 2} fill={color} strokeWidth={0} aria-hidden="true" />
  }

  const isCircle = shape === 'circle'
  return (
    <span
      className={`confetti__shape confetti__shape--${shape}`}
      style={{
        width: isCircle ? size * 0.7 : size * 0.55,
        height: isCircle ? size * 0.7 : size,
        background: color,
      }}
    />
  )
}

/** Tantana konfettisi: markazdan portlash + tepadan yog‘ish. */
export default function Confetti() {
  const reduceMotion = useReducedMotion()
  const [pieces] = useState(() => {
    const compact = isCompactViewport()
    return {
      rain: createRain(compact ? 34 : 60),
      burst: createBurst(compact ? 22 : 36),
    }
  })

  if (reduceMotion) return null

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.burst.map((piece) => (
        <motion.span
          key={`burst-${piece.id}`}
          className="confetti__piece"
          style={{ left: '50%', top: '42%' }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
          animate={{
            x: [0, piece.dx, piece.dx * 1.12],
            y: [0, piece.dy, piece.dy + 280],
            opacity: [0, 1, 0],
            scale: [0.3, 1, 1],
            rotate: [0, piece.spin],
          }}
          transition={{
            duration: piece.duration,
            delay: 0.35,
            times: [0, 0.4, 1],
            x: { duration: piece.duration, delay: 0.35, ease: 'easeOut', times: [0, 0.4, 1] },
            y: {
              duration: piece.duration,
              delay: 0.35,
              ease: ['easeOut', 'easeIn'],
              times: [0, 0.4, 1],
            },
            rotate: { duration: piece.duration, delay: 0.35, ease: 'linear' },
            opacity: { duration: piece.duration, delay: 0.35, times: [0, 0.15, 1] },
          }}
        >
          <PieceShape shape={piece.shape} size={piece.size} color={piece.color} />
        </motion.span>
      ))}

      {pieces.rain.map((piece) => (
        <motion.span
          key={`rain-${piece.id}`}
          className="confetti__piece"
          style={{ left: `${piece.left}%`, top: 0 }}
          initial={{ y: '-12vh' }}
          animate={{
            y: ['-12vh', '112vh'],
            x: [0, piece.drift, -piece.drift, 0],
            rotate: [0, piece.spin],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <PieceShape shape={piece.shape} size={piece.size} color={piece.color} />
        </motion.span>
      ))}
    </div>
  )
}
