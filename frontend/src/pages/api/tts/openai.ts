import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voice = 'alloy' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // OpenAI TTS API call
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // High-definition model for better quality
        input: text,
        voice: voice, // alloy, echo, fable, onyx, nova, shimmer
        response_format: 'mp3',
        speed: 0.9 // Slightly slower for learning
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Send the audio data
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('OpenAI TTS error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
