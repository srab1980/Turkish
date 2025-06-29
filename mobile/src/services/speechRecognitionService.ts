import { Platform } from 'react-native'
import { Audio } from 'expo-av'
import { apiClient } from './apiClient'

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  alternatives?: Array<{
    transcript: string
    confidence: number
  }>
}

export interface SpeechRecognitionOptions {
  language: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  timeout: number
}

export interface PronunciationAssessment {
  accuracy: number
  fluency: number
  completeness: number
  pronunciation: number
  feedback: string[]
  wordScores: Array<{
    word: string
    accuracy: number
    errorType?: 'mispronunciation' | 'omission' | 'insertion'
  }>
}

export class SpeechRecognitionService {
  private static isListening = false
  private static recognition: any = null
  private static currentRecording: Audio.Recording | null = null
  private static onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null
  private static onErrorCallback: ((error: string) => void) | null = null

  // Initialize speech recognition
  static async initialize(): Promise<void> {
    try {
      // Request microphone permissions
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted')
      }

      console.log('Speech recognition service initialized')
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error)
      throw error
    }
  }

  // Start speech recognition
  static async startListening(
    options: Partial<SpeechRecognitionOptions> = {},
    onResult?: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    try {
      if (this.isListening) {
        await this.stopListening()
      }

      this.onResultCallback = onResult || null
      this.onErrorCallback = onError || null

      const recognitionOptions: SpeechRecognitionOptions = {
        language: options.language || 'tr-TR',
        continuous: options.continuous || false,
        interimResults: options.interimResults || true,
        maxAlternatives: options.maxAlternatives || 3,
        timeout: options.timeout || 10000,
      }

      if (Platform.OS === 'web') {
        await this.startWebSpeechRecognition(recognitionOptions)
      } else {
        await this.startNativeSpeechRecognition(recognitionOptions)
      }

      this.isListening = true
      console.log('Speech recognition started')
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      if (this.onErrorCallback) {
        this.onErrorCallback(error instanceof Error ? error.message : 'Unknown error')
      }
      throw error
    }
  }

  // Stop speech recognition
  static async stopListening(): Promise<void> {
    try {
      if (!this.isListening) {
        return
      }

      if (Platform.OS === 'web' && this.recognition) {
        this.recognition.stop()
        this.recognition = null
      } else if (this.currentRecording) {
        await this.currentRecording.stopAndUnloadAsync()
        this.currentRecording = null
      }

      this.isListening = false
      this.onResultCallback = null
      this.onErrorCallback = null

      console.log('Speech recognition stopped')
    } catch (error) {
      console.error('Failed to stop speech recognition:', error)
    }
  }

  // Web Speech Recognition (for web platform)
  private static async startWebSpeechRecognition(options: SpeechRecognitionOptions): Promise<void> {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported in this browser')
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    this.recognition.lang = options.language
    this.recognition.continuous = options.continuous
    this.recognition.interimResults = options.interimResults
    this.recognition.maxAlternatives = options.maxAlternatives

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript
      const confidence = result[0].confidence || 0
      const isFinal = result.isFinal

      const alternatives = []
      for (let i = 1; i < Math.min(result.length, options.maxAlternatives); i++) {
        alternatives.push({
          transcript: result[i].transcript,
          confidence: result[i].confidence || 0,
        })
      }

      if (this.onResultCallback) {
        this.onResultCallback({
          transcript,
          confidence,
          isFinal,
          alternatives,
        })
      }
    }

    this.recognition.onerror = (event: any) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error)
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
    }

    // Set timeout
    setTimeout(() => {
      if (this.isListening) {
        this.stopListening()
      }
    }, options.timeout)

    this.recognition.start()
  }

  // Native Speech Recognition (for mobile platforms)
  private static async startNativeSpeechRecognition(options: SpeechRecognitionOptions): Promise<void> {
    try {
      // Set up audio recording for speech recognition
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })

      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      })

      await recording.startAsync()
      this.currentRecording = recording

      // Set timeout to stop recording and process
      setTimeout(async () => {
        if (this.currentRecording) {
          await this.processRecordedAudio(options)
        }
      }, options.timeout)

    } catch (error) {
      console.error('Failed to start native speech recognition:', error)
      throw error
    }
  }

  // Process recorded audio for speech recognition
  private static async processRecordedAudio(options: SpeechRecognitionOptions): Promise<void> {
    try {
      if (!this.currentRecording) {
        return
      }

      await this.currentRecording.stopAndUnloadAsync()
      const uri = this.currentRecording.getURI()
      this.currentRecording = null

      if (!uri) {
        throw new Error('No recording URI available')
      }

      // Send audio to backend for speech recognition
      const result = await this.sendAudioForRecognition(uri, options)
      
      if (this.onResultCallback && result) {
        this.onResultCallback(result)
      }

    } catch (error) {
      console.error('Failed to process recorded audio:', error)
      if (this.onErrorCallback) {
        this.onErrorCallback(error instanceof Error ? error.message : 'Processing failed')
      }
    }
  }

  // Send audio to backend for recognition
  private static async sendAudioForRecognition(
    audioUri: string,
    options: SpeechRecognitionOptions
  ): Promise<SpeechRecognitionResult | null> {
    try {
      const formData = new FormData()
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'speech.wav',
      } as any)
      formData.append('language', options.language)
      formData.append('maxAlternatives', options.maxAlternatives.toString())

      const response = await apiClient.request('/ai/speech-recognition', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.success && response.data) {
        return {
          transcript: response.data.transcript,
          confidence: response.data.confidence,
          isFinal: true,
          alternatives: response.data.alternatives,
        }
      }

      return null
    } catch (error) {
      console.error('Failed to send audio for recognition:', error)
      return null
    }
  }

  // Pronunciation Assessment
  static async assessPronunciation(
    audioUri: string,
    referenceText: string,
    language: string = 'tr-TR'
  ): Promise<PronunciationAssessment | null> {
    try {
      const formData = new FormData()
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'pronunciation.wav',
      } as any)
      formData.append('referenceText', referenceText)
      formData.append('language', language)

      const response = await apiClient.request('/ai/pronunciation-assessment', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.success && response.data) {
        return {
          accuracy: response.data.accuracy,
          fluency: response.data.fluency,
          completeness: response.data.completeness,
          pronunciation: response.data.pronunciation,
          feedback: response.data.feedback,
          wordScores: response.data.wordScores,
        }
      }

      return null
    } catch (error) {
      console.error('Failed to assess pronunciation:', error)
      return null
    }
  }

  // Quick pronunciation check
  static async quickPronunciationCheck(
    text: string,
    language: string = 'tr-TR',
    timeout: number = 5000
  ): Promise<PronunciationAssessment | null> {
    try {
      // Start recording
      await this.startListening(
        {
          language,
          continuous: false,
          interimResults: false,
          maxAlternatives: 1,
          timeout,
        }
      )

      // Wait for recording to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(async () => {
          if (!this.isListening && this.currentRecording) {
            clearInterval(checkInterval)
            const uri = this.currentRecording.getURI()
            if (uri) {
              const assessment = await this.assessPronunciation(uri, text, language)
              resolve(assessment)
            } else {
              resolve(null)
            }
          }
        }, 100)

        // Timeout fallback
        setTimeout(() => {
          clearInterval(checkInterval)
          resolve(null)
        }, timeout + 1000)
      })
    } catch (error) {
      console.error('Failed to perform quick pronunciation check:', error)
      return null
    }
  }

  // Check if speech recognition is supported
  static isSupported(): boolean {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' && 
             ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    }
    return true // Native platforms support recording
  }

  // Get current listening state
  static getIsListening(): boolean {
    return this.isListening
  }
}
