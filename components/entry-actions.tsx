"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { type Entry, toggleLike, toggleBookmark } from "@/lib/firebase/entries"
import { Heart, MessageSquare, Bookmark, Share2 } from "lucide-react"

interface EntryActionsProps {
  entry: Entry
}

export function EntryActions({ entry }: EntryActionsProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(entry.likes)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkCount, setBookmarkCount] = useState(entry.bookmarks)

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like entries",
      })
      router.push("/login")
      return
    }

    try {
      const isLiked = await toggleLike(entry.id, user.uid)
      setLiked(isLiked)
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1))
    } catch (error) {
      console.error("Error liking entry:", error)
      toast({
        title: "Error",
        description: "Failed to like entry",
        variant: "destructive",
      })
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark entries",
      })
      router.push("/login")
      return
    }

    try {
      const isBookmarked = await toggleBookmark(entry.id, user.uid)
      setBookmarked(isBookmarked)
      setBookmarkCount((prev) => (isBookmarked ? prev + 1 : prev - 1))
    } catch (error) {
      console.error("Error bookmarking entry:", error)
      toast({
        title: "Error",
        description: "Failed to bookmark entry",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: entry.title,
          text: `Check out this entry: ${entry.title}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied",
          description: "Entry link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <div className="flex items-center gap-4 w-full">
      <Button variant="ghost" size="sm" className="gap-1" onClick={handleLike}>
        <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
        <span>{likeCount}</span>
      </Button>
      <Button variant="ghost" size="sm" className="gap-1">
        <MessageSquare className="h-4 w-4" />
        <span>{entry.comments}</span>
      </Button>
      <Button variant="ghost" size="sm" className="gap-1" onClick={handleBookmark}>
        <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
        <span>{bookmarkCount}</span>
      </Button>
      <div className="flex-1"></div>
      <Button variant="ghost" size="sm" className="gap-1" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>
    </div>
  )
}
