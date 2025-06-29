import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Slider, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AudioService, AudioPlaybackState } from '../services/audioService'
import { SpeechRecognitionService, PronunciationAssessment } from '../services/speechRecognitionService'
import { useAppSelector } from '../store'

interface AudioPlayerProps {
  audioUri: string
  title?: string
  subtitle?: string
  showPronunciationPractice?: boolean
  referenceText?: string
  onPronunciationResult?: (assessment: PronunciationAssessment) => void
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUri,
  title,
  subtitle,
  showPronunciationPractice = false,
  referenceText,
  onPronunciationResult,
}) => {
  const { display } = useAppSelector((state) => state.settings)
  const isDark = display.theme === 'dark'

  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>({
    isPlaying: false,
    isLoading: false,
    duration: 0,
    position: 0,
    rate: 1.0,
    volume: 1.0,
  })

  const [isRecording, setIsRecording] = useState(false)
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationAssessment | null>(null)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      AudioService.stopAudio()
      SpeechRecognitionService.stopListening()
    }
  }, [])

  const handlePlayPause = async () => {
    try {
      if (playbackState.isPlaying) {
        await AudioService.pauseAudio()
      } else if (playbackState.position > 0 && playbackState.position < playbackState.duration) {
        await AudioService.resumeAudio()
      } else {
        await AudioService.playAudio(audioUri, {}, setPlaybackState)
      }
    } catch (error) {
      console.error('Playback error:', error)
      Alert.alert('Playback Error', 'Failed to play audio')
    }
  }

  const handleStop = async () => {
    try {
      await AudioService.stopAudio()
    } catch (error) {
      console.error('Stop error:', error)
    }
  }

  const handleSeek = async (value: number) => {
    try {
      const position = value * playbackState.duration
      await AudioService.seekTo(position)
    } catch (error) {
      console.error('Seek error:', error)
    }
  }

  const handleRateChange = async (rate: number) => {
    try {
      await AudioService.setPlaybackRate(rate)
    } catch (error) {
      console.error('Rate change error:', error)
    }
  }

  const handleVolumeChange = async (volume: number) => {
    try {
      await AudioService.setVolume(volume)
    } catch (error) {
      console.error('Volume change error:', error)
    }
  }

  const handlePronunciationPractice = async () => {
    if (!referenceText) {
      Alert.alert('Error', 'No reference text provided for pronunciation practice')
      return
    }

    try {
      setIsRecording(true)
      setPronunciationResult(null)

      const assessment = await SpeechRecognitionService.quickPronunciationCheck(
        referenceText,
        'tr-TR',
        5000
      )

      if (assessment) {
        setPronunciationResult(assessment)
        if (onPronunciationResult) {
          onPronunciationResult(assessment)
        }
      } else {
        Alert.alert('Error', 'Failed to assess pronunciation. Please try again.')
      }
    } catch (error) {
      console.error('Pronunciation practice error:', error)
      Alert.alert('Error', 'Failed to record pronunciation')
    } finally {
      setIsRecording(false)
    }
  }

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getPlaybackRateColor = (rate: number): string => {
    if (rate < 1.0) return '#f59e0b' // Slower - amber
    if (rate > 1.0) return '#10b981' // Faster - green
    return isDark ? '#ffffff' : '#1f2937' // Normal - theme color
  }

  const getPronunciationColor = (score: number): string => {
    if (score >= 80) return '#10b981' // Good - green
    if (score >= 60) return '#f59e0b' // Fair - amber
    return '#ef4444' // Poor - red
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
    ]}>
      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text style={[
              styles.title,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[
              styles.subtitle,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Main Controls */}
      <View style={styles.mainControls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: isDark ? '#374151' : '#f3f4f6' }
          ]}
          onPress={handleStop}
        >
          <Ionicons 
            name="stop" 
            size={24} 
            color={isDark ? '#ffffff' : '#1f2937'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: '#1e40af' }
          ]}
          onPress={handlePlayPause}
          disabled={playbackState.isLoading}
        >
          <Ionicons 
            name={playbackState.isPlaying ? 'pause' : 'play'} 
            size={32} 
            color="#ffffff" 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: isDark ? '#374151' : '#f3f4f6' }
          ]}
          onPress={() => setShowControls(!showControls)}
        >
          <Ionicons 
            name="settings" 
            size={24} 
            color={isDark ? '#ffffff' : '#1f2937'} 
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={[
          styles.timeText,
          { color: isDark ? '#d1d5db' : '#6b7280' }
        ]}>
          {formatTime(playbackState.position)}
        </Text>
        
        <Slider
          style={styles.progressSlider}
          value={playbackState.duration > 0 ? playbackState.position / playbackState.duration : 0}
          onValueChange={handleSeek}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#1e40af"
          maximumTrackTintColor={isDark ? '#374151' : '#d1d5db'}
          thumbTintColor="#1e40af"
        />
        
        <Text style={[
          styles.timeText,
          { color: isDark ? '#d1d5db' : '#6b7280' }
        ]}>
          {formatTime(playbackState.duration)}
        </Text>
      </View>

      {/* Advanced Controls */}
      {showControls && (
        <View style={styles.advancedControls}>
          {/* Playback Rate */}
          <View style={styles.controlRow}>
            <Text style={[
              styles.controlLabel,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Speed
            </Text>
            <View style={styles.rateButtons}>
              {[0.5, 0.75, 1.0, 1.25, 1.5].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.rateButton,
                    { 
                      backgroundColor: playbackState.rate === rate 
                        ? '#1e40af' 
                        : (isDark ? '#374151' : '#f3f4f6')
                    }
                  ]}
                  onPress={() => handleRateChange(rate)}
                >
                  <Text style={[
                    styles.rateButtonText,
                    { 
                      color: playbackState.rate === rate 
                        ? '#ffffff' 
                        : getPlaybackRateColor(rate)
                    }
                  ]}>
                    {rate}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Volume */}
          <View style={styles.controlRow}>
            <Text style={[
              styles.controlLabel,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Volume
            </Text>
            <Slider
              style={styles.volumeSlider}
              value={playbackState.volume}
              onValueChange={handleVolumeChange}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#1e40af"
              maximumTrackTintColor={isDark ? '#374151' : '#d1d5db'}
              thumbTintColor="#1e40af"
            />
          </View>
        </View>
      )}

      {/* Pronunciation Practice */}
      {showPronunciationPractice && referenceText && (
        <View style={styles.pronunciationSection}>
          <TouchableOpacity
            style={[
              styles.pronunciationButton,
              { 
                backgroundColor: isRecording ? '#ef4444' : '#10b981',
                opacity: isRecording ? 0.8 : 1
              }
            ]}
            onPress={handlePronunciationPractice}
            disabled={isRecording}
          >
            <Ionicons 
              name={isRecording ? 'mic' : 'mic-outline'} 
              size={24} 
              color="#ffffff" 
            />
            <Text style={styles.pronunciationButtonText}>
              {isRecording ? 'Recording...' : 'Practice Pronunciation'}
            </Text>
          </TouchableOpacity>

          {pronunciationResult && (
            <View style={styles.pronunciationResult}>
              <Text style={[
                styles.pronunciationScore,
                { color: getPronunciationColor(pronunciationResult.pronunciation) }
              ]}>
                Score: {pronunciationResult.pronunciation}/100
              </Text>
              
              <View style={styles.pronunciationDetails}>
                <Text style={[styles.pronunciationDetail, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                  Accuracy: {pronunciationResult.accuracy}%
                </Text>
                <Text style={[styles.pronunciationDetail, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                  Fluency: {pronunciationResult.fluency}%
                </Text>
              </View>

              {pronunciationResult.feedback.length > 0 && (
                <View style={styles.feedbackContainer}>
                  {pronunciationResult.feedback.map((feedback, index) => (
                    <Text 
                      key={index}
                      style={[
                        styles.feedbackText,
                        { color: isDark ? '#fbbf24' : '#d97706' }
                      ]}
                    >
                      • {feedback}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  progressSlider: {
    flex: 1,
    height: 40,
  },
  advancedControls: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 14,
    width: 60,
  },
  rateButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  rateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  rateButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  pronunciationSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  pronunciationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  pronunciationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  pronunciationResult: {
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  pronunciationScore: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  pronunciationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  pronunciationDetail: {
    fontSize: 12,
  },
  feedbackContainer: {
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 12,
    marginBottom: 2,
  },
})
