# Turkish Learning Platform - API Documentation

Comprehensive API documentation for the Turkish Learning Platform Admin Panel.

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URLs](#base-urls)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)
- [SDK and Libraries](#sdk-and-libraries)

## 🌐 Overview

The Turkish Learning Platform API provides RESTful endpoints for managing users, content, analytics, and AI-powered features. All endpoints return JSON responses and follow consistent patterns for authentication, pagination, and error handling.

### API Version
- **Current Version**: v1
- **Base Path**: `/api/v1`
- **Protocol**: HTTPS (production), HTTP (development)

### Content Types
- **Request**: `application/json`
- **Response**: `application/json`
- **File Upload**: `multipart/form-data`

## 🔐 Authentication

### JWT Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. **Login**: POST `/api/v1/auth/login`
2. **Get Token**: Receive access and refresh tokens
3. **Use Token**: Include in Authorization header
4. **Refresh**: POST `/api/v1/auth/refresh` when token expires

### Token Lifecycle

- **Access Token**: 24 hours
- **Refresh Token**: 7 days
- **Automatic Refresh**: Client should handle token refresh

## 🌍 Base URLs

### Environments

- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://api-staging.turkishlearning.com/api/v1`
- **Production**: `https://api.turkishlearning.com/api/v1`

## 📄 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-12-29T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Users retrieved successfully",
  "timestamp": "2024-12-29T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-12-29T10:30:00Z"
}
```

## ⚠️ Error Handling

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Rate Limit Exceeded
- **500**: Internal Server Error

### Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## 🚦 Rate Limiting

### Limits

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per minute per IP
- **File Upload**: 10 requests per hour per user
- **AI Services**: 20 requests per hour per user

### Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔗 API Endpoints

### Authentication

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@turkishlearning.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@turkishlearning.com",
      "fullName": "Admin User",
      "role": "ADMIN"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": 86400
    }
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt-refresh-token"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <access-token>
```

### User Management

#### List Users
```http
GET /api/v1/users?page=1&limit=20&search=john&role=STUDENT&status=active
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `search`: Search term (name or email)
- `role`: Filter by role (ADMIN, TEACHER, STUDENT)
- `status`: Filter by status (active, inactive)
- `sortBy`: Sort field (createdAt, fullName, email)
- `sortOrder`: Sort order (asc, desc)

#### Get User
```http
GET /api/v1/users/{userId}
Authorization: Bearer <access-token>
```

#### Create User
```http
POST /api/v1/users
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "fullName": "New User",
  "role": "STUDENT",
  "password": "securepassword",
  "profile": {
    "nativeLanguage": "English",
    "proficiencyLevel": "BEGINNER",
    "learningGoals": ["conversation", "grammar"]
  }
}
```

#### Update User
```http
PUT /api/v1/users/{userId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "fullName": "Updated Name",
  "role": "TEACHER",
  "isActive": true
}
```

#### Delete User
```http
DELETE /api/v1/users/{userId}
Authorization: Bearer <access-token>
```

### Content Management

#### List Courses
```http
GET /api/v1/courses?page=1&limit=20&level=BEGINNER&status=PUBLISHED
Authorization: Bearer <access-token>
```

#### Get Course
```http
GET /api/v1/courses/{courseId}
Authorization: Bearer <access-token>
```

#### Create Course
```http
POST /api/v1/courses
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Turkish Basics",
  "description": "Introduction to Turkish language",
  "level": "BEGINNER",
  "estimatedDuration": 120,
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "tags": ["basics", "grammar", "vocabulary"]
}
```

#### Update Course
```http
PUT /api/v1/courses/{courseId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Updated Course Title",
  "status": "PUBLISHED"
}
```

#### Delete Course
```http
DELETE /api/v1/courses/{courseId}
Authorization: Bearer <access-token>
```

### Lesson Management

#### List Lessons
```http
GET /api/v1/courses/{courseId}/lessons
Authorization: Bearer <access-token>
```

#### Get Lesson
```http
GET /api/v1/lessons/{lessonId}
Authorization: Bearer <access-token>
```

#### Create Lesson
```http
POST /api/v1/courses/{courseId}/lessons
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Greetings in Turkish",
  "description": "Learn basic Turkish greetings",
  "content": {
    "sections": [
      {
        "type": "text",
        "content": "In Turkish, hello is 'Merhaba'"
      },
      {
        "type": "audio",
        "url": "https://example.com/audio.mp3"
      }
    ]
  },
  "orderIndex": 1,
  "duration": 15
}
```

### Vocabulary Management

#### List Vocabulary
```http
GET /api/v1/vocabulary?page=1&limit=20&category=greetings&difficulty=BEGINNER
Authorization: Bearer <access-token>
```

#### Create Vocabulary
```http
POST /api/v1/vocabulary
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "turkish": "merhaba",
  "english": "hello",
  "pronunciation": "mer-ha-BA",
  "category": "greetings",
  "difficulty": "BEGINNER",
  "audioUrl": "https://example.com/audio.mp3",
  "exampleSentence": "Merhaba, nasılsın?",
  "exampleTranslation": "Hello, how are you?",
  "tags": ["greeting", "basic"]
}
```

### Exercise Management

#### List Exercises
```http
GET /api/v1/lessons/{lessonId}/exercises
Authorization: Bearer <access-token>
```

#### Create Exercise
```http
POST /api/v1/lessons/{lessonId}/exercises
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "Choose the correct greeting",
  "type": "MULTIPLE_CHOICE",
  "content": {
    "question": "How do you say 'hello' in Turkish?",
    "options": [
      { "id": "a", "text": "Merhaba", "correct": true },
      { "id": "b", "text": "Günaydın", "correct": false },
      { "id": "c", "text": "İyi akşamlar", "correct": false }
    ]
  },
  "difficulty": "BEGINNER",
  "points": 10,
  "timeLimit": 30
}
```

### Analytics

#### Get Overview Analytics
```http
GET /api/v1/analytics/overview
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active": 890,
      "newThisMonth": 45
    },
    "content": {
      "courses": 25,
      "lessons": 180,
      "exercises": 450
    },
    "engagement": {
      "dailyActiveUsers": 120,
      "averageSessionDuration": 1800,
      "completionRate": 0.75
    }
  }
}
```

#### Get User Analytics
```http
GET /api/v1/analytics/users?period=30d&groupBy=day
Authorization: Bearer <access-token>
```

#### Get Content Analytics
```http
GET /api/v1/analytics/content/{contentId}?type=course&period=7d
Authorization: Bearer <access-token>
```

### AI Services

#### Generate Content
```http
POST /api/v1/ai/generate-content
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "type": "lesson",
  "topic": "Turkish greetings",
  "level": "BEGINNER",
  "length": "short",
  "includeExercises": true
}
```

#### Import from PDF
```http
POST /api/v1/ai/import-pdf
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

