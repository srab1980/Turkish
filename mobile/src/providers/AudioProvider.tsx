import React, { createContext, useContext, useRef, useState } from 'react'
import { Audio } from 'expo-av'
import { useAppSelector } from '../store'

interface AudioContextType {
  playAudio: (uri: string) => Promise<void>
  stopAudio: () => Promise<void>
  pauseAudio: () => Promise<void>
  resumeAudio: () => Promise<void>
  setVolume: (volume: number) => Promise<void>
  setPlaybackSpeed: (speed: number) => Promise<void>
  isPlaying: boolean
  isLoading: boolean
  currentUri: string | null
}

const AudioContext = createContext<AudioContextType | null>(null)

interface AudioProviderProps {
  children: React.ReactNode
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const { audio } = useAppSelector((state) => state.settings)
  const soundRef = useRef<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUri, setCurrentUri] = useState<string | null>(null)

  React.useEffect(() => {
    // Configure audio session
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        })
      } catch (error) {
        console.error('Error configuring audio:', error)
      }
    }

    configureAudio()

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync()
      }
    }
  }, [])

  const playAudio = async (uri: string) => {
    if (!audio.enabled) {
      return
    }

    try {
      setIsLoading(true)

      // Stop current audio if playing
      if (soundRef.current) {
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }

      // Load and play new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: true,
          volume: audio.volume,
          rate: audio.playbackSpeed,
          shouldCorrectPitch: true,
        }
      )

      soundRef.current = sound
      setCurrentUri(uri)
      setIsPlaying(true)
      setIsLoading(false)

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying)
          
          if (status.didJustFinish) {
            setIsPlaying(false)
            setCurrentUri(null)
          }
        }
      })

    } catch (error) {
      console.error('Error playing audio:', error)
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  const stopAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync()
        await soundRef.current.unloadAsync()
        soundRef.current = null
        setIsPlaying(false)
        setCurrentUri(null)
      }
    } catch (error) {
      console.error('Error stopping audio:', error)
    }
  }

  const pauseAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync()
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error pausing audio:', error)
    }
  }

  const resumeAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Error resuming audio:', error)
    }
  }

  const setVolume = async (volume: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(volume)
      }
    } catch (error) {
      console.error('Error setting volume:', error)
    }
  }

  const setPlaybackSpeed = async (speed: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setRateAsync(speed, true)
      }
    } catch (error) {
      console.error('Error setting playback speed:', error)
    }
  }

  const contextValue: AudioContextType = {
    playAudio,
    stopAudio,
    pauseAudio,
    resumeAudio,
    setVolume,
    setPlaybackSpeed,
    isPlaying,
    isLoading,
    currentUri,
  }

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
