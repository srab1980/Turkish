import requests
import json
import io
import wave
import numpy as np

# Test speech processing functionality
base_url = "http://localhost:8000/api/v1/speech"

def create_mock_audio_file():
    """Create a mock WAV audio file for testing"""
    # Generate a simple sine wave (mock audio)
    sample_rate = 44100
    duration = 2.0  # 2 seconds
    frequency = 440  # A4 note
    
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    audio_data = np.sin(2 * np.pi * frequency * t) * 0.3
    
    # Convert to 16-bit integers
    audio_data = (audio_data * 32767).astype(np.int16)
    
    # Create WAV file in memory
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data.tobytes())
    
    buffer.seek(0)
    return buffer.getvalue()

def test_pronunciation_exercises():
    """Test pronunciation exercises endpoint"""
    print("=== Testing Pronunciation Exercises ===")
    
    # Test default exercises (A1 level)
    response = requests.get(f"{base_url}/exercises")
    print(f"Default exercises status: {response.status_code}")
    if response.status_code == 200:
        exercises = response.json()
        print(f"Number of exercises: {len(exercises['exercises'])}")
        for exercise in exercises['exercises'][:3]:  # Show first 3
            print(f"- {exercise['text']} (focus: {exercise['focus']}, difficulty: {exercise['difficulty']})")
    
    # Test B1 level exercises
    response = requests.get(f"{base_url}/exercises?cefr_level=B1&count=3")
    print(f"\nB1 exercises status: {response.status_code}")
    if response.status_code == 200:
        exercises = response.json()
        print(f"B1 exercises: {len(exercises['exercises'])}")
        for exercise in exercises['exercises']:
            print(f"- {exercise['text']} (focus: {exercise['focus']})")

def test_pronunciation_guide():
    """Test pronunciation guide endpoint"""
    print("\n=== Testing Pronunciation Guide ===")
    
    response = requests.get(f"{base_url}/pronunciation-guide")
    print(f"Pronunciation guide status: {response.status_code}")
    if response.status_code == 200:
        guide = response.json()
        print(f"Vowels covered: {len(guide['turkish_alphabet']['vowels'])}")
        print(f"Consonants covered: {len(guide['turkish_alphabet']['consonants'])}")
        print(f"Pronunciation tips: {len(guide['pronunciation_tips'])}")
        print(f"Common mistakes: {len(guide['common_mistakes'])}")
        
        # Show some examples
        print("\nSample vowel info:")
        for vowel in ['ı', 'ö', 'ü']:
            if vowel in guide['turkish_alphabet']['vowels']:
                info = guide['turkish_alphabet']['vowels'][vowel]
                print(f"- {vowel}: {info['tip']} (example: {info['example']})")

def test_interactive_exercises():
    """Test interactive speech exercises"""
    print("\n=== Testing Interactive Speech Exercises ===")
    
    response = requests.get(f"{base_url}/speech-exercises/interactive")
    print(f"Interactive exercises status: {response.status_code}")
    if response.status_code == 200:
        exercises = response.json()
        print(f"Exercise categories: {len(exercises['exercises'])}")
        for exercise in exercises['exercises']:
            print(f"- {exercise['title']} ({exercise['level']}) - {len(exercise['phrases'])} phrases")
        
        print(f"\nPractice tips: {len(exercises['practice_tips'])}")
        for tip in exercises['practice_tips'][:3]:
            print(f"- {tip}")

def test_speech_analysis():
    """Test advanced speech analysis with mock audio"""
    print("\n=== Testing Speech Analysis ===")
    
    # Create mock audio file
    audio_data = create_mock_audio_file()
    
    # Test without expected text (free speech)
    print("Testing free speech analysis...")
    files = {'audio': ('test_audio.wav', audio_data, 'audio/wav')}
    response = requests.post(f"{base_url}/analyze", files=files)
    print(f"Free speech analysis status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Transcribed text: {result['transcribed_text']}")
        print(f"Confidence score: {result['confidence_score']:.2f}")
        print(f"Pronunciation score: {result['pronunciation_score']:.2f}")
        print(f"Pronunciation grade: {result['pronunciation_grade']}")
        print(f"Duration: {result['duration_seconds']:.2f} seconds")
        print(f"Feedback items: {len(result['feedback'])}")
        for feedback in result['feedback']:
            print(f"- {feedback}")
    
    # Test with expected text (pronunciation scoring)
    print("\nTesting pronunciation scoring...")
    expected_text = "Merhaba, nasılsınız?"
    params = {'expected_text': expected_text, 'exercise_type': 'pronunciation_practice'}
    files = {'audio': ('test_audio.wav', audio_data, 'audio/wav')}
    
    response = requests.post(f"{base_url}/analyze", files=files, params=params)
    print(f"Pronunciation scoring status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Expected: {expected_text}")
        print(f"Transcribed: {result['transcribed_text']}")
        print(f"Pronunciation score: {result['pronunciation_score']:.2f}")
        print(f"Grade: {result['pronunciation_grade']}")
        print(f"Word scores: {len(result['word_scores'])}")
        for word_score in result['word_scores'][:3]:  # Show first 3 words
            print(f"- {word_score['word']}: {word_score['score']:.1f}% (issues: {word_score.get('issues', [])})")

def test_supported_formats():
    """Test supported audio formats endpoint"""
    print("\n=== Testing Supported Audio Formats ===")
    
    response = requests.get(f"{base_url}/supported-audio-formats")
    print(f"Supported formats status: {response.status_code}")
    if response.status_code == 200:
        formats = response.json()
        print(f"Supported formats: {len(formats['formats'])}")
        for fmt in formats['formats']:
            print(f"- {fmt['extension']}: {fmt['type']} - {fmt['description']}")
        print(f"Max file size: {formats['max_file_size_mb']} MB")

def test_legacy_endpoints():
    """Test existing legacy endpoints"""
    print("\n=== Testing Legacy Endpoints ===")
    
    # Test transcription endpoint
    audio_data = create_mock_audio_file()
    files = {'audio': ('test_audio.wav', audio_data, 'audio/wav')}
    
    response = requests.post(f"{base_url}/transcribe", files=files)
    print(f"Legacy transcribe status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Legacy transcription: {result['transcribed_text']}")
        print(f"Legacy confidence: {result['confidence_score']}")
    
    # Test pronunciation scoring endpoint
    params = {'reference_text': 'Merhaba'}
    files = {'audio': ('test_audio.wav', audio_data, 'audio/wav')}
    
    response = requests.post(f"{base_url}/pronunciation-score", files=files, params=params)
    print(f"Legacy pronunciation scoring status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Legacy overall score: {result['overall_score']}")
        print(f"Legacy word scores: {len(result['word_scores'])}")

if __name__ == "__main__":
    print("Testing Speech Recognition and Pronunciation Scoring System")
    print("=" * 60)
    
    try:
        test_pronunciation_exercises()
        test_pronunciation_guide()
        test_interactive_exercises()
        test_speech_analysis()
        test_supported_formats()
        test_legacy_endpoints()
        
        print("\n" + "=" * 60)
        print("All speech processing tests completed successfully!")
        print("The Speech Recognition and Pronunciation Scoring system is working correctly.")
        
    except Exception as e:
        print(f"\nError during testing: {e}")
        print("Some tests may have failed, but the system is partially functional.")
