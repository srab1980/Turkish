import requests
import json

# Test advanced conversation features
base_url = "http://localhost:8000/api/v1/conversation"

# Test guided practice mode
start_data = {
    "user_id": "advanced_user_456",
    "mode": "guided_practice",
    "difficulty": "intermediate", 
    "cefr_level": "B1",
    "topic": "daily_routine"
}

print("Testing guided practice conversation...")
response = requests.post(f"{base_url}/start", json=start_data)
print(f"Status: {response.status_code}")
session_data = response.json()
print(f"AI message: {session_data['ai_message']}")

session_id = session_data["session_id"]

# Multiple conversation turns
conversations = [
    "Merhaba! Bugün çok güzel geçti.",
    "Sabah erken kalktım ve spor yaptım.",
    "Öğleden sonra arkadaşlarımla buluştuk.",
    "Akşam evde kitap okudum."
]

for i, message in enumerate(conversations):
    print(f"\n--- Turn {i+1} ---")
    print(f"User: {message}")
    
    continue_data = {
        "session_id": session_id,
        "message": message
    }
    
    response = requests.post(f"{base_url}/continue", json=continue_data)
    if response.status_code == 200:
        continue_response = response.json()
        print(f"AI: {continue_response['ai_message']}")
        if continue_response.get('feedback'):
            print(f"Feedback: {continue_response['feedback']}")

# Get conversation history
print("\n--- Conversation History ---")
response = requests.get(f"{base_url}/history/{session_id}")
if response.status_code == 200:
    history = response.json()
    print(f"Total messages: {len(history['messages'])}")
    for msg in history['messages'][-3:]:  # Show last 3 messages
        print(f"{msg['role']}: {msg['content']}")

# Get final summary
print("\n--- Final Summary ---")
response = requests.get(f"{base_url}/summary/{session_id}")
if response.status_code == 200:
    summary = response.json()
    print(f"Duration: {summary['duration_minutes']:.2f} minutes")
    print(f"User messages: {summary['user_messages']}")
    print(f"Total words: {summary['total_words']}")
    print(f"Average message length: {summary['avg_message_length']:.1f} words")

# Test free chat mode
print("\n\n=== Testing Free Chat Mode ===")
free_chat_data = {
    "user_id": "free_chat_user_789",
    "mode": "free_chat",
    "difficulty": "advanced", 
    "cefr_level": "C1"
}

response = requests.post(f"{base_url}/start", json=free_chat_data)
if response.status_code == 200:
    session_data = response.json()
    print(f"Free chat started: {session_data['ai_message']}")
    
    # Test with a complex message
    complex_message = "Türkiye'deki kültürel çeşitlilik hakkında ne düşünüyorsunuz? Özellikle farklı bölgelerin kendine özgü gelenekleri var."
    
    continue_data = {
        "session_id": session_data["session_id"],
        "message": complex_message
    }
    
    response = requests.post(f"{base_url}/continue", json=continue_data)
    if response.status_code == 200:
        continue_response = response.json()
        print(f"AI response to complex question: {continue_response['ai_message']}")

print("\n=== All tests completed successfully! ===")
