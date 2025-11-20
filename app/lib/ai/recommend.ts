import { prisma } from "@/lib/prisma"
import { JobListing, UserProfile, UserKeyword } from "@prisma/client"

interface RecommendationOptions {
  limit?: number
  includeApplied?: boolean
  minScore?: number
}

interface ScoredJob {
  job: JobListing
  score: number
  reasons: string[]
}

/**
 * Generate personalized job recommendations for a user
 * Uses a hybrid content-based filtering approach
 */
export async function recommendJobs(
  userId: string,
  options: RecommendationOptions = {}
): Promise<ScoredJob[]> {
  const { limit = 50, includeApplied = false, minScore = 0 } = options

  // Fetch user profile and preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          skills: true,
        },
      },
      keywords: true,
      savedJobs: true,
      applications: !includeApplied,
    },
  })

  if (!user || !user.profile) {
    throw new Error("User or profile not found")
  }

  // Get all active jobs
  const allJobs = await prisma.jobListing.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      postedDate: "desc",
    },
  })

  // Create sets for faster lookup
  const appliedJobIds = new Set(user.applications?.map((app) => app.jobId) || [])
  const likedKeywords = user.keywords.filter((k) => k.sentiment > 0)
  const dislikedKeywords = user.keywords.filter((k) => k.sentiment < 0)
  const userSkills = user.profile.skills.map((s) => s.name.toLowerCase())

  // Score each job
  const scoredJobs: ScoredJob[] = []

  for (const job of allJobs) {
    // Skip if already applied (unless includeApplied is true)
    if (!includeApplied && appliedJobIds.has(job.id)) {
      continue
    }

    const { score, reasons } = calculateJobScore(job, user.profile, {
      likedKeywords,
      dislikedKeywords,
      userSkills,
    })

    // Skip if score is below threshold or disqualified
    if (score < minScore) {
      continue
    }

    scoredJobs.push({ job, score, reasons })
  }

  // Sort by score descending
  scoredJobs.sort((a, b) => b.score - a.score)

  // Return top N
  return scoredJobs.slice(0, limit)
}

/**
 * Calculate relevance score for a job based on user profile
 */
