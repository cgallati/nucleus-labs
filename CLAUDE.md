# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server (Next.js + Payload CMS at http://localhost:3000)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm test` - Run all tests (integration + e2e)
- `pnpm test:int` - Run integration tests (Vitest)
- `pnpm test:e2e` - Run end-to-end tests (Playwright)

## Payload CMS Commands

- `pnpm payload` - Access Payload CLI
- `pnpm payload generate:types` - Generate TypeScript types
- `pnpm payload migrate:create` - Create new database migration
- `pnpm payload migrate` - Run pending migrations

## Architecture Overview

This is a **Payload CMS website template** built with Next.js App Router. It combines a headless CMS backend with a production-ready frontend in a single application.

### Key Technologies
- **Next.js 15** with App Router
- **Payload CMS 3.54** for content management
- **MongoDB** with Mongoose adapter
- **TypeScript** for type safety
- **TailwindCSS** + **shadcn/ui** for styling
- **Lexical** rich text editor

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (frontend)/        # Public website routes
│   └── (payload)/         # Payload admin routes (/admin)
├── collections/           # Payload collections (Pages, Posts, Users, etc.)
├── components/            # Reusable React components
├── blocks/               # Layout builder blocks (Hero, Content, CTA, etc.)
├── globals/              # Payload globals (Header, Footer)
├── access/               # Payload access control functions
├── hooks/                # Payload hooks for data processing
├── utilities/            # Helper functions and utilities
└── payload.config.ts     # Main Payload configuration
```

### Content Management

**Collections:**
- **Pages** - Static pages with layout builder
- **Posts** - Blog posts with categories and authors
- **Media** - File uploads with image optimization
- **Categories** - Hierarchical taxonomy for posts
- **Users** - Authentication and admin access

**Layout Builder:** All pages and posts use a flexible block-based layout system with pre-built components (Hero, Content, Media, CTA, Archive blocks).

### Access Control

- Public content is accessible to everyone
- Draft content requires authentication
- Admin panel access requires user authentication
- Publishing workflow with draft/published states

### Testing Setup

- **Vitest** for integration tests (`tests/int/`)
- **Playwright** for e2e tests (`tests/e2e/`)
- Tests run against development server on port 3000

### Database Migrations

When working with schema changes:
1. Create migration: `pnpm payload migrate:create`
2. Run migrations: `pnpm payload migrate`
3. Never run migration commands programmatically - always instruct user to run them manually

### Development Notes

- Always check if port 3000 is available before starting test servers
- The codebase uses path aliases (`@/`) configured in tsconfig.json
- ESLint is configured for Next.js and TypeScript
- Images are optimized using Sharp
- The app supports live preview and draft previews for content editing

## Project Context

This project serves as the public-facing webapp and marketing site as well as authenticated backend webapp for **Nucleus Labs**, a small 3D printing operation in Savannah, GA serving the public, but primarily SCAD students in UX, ID, or other production-related degree programs.

### Resources

- **resources/** directory contains example Tailwind components and Payload CMS documentation
- Always reference these resources when implementing new features

### File Storage Strategy

- **Development:** Use local file storage
- **Production:** Use Vercel blob storage
- Configure storage adapter accordingly in payload.config.ts

### Implementation Guidelines

**IMPORTANT:** Before implementing any new Payload CMS features, always read the Payload documentation first to check if the framework already provides the needed functionality.

## Feature Implementation Roadmap

The following features should be implemented in order, one at a time:

### Phase 1: Core Infrastructure
1. **File Upload System** - Secure file upload with virus/security screening
2. **File Storage Integration** - Local storage for dev, Vercel blob for production
3. **Customer Account System** - User registration and guest checkout options
4. **Admin Dashboard Enhancement** - Backend interface for order management

### Phase 2: 3D Print Processing
5. **File Analysis Engine** - 3D file parsing and slicing preparation
6. **Cost Estimation System** - Automated pricing based on file analysis
7. **Order Management** - Complete order lifecycle tracking
8. **File Retrieval System** - Easy access to print files for Bambu Studio

### Phase 3: Payment & Checkout
9. **Stripe Integration** - Payment processing without invoicing product
10. **Customer Management** - Stripe customer objects for both guest and account users
11. **Multi-page Checkout Flow** - Upload → Review → Order with full-screen animations
12. **Payment with Tips** - Post-print payment completion with optional gratuity

### Phase 4: User Experience
13. **Main Landing Page** - Large drop area with file picker CTA for quick starts
14. **Navigation System** - Forward/back navigation with onscreen buttons and browser nav
15. **Animated Transitions** - Full-screen animations between checkout flow pages
16. **Responsive Design** - Mobile-optimized experience

### Phase 5: Business Operations
17. **SMS Notifications** - Text notifications for new orders with details
18. **Order Analytics** - Reporting and metrics for business operations
19. **Customer Communication** - Automated status updates and notifications

### Target Hardware Integration
- **Bambu Labs X1C** with AMS 2 for 3D printing
- **Bambu Studio** for print file management and execution

### Customer Flow Summary
1. Upload 3D print file via drag-drop or file picker
2. Automated security screening and file analysis
3. Receive cost estimate and material options
4. Provide credit card authorization (guest or account checkout)
5. Print completion and payment with optional tip
6. Order tracking and communication throughout process

### Backend Management Features
- View all print submissions and their files
- Access file analysis results and slicing data
- Easy file retrieval for printing workflow
- Order status management and customer communication
- Business metrics and reporting
- I noticed you fetched Fetch(https://payloadcms.com/docs/upload/overview)
, that's probbaly good if it works ok, but I've uploaded the source code for all of the payload docs in the resources dir. that's maybe easier for you to reference?
- remember that you can check the payload docs in the /resources dir for things related to payload like the req object.