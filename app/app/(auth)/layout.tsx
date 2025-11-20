import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-foreground text-primary rounded-lg flex items-center justify-center font-bold text-xl">
              R
            </div>
            <span className="text-2xl font-bold">Remote Work Engine</span>
          </Link>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Find Your Dream Remote Job with AI
          </h1>
          <p className="text-lg opacity-90">
            Join thousands of professionals discovering perfect remote opportunities
            through intelligent matching and automation.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>AI-Powered Job Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>One-Click Applications</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Daily Personalized Reports</span>
            </div>
          </div>
        </div>
        <div className="text-sm opacity-75">
          © 2025 Remote Work Engine. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