function calculateJobScore(
  job: JobListing,
  profile: UserProfile,
  context: {
    likedKeywords: UserKeyword[]
    dislikedKeywords: UserKeyword[]
    userSkills: string[]
  }
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  const jobText = `${job.title} ${job.description} ${job.requirements || ""}`.toLowerCase()

  // === HARD FILTERS (Must-haves) ===

  // Salary requirement
  if (profile.minSalary && job.salaryMax && job.salaryMax < profile.minSalary) {
    return { score: -1000, reasons: ["Below minimum salary requirement"] }
  }

  // Check negative keywords (auto-reject)
  for (const keyword of context.dislikedKeywords) {
    if (jobText.includes(keyword.keyword.toLowerCase())) {
      return { score: -1000, reasons: [`Contains disliked keyword: ${keyword.keyword}`] }
    }
  }

  // === SCORING FACTORS ===

  // 1. Positive keyword matches (+5 each)
  for (const keyword of context.likedKeywords) {
    if (jobText.includes(keyword.keyword.toLowerCase())) {
      score += 5
      reasons.push(`Matches liked ${keyword.type.toLowerCase()}: ${keyword.keyword}`)
    }
  }

  // 2. Skill matching (+2 per skill)
  for (const skill of context.userSkills) {
    if (jobText.includes(skill)) {
      score += 2
      reasons.push(`Matches your skill: ${skill}`)
    }
  }

  // 3. Desired job titles (+5)
  if (profile.desiredTitles.length > 0) {
    for (const title of profile.desiredTitles) {
      if (job.title.toLowerCase().includes(title.toLowerCase())) {
        score += 5
        reasons.push(`Matches desired title: ${title}`)
      }
    }
  }

  // 4. Target industries (+3)
  if (profile.targetIndustries.length > 0 && job.industry) {
    for (const industry of profile.targetIndustries) {
      if (job.industry.toLowerCase().includes(industry.toLowerCase())) {
        score += 3
        reasons.push(`Matches target industry: ${industry}`)
      }
    }
  }

  // 5. Employment type match (+2)
  if (profile.employmentTypes.length > 0) {
    if (profile.employmentTypes.includes(job.jobType)) {
      score += 2
      reasons.push(`Matches employment type preference`)
    }
  }

  // 6. Experience level alignment (+2 if match, -1 if mismatch)
  if (job.experienceLevel) {
    // Simplified: assume user's experience is reflected in their years of work history
    // In a real implementation, you'd track this explicitly
    const experienceLevels = ["ENTRY", "MID", "SENIOR", "DIRECTOR", "EXECUTIVE"]
    // For now, consider MID as default for users without explicit level
    const userLevel = "MID" // This should be calculated or stored
    if (job.experienceLevel === userLevel) {
      score += 2
      reasons.push("Experience level matches")
    } else {
      score -= 1
    }
  }

  // 7. Salary in range (+3)
  if (job.salaryMin && job.salaryMax && profile.minSalary && profile.maxSalary) {
    if (job.salaryMin <= profile.maxSalary && job.salaryMax >= profile.minSalary) {
      score += 3
      reasons.push("Salary within your range")
    }
  }

  // 8. Job freshness (+2 for recent jobs)
  const daysSincePosted = Math.floor(
    (new Date().getTime() - job.postedDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSincePosted < 1) {
    score += 2
    reasons.push("Just posted")
  } else if (daysSincePosted < 3) {
    score += 1
    reasons.push("Recently posted")
  }

  // 9. Base score for all jobs
  score += 1

  return { score, reasons }
}

/**
 * Update user preferences based on interaction
 */
export async function updateUserPreferences(
  userId: string,
  jobId: string,
  action: "like" | "dislike" | "save" | "apply"
) {
  const job = await prisma.jobListing.findUnique({
    where: { id: jobId },
  })

  if (!job) return

  // Extract implicit keywords from job
  const keywords: Array<{ keyword: string; type: "TITLE" | "COMPANY" | "INDUSTRY" }> = []

  // Add job title keywords
  const titleWords = job.title.split(" ").filter((word) => word.length > 3)
  titleWords.forEach((word) => {
    keywords.push({ keyword: word, type: "TITLE" })
  })

  // Add company
  keywords.push({ keyword: job.companyName, type: "COMPANY" })

  // Add industry
  if (job.industry) {
    keywords.push({ keyword: job.industry, type: "INDUSTRY" })
  }

  const sentiment = action === "like" || action === "save" || action === "apply" ? 1 : -1

  // Update or create keywords
  for (const { keyword, type } of keywords) {
    await prisma.userKeyword.upsert({
      where: {
        userId_keyword_type: {
          userId,
          keyword,
          type,
        },
      },
      update: {
        sentiment: { increment: sentiment },
      },
      create: {
        userId,
        keyword,
        type,
        sentiment,
      },
    })
  }
}

/**
 * Get similar jobs based on a reference job
 */
export async function getSimilarJobs(jobId: string, limit = 10): Promise<JobListing[]> {
  const referenceJob = await prisma.jobListing.findUnique({
    where: { id: jobId },
  })

  if (!referenceJob) {
    return []
  }

  // Find jobs with similar attributes
  const similarJobs = await prisma.jobListing.findMany({
    where: {
      AND: [
        { id: { not: jobId } },
        { status: "ACTIVE" },
        {
          OR: [
            { companyName: referenceJob.companyName },
            { industry: referenceJob.industry },
            { jobType: referenceJob.jobType },
            { experienceLevel: referenceJob.experienceLevel },
          ],
        },
      ],
    },
    take: limit,
    orderBy: {
      postedDate: "desc",
    },
  })

  return similarJobs
}
