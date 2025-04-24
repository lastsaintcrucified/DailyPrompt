"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function CommunityTabs() {
  const pathname = usePathname()

  const tabs = [
    {
      name: "All Prompts",
      href: "/community",
      active: pathname === "/community",
    },
    {
      name: "Today's Prompt",
      href: `/community/${new Date().toISOString().split("T")[0]}`,
      active: pathname.includes(`/community/${new Date().toISOString().split("T")[0]}`),
    },
    {
      name: "Popular",
      href: "/community/popular",
      active: pathname === "/community/popular",
    },
  ]

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center">
        <nav className="flex space-x-6">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                tab.active ? "border-b-2 border-primary text-foreground" : "text-muted-foreground",
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
