import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserProfile } from "@/lib/firebase/users"
import { getUserEntries } from "@/lib/firebase/entries"
import { EntryCard } from "@/components/entry-card"
import { CalendarDays, MapPin, Link2 } from "lucide-react"

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params
  const userProfile = await getUserProfile(userId)

  if (!userProfile) {
    notFound()
  }

  const userEntries = await getUserEntries(userId)

  // Sort entries by date (newest first)
  const sortedEntries = [...userEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // Calculate user stats
  const totalEntries = userEntries.length
  const totalLikes = userEntries.reduce((sum, entry) => sum + entry.likes, 0)

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader className="relative pb-0">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary/20 to-primary/10 rounded-t-lg" />
            <div className="relative flex flex-col sm:flex-row gap-4 sm:items-end pt-16">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={userProfile.photoURL || ""} alt={userProfile.displayName} />
                <AvatarFallback className="text-2xl">
                  {userProfile.displayName?.charAt(0) || userProfile.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <CardTitle className="text-2xl">{userProfile.displayName}</CardTitle>
                <CardDescription>{userProfile.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 md:col-span-2">
                {userProfile.bio && (
                  <div>
                    <h3 className="font-medium mb-2">About</h3>
                    <p className="text-muted-foreground">{userProfile.bio}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {userProfile.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-4 w-4" />
                      {userProfile.location}
                    </div>
                  )}
                  {userProfile.website && (
                    <div className="flex items-center text-sm">
                      <Link2 className="mr-1 h-4 w-4" />
                      <a
                        href={
                          userProfile.website.startsWith("http")
                            ? userProfile.website
                            : `https://${userProfile.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {userProfile.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  {userProfile.joinedAt && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="mr-1 h-4 w-4" />
                      Joined {new Date(userProfile.joinedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium mb-4">Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{totalEntries}</p>
                    <p className="text-sm text-muted-foreground">Entries</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalLikes}</p>
                    <p className="text-sm text-muted-foreground">Likes</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="entries" className="w-full">
          <TabsList>
            <TabsTrigger value="entries">Entries</TabsTrigger>
          </TabsList>
          <TabsContent value="entries" className="space-y-4 mt-4">
            {sortedEntries.length > 0 ? (
              sortedEntries.map((entry) => <EntryCard key={entry.id} entry={entry} />)
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No entries yet</CardTitle>
                  <CardDescription>This user hasn&apos;t published any entries yet.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
