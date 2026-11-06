import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { personalize } from '../config/invitation'
import type { InvitationConfig } from '../config/invitation'
import { useEscapingButton } from '../hooks/useEscapingButton'
import type { AnswerStats } from '../services/report'

interface InvitationProps {
  config: InvitationConfig
  /** "Ha" tugmasi bosilganda statistika bilan birga chaqiriladi. */
  onYes: (stats: AnswerStats) => void
}

const MAX_GROWTH_STEPS = 3

export default function Invitation({ config, onYes }: InvitationProps) {
  const { invitation, girlName } = config
  const reduceMotion = useReducedMotion() ?? false

  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const questionRef = useRef<HTMLParagraphElement>(null)
  const yesRef = useRef<HTMLButtonElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)

  const noButton = useEscapingButton({
    avoid: [badgeRef, titleRef, questionRef, yesRef, slotRef],
    reduceMotion,
  })

  // Taklif ko‘ringan payt — javob berish vaqtini hisoblash uchun.
  const [shownAt] = useState(() => performance.now())
  const { getStats } = noButton

  const handleYes = useCallback(() => {
    const { presses, escapes } = getStats()
    onYes({
      noPresses: presses,
      noEscapes: escapes,
      secondsToDecide: Math.round((performance.now() - shownAt) / 1000),
    })
  }, [getStats, onYes, shownAt])

  const { noTeasers } = invitation
  const teaser = noButton.escapes > 0 && noTeasers.length > 0
    ? noTeasers[(noButton.escapes - 1) % noTeasers.length]
    : null

  // "Yo‘q" qochgan sari "Ha" tugmasi biroz kattalashadi (chegarasi bor).
  const yesScale = 1 + Math.min(noButton.escapes, MAX_GROWTH_STEPS) * 0.04

  return (
    <motion.section
      className="screen screen--invitation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <motion.div
        className="glass-card invitation-card"
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div ref={badgeRef} className="invitation__badge">
          <motion.span
            style={{ display: 'grid' }}
            animate={reduceMotion ? undefined : { scale: [1, 1.2, 1, 1.14, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.15, 0.3, 0.45, 1], ease: 'easeInOut' }}
          >
            <Heart size={30} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          </motion.span>
        </div>

        <motion.h1
          ref={titleRef}
          className="invitation__title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {personalize(invitation.greeting, girlName)}
        </motion.h1>

        <motion.p
          ref={questionRef}
          className="invitation__question"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {personalize(invitation.question, girlName)}
        </motion.p>

        <motion.div
          className="invitation__actions"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <motion.button
            ref={yesRef}
            type="button"
            className="btn btn--yes"
            onClick={handleYes}
            animate={{ scale: yesScale }}
            whileHover={{ scale: yesScale * 1.06 }}
            whileTap={{ scale: yesScale * 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            {personalize(invitation.yesText, girlName)}
          </motion.button>

          <div ref={slotRef} className="invitation__no-slot">
            <AnimatePresence mode="wait">
              {teaser !== null && (
                <motion.p
                  key={noButton.escapes}
                  className="invitation__teaser"
                  role="status"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {teaser}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              ref={noButton.ref}
              type="button"
              className="btn btn--no"
              style={{ x: noButton.x, y: noButton.y, rotate: noButton.rotate }}
              onPointerDown={noButton.handlers.onPointerDown}
              onClick={noButton.handlers.onClick}
            >
              {personalize(invitation.noText, girlName)}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
