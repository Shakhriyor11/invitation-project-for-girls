import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { Heart, MailOpen } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { InvitationConfig } from '../config/invitation'

interface EnvelopeProps {
  config: InvitationConfig['envelope']
  /** Xat to‘liq chiqqach chaqiriladi. */
  onOpened: () => void
}

const LETTER_LINES = 5

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const play = (
  value: MotionValue<number>,
  to: number,
  duration: number,
  ease: [number, number, number, number],
) =>
  new Promise<void>((resolve) => {
    animate(value, to, { duration, ease, onComplete: resolve })
  })

export default function Envelope({ config, onOpened }: EnvelopeProps) {
  const reduceMotion = useReducedMotion()
  const [opening, setOpening] = useState(false)
  const mounted = useRef(true)

  const flapRotation = useMotionValue(0)
  const letterOffset = useMotionValue(0)

  // Qopqoq 90° dan oshganda xat orqasiga o‘tadi (qirrasi ko‘rinmay qolgan paytda).
  const flapLayer = useTransform(flapRotation, (angle) => (angle > 90 ? 2 : 5))
  const letterY = useTransform(letterOffset, (percent) => `${percent}%`)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const open = useCallback(async () => {
    if (opening) return
    setOpening(true)

    if (reduceMotion) {
      await wait(450)
    } else {
      await play(flapRotation, 180, 0.9, [0.45, 0.05, 0.25, 1])
      await play(letterOffset, -64, 1, [0.22, 1, 0.36, 1])
      await wait(380)
    }

    if (mounted.current) onOpened()
  }, [flapRotation, letterOffset, onOpened, opening, reduceMotion])

  const idle = !opening && !reduceMotion

  return (
    <motion.section
      className="screen screen--envelope"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.p
        className="envelope-teaser"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: opening ? 0 : 1, y: 0 }}
        transition={{ duration: opening ? 0.4 : 0.9, delay: opening ? 0 : 0.2 }}
      >
        {config.teaser}
      </motion.p>

      <motion.div
        className="envelope-float"
        animate={idle ? { y: [0, -9, 0] } : { y: 0 }}
        transition={idle ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
      >
        <button
          type="button"
          className="envelope-button"
          onClick={open}
          disabled={opening}
          aria-label={config.ariaLabel}
        >
          <span className="envelope">
            <span className="envelope__back" />

            <motion.span className="envelope__letter" style={{ y: letterY }}>
              <Heart className="letter__heart" fill="currentColor" strokeWidth={0} />
              {Array.from({ length: LETTER_LINES }, (_, index) => (
                <span key={index} className="letter__line" />
              ))}
            </motion.span>

            <span className="envelope__front" />

            <motion.span
              className="envelope__flap"
              style={{ rotateX: flapRotation, zIndex: flapLayer, originX: 0.5, originY: 0 }}
            >
              <span className="flap__face flap__face--front">
                <span className="flap__shadow">
                  <span className="flap__shape" />
                </span>
              </span>
              <span className="flap__face flap__face--back">
                <span className="flap__shadow">
                  <span className="flap__shape" />
                </span>
              </span>

              <span className="flap__seal">
                <motion.span
                  className="flap__seal-inner"
                  animate={idle ? { scale: [1, 1.14, 1, 1.09, 1] } : { scale: 1 }}
                  transition={
                    idle
                      ? { duration: 1.7, repeat: Infinity, times: [0, 0.14, 0.28, 0.42, 1], ease: 'easeInOut' }
                      : { duration: 0.2 }
                  }
                >
                  <Heart fill="currentColor" strokeWidth={1.5} />
                </motion.span>
              </span>
            </motion.span>
          </span>
        </button>
      </motion.div>

      <motion.button
        type="button"
        className="btn btn--primary envelope-cta"
        onClick={open}
        disabled={opening}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: opening ? 0 : 1, y: opening ? 10 : 0 }}
        transition={{ duration: 0.5, delay: opening ? 0 : 0.6 }}
        whileHover={opening ? undefined : { scale: 1.05 }}
        whileTap={opening ? undefined : { scale: 0.97 }}
      >
        <MailOpen size={20} aria-hidden="true" />
        {config.openLabel}
      </motion.button>
    </motion.section>
  )
}
