# Match Colab - Community Networking Platform

## Overview

Match Colab is a community-first networking platform designed to help singles find life partners through meaningful connections and conversation-first discovery. The platform creates a safe, supportive environment where compatibility reveals itself naturally through group interactions, shared activities, and guided discussions, avoiding the superficiality of swiping-based dating apps.

The application serves as a comprehensive dating platform with a structured 6-step onboarding process that ensures only serious, verified users can access premium features like personalized introductions. Users progress from basic account creation to verified membership through social profile completion, comprehensive background verification, and subscription-based premium features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket integration for live updates and online presence
- **Onboarding System**: Multi-step progressive onboarding with step validation and progress tracking

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL as the primary database
- **Authentication**: Replit Auth integration with session-based authentication
- **API Design**: RESTful API with standardized error handling and request logging
- **Real-time Features**: WebSocket server for live notifications and presence indicators

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle migrations for database versioning
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **Connection Pooling**: Neon serverless connection pooling for optimal performance

### Authentication and Authorization
- **Provider**: Replit OAuth integration with OpenID Connect
- **Session Management**: Server-side sessions with secure HTTP-only cookies
- **Authorization**: Route-level protection with middleware-based access control
- **User Management**: 6-step onboarding process with progressive feature unlocking
- **App ID System**: Unique 6-character identifiers for community interactions (format: Gender/Age/AppID)

### Content Moderation and Safety
- **AI Moderation**: OpenAI moderation API for automated content filtering
- **Sentiment Analysis**: GPT-4 powered sentiment analysis for conversation health monitoring
- **Trust System**: User trust scoring based on community interactions and reports
- **Introduction Context**: AI-generated conversation starters for matched users

### Real-time Features
- **WebSocket Management**: Custom WebSocket service for live updates
- **Online Presence**: Real-time user count and activity indicators
- **Live Notifications**: Instant updates for likes, comments, and introduction requests
- **Heartbeat System**: Connection health monitoring with automatic reconnection

### Component Organization
- **Shared Types**: Common TypeScript interfaces and Zod schemas in shared directory
- **UI Components**: Reusable component library with consistent design patterns
- **Layout System**: Responsive design with mobile-first approach and progressive enhancement
- **State Synchronization**: Optimistic updates with server state reconciliation

## External Dependencies

### Cloud Services
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OAuth service for user authentication
- **AI Services**: OpenAI API for content moderation and sentiment analysis

### Development Tools
- **Bundling**: Vite for fast development and optimized production builds
- **Type Safety**: TypeScript with strict configuration across frontend and backend
- **Styling**: Tailwind CSS with custom design tokens and component variants
- **Development Environment**: Replit-specific tooling and runtime error handling

### Key Libraries
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Form Handling**: React Hook Form with Zod validation
- **Database**: Drizzle ORM with type-safe query building
- **WebSocket**: ws library for Node.js WebSocket server implementation
- **Session Management**: express-session with PostgreSQL store

## Onboarding System

### 6-Step Progressive Onboarding Process
1. **Minimal Account Setup** - Contact verification with unique App ID assignment
2. **Short Social Profile** - Basic details and social verification (enables group activities)
3. **Complete Profile** - Comprehensive background, preferences, photos (enables verification)
4. **Identity Verification** - Social or manual verification process (enables subscription)
5. **Premium Subscription** - Payment and video call verification (enables introductions)
6. **Active Participation** - Full community engagement with all features unlocked

### App ID System
- Unique 6-character alphanumeric identifiers assigned to each user
- Displayed as Gender/Age/AppID format (e.g., M/25/abc123)
- Used for community identification while maintaining privacy
- Prevents pseudonym usage and ensures authentic interactions

### Feature Gating
- **Group Activities**: Requires completed social profile (Step 2)
- **Verification Eligibility**: Requires completed full profile (Step 3)
- **Subscription Access**: Requires verified status (Step 4)
- **Introduction Requests**: Requires active subscription (Step 5)

### Profile Data Structure
- **Basic Profile**: Name, gender, DOB, height, marital status, location, contact info
- **Lifestyle & Habits**: Smoking, drinking, diet, workout, interests, languages, social links
- **Professional Details**: Education, career, income range, professional introduction
- **Partner Preferences**: Age/height ranges, lifestyle preferences, relocation willingness
- **Personal Information**: Bio, family details, health information, photo gallery