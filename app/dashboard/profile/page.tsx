"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { getUserProfile, updateUserProfile } from "@/lib/firebase/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import { storage } from "@/lib/firebase/config"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function ProfileEditPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    photoURL: "",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        setLoading(true)
        const userProfile = await getUserProfile(user.uid)

        if (userProfile) {
          setProfile({
            displayName: userProfile.displayName || "",
            bio: userProfile.bio || "",
            location: userProfile.location || "",
            website: userProfile.website || "",
            photoURL: userProfile.photoURL || "",
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingImage(true)

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`)

      // Upload the file
      await uploadBytes(storageRef, file)

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef)

      // Update the profile state
      setProfile((prev) => ({ ...prev, photoURL: downloadURL }))

      toast({
        title: "Image uploaded",
        description: "Your profile image has been updated",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      await updateUserProfile(user.uid, profile)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-muted-foreground">Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details and public information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.photoURL || ""} alt={profile.displayName} />
                  <AvatarFallback className="text-2xl">
                    {profile.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex items-center gap-2">
                  <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("picture")?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Change Picture
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
