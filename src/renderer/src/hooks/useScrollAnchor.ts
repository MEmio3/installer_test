import { useRef, useCallback, useEffect, useState } from 'react'

interface UseScrollAnchorReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  isAtBottom: boolean
  scrollToBottom: () => void
}

export function useScrollAnchor(): UseScrollAnchorReturn {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      setIsAtBottom(true)
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = (): void => {
      const threshold = 200
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
      setIsAtBottom(atBottom)
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll when at bottom and content changes
  useEffect(() => {
    if (isAtBottom) {
      const el = containerRef.current
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    }
  })

  return { containerRef, isAtBottom, scrollToBottom }
}
