import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useCallback, useState } from 'react'
import Celebration from './components/Celebration'
import Envelope from './components/Envelope'
import FloatingHearts from './components/FloatingHearts'
import Invitation from './components/Invitation'
import Planning from './components/Planning'
import { invitation } from './config/invitation'
import { EMPTY_STATS, sendReport } from './services/report'
import type { AnswerStats, MeetingPlan } from './services/report'

type Screen = 'envelope' | 'invitation' | 'celebration' | 'planning'

export default function App() {
  const [screen, setScreen] = useState<Screen>('envelope')
  const [stats, setStats] = useState<AnswerStats>(EMPTY_STATS)
  const [plan, setPlan] = useState<MeetingPlan | null>(null)
  /** Taklifnoma necha marta (qayta ko‘rish bilan) boshlangani. */
  const [view, setView] = useState(1)

  const showInvitation = useCallback(() => setScreen('invitation'), [])
  const showPlanning = useCallback(() => setScreen('planning'), [])

  const handleYes = useCallback(
    (answerStats: AnswerStats) => {
      setStats(answerStats)
      setPlan(null)
      void sendReport(invitation.notifications, { type: 'answer', stats: answerStats, view })
      setScreen('celebration')
    },
    [view],
  )

  const handleConfirm = useCallback(
    (chosen: MeetingPlan) => {
      setPlan(chosen)
      void sendReport(invitation.notifications, { type: 'plan', stats, plan: chosen, view })
      setScreen('celebration')
    },
    [stats, view],
  )

  const restart = useCallback(() => {
    setPlan(null)
    setStats(EMPTY_STATS)
    setView((count) => count + 1)
    setScreen('envelope')
  }, [])

  return (
    // Foydalanuvchi "harakatni kamaytirish"ni yoqqan bo‘lsa, transform animatsiyalari o‘chiriladi.
    <MotionConfig reducedMotion="user">
      <main className="app">
        <AnimatePresence>
          {screen !== 'celebration' && <FloatingHearts key="background-hearts" />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {screen === 'envelope' && (
            <Envelope key="envelope" config={invitation.envelope} onOpened={showInvitation} />
          )}
          {screen === 'invitation' && (
            <Invitation key="invitation" config={invitation} onYes={handleYes} />
          )}
          {screen === 'planning' && (
            <Planning key="planning" config={invitation} onConfirm={handleConfirm} />
          )}
          {screen === 'celebration' && (
            <Celebration
              key={plan ? 'celebration-confirmed' : 'celebration'}
              config={invitation}
              plan={plan}
              onPlan={showPlanning}
              onReplay={restart}
            />
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  )
}
