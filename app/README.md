# Remote Work Engine

> An AI-powered platform that revolutionizes remote job discovery and candidate matching

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## 🌟 Overview

Remote Work Engine (RWE) is a comprehensive two-sided marketplace that connects remote job seekers with employers worldwide. Using advanced AI algorithms and machine learning, RWE provides personalized job recommendations, automated application processes, and intelligent candidate matching.

### Key Features

#### For Job Seekers
- **🎯 AI-Powered Job Feed**: Personalized job recommendations based on your skills, preferences, and behavior
- **💫 Tinder-Style Swipe Interface**: Quick and engaging job discovery
- **⚡ Bulk Apply**: Apply to multiple jobs with one click (Premium)
- **🤖 Full Auto-Apply**: AI automatically applies to matching jobs daily (Pro)
- **📊 Daily Job Reports**: Personalized email/SMS alerts with new opportunities
- **🔍 Advanced Search**: Comprehensive filters and AI-enhanced result ranking
- **📱 Progressive Web App**: Install on mobile, works offline
- **💼 Professional Profiles**: Showcase your experience, skills, and portfolio

#### For Employers
- **👥 Candidate Feed**: Browse qualified remote candidates
- **🎨 Company Profiles**: Showcase your company culture and open positions
- **💬 Direct Messaging**: Connect with potential hires
- **📈 AI Recommendations**: Get matched with ideal candidates
- **📝 Job Posting Management**: Easy-to-use interface for creating and managing listings

## 🚀 Technology Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe
- **Email**: SendGrid
- **SMS**: Twilio
- **AI/ML**: OpenAI GPT-4, Anthropic Claude
- **File Storage**: AWS S3
- **Job Aggregation**: Indeed API, RemoteOK, custom scrapers

## 📋 Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn
- (Optional) Docker for containerized development

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Remote-Work-Engine/app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rwe?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Add other required variables (see .env.example)
```

### 4. Set Up the Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
app/
├── (auth)/              # Authentication pages
├── (onboarding)/        # User onboarding flow
├── (dashboard)/         # Main application dashboard
├── (employer)/          # Employer-specific pages
├── api/                 # API routes
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── job/            # Job-related components
│   └── profile/        # Profile components
├── lib/                 # Utility functions and helpers
│   ├── ai/             # AI/ML algorithms
│   ├── email/          # Email services
│   └── db/             # Database utilities
├── prisma/
│   └── schema.prisma   # Database schema
└── public/             # Static assets
```

## 🗄️ Database Schema

The application uses a comprehensive Prisma schema with the following main models:

- **User**: Base user accounts with authentication
- **UserProfile**: Detailed job seeker profiles
- **EmployerProfile**: Company profiles
- **JobListing**: Job postings (internal and aggregated)
- **SavedJob**: User interactions (likes, dislikes, saves)
- **Application**: Application tracking
- **UserKeyword**: AI preference learning
- **ReportSubscription**: Daily/weekly job alerts

See `prisma/schema.prisma` for the complete schema and `PROJECT_ARCHITECTURE.md` for detailed documentation.

## 🎨 UI Components

We use [shadcn/ui](https://ui.shadcn.com) for our component library. Components are built with Radix UI and styled with Tailwind CSS.

### Adding New Components

```bash
npx shadcn@latest add [component-name]
```

### Example: Job Card Component

```tsx
import { JobCard } from "@/components/job/JobCard"

<JobCard
  job={jobData}
  onLike={(jobId) => console.log("Liked:", jobId)}
  onApply={(jobId) => console.log("Applied:", jobId)}
/>
```

## 🔐 Authentication

Authentication is handled by NextAuth.js v5 with support for:

- Email/Password
- Google OAuth
- GitHub OAuth
- LinkedIn OAuth

```typescript
// Protect API routes
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  // Your protected logic here
}
```

## 🤖 AI/ML Features

### Recommendation Engine

The recommendation system uses a hybrid approach:

1. **Content-Based Filtering**: Matches job attributes with user profiles
2. **Preference Learning**: Adapts based on likes/dislikes
3. **Collaborative Filtering**: "Users like you also liked..."

```typescript
import { recommendJobs } from "@/lib/ai/recommend"

const recommendations = await recommendJobs(userId, {
  limit: 20,
  includeApplied: false,
})
```

### Job Matching Score

Jobs are scored based on:
- Keyword matches (+5 points)
- Skill overlap (+2 per skill)
- Industry match (+3 points)
- Experience level alignment (+2 points)
- Job freshness (+2 points for < 24h)

See `lib/ai/recommend.ts` for implementation details.

## 📧 Email & SMS

### Sending Emails

```typescript
import { sendEmail } from "@/lib/email/sendgrid"

await sendEmail({
  to: user.email,
  template: "daily-report",
  data: {
    jobs: recommendedJobs,
    userName: user.name,
  },
})
```

### Sending SMS

```typescript
import { sendSMS } from "@/lib/sms/twilio"

await sendSMS({
  to: user.phone,
  message: "You have 5 new job matches! Check your email for details.",
})
```

## 💳 Payment Integration

Stripe is used for subscription management:

```typescript
import { createCheckoutSession } from "@/lib/payments/stripe"

const session = await createCheckoutSession({
  userId: user.id,
  tier: "PREMIUM",
  successUrl: `${process.env.APP_URL}/dashboard`,
  cancelUrl: `${process.env.APP_URL}/pricing`,
})
```

## 📱 Progressive Web App

The application is a full PWA with:
- Offline support
- Install prompts
- Push notifications
- Background sync

### Manifest

See `public/manifest.json` for PWA configuration.

### Service Worker

The service worker caches:
- Static assets
- API responses
- User profile data

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=your-repo-url)

### Docker

```bash
# Build image
docker build -t remote-work-engine .

# Run container
docker run -p 3000:3000 remote-work-engine
```

## 📊 API Documentation

### Jobs

- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/[id]` - Get single job
- `POST /api/jobs` - Create job (employer only)
- `GET /api/jobs/recommend` - Get AI recommendations

### Applications

- `POST /api/applications` - Submit application
- `POST /api/applications/bulk` - Bulk apply (premium)
- `GET /api/applications` - List user's applications

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/[username]` - Get public profile

See `PROJECT_ARCHITECTURE.md` for complete API documentation.

## 🎯 Roadmap

### Q1 2026 (MVP)
- [x] Core infrastructure setup
- [x] Database schema
- [x] Basic UI components
- [ ] User authentication
- [ ] Onboarding flow
- [ ] Keyword cloud
- [ ] Job feed
- [ ] Basic search
- [ ] Daily reports

### Q2 2026
- [ ] Premium features
- [ ] Bulk apply
- [ ] Employer dashboard
- [ ] Payment integration
- [ ] Advanced AI personalization

### Q3 2026
- [ ] Full auto-apply
- [ ] Video interviews
- [ ] Team features
- [ ] Mobile app (React Native)

### Q4 2026
- [ ] AI follow-up assistant
- [ ] Calendar integration
- [ ] API marketplace
- [ ] White-label solution

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/remote-work-engine/issues)
- **Email**: support@remoteworkengine.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Prisma](https://prisma.io) - Database ORM
- [Vercel](https://vercel.com) - Deployment platform

---

**Built with ❤️ for the remote work community**
