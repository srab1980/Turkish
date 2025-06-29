# API Architecture Documentation

## Overview

The Turkish Learning App uses a microservices architecture with the following components:

- **Backend API (NestJS)**: Main application API handling authentication, user management, courses, and progress
- **AI Service (Python/FastAPI)**: Handles content extraction, NLP processing, and AI-powered features
- **Frontend (Next.js)**: Web application consuming the APIs
- **Admin Panel (Next.js)**: Administrative interface for content management
- **Mobile App (React Native)**: Mobile application with offline capabilities

## Authentication Flow

### JWT-based Authentication
```
1. User login → Backend validates credentials
2. Backend generates JWT access token (15min) + refresh token (7 days)
3. Client stores tokens securely
4. Client sends access token in Authorization header
5. Backend validates token on each request
6. Client refreshes token when expired using refresh token
```

### Google OAuth Flow
```
1. Client initiates Google OAuth
2. Google redirects with authorization code
3. Backend exchanges code for Google user info
4. Backend creates/updates user account
5. Backend generates JWT tokens
6. Client receives tokens and user data
```

## API Endpoints Structure

### Authentication Endpoints
```
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
POST /auth/google
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/verify-email/:token
```

### User Management
```
GET    /users/profile
PUT    /users/profile
GET    /users/preferences
PUT    /users/preferences
GET    /users/stats
GET    /users/achievements
POST   /users/upload-avatar
DELETE /users/account
```

### Courses and Content
```
GET    /courses                    # List all courses
GET    /courses/:id                # Get course details
GET    /courses/:id/units          # Get course units
GET    /units/:id/lessons          # Get unit lessons
GET    /lessons/:id                # Get lesson content
GET    /lessons/:id/exercises      # Get lesson exercises
POST   /lessons/:id/complete       # Mark lesson complete
```

### Progress Tracking
```
GET    /progress/overview          # User progress overview
GET    /progress/course/:id        # Course-specific progress
POST   /progress/lesson/:id        # Update lesson progress
GET    /progress/stats             # Detailed statistics
GET    /progress/leaderboard       # Global leaderboard
```

### Exercises and Practice
```
POST   /exercises/:id/attempt      # Submit exercise attempt
GET    /exercises/review           # Get spaced repetition items
POST   /exercises/review/:id       # Submit review attempt
GET    /exercises/speaking/:id     # Get speaking exercise
POST   /exercises/speaking/:id     # Submit speech for analysis
```

### Gamification
```
GET    /gamification/achievements  # List all achievements
GET    /gamification/badges        # User's badges
GET    /gamification/leaderboard   # Leaderboard data
POST   /gamification/claim-reward  # Claim daily reward
```

### Admin Endpoints
```
GET    /admin/users               # User management
GET    /admin/courses             # Course management
POST   /admin/courses             # Create course
PUT    /admin/courses/:id         # Update course
DELETE /admin/courses/:id         # Delete course
GET    /admin/analytics           # System analytics
POST   /admin/content/import      # Import content
```

## AI Service Endpoints

### Content Processing
```
POST   /ai/extract-content        # Extract content from PDF/ebook
POST   /ai/generate-exercises     # Generate exercises from content
POST   /ai/classify-level         # Classify CEFR level
POST   /ai/analyze-speech         # Analyze pronunciation
```

### Conversation Practice
```
POST   /ai/chat/start             # Start conversation session
POST   /ai/chat/message           # Send message to AI
GET    /ai/chat/history/:id       # Get conversation history
POST   /ai/chat/end               # End conversation session
```

### Content Enhancement
```
POST   /ai/enhance-vocabulary     # Enhance vocabulary with examples
POST   /ai/generate-audio         # Generate audio for text
POST   /ai/translate              # Translate content
POST   /ai/grammar-check          # Check grammar and provide feedback
```

## Data Models and Validation

### Request/Response Schemas

#### User Registration
```typescript
interface RegisterRequest {
  email: string;           // Valid email format
  password: string;        // Min 8 chars, 1 upper, 1 lower, 1 number
  username: string;        // 3-20 chars, alphanumeric + underscore
  firstName: string;       // 1-50 chars
  lastName: string;        // 1-50 chars
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

#### Lesson Progress
```typescript
interface LessonProgressRequest {
  lessonId: string;        // UUID
  score: number;           // 0-100
  timeSpent: number;       // Seconds
  exerciseAttempts: ExerciseAttempt[];
}

interface ExerciseAttempt {
  exerciseId: string;
  userAnswer: any;
  isCorrect: boolean;
  timeSpent: number;
}
```

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;          // ERROR_CODE
    message: string;       // Human-readable message
    details?: any;         // Additional error details
  };
  timestamp: string;
  path: string;
}
```

### Error Codes
```
AUTH_001: Invalid credentials
AUTH_002: Token expired
AUTH_003: Insufficient permissions
VALIDATION_001: Invalid input data
VALIDATION_002: Missing required fields
CONTENT_001: Content not found
CONTENT_002: Content not accessible
SYSTEM_001: Internal server error
RATE_LIMIT_001: Too many requests
```

## Rate Limiting

### Rate Limit Rules
```
- Authentication endpoints: 5 requests/minute
- General API endpoints: 100 requests/minute
- File upload endpoints: 10 requests/minute
- AI service endpoints: 20 requests/minute
```

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Caching Strategy

### Redis Caching
```
- User sessions: 7 days TTL
- Course content: 1 hour TTL
- User progress: 5 minutes TTL
- Leaderboard data: 10 minutes TTL
- AI responses: 24 hours TTL
```

### Cache Keys Pattern
```
user:session:{userId}
course:content:{courseId}
user:progress:{userId}:{courseId}
leaderboard:global
ai:response:{hash}
```

## Security Measures

### Input Validation
- All inputs validated using class-validator
- SQL injection prevention with parameterized queries
- XSS prevention with input sanitization
- File upload validation (type, size, content)

### Authentication Security
- JWT tokens with short expiration
- Refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Account lockout after failed attempts

### API Security
- CORS configuration for allowed origins
- Helmet.js for security headers
- Request size limits
- IP-based rate limiting

## Monitoring and Logging

### Logging Levels
```
ERROR: System errors, exceptions
WARN:  Performance issues, deprecated usage
INFO:  User actions, system events
DEBUG: Detailed execution flow
```

### Metrics Tracking
```
- API response times
- Error rates by endpoint
- User activity patterns
- System resource usage
- Database query performance
```

## Service Communication

### Inter-service Communication
```
Backend ←→ AI Service: HTTP REST API
Backend ←→ Database: Direct connection
Frontend ←→ Backend: HTTP REST API
Mobile ←→ Backend: HTTP REST API
Admin ←→ Backend: HTTP REST API
```

### Message Queue (Future Enhancement)
```
- Background job processing
- Email notifications
- Content processing pipeline
- Analytics data aggregation
```

## API Versioning

### Versioning Strategy
```
URL Path: /api/v1/users
Header: Accept: application/vnd.api+json;version=1
```

### Version Support
```
v1: Current stable version
v2: Future version (backward compatible for 6 months)
```
