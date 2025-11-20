import { NextRequest, NextResponse } from "next/server"

// This is a demonstration API route for job listings
// In production, this would integrate with Prisma and the recommendation engine

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search")
  const jobType = searchParams.get("jobType")
  const experienceLevel = searchParams.get("experienceLevel")
  const salaryMin = searchParams.get("salaryMin")
  const location = searchParams.get("location")

  // TODO: Implement actual database query with Prisma
  // Example:
  // const jobs = await prisma.jobListing.findMany({
  //   where: {
  //     status: "ACTIVE",
  //     title: search ? { contains: search, mode: "insensitive" } : undefined,
  //     jobType: jobType as JobType,
  //     experienceLevel: experienceLevel as ExperienceLevel,
  //     salaryMin: salaryMin ? { gte: parseInt(salaryMin) } : undefined,
  //     location: location ? { contains: location } : undefined,
  //   },
  //   skip: (page - 1) * limit,
  //   take: limit,
  //   orderBy: { postedDate: "desc" },
  // })

  // Mock data for demonstration
  const mockJobs = [
    {
      id: "1",
      title: "Senior Full-Stack Developer",
      companyName: "TechCorp",
      companyLogo: null,
      location: "Remote - Worldwide",
      jobType: "FULL_TIME",
      experienceLevel: "SENIOR",
      salaryMin: 120000,
      salaryMax: 180000,
      currency: "USD",
      description:
        "We're looking for an experienced full-stack developer to join our remote team. You'll work on cutting-edge projects using React, Node.js, and PostgreSQL.",
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      tags: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS"],
      applyUrl: "https://example.com/apply/1",
      source: "internal",
      status: "ACTIVE",
    },
    {
      id: "2",
      title: "Product Designer",
      companyName: "DesignHub",
      companyLogo: null,
      location: "Remote - US/EU",
      jobType: "FULL_TIME",
      experienceLevel: "MID",
      salaryMin: 80000,
      salaryMax: 120000,
      currency: "USD",
      description:
        "Join our design team to create beautiful and intuitive user experiences. Experience with Figma and design systems required.",
      postedDate: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      tags: ["Figma", "UI/UX", "Design Systems", "Prototyping"],
      applyUrl: "https://example.com/apply/2",
      source: "internal",
      status: "ACTIVE",
    },
    {
      id: "3",
      title: "DevOps Engineer",
      companyName: "CloudScale",
      companyLogo: null,
      location: "Remote - North America",
      jobType: "FULL_TIME",
      experienceLevel: "SENIOR",
      salaryMin: 130000,
      salaryMax: 170000,
      currency: "USD",
      description:
        "Help us build and maintain scalable cloud infrastructure. Kubernetes, Docker, and CI/CD expertise required.",
      postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      tags: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD"],
      applyUrl: "https://example.com/apply/3",
      source: "internal",
      status: "ACTIVE",
    },
    {
      id: "4",
      title: "Content Marketing Manager",
      companyName: "GrowthCo",
      companyLogo: null,
      location: "Remote - Worldwide",
      jobType: "FULL_TIME",
      experienceLevel: "MID",
      salaryMin: 70000,
      salaryMax: 95000,
      currency: "USD",
      description:
        "Lead our content marketing strategy and create compelling content that drives growth. SEO and analytics experience is a plus.",
      postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      tags: ["Content Marketing", "SEO", "Analytics", "Copywriting"],
      applyUrl: "https://example.com/apply/4",
      source: "internal",
      status: "ACTIVE",
    },
    {
      id: "5",
      title: "Data Scientist",
      companyName: "AI Innovations",
      companyLogo: null,
      location: "Remote - US",
      jobType: "FULL_TIME",
      experienceLevel: "SENIOR",
      salaryMin: 140000,
      salaryMax: 190000,
      currency: "USD",
      description:
        "Work on exciting ML projects and help shape our AI-powered products. Python, TensorFlow, and experience with large datasets required.",
      postedDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      tags: ["Python", "Machine Learning", "TensorFlow", "Data Analysis", "SQL"],
      applyUrl: "https://example.com/apply/5",
      source: "internal",
      status: "ACTIVE",
    },
  ]

  // Apply basic filtering to mock data
  let filteredJobs = mockJobs

  if (search) {
    filteredJobs = filteredJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.companyName.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (jobType) {
    filteredJobs = filteredJobs.filter((job) => job.jobType === jobType)
  }

  if (experienceLevel) {
    filteredJobs = filteredJobs.filter((job) => job.experienceLevel === experienceLevel)
  }

  if (salaryMin) {
    const minSalary = parseInt(salaryMin)
    filteredJobs = filteredJobs.filter((job) => job.salaryMin && job.salaryMin >= minSalary)
  }

  if (location) {
    filteredJobs = filteredJobs.filter((job) =>
      job.location?.toLowerCase().includes(location.toLowerCase())
    )
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit)

  return NextResponse.json({
    jobs: paginatedJobs,
    pagination: {
      page,
      limit,
      total: filteredJobs.length,
      totalPages: Math.ceil(filteredJobs.length / limit),
    },
  })
}

// POST endpoint to create new job listing (for employers)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Validate user is an employer
    // TODO: Validate request body with Zod
    // TODO: Create job in database with Prisma

    // Mock response
    return NextResponse.json(
      {
        success: true,
        job: {
          id: "new-job-id",
          ...body,
          postedDate: new Date(),
          status: "ACTIVE",
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to create job listing" }, { status: 500 })
  }
}
