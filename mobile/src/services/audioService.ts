import { Audio } from 'expo-av'
import * as Speech from 'expo-speech'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

export interface AudioPlaybackState {
  isPlaying: boolean
  isLoading: boolean
  duration: number
  position: number
  rate: number
  volume: number
}

export interface RecordingState {
  isRecording: boolean
  duration: number
  uri?: string
}

export interface SpeechOptions {
  language: string
  rate: number
  pitch: number
  volume: number
  voice?: string
}

export class AudioService {
  private static sound: Audio.Sound | null = null
  private static recording: Audio.Recording | null = null
  private static playbackStatusUpdateCallback: ((status: AudioPlaybackState) => void) | null = null
  private static recordingStatusUpdateCallback: ((status: RecordingState) => void) | null = null

  // Initialize audio session
  static async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })
      console.log('Audio service initialized')
    } catch (error) {
      console.error('Failed to initialize audio service:', error)
      throw error
    }
  }

  // Audio Playback Methods
  static async playAudio(
    uri: string,
    options: Partial<SpeechOptions> = {},
    onStatusUpdate?: (status: AudioPlaybackState) => void
  ): Promise<void> {
    try {
      // Stop any currently playing audio
      await this.stopAudio()

      // Set status update callback
      this.playbackStatusUpdateCallback = onStatusUpdate || null

      // Load and play the audio
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: true,
          volume: options.volume || 1.0,
          rate: options.rate || 1.0,
          shouldCorrectPitch: true,
          progressUpdateIntervalMillis: 100,
        },
        this.onPlaybackStatusUpdate
      )

      this.sound = sound
    } catch (error) {
      console.error('Failed to play audio:', error)
      throw error
    }
  }

  static async pauseAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync()
      }
    } catch (error) {
      console.error('Failed to pause audio:', error)
    }
  }

  static async resumeAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync()
      }
    } catch (error) {
      console.error('Failed to resume audio:', error)
    }
  }

  static async stopAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync()
        this.sound = null
      }
    } catch (error) {
      console.error('Failed to stop audio:', error)
    }
  }

  static async setPlaybackRate(rate: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setRateAsync(rate, true)
      }
    } catch (error) {
      console.error('Failed to set playback rate:', error)
    }
  }

  static async setVolume(volume: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(volume)
      }
    } catch (error) {
      console.error('Failed to set volume:', error)
    }
  }

  static async seekTo(positionMillis: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionMillis)
      }
    } catch (error) {
      console.error('Failed to seek:', error)
    }
  }

  // Audio Recording Methods
  static async startRecording(onStatusUpdate?: (status: RecordingState) => void): Promise<void> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted')
      }

      // Stop any current recording
      await this.stopRecording()

      // Set status update callback
      this.recordingStatusUpdateCallback = onStatusUpdate || null

      // Prepare recording
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
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      })

      recording.setOnRecordingStatusUpdate(this.onRecordingStatusUpdate)
      await recording.startAsync()
      this.recording = recording

      console.log('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  }

  static async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) {
        return null
      }

      await this.recording.stopAndUnloadAsync()
      const uri = this.recording.getURI()
      this.recording = null

      console.log('Recording stopped, saved to:', uri)
      return uri
    } catch (error) {
      console.error('Failed to stop recording:', error)
      return null
    }
  }

  static async pauseRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.pauseAsync()
      }
    } catch (error) {
      console.error('Failed to pause recording:', error)
    }
  }

  static async resumeRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.startAsync()
      }
    } catch (error) {
      console.error('Failed to resume recording:', error)
    }
  }

  // Text-to-Speech Methods
  static async speak(
    text: string,
    options: Partial<SpeechOptions> = {}
  ): Promise<void> {
    try {
      const speechOptions: Speech.SpeechOptions = {
        language: options.language || 'tr-TR', // Turkish by default
        rate: options.rate || 0.8,
        pitch: options.pitch || 1.0,
        volume: options.volume || 1.0,
        voice: options.voice,
      }

      await Speech.speak(text, speechOptions)
    } catch (error) {
      console.error('Failed to speak text:', error)
      throw error
    }
  }

  static async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop()
    } catch (error) {
      console.error('Failed to stop speaking:', error)
    }
  }

  static async pauseSpeaking(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Speech.pause()
      }
    } catch (error) {
      console.error('Failed to pause speaking:', error)
    }
  }

  static async resumeSpeaking(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Speech.resume()
      }
    } catch (error) {
      console.error('Failed to resume speaking:', error)
    }
  }

  static async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      return await Speech.getAvailableVoicesAsync()
    } catch (error) {
      console.error('Failed to get available voices:', error)
      return []
    }
  }

  // Utility Methods
  static async saveRecording(uri: string, filename: string): Promise<string> {
    try {
      const recordingsDir = `${FileSystem.documentDirectory}recordings/`
      const dirInfo = await FileSystem.getInfoAsync(recordingsDir)
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true })
      }

      const newUri = `${recordingsDir}${filename}`
      await FileSystem.moveAsync({ from: uri, to: newUri })
      
      return newUri
    } catch (error) {
      console.error('Failed to save recording:', error)
      throw error
    }
  }

  static async deleteRecording(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri)
      }
    } catch (error) {
      console.error('Failed to delete recording:', error)
    }
  }

  // Status update handlers
  private static onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && AudioService.playbackStatusUpdateCallback) {
      const playbackState: AudioPlaybackState = {
        isPlaying: status.isPlaying || false,
        isLoading: status.isBuffering || false,
        duration: status.durationMillis || 0,
        position: status.positionMillis || 0,
        rate: status.rate || 1.0,
        volume: status.volume || 1.0,
      }
      AudioService.playbackStatusUpdateCallback(playbackState)
    }
  }

  private static onRecordingStatusUpdate = (status: any) => {
    if (AudioService.recordingStatusUpdateCallback) {
      const recordingState: RecordingState = {
        isRecording: status.isRecording || false,
        duration: status.durationMillis || 0,
        uri: status.uri,
      }
      AudioService.recordingStatusUpdateCallback(recordingState)
    }
  }
}
