import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voice = 'tr-TR-EmelNeural', language = 'tr-TR' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // For now, return a fallback response since Azure TTS requires API key setup
    // In production, you would implement Azure Cognitive Services TTS here
    console.log('Azure TTS requested for:', text);
    
    // Return 404 to trigger fallback to next service
    res.status(404).json({ error: 'Azure TTS not configured' });

  } catch (error) {
    console.error('Azure TTS error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/* 
// Uncomment and configure when you have Azure Cognitive Services API key:

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voice = 'tr-TR-EmelNeural', language = 'tr-TR' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const subscriptionKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || 'eastus';

    if (!subscriptionKey) {
      throw new Error('Azure Speech API key not configured');
    }

    // Get access token
    const tokenResponse = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Azure access token');
    }

    const accessToken = await tokenResponse.text();

    // SSML for Turkish speech
    const ssml = `
      <speak version='1.0' xml:lang='${language}'>
        <voice xml:lang='${language}' xml:gender='Female' name='${voice}'>
          <prosody rate='0.9'>
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    // Synthesize speech
    const speechResponse = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
      },
      body: ssml
    });

    if (!speechResponse.ok) {
      throw new Error(`Azure TTS API error: ${speechResponse.statusText}`);
    }

    const audioBuffer = await speechResponse.arrayBuffer();
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('Azure TTS error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
*/
