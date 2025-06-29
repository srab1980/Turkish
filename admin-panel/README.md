# Turkish Learning Admin Panel

A comprehensive admin panel for the Turkish Language Learning Platform with Istanbul Book Curriculum Integration. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🎯 Content Management System
- **Course Management**: Create, edit, and organize Turkish language courses
- **Lesson Builder**: Rich lesson editor with multimedia support
- **Exercise Creator**: Multiple exercise types (multiple choice, fill-in-blank, speaking, etc.)
- **Vocabulary Management**: Comprehensive vocabulary database with audio
- **Grammar Rules**: Structured grammar rule management
- **Content Import**: AI-powered content import from Istanbul Book PDFs

### 👥 User Administration
- **User Management**: Comprehensive user administration with role-based access
- **Progress Tracking**: Detailed learning analytics and progress monitoring
- **Role Management**: Admin, Instructor, and Student role management
- **Bulk Operations**: Efficient bulk user operations

### 📊 Analytics & Reporting
- **Learning Analytics**: Comprehensive learning metrics and insights
- **User Analytics**: Individual and aggregate user performance data
- **Content Analytics**: Course and lesson performance metrics
- **System Analytics**: Platform usage and performance monitoring

### 🤖 AI Integration
- **Content Generation**: AI-powered content creation from PDF materials
- **Exercise Generation**: Automatic exercise creation based on lesson content
- **Content Review**: AI-assisted content quality review
- **Smart Recommendations**: AI-driven content and learning path recommendations

### ⚙️ System Configuration
- **Feature Flags**: Dynamic feature management
- **System Settings**: Comprehensive system configuration
- **API Management**: API endpoint configuration and monitoring
- **Security Settings**: Authentication and authorization management

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Headless UI with custom components
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **Charts**: Recharts
- **File Upload**: React Dropzone
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (NestJS)
- AI Services running (Python)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

### Demo Credentials

For development and testing:
- **Email**: admin@turkishlearning.com
- **Password**: admin123

## Project Structure

```
admin-panel/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── content/           # Content management pages
│   │   ├── users/             # User management pages
│   │   ├── analytics/         # Analytics pages
│   │   ├── ai-tools/          # AI tools pages
│   │   ├── system/            # System configuration pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── login/             # Authentication pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── layout/            # Layout components
│   │   ├── content/           # Content management components
│   │   ├── users/             # User management components
│   │   ├── analytics/         # Analytics components
│   │   ├── ai-tools/          # AI tools components
│   │   ├── system/            # System components
│   │   └── ui/                # Base UI components
│   ├── lib/                   # Utility libraries
│   │   ├── api.ts             # API client
│   │   ├── utils.ts           # Utility functions
│   │   └── validations.ts     # Form validations
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Main types file
│   └── hooks/                 # Custom React hooks
├── public/                    # Static assets
├── tailwind.config.js         # Tailwind CSS configuration
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Key Components

### API Client (`src/lib/api.ts`)
Comprehensive API client with:
- Authentication handling
- Error management
- Type safety
- Request/response interceptors
- Automatic token refresh

### Type System (`src/types/index.ts`)
Complete TypeScript definitions for:
- All entity types (Course, Lesson, Exercise, etc.)
- API response types
- Form types
- Enum definitions

### Layout System (`src/components/layout/`)
- **Sidebar**: Collapsible navigation with role-based menu items
- **Header**: Search, notifications, and user menu
- **Layout**: Main layout wrapper with authentication

### Content Management (`src/components/content/`)
- **CourseList**: Advanced course listing with search, filters, and bulk operations
- **CourseForm**: Comprehensive course creation/editing form
- **LessonEditor**: Rich lesson content editor
- **ExerciseBuilder**: Multi-type exercise creation interface

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- **ESLint**: Configured with Next.js and TypeScript rules
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Tailwind CSS**: Utility-first styling

### Component Guidelines

1. **Use TypeScript**: All components must be typed
2. **Props Interface**: Define clear props interfaces
3. **Error Handling**: Implement proper error boundaries
4. **Loading States**: Show loading indicators for async operations
5. **Accessibility**: Follow WCAG guidelines
6. **Responsive Design**: Mobile-first approach

## API Integration

### Authentication
- JWT-based authentication
- Automatic token refresh
- Role-based access control
- Secure cookie storage

### Error Handling
- Global error interceptors
- User-friendly error messages
- Retry mechanisms
- Offline support

### Data Management
- TanStack Query for server state
- Optimistic updates
- Background refetching
- Cache invalidation

## Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Environment Variables

Required for production:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_AI_SERVICE_URL`: AI services URL
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## Security

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Secure HTTP-only cookies
- CSRF protection

### Data Protection
- Input validation and sanitization
- XSS protection
- SQL injection prevention
- File upload security

### API Security
- Rate limiting
- Request validation
- Error message sanitization
- Secure headers

## Performance

### Optimization Strategies
- Next.js App Router for optimal performance
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Bundle size optimization
- Caching strategies

### Monitoring
- Performance metrics tracking
- Error monitoring
- User analytics
- API response time monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/updates
- `chore:` Maintenance tasks

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.
