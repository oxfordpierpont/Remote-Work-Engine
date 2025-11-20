# Remote Work Engine - Project Architecture

## Overview
This document outlines the comprehensive architecture for the Remote Work Engine (RWE) platform, an AI-powered remote job and candidate discovery platform as specified in the Project Requirements Document.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **State Management**: React Context + Zustand (for complex state)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **PWA**: next-pwa

### Backend
- **API**: Next.js API Routes (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **File Upload**: AWS S3 / DigitalOcean Spaces
- **Email**: SendGrid
- **SMS**: Twilio
- **Payments**: Stripe
- **Cron Jobs**: Node-cron / Vercel Cron

### AI/ML
- **LLM API**: OpenAI GPT-4 / Anthropic Claude
- **Vector Database**: Pinecone / Weaviate (for job matching)
- **Resume Parsing**: Affinda / Sovren API
- **Recommendation Engine**: Custom algorithm + collaborative filtering

### Job Aggregation
- **APIs**: Indeed, RemoteOK, We Work Remotely, LinkedIn
- **Web Scraping**: Puppeteer (for sites without APIs)

## Database Schema

### Core Models
See `prisma/schema.prisma` for complete schema. Key models include:

1. **User Management**
   - User (base user account)
   - Account (OAuth accounts)
   - Session (auth sessions)
   - UserProfile (job seeker profiles)
   - EmployerProfile (employer profiles)

2. **Job Listings**
   - JobListing (all jobs, internal and external)
   - SavedJob (user interactions: likes, dislikes, saves)
   - Application (application tracking)

3. **Preferences & Learning**
   - UserKeyword (keyword cloud preferences)
   - UserPreference (user settings)
   - SavedSearch (saved search queries)
   - ReportSubscription (daily/weekly alerts)

4. **Communication**
   - Message (in-platform messaging)
   - Notification (system notifications)

5. **Analytics**
   - UserActivity (tracking for recommendations)

## Application Structure

```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   ├── verify-email/
│   └── forgot-password/
├── (onboarding)/
│   ├── welcome/
│   ├── profile/
│   │   ├── basic/
│   │   ├── experience/
│   │   ├── preferences/
│   │   └── complete/
│   └── keyword-cloud/
├── (dashboard)/
│   ├── feed/              # AI-powered job feed
│   ├── swipe/             # Tinder-style swipe interface
│   ├── search/            # Advanced search
│   ├── saved/             # Saved jobs (premium)
│   ├── applications/      # Application tracker
│   ├── reports/           # Daily reports (in-app)
│   └── profile/
│       ├── edit/
│       └── [username]/    # Public profile view
├── (employer)/
│   ├── dashboard/
│   ├── candidates/        # Candidate feed
│   ├── jobs/
│   │   ├── new/
│   │   ├── edit/[id]/
│   │   └── [id]/
│   └── messages/
├── (marketing)/
│   ├── page.tsx           # Homepage
│   ├── about/
│   ├── pricing/
│   └── how-it-works/
├── api/
│   ├── auth/[...nextauth]/
│   ├── jobs/
│   │   ├── route.ts       # GET /api/jobs (list with filters)
│   │   ├── [id]/route.ts  # GET /api/jobs/[id]
│   │   ├── recommend/route.ts # GET /api/jobs/recommend
│   │   └── aggregate/route.ts # Background job aggregation
│   ├── applications/
│   │   ├── route.ts       # POST /api/applications
│   │   ├── bulk/route.ts  # POST /api/applications/bulk
│   │   └── auto/route.ts  # Auto-apply cron job
│   ├── profile/
│   ├── search/
│   ├── keywords/
│   ├── reports/
│   │   └── send/route.ts  # Cron job for daily reports
│   ├── stripe/
│   │   ├── create-checkout/
│   │   └── webhook/
│   └── admin/
├── components/
│   ├── ui/                # shadcn components
│   ├── job/
│   │   ├── JobCard.tsx
│   │   ├── JobFeed.tsx
│   │   ├── SwipeCard.tsx
│   │   └── JobFilters.tsx
│   ├── profile/
│   │   ├── ProfileForm.tsx
│   │   ├── ExperienceSection.tsx
│   │   └── SkillsSection.tsx
│   ├── onboarding/
│   │   ├── OnboardingWizard.tsx
│   │   ├── KeywordCloud.tsx
│   │   └── ProgressBar.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── auth.ts            # NextAuth configuration
│   ├── ai/
│   │   ├── recommend.ts   # Recommendation engine
│   │   ├── match-score.ts # Job matching algorithm
│   │   └── parser.ts      # Resume/job description parsing
│   ├── email/
│   │   ├── sendgrid.ts
│   │   └── templates/
│   ├── sms/
│   │   └── twilio.ts
│   ├── payments/
│   │   └── stripe.ts
│   ├── storage/
│   │   └── s3.ts
│   ├── jobs/
│   │   ├── aggregator.ts  # Job aggregation from APIs
│   │   └── scraper.ts     # Web scraping
│   └── utils.ts
└── public/
    ├── manifest.json      # PWA manifest
    ├── sw.js              # Service worker
    └── icons/
```

## Key Features Implementation

### 1. User Onboarding
**Files**: `app/(onboarding)/`, `components/onboarding/`
- Multi-step wizard using React Hook Form
- Progress indicator
- Form validation with Zod
- Auto-save functionality
- Profile picture upload to S3

### 2. Keyword Cloud
**Files**: `app/(onboarding)/keyword-cloud/`, `components/onboarding/KeywordCloud.tsx`
- Interactive tag selection
- Categorized keywords (titles, companies, skills, industries)
- Like/dislike toggle
- Manual keyword addition
- Stores preferences in UserKeyword model

### 3. AI-Powered Job Feed
**Files**: `app/(dashboard)/feed/`, `components/job/JobFeed.tsx`
- Infinite scroll with React Intersection Observer
- Job cards with actions (like, dislike, save, apply, share)
- Real-time recommendation updates
- Personalized sorting based on user preferences
- Feedback loop to AI system

**Algorithm** (`lib/ai/recommend.ts`):
```typescript
function recommendJobs(userId: string): Promise<Job[]> {
  // 1. Fetch user profile and preferences
  // 2. Get all active jobs
  // 3. Filter by must-haves (salary, location, etc.)
  // 4. Score each job based on:
  //    - Keyword matches (liked keywords = +5, disliked = skip)
  //    - Skill matches (+2 per skill)
  //    - Industry/company matches (+3)
  //    - Experience level match (+2)
  //    - Freshness (+2 for jobs < 24h old)
  // 5. Sort by score descending
  // 6. Return top N results
}
```

### 4. Swipe Interface
**Files**: `app/(dashboard)/swipe/`, `components/job/SwipeCard.tsx`
- Framer Motion for drag animations
- Swipe gestures: left (dislike), right (like), up (details)
- Double-tap to save
- Card stack UI similar to Tinder
- Syncs with job feed data

### 5. Advanced Search
**Files**: `app/(dashboard)/search/`, `components/job/JobFilters.tsx`
- Comprehensive filters (location, salary, type, level, etc.)
- AI-enhanced results ranking
- Save search functionality (premium)
- External API aggregation (Indeed, RemoteOK)
- Debounced search input

### 6. Daily Job Reports
**Files**: `api/reports/send/route.ts`, `lib/email/templates/daily-report.tsx`
- Cron job runs daily at user's preferred time
- Generates personalized job matches
- Email with HTML template (React Email)
- SMS option via Twilio
- In-app report view for premium users
- Custom report feeds (up to 3 for premium)

### 7. Application Automation

#### Bulk Apply (Premium)
**Files**: `api/applications/bulk/route.ts`
- Applies to all saved jobs in one action
- Shows progress UI
- Handles different application types:
  - Internal jobs: Direct DB insert
  - Integrated ATS (Greenhouse, Lever): API calls
  - External sites: Opens pre-filled tabs (semi-automated)

#### Full Auto-Apply (Pro)
**Files**: `api/applications/auto/route.ts`
- Cron job runs daily
- Identifies new matching jobs
- Automatically applies using user's profile
- Sends daily summary email
- Respects application limits (configurable)

### 8. User Profiles
**Files**: `app/(dashboard)/profile/`, `components/profile/`
- Public-facing profile (shareable link)
- Privacy controls (show/hide fields)
- Work experience, education, skills, certifications
- Video introduction embed
- Portfolio links
- "Open to work" toggle
- Download resume option

### 9. Employer Features
**Files**: `app/(employer)/`, `components/employer/`
- Company profile creation
- Job posting interface
- Candidate feed (reverse of job feed)
- Search and filter candidates
- Messaging system
- Interview scheduling integration
- Premium: AI candidate recommendations

### 10. PWA Implementation
**Files**: `public/manifest.json`, `public/sw.js`
- Installable on mobile devices
- Offline support with service worker
- Cached job listings
- Push notifications for:
  - New job matches
  - Employer messages
  - Application status updates
- Background sync for offline actions

### 11. Payment Integration
**Files**: `api/stripe/`, `lib/payments/stripe.ts`
- Stripe Checkout for subscriptions
- Three tiers: Free, Premium ($X/month), Pro ($XX/month)
- Add-on purchases (AI Follow-up Assistant, etc.)
- Webhook handling for subscription events
- Upgrade/downgrade flow
- Trial periods

### 12. Email & SMS
**Files**: `lib/email/`, `lib/sms/`
- SendGrid for transactional emails:
  - Welcome email
  - Email verification
  - Daily job reports
  - Application confirmations
  - Employer contact notifications
- Twilio for SMS:
  - Job alerts
  - Interview reminders
  - 2FA codes

## AI/ML Components

### Recommendation Engine
**Location**: `lib/ai/recommend.ts`

The recommendation system uses a hybrid approach:

1. **Content-Based Filtering**
   - Matches job attributes with user profile
   - Keyword matching (positive/negative)
   - Skill overlap scoring

2. **Collaborative Filtering** (Phase 2)
   - "Users similar to you also liked..."
   - Requires sufficient user interaction data

3. **Learning Loop**
   - Tracks all user interactions (likes, dislikes, saves, applies)
   - Updates user preference weights
   - Adds implicit negative keywords from dislikes
   - Boosts categories with high engagement

### Job Matching Score Algorithm
```
score = 0

// Must-have filters (hard constraints)
if salary < user.minSalary: return 0
if location not in user.allowedLocations: return 0

// Keyword matching
for keyword in user.likedKeywords:
  if keyword in job.title or keyword in job.description:
    score += 5

for keyword in user.dislikedKeywords:
  if keyword in job.title or keyword in job.description:
    return 0  // Auto-reject

// Skill matching
for skill in user.skills:
  if skill in job.requiredSkills:
    score += 2

// Industry/company match
if job.industry in user.targetIndustries:
  score += 3

if job.companyName in user.likedCompanies:
  score += 4

// Experience level alignment
if job.experienceLevel == user.experienceLevel:
  score += 2

// Freshness bonus
daysSincePosted = (now - job.postedDate).days
if daysSincePosted < 1:
  score += 2

// Popularity (Phase 2)
if job.likes / job.views > 0.3:
  score += 1

return score
```

### Resume Parsing
**Location**: `lib/ai/parser.ts`
- Uses Affinda or Sovren API
- Extracts: work history, education, skills, certifications
- Auto-populates profile during onboarding
- Fallback: GPT-4 API for custom parsing

## Security Considerations

1. **Authentication**
   - NextAuth.js with secure session handling
   - Password hashing with bcrypt
   - OAuth 2.0 for social logins
   - Email verification required
   - Optional 2FA

2. **Authorization**
   - Role-based access control (Job Seeker, Employer, Admin)
   - Tier-based feature gates (Free, Premium, Pro)
   - API route protection with middleware

3. **Data Protection**
   - Encrypted sensitive data (salary, personal info)
   - HTTPS only in production
   - CSRF protection
   - Rate limiting on API routes
   - SQL injection prevention via Prisma ORM
   - XSS protection (sanitize user input)

4. **Privacy**
   - GDPR compliance
   - User data export functionality
   - Account deletion with data purge
   - Privacy controls on profiles
   - Anonymous browsing option

5. **Payment Security**
   - Stripe handles payment data (PCI compliant)
   - Webhook signature verification
   - No credit card data stored locally

## Performance Optimization

1. **Frontend**
   - Code splitting with Next.js dynamic imports
   - Image optimization with next/image
   - Lazy loading for job cards
   - Virtual scrolling for large lists (react-window)
   - Debounced search inputs
   - Optimistic UI updates

2. **Backend**
   - Database indexing on frequently queried fields
   - Redis caching for:
     - User sessions
     - Job recommendations
     - Search results
   - Pagination on all list endpoints
   - Background jobs for heavy tasks (job aggregation, reports)
   - CDN for static assets

3. **Database**
   - Connection pooling (Prisma)
   - Read replicas for heavy read operations
   - Archiving old jobs (soft delete)
   - Materialized views for analytics

## Deployment

### Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Production (Vercel)
```bash
# Automatic deployment from git push
# Environment variables set in Vercel dashboard
# PostgreSQL via Vercel Postgres or external service
# Redis via Upstash
# Cron jobs via Vercel Cron
```

### Alternative (Self-Hosted)
- Docker containers for app + PostgreSQL + Redis
- Nginx reverse proxy
- PM2 for Node.js process management
- SSL via Let's Encrypt

## Testing Strategy

1. **Unit Tests** (Jest + React Testing Library)
   - Component tests
   - Utility function tests
   - API route tests

2. **Integration Tests**
   - User flows (onboarding, job application)
   - API endpoint tests
   - Database interactions

3. **E2E Tests** (Playwright)
   - Critical user journeys
   - Payment flows
   - Mobile responsiveness

4. **Load Testing**
   - API endpoint performance
   - Recommendation engine speed
   - Concurrent user handling

## Monitoring & Analytics

1. **Error Tracking**: Sentry
2. **Performance**: Vercel Analytics
3. **User Analytics**: PostHog / Mixpanel
4. **Uptime**: UptimeRobot
5. **Database**: Prisma Studio for DB inspection

## Future Enhancements (Roadmap)

### Q2 Features
- Premium tiers fully implemented
- Bulk Apply with ATS integrations
- Advanced AI personalization
- Mobile app (React Native)

### Q3 Features
- Full Auto-Apply system
- Employer portal enhancements
- Video interview integration
- Team collaboration features for employers

### Q4 Features
- AI Follow-up & Interview Assistant
- Calendar integration (Google, Outlook)
- API marketplace for third-party integrations
- White-label solution for recruiters

### Phase 2 (Year 2)
- Collaborative filtering in recommendations
- Skills gap analysis
- Salary negotiation insights
- Career path recommendations
- Interview preparation AI coach
- Referral bonus system
- Community features (forums, networking)

## Development Guidelines

1. **Code Style**
   - TypeScript strict mode
   - ESLint + Prettier
   - Conventional commits

2. **Git Workflow**
   - Feature branches
   - Pull request reviews
   - CI/CD with GitHub Actions

3. **Documentation**
   - JSDoc for functions
   - README for each major module
   - API documentation with OpenAPI spec

4. **Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support
   - Color contrast ratios

---

## Getting Started (For Developers)

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd app
   npm install
   ```

2. **Set Up Database**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   npx prisma generate
   npx prisma db push
   npx prisma db seed  # Optional: seed with sample data
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Database Studio: npx prisma studio (http://localhost:5555)

## Support

For questions or issues, please refer to:
- Project Requirements Document.md
- This PROJECT_ARCHITECTURE.md
- Individual component README files
- GitHub Issues

---

**Last Updated**: November 2025
**Version**: 1.0
**Author**: Development Team
