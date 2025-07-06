"use client"

import { useState } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Mic, 
  Volume2, 
  Brain, 
  FileText, 
  MessageSquare, 
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Pause
} from "lucide-react"

export default function AITestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>({})
  const [ttsText, setTtsText] = useState("Merhaba! Bu bir test metnidir.")
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)

  // Test TTS (Text-to-Speech)
  const testTTS = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/speech/text-to-speech?text=${encodeURIComponent(ttsText)}&language=tr&voice=alloy&speed=1.0`, {
        method: 'POST'
      })
      const result = await response.json()
      setTestResults(prev => ({ ...prev, tts: { success: true, data: result } }))
    } catch (error) {
      setTestResults(prev => ({ ...prev, tts: { success: false, error: error.message } }))
    }
    setIsLoading(false)
  }

  // Test Speech Recognition
  const testSpeechRecognition = async () => {
    setIsLoading(true)
    try {
      if (!audioFile) {
        // Test pronunciation guide if no file uploaded
        const response = await fetch(`/api/v1/speech/pronunciation-guide`)
        const result = await response.json()
        setTestResults(prev => ({ ...prev, speech: { success: true, data: result } }))
      } else {
        // Test speech-to-text with uploaded file
        const formData = new FormData()
        formData.append('audio_file', audioFile)

        const response = await fetch(`/api/v1/speech/speech-to-text?language=tr&model=whisper-1`, {
          method: 'POST',
          body: formData
        })
        const result = await response.json()
        setTestResults(prev => ({ ...prev, speech: { success: true, data: result } }))
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, speech: { success: false, error: error.message } }))
    }
    setIsLoading(false)
  }

  // Test Content Generation
  const testContentGeneration = async () => {
    setIsLoading(true)
    try {
      // Create AbortController for timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch(`/api/v1/lessons/generate-with-gpt4?topic=Turkish Greetings&cefr_level=A1&lesson_type=vocabulary&duration_minutes=15`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setTestResults(prev => ({ ...prev, content: { success: true, data: result } }))
    } catch (error) {
      if (error.name === 'AbortError') {
        setTestResults(prev => ({ ...prev, content: { success: false, error: 'Request timed out. GPT-4 content generation takes time, please try again.' } }))
      } else {
        setTestResults(prev => ({ ...prev, content: { success: false, error: error.message } }))
      }
    }
    setIsLoading(false)
  }

  // Test AI Services Health
  const testAIHealth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/health`)
      const result = await response.json()
      setTestResults(prev => ({ ...prev, health: { success: true, data: result } }))
    } catch (error) {
      setTestResults(prev => ({ ...prev, health: { success: false, error: error.message } }))
    }
    setIsLoading(false)
  }

  // Test Conversation AI
  const testConversationAI = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/conversation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: "restaurant_ordering",
          user_level: "A2"
        })
      })
      const result = await response.json()
      setTestResults(prev => ({ ...prev, conversation: { success: true, data: result } }))
    } catch (error) {
      setTestResults(prev => ({ ...prev, conversation: { success: false, error: error.message } }))
    }
    setIsLoading(false)
  }

  const renderTestResult = (testName: string, result: any) => {
    if (!result) return <Badge variant="outline">Not tested</Badge>
    
    return (
      <div className="space-y-2">
        <Badge variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <><CheckCircle className="w-3 h-3 mr-1" /> Success</>
          ) : (
            <><XCircle className="w-3 h-3 mr-1" /> Failed</>
          )}
        </Badge>
        {result.data && (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}
        {result.error && (
          <p className="text-xs text-red-600">{result.error}</p>
        )}
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Features Testing</h1>
            <p className="text-muted-foreground">
              Test all AI-powered features in your Turkish learning app
            </p>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Brain className="h-3 w-3" />
            <span>AI Testing Suite</span>
          </Badge>
        </div>

        <Tabs defaultValue="tts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tts">TTS</TabsTrigger>
            <TabsTrigger value="speech">Speech</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="conversation">Chat</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          {/* Text-to-Speech Testing */}
          <TabsContent value="tts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5" />
                  <span>Text-to-Speech (TTS) Testing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Text to Convert:</label>
                  <Input
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Enter Turkish text to convert to speech..."
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={testTTS} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Volume2 className="w-4 h-4 mr-2" />}
                    Test TTS
                  </Button>
                  
                  <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Play'} Audio
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Test Result:</h4>
                  {renderTestResult('tts', testResults.tts)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Speech Recognition Testing */}
          <TabsContent value="speech">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="h-5 w-5" />
                  <span>Speech Recognition & Pronunciation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test speech recognition, pronunciation scoring, and pronunciation guides.
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Audio File (Optional):</label>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {audioFile && (
                    <p className="text-xs text-green-600">File selected: {audioFile.name}</p>
                  )}
                </div>

                <Button onClick={testSpeechRecognition} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mic className="w-4 h-4 mr-2" />}
                  {audioFile ? 'Test Speech-to-Text' : 'Test Pronunciation Guide'}
                </Button>

                <div className="space-y-2">
                  <h4 className="font-medium">Test Result:</h4>
                  {renderTestResult('speech', testResults.speech)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Generation Testing */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>AI Content Generation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test AI-powered lesson generation, exercise creation, and content adaptation.
                </p>
                
                <Button onClick={testContentGeneration} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                  Test Content Generation
                </Button>

                <div className="space-y-2">
                  <h4 className="font-medium">Test Result:</h4>
                  {renderTestResult('content', testResults.content)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversation AI Testing */}
          <TabsContent value="conversation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Conversation AI</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test AI-powered conversation practice and interactive dialogue systems.
                </p>
                
                <Button onClick={testConversationAI} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                  Test Conversation AI
                </Button>

                <div className="space-y-2">
                  <h4 className="font-medium">Test Result:</h4>
                  {renderTestResult('conversation', testResults.conversation)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Check Testing */}
          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>AI Services Health Check</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Check the health and connectivity of all AI services.
                </p>
                
                <Button onClick={testAIHealth} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                  Check AI Health
                </Button>

                <div className="space-y-2">
                  <h4 className="font-medium">Test Result:</h4>
                  {renderTestResult('health', testResults.health)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Test All Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Run All Tests</h3>
                <p className="text-sm text-muted-foreground">Test all AI features at once</p>
              </div>
              <Button 
                onClick={async () => {
                  await testAIHealth()
                  await testTTS()
                  await testSpeechRecognition()
                  await testContentGeneration()
                  await testConversationAI()
                }}
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                Test All AI Features
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
