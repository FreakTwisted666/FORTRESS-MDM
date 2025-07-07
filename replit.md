# Fortress MDM - Enterprise Device Management System

## Overview

Fortress MDM is a comprehensive enterprise-grade mobile device management (MDM) system built with a modern full-stack architecture. The system provides centralized device management, remote control capabilities, policy enforcement, and real-time chat assistance for IT administrators managing enterprise device fleets.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with dark/light theme support
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for database operations
- **Authentication**: Simple username/password authentication with localStorage persistence
- **API Pattern**: RESTful API with JSON responses

### Database Architecture
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Database Schema
- **Users**: Authentication and role management
- **Devices**: Complete device information including IMEI, serial numbers, status tracking
- **Device Commands**: Remote command execution and tracking (lock, reboot, wipe, etc.)
- **Chat Messages**: AI assistant chat functionality
- **Device Logs**: Audit trail for device actions

### Authentication System
- Username/password authentication
- Role-based access control
- Session persistence via localStorage
- Default admin credentials support

### Device Management Features
- Device enrollment via QR codes, IMEI, or serial numbers
- Bulk device enrollment via CSV import with template download
- Real-time device status monitoring (online/offline/warning)
- Remote device actions (lock, reboot, factory reset)
- Battery level and location tracking
- Kiosk mode management
- Policy enforcement and configuration

### Policy Management System
- Security policy creation and management
- Device setting controls (WiFi, Bluetooth, Camera, USB, etc.)
- Policy enforcement levels (Strict, Moderate, Flexible)
- Policy assignment to device groups
- Compliance monitoring and reporting

### Application Management
- Enterprise app catalog with approval workflow
- Silent app installation and removal
- App blocklist and allowlist management
- App distribution to device groups
- Security scanning for uploaded applications
- Version control and update management

### Analytics & Reporting Dashboard
- Real-time compliance metrics and trends
- Security threat monitoring and alerts
- Device performance analytics
- Geolocation tracking and reporting
- Custom report generation
- Fleet health monitoring

### Chat Integration
- AI-powered MDM assistant
- Natural language device queries
- Command execution through chat interface
- Real-time messaging with bot responses

### UI Components
- Responsive dashboard with device overview
- Multi-page navigation (Dashboard, Applications, Policies, Analytics)
- Device table with search and filtering
- Statistics cards for fleet monitoring
- Modal dialogs for device enrollment and dangerous actions
- Bulk enrollment interface with CSV support
- Policy management interface
- Application catalog and distribution
- Theme switching (dark/light mode)
- Toast notifications for user feedback

## Data Flow

### Device Enrollment Flow
1. Admin initiates enrollment via dashboard
2. Device information (IMEI, serial, name) entered
3. Database record created with initial status
4. QR code or enrollment token generated
5. Device connects and updates status to "online"

### Remote Command Flow
1. Admin selects device and command action
2. Command record created in database with "pending" status
3. Command sent to device via API endpoint
4. Device processes command and reports completion
5. Command status updated to "completed" or "failed"

### Chat Assistant Flow
1. User types natural language query
2. Message sent to /api/chat endpoint
3. Backend processes query and generates response
4. Response includes device information or command confirmations
5. Chat history maintained in database

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: TypeScript ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight client-side routing

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay

## Deployment Strategy

### Development Environment
- Vite development server for frontend hot reloading
- tsx for TypeScript execution in development
- Replit-specific development enhancements

### Production Build
- Vite builds optimized frontend bundle
- esbuild creates server bundle with external dependencies
- Static files served from dist/public directory
- Node.js server runs production bundle

### Environment Configuration
- DATABASE_URL required for PostgreSQL connection
- Environment-specific configurations via NODE_ENV
- Replit-specific integration when REPL_ID is present

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Added comprehensive enterprise MDM features:
  - Policy Management system with security controls
  - Application Management with catalog and distribution
  - Analytics Dashboard with compliance monitoring
  - Bulk Enrollment with CSV import functionality
  - Multi-page navigation and enhanced UI
  - Fixed TypeScript compilation errors
- July 07, 2025. Migration to PostgreSQL database:
  - Replaced in-memory storage with persistent database
  - Created database seed script with demo data
  - System now production-ready with data persistence
- July 07, 2025. Added Kiosk Management with Single Sign-On:
  - Comprehensive kiosk management page with SSO authentication
  - Device control rules for WiFi, Mobile Data, GPS, Bluetooth
  - API endpoints for device controls and bulk operations
  - Interactive device control dashboard with enable/disable buttons
  - SSO configuration supporting SAML, OAuth, OIDC, Azure AD, Google Workspace
  - Updated AI chatbot with kiosk and device control commands
- July 07, 2025. Implemented Dark Mode:
  - Complete dark/light theme system with CSS variables
  - Theme provider with localStorage persistence and system detection
  - Theme toggle in header with smooth transitions
  - Dark mode styling across all components and pages
  - Updated chatbot to include dark mode information