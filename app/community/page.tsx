import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllPrompts } from "@/lib/firebase/prompts"
import { formatDate } from "@/lib/utils"
import { CalendarIcon, PenLine } from "lucide-react"

export default async function CommunityPage() {
  const prompts = await getAllPrompts()

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">Browse writing prompts and community entries</p>
        </div>

        <div className="grid gap-6">
          <h2 className="text-2xl font-bold tracking-tight">Recent Prompts</h2>

          {prompts.length > 0 ? (
            prompts.map((prompt) => (
              <Card key={prompt.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{formatDate(new Date(prompt.date))}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      {new Date(prompt.date).toLocaleDateString()}
                    </div>
                  </div>
                  <CardDescription>Daily writing prompt</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{prompt.text}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href={`/community/${prompt.date}`}>View Entries</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/write/${prompt.date}`}>
                      <PenLine className="mr-2 h-4 w-4" />
                      Write Entry
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No prompts available</CardTitle>
                <CardDescription>Check back soon for new writing prompts</CardDescription>
              </CardHeader>
              <CardContent>
                <p>There are currently no prompts available in the community.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">Want to see more prompts and entries?</p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
