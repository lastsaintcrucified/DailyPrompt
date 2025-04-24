import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPopularEntries } from "@/lib/firebase/entries"
import { EntryCard } from "@/components/entry-card"

export default async function PopularPage() {
  const popularEntries = await getPopularEntries()

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Popular Entries</h1>
          <p className="text-muted-foreground">The most liked entries from the community</p>
        </div>

        <div className="space-y-4">
          {popularEntries.length > 0 ? (
            popularEntries.map((entry) => <EntryCard key={entry.id} entry={entry} />)
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No popular entries yet</CardTitle>
                <CardDescription>Be the first to write and get likes!</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/">Write an entry</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
