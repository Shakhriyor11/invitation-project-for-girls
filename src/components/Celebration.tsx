import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { CalendarHeart, CalendarPlus, Heart, MapPin, RotateCcw } from 'lucide-react'
import { personalize } from '../config/invitation'
import type { InvitationConfig } from '../config/invitation'
import type { MeetingPlan } from '../services/report'
import Confetti from './Confetti'
import FloatingHearts from './FloatingHearts'

interface CelebrationProps {
  config: InvitationConfig
  /** Qiz tanlagan uchrashuv. `null` bo‘lsa, hali tanlanmagan (birinchi bosqich). */
  plan: MeetingPlan | null
  /** "Vaqt va joyni tanlaymiz" bosilganda chaqiriladi. */
  onPlan: () => void
  /** "Yana bir bor ko‘rish" bosilganda chaqiriladi. */
  onReplay: () => void
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.45 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Celebration({ config, plan, onPlan, onReplay }: CelebrationProps) {
  const { celebration, girlName } = config
  const reduceMotion = useReducedMotion()
  const confirmed = plan !== null

  const title = confirmed ? celebration.confirmedTitle : celebration.title
  const subtitle = confirmed ? celebration.confirmedSubtitle : celebration.subtitle

  return (
    <motion.section
      className="screen screen--celebration screen--scroll"
      // Markazdan yoyiladigan doira: "Ha" bosilgan joydan tantana ochiladi.
      initial={reduceMotion ? { opacity: 0 } : { clipPath: 'circle(0% at 50% 62%)' }}
      animate={reduceMotion ? { opacity: 1 } : { clipPath: 'circle(150% at 50% 62%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.3 : 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <FloatingHearts festive />
      <Confetti />

      <motion.div className="celebration__content" variants={container} initial="hidden" animate="show">
        <motion.div className="celebration__badge" variants={item}>
          <motion.span
            style={{ display: 'grid' }}
            animate={reduceMotion ? undefined : { scale: [1, 1.22, 1, 1.15, 1] }}
            transition={{ duration: 1.3, repeat: Infinity, times: [0, 0.15, 0.3, 0.45, 1], ease: 'easeInOut' }}
          >
            <Heart size={40} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          </motion.span>
        </motion.div>

        <motion.h1 className="celebration__title" variants={item}>
          {personalize(title, girlName)}
        </motion.h1>

        <motion.p className="celebration__subtitle" variants={item}>
          {personalize(subtitle, girlName)}
        </motion.p>

        {plan && (
          <motion.div className="glass-card celebration__details" variants={item}>
            <div className="details__row">
              <span className="details__icon">
                <CalendarHeart size={20} aria-hidden="true" />
              </span>
              <span className="details__text">
                <span className="details__label">{celebration.dateLabel}</span>
                <span className="details__value">
                  {plan.dateLabel} · {plan.time}
                </span>
              </span>
            </div>
            <div className="details__row">
              <span className="details__icon">
                <MapPin size={20} aria-hidden="true" />
              </span>
              <span className="details__text">
                <span className="details__label">{celebration.locationLabel}</span>
                <span className="details__value">{plan.place}</span>
              </span>
            </div>
          </motion.div>
        )}

        <motion.p className="celebration__footer" variants={item}>
          {personalize(celebration.footer, girlName)}
        </motion.p>

        {!confirmed && (
          <motion.button
            type="button"
            className="btn btn--primary"
            variants={item}
            onClick={onPlan}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <CalendarPlus size={20} aria-hidden="true" />
            {celebration.planLabel}
          </motion.button>
        )}

        <motion.button
          type="button"
          className="btn btn--ghost"
          variants={item}
          onClick={onReplay}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={18} aria-hidden="true" />
          {celebration.replayLabel}
        </motion.button>
      </motion.div>
    </motion.section>
  )
}
