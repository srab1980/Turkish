import requests
import json

# Test conversation API
base_url = "http://localhost:8000/api/v1/conversation"

# Test starting a conversation
start_data = {
    "user_id": "test_user_123",
    "mode": "role_play",
    "difficulty": "beginner", 
    "cefr_level": "A1",
    "topic": "restaurant"
}

print("Testing conversation start...")
response = requests.post(f"{base_url}/start", json=start_data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 200:
    session_data = response.json()
    session_id = session_data["session_id"]
    print(f"\nSession started: {session_id}")
    print(f"AI message: {session_data['ai_message']}")
    
    # Test continuing conversation
    continue_data = {
        "session_id": session_id,
        "message": "Merhaba! Bir masa istiyorum."
    }
    
    print("\nTesting conversation continue...")
    response = requests.post(f"{base_url}/continue", json=continue_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        continue_response = response.json()
        print(f"\nAI response: {continue_response['ai_message']}")
        if continue_response.get('feedback'):
            print(f"Feedback: {continue_response['feedback']}")
    
    # Test getting summary
    print("\nTesting conversation summary...")
    response = requests.get(f"{base_url}/summary/{session_id}")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Summary: {response.json()}")
