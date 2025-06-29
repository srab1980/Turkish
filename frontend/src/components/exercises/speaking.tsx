"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react"

interface SpeakingProps {
  question: {
    id: string
    text: string
    expectedText: string
    audioUrl?: string
    difficulty: "easy" | "medium" | "hard"
    explanation?: string
    hints?: string[]
  }
  onAnswer: (audioBlob: Blob, transcript?: string) => void
  showResult?: boolean
  result?: {
    score: number
    feedback: string
    transcript?: string
    pronunciationScore?: number
    fluencyScore?: number
    accuracyScore?: number
  }
}

export function Speaking({ 
  question, 
  onAnswer, 
  showResult = false, 
  result 
}: SpeakingProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [recordingLevel, setRecordingLevel] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })
      
      // Set up audio analysis for visual feedback
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onAnswer(blob)
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
        audioContext.close()
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      // Start audio level monitoring
      monitorAudioLevel()

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingLevel(0)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const updateLevel = () => {
      if (!analyserRef.current || !isRecording) return
      
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      setRecordingLevel(Math.min(100, (average / 255) * 100))
      
      animationRef.current = requestAnimationFrame(updateLevel)
    }
    
    updateLevel()
  }

  const playExampleAudio = async () => {
    if (!question.audioUrl) return

    setIsPlaying(true)
    try {
      const audio = new Audio(question.audioUrl)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        console.warn("Audio file not found:", question.audioUrl)
        setIsPlaying(false)
      }
      await audio.play()
    } catch (error) {
      console.warn("Audio playback not available:", error.message)
      setIsPlaying(false)
    }
  }

  const playRecording = () => {
    if (!audioUrl) return

    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setRecordingTime(0)
    setRecordingLevel(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "hard": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Speaking Exercise</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            {showResult && result && (
              <Badge variant="outline" className={`text-sm ${getScoreColor(result.score)}`}>
                Score: {result.score}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-lg font-medium leading-relaxed mb-2">
                {question.text}
              </p>
              <div className="p-3 bg-accent/50 rounded-lg border">
                <p className="text-sm font-medium text-foreground">
                  Say: "{question.expectedText}"
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
              {question.audioUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playExampleAudio}
                  disabled={isPlaying || isRecording}
                >
                  <Volume2 className={cn(
                    "h-4 w-4",
                    isPlaying && "animate-pulse"
                  )} />
                </Button>
              )}
              {question.hints && question.hints.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHints(!showHints)}
                >
                  Hints
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hints */}
        {showHints && question.hints && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-sm mb-2 text-blue-800">Pronunciation Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {question.hints.map((hint, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recording Interface */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="animate-pulse"
              >
                <MicOff className="h-5 w-5 mr-2" />
                Stop Recording ({formatTime(recordingTime)})
              </Button>
            )}

            {audioBlob && !isRecording && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={playRecording}
                  variant="outline"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Play Recording
                </Button>
                {!showResult && (
                  <Button
                    onClick={resetRecording}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Record Again
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Activity className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Recording level</span>
              </div>
              <Progress value={recordingLevel} className="h-2" />
            </div>
          )}

          {/* Hidden audio element for playback */}
          {audioUrl && (
            <audio ref={audioRef} src={audioUrl} className="hidden" />
          )}
        </div>

        {/* Results */}
        {showResult && result && (
          <div className="space-y-4">
            <div className="p-4 bg-accent/50 rounded-lg border">
              <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Speech Analysis Results</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {result.pronunciationScore !== undefined && (
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(result.pronunciationScore)}`}>
                      {result.pronunciationScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Pronunciation</div>
                  </div>
                )}
                {result.fluencyScore !== undefined && (
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(result.fluencyScore)}`}>
                      {result.fluencyScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Fluency</div>
                  </div>
                )}
                {result.accuracyScore !== undefined && (
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(result.accuracyScore)}`}>
                      {result.accuracyScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                )}
              </div>

              {result.transcript && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">What we heard:</div>
                  <div className="text-sm text-muted-foreground italic">"{result.transcript}"</div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                {result.feedback}
              </div>
            </div>

            {question.explanation && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-sm mb-2 text-blue-800">Explanation:</h4>
                <p className="text-sm text-blue-700">{question.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!showResult && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> Click "Start Recording" and clearly pronounce the Turkish phrase. 
              Try to match the pronunciation and intonation of the example audio.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
