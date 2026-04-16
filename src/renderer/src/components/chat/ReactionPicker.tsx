import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useEffect, useRef } from 'react'

interface ReactionPickerProps {
  onSelect: (emojiId: string) => void
  onClose: () => void
}

export function ReactionPicker({ onSelect, onClose }: ReactionPickerProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <Picker
        data={data}
        theme="dark"
        onEmojiSelect={(e: { id: string }) => {
          onSelect(e.id)
          onClose()
        }}
        previewPosition="none"
        skinTonePosition="none"
      />
    </div>
  )
}
