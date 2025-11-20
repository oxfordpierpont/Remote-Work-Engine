import { UserRole, SubscriptionTier } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      tier: SubscriptionTier
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    tier: SubscriptionTier
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    tier: SubscriptionTier
  }
}
