# 🇹🇷 Turkish Language Learning App

A comprehensive, interactive Turkish language learning platform with real curriculum integration, gamification, and professional-grade features that rival commercial language learning apps.

## 🎉 **LATEST UPDATE - Complete Interactive Learning System**

**🚀 Major Feature Release:** We've just implemented a complete interactive Turkish learning system with:
- ✅ **12 Interactive Exercise Types** - From flashcards to speech recognition
- ✅ **Real Curriculum Integration** - A1DersKtabi.docx & A1alimaKtabi.docx content
- ✅ **Complete Gamification** - XP, levels, achievements, streaks, and badges
- ✅ **Dynamic Progress Tracking** - Real-time sidebar updates and persistence
- ✅ **Professional UI/UX** - Loading states, error handling, responsive design
- ✅ **Practice System** - 8 targeted exercise types with difficulty progression

**🎮 Try it now:** `npm run dev` in the frontend directory and visit `http://localhost:3002`

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

### 🎮 Interactive Learning System
- **🃏 Flashcard System**: Spaced repetition with swipe gestures and Turkish text-to-speech
- **🖼️ Picture Matching**: Drag-and-drop vocabulary learning with visual feedback
- **🔤 Word Scramble**: Letter tile construction with hints and pronunciation
- **🎬 Animated Grammar**: Visual vowel harmony demonstrations with interactive examples
- **🧩 Sentence Builder**: Grammar practice with drag-and-drop word tiles
- **🎧 Audio System**: Player controls with speed adjustment and Turkish pronunciation
- **🎤 Speech Recognition**: Real-time pronunciation practice with feedback scoring
- **📖 Interactive Reading**: Tap-to-translate with vocabulary tooltips and audio
- **👤 Personalization**: "Ya Siz?" personal questions for cultural learning
- **🎮 Mini-Games**: Memory matching, crosswords, and educational games
- **🔍 Error Detection**: Interactive sentence correction with explanations
- **🏆 Gamification**: Complete XP, levels, achievements, streaks, and badge system

### 📚 Real Curriculum Integration
- **📖 A1 Textbook Content**: Real lessons from A1DersKtabi.docx
- **📝 Workbook Exercises**: Interactive versions of A1alimaKtabi.docx content
- **🎯 Smart Categorization**: Auto-categorized lessons (Grammar, Vocabulary, Culture, etc.)
- **📊 Progress Tracking**: Real completion tracking based on curriculum structure
- **🔄 Dynamic Content**: Lessons update based on actual curriculum data

### 🏆 Complete Gamification System
- **⚡ XP System**: Earn points for all learning activities (10-40 XP per exercise)
- **📈 Level Progression**: A1 Beginner → A1 Intermediate → A2 → B1 advancement
- **🔥 Streak System**: Daily goal tracking with streak maintenance
- **🏅 Achievement System**: 15+ achievement types with milestone unlocking
- **📊 Progress Dashboard**: Real-time statistics and learning analytics
- **💾 Data Persistence**: All progress saved locally with session restoration

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

### 🌐 Application URLs
- **🎓 Main Learning App**: http://localhost:3002 *(Updated port)*
- **📚 Lessons Page**: http://localhost:3002/lessons *(Real curriculum data)*
- **🎯 Practice Page**: http://localhost:3002/practice *(8 exercise types)*
- **🎮 Interactive Lessons**: http://localhost:3002/lesson/[id] *(Complete lesson flow)*
- **📊 Progress Demo**: http://localhost:3002/progress-demo *(Test gamification)*
- **🔧 Backend API**: http://localhost:3001
- **⚙️ Admin Panel**: http://localhost:3000
- **🤖 AI Service**: http://localhost:8000
- **🗄️ Database**: localhost:5432
- **⚡ Redis**: localhost:6379

### 🎮 Quick Demo
```bash
# Start the interactive learning system
cd frontend
npm install
npm run dev

# Visit http://localhost:3002 and try:
# 1. Courses → Enroll → Continue Learning → Start Lesson
# 2. Practice → Try different exercise types
# 3. Progress Demo → Test gamification features
```

## 🎮 Interactive Features Guide

### 📚 Lessons System
The lessons page (`/lessons`) displays real curriculum content from Turkish textbooks:
- **Real Data**: Loads actual lessons from A1DersKtabi.docx and A1alimaKtabi.docx
- **Smart Filtering**: Filter by category (Grammar, Vocabulary, Culture) and difficulty (A1, A2, B1)
- **Progress Tracking**: Shows completion status and progress for each lesson
- **Professional UI**: Loading states, error handling, and responsive design

### 🎯 Practice System
The practice page (`/practice`) offers 8 targeted exercise types:
- **Vocabulary Flashcards** (10 min, 20 XP) - Spaced repetition review
- **Sentence Builder** (15 min, 30 XP) - Grammar practice with word tiles
- **Pronunciation Practice** (12 min, 25 XP) - Speech recognition feedback
- **Picture Matching** (8 min, 15 XP) - Visual vocabulary learning
- **Word Scramble** (10 min, 20 XP) - Spelling and letter arrangement
- **Reading Comprehension** (20 min, 40 XP) - Text understanding with questions
- **Memory Match** (5 min, 10 XP) - Fun memory games with Turkish words
- **Error Detection** (15 min, 35 XP) - Grammar correction exercises

### 🏆 Gamification Features
- **XP System**: Earn 10-40 XP per exercise based on difficulty
- **Level Progression**: Automatic advancement through Turkish proficiency levels
- **Daily Goals**: 200 XP daily target with visual progress tracking
- **Streak System**: Maintain learning streaks with daily goal completion
- **Achievements**: Unlock badges for milestones (3-day streak, 10 lessons, etc.)
- **Real-time Updates**: Sidebar updates immediately as you learn

### 🎨 User Experience
- **Dynamic Sidebar**: Real-time progress updates and curriculum data
- **Loading States**: Professional loading animations and error handling
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Text-to-Speech**: Turkish pronunciation for all vocabulary and exercises
- **Progress Persistence**: All progress saved locally and restored between sessions

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
