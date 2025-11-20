"use client"

import { useState } from "react"
import { Heart, X, Bookmark, ExternalLink, Share2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Job {
  id: string
  title: string
  companyName: string
  companyLogo?: string
  location?: string
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP"
  experienceLevel?: "ENTRY" | "MID" | "SENIOR" | "DIRECTOR" | "EXECUTIVE"
  salaryMin?: number
  salaryMax?: number
  currency?: string
  description: string
  postedDate: Date
  tags?: string[]
}

interface JobCardProps {
  job: Job
  onLike?: (jobId: string) => void
  onDislike?: (jobId: string) => void
  onSave?: (jobId: string) => void
  onApply?: (jobId: string) => void
  onShare?: (jobId: string) => void
  variant?: "feed" | "swipe"
}

export function JobCard({
  job,
  onLike,
  onDislike,
  onSave,
  onApply,
  onShare,
  variant = "feed",
}: JobCardProps) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleLike = () => {
    setLiked(true)
    onLike?.(job.id)
  }

  const handleDislike = () => {
    onDislike?.(job.id)
  }

  const handleSave = () => {
    setSaved(!saved)
    onSave?.(job.id)
  }

  const handleApply = () => {
    onApply?.(job.id)
  }

  const handleShare = () => {
    onShare?.(job.id)
  }

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null
    const currency = job.currency || "USD"
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    })

    if (job.salaryMin && job.salaryMax) {
      return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`
    } else if (job.salaryMin) {
      return `From ${formatter.format(job.salaryMin)}`
    } else if (job.salaryMax) {
      return `Up to ${formatter.format(job.salaryMax)}`
    }
  }

  const formatJobType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just posted"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    if (diffInDays < 7) return `${diffInDays} days ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks === 1) return "1 week ago"
    return `${diffInWeeks} weeks ago`
  }

  return (
    <Card className={cn("w-full transition-all hover:shadow-lg", variant === "swipe" && "max-w-md")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {job.companyName.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight truncate">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.companyName}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {job.location && <span>{job.location}</span>}
                {job.location && <span>•</span>}
                <span>{getTimeAgo(job.postedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
              {formatJobType(job.jobType)}
            </span>
            {job.experienceLevel && (
              <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
                {job.experienceLevel.charAt(0) + job.experienceLevel.slice(1).toLowerCase()} Level
              </span>
            )}
            {formatSalary() && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                {formatSalary()}
              </span>
            )}
          </div>

          {/* Description Preview */}
          <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

          {/* Additional Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 5 && (
                <span className="px-2 py-0.5 text-xs text-muted-foreground">
                  +{job.tags.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 pt-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={cn(liked && "text-green-600 hover:text-green-700")}
            title="Like"
          >
            <Heart className={cn("h-5 w-5", liked && "fill-current")} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDislike} title="Not interested">
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className={cn(saved && "text-blue-600 hover:text-blue-700")}
            title="Save for later"
          >
            <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} title="Share">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        <Button onClick={handleApply} className="ml-auto">
          Apply
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
