import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, languageCode = 'tr-TR', voiceName = 'tr-TR-Wavenet-E' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // For now, return a fallback response since Google Cloud TTS requires API key setup
    // In production, you would implement Google Cloud TTS here
    console.log('Google TTS requested for:', text);
    
    // Return 404 to trigger fallback to next service
    res.status(404).json({ error: 'Google TTS not configured' });

  } catch (error) {
    console.error('Google TTS error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/* 
// Uncomment and configure when you have Google Cloud TTS API key:

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const client = new TextToSpeechClient({
  keyFilename: 'path/to/your/google-cloud-key.json', // Set this up
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, languageCode = 'tr-TR', voiceName = 'tr-TR-Wavenet-E' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const request = {
      input: { text: text },
      voice: { 
        languageCode: languageCode,
        name: voiceName,
        ssmlGender: 'FEMALE' as const
      },
      audioConfig: { 
        audioEncoding: 'MP3' as const,
        speakingRate: 0.9, // Slightly slower for learning
        pitch: 0.0,
        volumeGainDb: 0.0
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(response.audioContent);

  } catch (error) {
    console.error('Google TTS error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
*/
