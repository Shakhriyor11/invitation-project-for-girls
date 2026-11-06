import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { personalize } from '../config/invitation'
import type { InvitationConfig } from '../config/invitation'
import type { MeetingPlan } from '../services/report'
import { formatDate, todayISO, upcomingDays } from '../utils/dates'

interface PlanningProps {
  config: InvitationConfig
  /** "Tasdiqlash" bosilganda tanlangan uchrashuv bilan chaqiriladi. */
  onConfirm: (plan: MeetingPlan) => void
}

/** `quick` — tayyor variantlardan biri, `custom` — o‘zi kiritadi. */
type Mode = 'quick' | 'custom'

interface Option {
  value: string
  title: string
  subtitle?: string
}

interface OptionGroupProps {
  label: string
  icon: ReactNode
  options: Option[]
  value: string
  mode: Mode
  /** Variantlar bir qatorda gorizontal aylantiriladi (kunlar uchun). */
  scroll?: boolean
  otherLabel: string
  onPick: (value: string) => void
  onOther: () => void
  /** "Boshqa" tanlanganda ko‘rinadigan kiritish maydoni. */
  children: ReactNode
}

function OptionGroup({
  label,
  icon,
  options,
  value,
  mode,
  scroll = false,
  otherLabel,
  onPick,
  onOther,
  children,
}: OptionGroupProps) {
  const labelId = useId()

  return (
    <div className="plan-group" role="group" aria-labelledby={labelId}>
      <div id={labelId} className="plan-group__label">
        {icon}
        {label}
      </div>

      <div className={scroll ? 'chips chips--scroll' : 'chips'}>
        {options.map((option) => {
          const selected = mode === 'quick' && value === option.value
          return (
            <button
              key={option.value}
              type="button"
              className={`chip${scroll ? ' chip--day' : ''}${selected ? ' chip--selected' : ''}`}
              aria-pressed={selected}
              onClick={() => onPick(option.value)}
            >
              <span className="chip__title">{option.title}</span>
              {option.subtitle && <span className="chip__subtitle">{option.subtitle}</span>}
            </button>
          )
        })}

        <button
          type="button"
          className={`chip${scroll ? ' chip--day chip--day-other' : ''}${mode === 'custom' ? ' chip--selected' : ''}`}
          aria-pressed={mode === 'custom'}
          onClick={onOther}
        >
          <span className="chip__title">{otherLabel}</span>
        </button>
      </div>

      {mode === 'custom' && <div className="plan-group__custom">{children}</div>}
    </div>
  )
}

export default function Planning({ config, onConfirm }: PlanningProps) {
  const { planning, girlName } = config
  const today = todayISO()
  const days = useMemo(() => upcomingDays(planning.daysAhead), [planning.daysAhead])

  const [date, setDate] = useState('')
  const [dateMode, setDateMode] = useState<Mode>('quick')
  const [time, setTime] = useState('')
  const [timeMode, setTimeMode] = useState<Mode>('quick')
  const [place, setPlace] = useState('')
  const [placeMode, setPlaceMode] = useState<Mode>('quick')

  const trimmedPlace = place.trim()
  const complete = date !== '' && time !== '' && trimmedPlace !== ''

  const confirm = () => {
    if (!complete) return
    onConfirm({ date, dateLabel: formatDate(date), time, place: trimmedPlace })
  }

  return (
    <motion.section
      className="screen screen--planning screen--scroll"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <motion.div
        className="glass-card planning-card"
        initial={{ opacity: 0, y: 36, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="planning__title">{personalize(planning.title, girlName)}</h1>
        <p className="planning__subtitle">{personalize(planning.subtitle, girlName)}</p>

        <OptionGroup
          label={planning.dateLabel}
          icon={<CalendarDays size={18} aria-hidden="true" />}
          options={days.map((day) => ({ value: day.iso, title: day.weekday, subtitle: day.label }))}
          value={date}
          mode={dateMode}
          scroll
          otherLabel={planning.otherDateLabel}
          onPick={(value) => {
            setDate(value)
            setDateMode('quick')
          }}
          onOther={() => {
            setDate('')
            setDateMode('custom')
          }}
        >
          <input
            type="date"
            className="field"
            aria-label={planning.otherDateLabel}
            min={today}
            value={date}
            // O‘tib ketgan sanani qabul qilmaymiz.
            onChange={(event) => setDate(event.target.value >= today ? event.target.value : '')}
          />
        </OptionGroup>

        <OptionGroup
          label={planning.timeLabel}
          icon={<Clock size={18} aria-hidden="true" />}
          options={planning.times.map((value) => ({ value, title: value }))}
          value={time}
          mode={timeMode}
          otherLabel={planning.otherTimeLabel}
          onPick={(value) => {
            setTime(value)
            setTimeMode('quick')
          }}
          onOther={() => {
            setTime('')
            setTimeMode('custom')
          }}
        >
          <input
            type="time"
            className="field"
            aria-label={planning.otherTimeLabel}
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </OptionGroup>

        <OptionGroup
          label={planning.placeLabel}
          icon={<MapPin size={18} aria-hidden="true" />}
          options={planning.places.map((value) => ({ value, title: value }))}
          value={place}
          mode={placeMode}
          otherLabel={planning.otherPlaceLabel}
          onPick={(value) => {
            setPlace(value)
            setPlaceMode('quick')
          }}
          onOther={() => {
            setPlace('')
            setPlaceMode('custom')
          }}
        >
          <input
            type="text"
            className="field"
            aria-label={planning.otherPlaceLabel}
            placeholder={planning.otherPlacePlaceholder}
            maxLength={60}
            value={place}
            onChange={(event) => setPlace(event.target.value)}
          />
        </OptionGroup>

        <div className="planning__footer">
          {complete ? (
            <p className="planning__summary" aria-live="polite">
              {formatDate(date)} · {time} · {trimmedPlace}
            </p>
          ) : (
            <p className="planning__hint">{planning.incompleteHint}</p>
          )}

          <motion.button
            type="button"
            className="btn btn--primary planning__confirm"
            onClick={confirm}
            disabled={!complete}
            whileHover={complete ? { scale: 1.04 } : undefined}
            whileTap={complete ? { scale: 0.97 } : undefined}
          >
            {planning.confirmLabel}
          </motion.button>
        </div>
      </motion.div>
    </motion.section>
  )
}
