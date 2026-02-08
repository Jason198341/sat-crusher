import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTimerOptions {
  initialSeconds: number
  countDown?: boolean
  onExpire?: () => void
  autoStart?: boolean
}

export function useTimer({ initialSeconds, countDown = true, onExpire, autoStart = false }: UseTimerOptions) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(autoStart)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => {
    setSeconds(initialSeconds)
    setRunning(false)
  }, [initialSeconds])

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = countDown ? prev - 1 : prev + 1
        if (countDown && next <= 0) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          onExpire?.()
          return 0
        }
        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, countDown, onExpire])

  const formatted = formatTime(seconds)

  return { seconds, formatted, running, start, pause, reset }
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
