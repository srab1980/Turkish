import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AudioService } from '../services/audioService'
import { SpeechRecognitionService, PronunciationAssessment } from '../services/speechRecognitionService'
import { useAppSelector } from '../store'

interface SpeechPracticeProps {
  text: string
  audioUri?: string
  language?: string
  onPronunciationResult?: (assessment: PronunciationAssessment) => void
  showDetailedFeedback?: boolean
}

export const SpeechPractice: React.FC<SpeechPracticeProps> = ({
  text,
  audioUri,
  language = 'tr-TR',
  onPronunciationResult,
  showDetailedFeedback = true,
}) => {
  const { display } = useAppSelector((state) => state.settings)
  const isDark = display.theme === 'dark'

  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationAssessment | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [recordingUri, setRecordingUri] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup
      AudioService.stopAudio()
      SpeechRecognitionService.stopListening()
    }
  }, [])

  const handlePlayReference = async () => {
    if (!audioUri) {
      // Use text-to-speech if no audio URI provided
      try {
        setIsPlaying(true)
        await AudioService.speak(text, { language, rate: 0.8 })
        setIsPlaying(false)
      } catch (error) {
        console.error('TTS error:', error)
        Alert.alert('Error', 'Failed to play reference audio')
        setIsPlaying(false)
      }
      return
    }

    try {
      setIsPlaying(true)
      await AudioService.playAudio(audioUri, {}, (state) => {
        setIsPlaying(state.isPlaying)
      })
    } catch (error) {
      console.error('Audio playback error:', error)
      Alert.alert('Error', 'Failed to play reference audio')
      setIsPlaying(false)
    }
  }

  const handleStartRecording = async () => {
    try {
      setIsRecording(true)
      await AudioService.startRecording((status) => {
        setIsRecording(status.isRecording)
      })
    } catch (error) {
      console.error('Recording error:', error)
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.')
      setIsRecording(false)
    }
  }

  const handleStopRecording = async () => {
    try {
      const uri = await AudioService.stopRecording()
      setIsRecording(false)
      
      if (uri) {
        setRecordingUri(uri)
        await assessPronunciation(uri)
      } else {
        Alert.alert('Error', 'Failed to save recording')
      }
    } catch (error) {
      console.error('Stop recording error:', error)
      Alert.alert('Error', 'Failed to stop recording')
      setIsRecording(false)
    }
  }

  const assessPronunciation = async (audioUri: string) => {
    try {
      setIsProcessing(true)
      
      const assessment = await SpeechRecognitionService.assessPronunciation(
        audioUri,
        text,
        language
      )

      if (assessment) {
        setPronunciationResult(assessment)
        if (onPronunciationResult) {
          onPronunciationResult(assessment)
        }
        if (showDetailedFeedback) {
          setShowResultModal(true)
        }
      } else {
        Alert.alert('Error', 'Failed to assess pronunciation. Please try again.')
      }
    } catch (error) {
      console.error('Pronunciation assessment error:', error)
      Alert.alert('Error', 'Failed to assess pronunciation')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlayRecording = async () => {
    if (!recordingUri) return

    try {
      await AudioService.playAudio(recordingUri)
    } catch (error) {
      console.error('Playback error:', error)
      Alert.alert('Error', 'Failed to play recording')
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981' // Good - green
    if (score >= 60) return '#f59e0b' // Fair - amber
    return '#ef4444' // Poor - red
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Practice'
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
    ]}>
      {/* Text to Practice */}
      <View style={styles.textContainer}>
        <Text style={[
          styles.practiceText,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          {text}
        </Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* Play Reference */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: '#3b82f6' }
          ]}
          onPress={handlePlayReference}
          disabled={isPlaying || isRecording}
        >
          <Ionicons 
            name={isPlaying ? 'volume-high' : 'play'} 
            size={24} 
            color="#ffffff" 
          />
          <Text style={styles.controlButtonText}>
            {isPlaying ? 'Playing...' : 'Listen'}
          </Text>
        </TouchableOpacity>

        {/* Record/Stop Recording */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: isRecording ? '#ef4444' : '#10b981' }
          ]}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isPlaying || isProcessing}
        >
          <Ionicons 
            name={isRecording ? 'stop' : 'mic'} 
            size={24} 
            color="#ffffff" 
          />
          <Text style={styles.controlButtonText}>
            {isRecording ? 'Stop' : 'Record'}
          </Text>
        </TouchableOpacity>

        {/* Play Recording */}
        {recordingUri && (
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: '#6b7280' }
            ]}
            onPress={handlePlayRecording}
            disabled={isRecording || isProcessing}
          >
            <Ionicons 
              name="play-circle" 
              size={24} 
              color="#ffffff" 
            />
            <Text style={styles.controlButtonText}>
              Play Back
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={styles.processingContainer}>
          <Text style={[
            styles.processingText,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            Analyzing pronunciation...
          </Text>
        </View>
      )}

      {/* Quick Score Display */}
      {pronunciationResult && !showResultModal && (
        <View style={styles.quickScoreContainer}>
          <Text style={[
            styles.quickScoreLabel,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            Pronunciation Score:
          </Text>
          <Text style={[
            styles.quickScore,
            { color: getScoreColor(pronunciationResult.pronunciation) }
          ]}>
            {pronunciationResult.pronunciation}/100
          </Text>
          <Text style={[
            styles.quickScoreLabel,
            { color: getScoreColor(pronunciationResult.pronunciation) }
          ]}>
            {getScoreLabel(pronunciationResult.pronunciation)}
          </Text>
        </View>
      )}

      {/* Detailed Results Modal */}
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Pronunciation Assessment
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowResultModal(false)}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={isDark ? '#ffffff' : '#1f2937'} 
                />
              </TouchableOpacity>
            </View>

            {pronunciationResult && (
              <View style={styles.resultsContainer}>
                {/* Overall Score */}
                <View style={styles.overallScoreContainer}>
                  <Text style={[
                    styles.overallScore,
                    { color: getScoreColor(pronunciationResult.pronunciation) }
                  ]}>
                    {pronunciationResult.pronunciation}/100
                  </Text>
                  <Text style={[
                    styles.overallScoreLabel,
                    { color: getScoreColor(pronunciationResult.pronunciation) }
                  ]}>
                    {getScoreLabel(pronunciationResult.pronunciation)}
                  </Text>
                </View>

                {/* Detailed Scores */}
                <View style={styles.detailedScores}>
                  <View style={styles.scoreRow}>
                    <Text style={[styles.scoreLabel, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                      Accuracy:
                    </Text>
                    <Text style={[styles.scoreValue, { color: isDark ? '#ffffff' : '#1f2937' }]}>
                      {pronunciationResult.accuracy}%
                    </Text>
                  </View>
                  <View style={styles.scoreRow}>
                    <Text style={[styles.scoreLabel, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                      Fluency:
                    </Text>
                    <Text style={[styles.scoreValue, { color: isDark ? '#ffffff' : '#1f2937' }]}>
                      {pronunciationResult.fluency}%
                    </Text>
                  </View>
                  <View style={styles.scoreRow}>
                    <Text style={[styles.scoreLabel, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                      Completeness:
                    </Text>
                    <Text style={[styles.scoreValue, { color: isDark ? '#ffffff' : '#1f2937' }]}>
                      {pronunciationResult.completeness}%
                    </Text>
                  </View>
                </View>

                {/* Feedback */}
                {pronunciationResult.feedback.length > 0 && (
                  <View style={styles.feedbackContainer}>
                    <Text style={[
                      styles.feedbackTitle,
                      { color: isDark ? '#ffffff' : '#1f2937' }
                    ]}>
                      Feedback:
                    </Text>
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

                {/* Word-level Scores */}
                {pronunciationResult.wordScores.length > 0 && (
                  <View style={styles.wordScoresContainer}>
                    <Text style={[
                      styles.wordScoresTitle,
                      { color: isDark ? '#ffffff' : '#1f2937' }
                    ]}>
                      Word Analysis:
                    </Text>
                    {pronunciationResult.wordScores.map((wordScore, index) => (
                      <View key={index} style={styles.wordScoreRow}>
                        <Text style={[
                          styles.wordText,
                          { 
                            color: wordScore.errorType 
                              ? '#ef4444' 
                              : (isDark ? '#ffffff' : '#1f2937')
                          }
                        ]}>
                          {wordScore.word}
                        </Text>
                        <Text style={[
                          styles.wordAccuracy,
                          { color: getScoreColor(wordScore.accuracy) }
                        ]}>
                          {wordScore.accuracy}%
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  textContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  practiceText: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    gap: 8,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  processingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  quickScoreContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickScoreLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  quickScore: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  resultsContainer: {
    gap: 16,
  },
  overallScoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  overallScore: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  overallScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailedScores: {
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackContainer: {
    gap: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  wordScoresContainer: {
    gap: 8,
  },
  wordScoresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  wordScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  wordText: {
    fontSize: 14,
    flex: 1,
  },
  wordAccuracy: {
    fontSize: 14,
    fontWeight: '600',
  },
})
