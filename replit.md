# Match Colab - Community Networking Platform

## Overview

Match Colab is a community-first networking platform designed to help people form meaningful connections through structured engagement, group participation, and trusted introductions. The platform focuses on authentic conversations and progressive relationship building, moving users from public group interactions to private one-on-one connections.

The application serves as a social networking tool where users engage with daily prompts, participate in interest-based groups, and request introductions to other members. It emphasizes community trust, content moderation, and real-time engagement to create a safe and welcoming environment for forming both friendships and romantic relationships.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket integration for live updates and online presence

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
- **User Management**: Automatic user creation and profile management

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