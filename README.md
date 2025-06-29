# Turkish Language Learning App

A comprehensive full-stack Turkish language learning application with Istanbul Book Curriculum Integration and AI-powered content conversion.

## 🏗️ Project Structure

```
turkish-learning-app/
├── backend/                 # NestJS Backend API
├── frontend/               # Next.js Web Application
├── mobile/                 # React Native Mobile App
├── admin/                  # Next.js Admin Panel
├── ai-service/            # Python AI/NLP Microservices
├── shared/                # Shared utilities and types
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Shared utility functions
│   └── uploads/          # File upload storage
├── database/              # Database scripts and migrations
│   └── init/             # Database initialization scripts
├── docs/                  # Documentation
├── scripts/              # Build and deployment scripts
├── docker-compose.yml     # Docker services configuration
└── README.md             # This file
```

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based auth with Google OAuth
- **Curriculum Integration**: Automated Istanbul book content extraction
- **AI-Powered Learning**: Intelligent content generation and exercises
- **CEFR Alignment**: Structured progression through language levels
- **Interactive Exercises**: Multiple exercise types with instant feedback
- **Spaced Repetition**: Adaptive review system for retention
- **Gamification**: XP, badges, streaks, and leaderboards
- **Speech Recognition**: Pronunciation feedback and scoring
- **Offline Mode**: Essential content available without internet
- **Analytics**: Comprehensive progress tracking and insights

### Technical Features
- **Microservices Architecture**: Scalable, modular design
- **Docker Containerization**: Easy development and deployment
- **Real-time Updates**: WebSocket integration for live features
- **Mobile-First Design**: Responsive across all devices
- **AI/ML Integration**: Advanced NLP for content processing
- **Secure APIs**: JWT authentication and rate limiting
- **Performance Optimized**: Caching, CDN, and efficient algorithms

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, TypeScript
- **Mobile**: React Native, Expo
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis
- **AI/ML**: Python, FastAPI, OpenAI GPT, Hugging Face
- **Infrastructure**: Docker, Docker Compose
- **Authentication**: JWT, Google OAuth
- **Database**: PostgreSQL with Redis caching
- **File Storage**: Local storage with S3 compatibility

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Python 3.9+ (for AI services)

### Environment Setup
1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your configuration

### Development with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Services URLs
- **Frontend Web App**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:3002
- **AI Service**: http://localhost:8000
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 📚 Development Guide

### Backend Development (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### AI Service Development (Python)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload
```

### Mobile Development (React Native)
```bash
cd mobile
npm install
npx expo start
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run backend tests
cd backend && npm run test

# Run frontend tests
cd frontend && npm run test

# Run AI service tests
cd ai-service && python -m pytest
```

## 📖 Documentation

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guidelines](./docs/contributing.md)

## 🔒 Security

- JWT-based authentication
- Input validation and sanitization
- Rate limiting and CORS protection
- Secure file upload handling
- Environment variable protection

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Please read [CONTRIBUTING.md](./docs/contributing.md) for details on our code of conduct and the process for submitting pull requests.

## 📞 Support

For support, email support@turkishlearningapp.com or join our Discord community.
