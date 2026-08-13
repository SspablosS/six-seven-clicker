import { useEffect } from 'react'
import { initAudioFromSettings } from '@/audio/AudioController'

export function useAudioBootstrap() {
  useEffect(() => {
    initAudioFromSettings()
  }, [])
}