file: <pdf-file>
extractionType: "full"
targetLevel: "INTERMEDIATE"
```

#### Speech Recognition
```http
POST /api/v1/ai/speech-recognition
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

audio: <audio-file>
language: "tr"
expectedText: "Merhaba, nasılsın?"
```

### File Upload

#### Upload File
```http
POST /api/v1/upload
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

file: <file>
type: "image" | "audio" | "video" | "document"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.turkishlearning.com/files/abc123.jpg",
    "filename": "image.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

### System Configuration

#### Get Feature Flags
```http
GET /api/v1/system/feature-flags
Authorization: Bearer <access-token>
```

#### Update Feature Flag
```http
PUT /api/v1/system/feature-flags/{flagName}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "enabled": true,
  "rolloutPercentage": 50,
  "targetAudience": "premium"
}
```

#### Get System Health
```http
GET /api/v1/system/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-29T10:30:00Z",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "aiService": "healthy"
    },
    "metrics": {
      "uptime": 86400,
      "memoryUsage": 0.65,
      "cpuUsage": 0.45
    }
  }
}
```

## 🔌 WebSocket Events

### Connection
```javascript
const socket = io('wss://api.turkishlearning.com', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### User Activity
```javascript
// Listen for user activity updates
socket.on('user:activity', (data) => {
  console.log('User activity:', data);
});

// Send user activity
socket.emit('user:activity', {
  action: 'lesson_completed',
  lessonId: 'uuid',
  timestamp: Date.now()
});
```

#### Real-time Analytics
```javascript
// Listen for analytics updates
socket.on('analytics:update', (data) => {
  console.log('Analytics update:', data);
});
```

#### System Notifications
```javascript
// Listen for system notifications
socket.on('system:notification', (data) => {
  console.log('System notification:', data);
});
```

## 📚 SDK and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @turkish-learning/api-client
```

```typescript
import { TurkishLearningAPI } from '@turkish-learning/api-client';

const api = new TurkishLearningAPI({
  baseURL: 'https://api.turkishlearning.com/api/v1',
  apiKey: 'your-api-key'
});

// Get users
const users = await api.users.list({ page: 1, limit: 20 });

// Create course
const course = await api.courses.create({
  title: 'New Course',
  level: 'BEGINNER'
});
```

### Python SDK

```bash
pip install turkish-learning-api
```

```python
from turkish_learning import TurkishLearningAPI

api = TurkishLearningAPI(
    base_url='https://api.turkishlearning.com/api/v1',
    api_key='your-api-key'
)

# Get users
users = api.users.list(page=1, limit=20)

# Create course
course = api.courses.create({
    'title': 'New Course',
    'level': 'BEGINNER'
})
```

## 📞 Support

For API support:

- **Documentation**: [docs/API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/turkish-learning/admin-panel/issues)
- **Email**: api-support@turkishlearning.com

---

**Last Updated**: December 2024
**Version**: 1.0.0
