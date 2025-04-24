import type React from "react"
import { CommunityTabs } from "@/components/community-tabs"

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CommunityTabs />
      {children}
    </div>
  )
}
