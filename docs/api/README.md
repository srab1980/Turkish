# Turkish Learning Platform API Documentation

## Overview

The Turkish Learning Platform provides a comprehensive REST API for managing Turkish language learning content, users, and AI-powered features. The API is built with NestJS and follows OpenAPI 3.0 specifications.

## Base URLs

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.turkishlearning.com/api/v1`
- **AI Services**: `http://localhost:8000/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/profile` | Get current user profile |
| POST | `/auth/change-password` | Change user password |
| POST | `/auth/logout` | Logout user |

### Users

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | Get all users (paginated) | Admin |
| GET | `/users/:id` | Get user by ID | Admin, Self |
| PUT | `/users/:id` | Update user | Admin, Self |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/users/:id/progress` | Get user learning progress | Admin, Instructor, Self |
| GET | `/users/:id/analytics` | Get user analytics | Admin, Instructor, Self |

### Courses

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/courses` | Get all courses | All |
| GET | `/courses/:id` | Get course by ID | All |
| POST | `/courses` | Create new course | Admin, Instructor |
| PUT | `/courses/:id` | Update course | Admin, Instructor (owner) |
| DELETE | `/courses/:id` | Delete course | Admin, Instructor (owner) |
| POST | `/courses/:id/enroll` | Enroll in course | Student |
| DELETE | `/courses/:id/enroll` | Unenroll from course | Student |
| GET | `/courses/:id/progress` | Get course progress | Enrolled users |

### Units

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/courses/:courseId/units` | Get course units | All |
| GET | `/units/:id` | Get unit by ID | All |
| POST | `/courses/:courseId/units` | Create unit | Admin, Instructor |
| PUT | `/units/:id` | Update unit | Admin, Instructor |
| DELETE | `/units/:id` | Delete unit | Admin, Instructor |

### Lessons

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/units/:unitId/lessons` | Get unit lessons | All |
| GET | `/lessons/:id` | Get lesson by ID | All |
| POST | `/units/:unitId/lessons` | Create lesson | Admin, Instructor |
| PUT | `/lessons/:id` | Update lesson | Admin, Instructor |
| DELETE | `/lessons/:id` | Delete lesson | Admin, Instructor |
| POST | `/lessons/:id/complete` | Mark lesson as complete | Student |

### Exercises

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/lessons/:lessonId/exercises` | Get lesson exercises | All |
| GET | `/exercises/:id` | Get exercise by ID | All |
| POST | `/lessons/:lessonId/exercises` | Create exercise | Admin, Instructor |
| PUT | `/exercises/:id` | Update exercise | Admin, Instructor |
| DELETE | `/exercises/:id` | Delete exercise | Admin, Instructor |
| POST | `/exercises/:id/submit` | Submit exercise answer | Student |
| GET | `/exercises/:id/results` | Get exercise results | Student |

### Vocabulary

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/vocabulary` | Get vocabulary items | All |
| GET | `/vocabulary/:id` | Get vocabulary item | All |
| POST | `/vocabulary` | Create vocabulary item | Admin, Instructor |
| PUT | `/vocabulary/:id` | Update vocabulary item | Admin, Instructor |
| DELETE | `/vocabulary/:id` | Delete vocabulary item | Admin, Instructor |
| POST | `/vocabulary/:id/practice` | Practice vocabulary | Student |

### Grammar

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/grammar` | Get grammar rules | All |
| GET | `/grammar/:id` | Get grammar rule | All |
| POST | `/grammar` | Create grammar rule | Admin, Instructor |
| PUT | `/grammar/:id` | Update grammar rule | Admin, Instructor |
| DELETE | `/grammar/:id` | Delete grammar rule | Admin, Instructor |

### Analytics

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/analytics/dashboard` | Get dashboard analytics | Admin |
| GET | `/analytics/users` | Get user analytics | Admin |
| GET | `/analytics/courses` | Get course analytics | Admin, Instructor |
| GET | `/analytics/engagement` | Get engagement metrics | Admin |
| POST | `/analytics/reports` | Generate custom report | Admin |

### AI Services

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/ai/content/import` | Import content from PDF | Admin, Instructor |
| GET | `/ai/content/jobs` | Get import jobs | Admin, Instructor |
| POST | `/ai/exercises/generate` | Generate exercises | Admin, Instructor |
| POST | `/ai/content/review` | Review AI content | Admin, Instructor |
| POST | `/ai/content/approve` | Approve AI content | Admin, Instructor |

## Request/Response Examples

### Create Course

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/courses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Turkish for Beginners",
    "description": "Learn basic Turkish language skills",
    "level": "A1",
    "status": "draft"
  }'
```

**Response:**
```json
{
  "id": "uuid-here",
  "title": "Turkish for Beginners",
  "description": "Learn basic Turkish language skills",
  "level": "A1",
  "status": "draft",
  "instructor": {
    "id": "instructor-uuid",
    "fullName": "John Instructor",
    "email": "instructor@example.com"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Submit Exercise

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/exercises/uuid/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "Merhaba",
    "timeSpent": 30
  }'
```

**Response:**
```json
{
  "id": "submission-uuid",
  "isCorrect": true,
  "score": 10,
  "feedback": "Excellent! That's correct.",
  "correctAnswer": "Merhaba",
  "explanation": "Merhaba means hello in Turkish.",
  "timeSpent": 30,
  "submittedAt": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

The API uses standard HTTP status codes and returns error details in JSON format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email"
    }
  ]
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour
- **AI endpoints**: 50 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination using query parameters:

```bash
GET /api/v1/courses?page=1&limit=20&sort=createdAt&order=desc
```

**Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field (default: createdAt)
- `order` - Sort order: asc/desc (default: desc)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering and Search

Many endpoints support filtering and search:

```bash
# Search courses
GET /api/v1/courses?search=beginner&level=A1&status=published

# Filter users
GET /api/v1/users?role=student&isActive=true&createdAfter=2024-01-01
```

## File Uploads

File uploads use multipart/form-data:

```bash
curl -X POST http://localhost:3000/api/v1/ai/content/import \
  -H "Authorization: Bearer <token>" \
  -F "file=@istanbul-book.pdf" \
  -F "options={\"extractImages\":true,\"generateExercises\":true}"
```

**Supported file types:**
- PDF files (max 50MB)
- Audio files: MP3, WAV (max 10MB)
- Image files: JPG, PNG, GIF (max 5MB)

## WebSocket Events

Real-time updates are available via WebSocket:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for progress updates
socket.on('import:progress', (data) => {
  console.log('Import progress:', data.percentage);
});

// Listen for new exercises
socket.on('exercise:generated', (exercise) => {
  console.log('New exercise generated:', exercise);
});
```

## SDK and Libraries

Official SDKs are available for:

- **JavaScript/TypeScript**: `npm install @turkish-learning/sdk`
- **Python**: `pip install turkish-learning-sdk`
- **React**: `npm install @turkish-learning/react-hooks`

## Interactive Documentation

- **Swagger UI**: http://localhost:3000/api/docs
- **ReDoc**: http://localhost:3000/api/redoc
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

## Support

- **Documentation**: https://docs.turkishlearning.com
- **GitHub Issues**: https://github.com/turkish-learning/platform/issues
- **Email**: api-support@turkishlearning.com
