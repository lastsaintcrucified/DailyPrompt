import { db, auth } from "@/lib/firebase/config"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"

export type UserProfile = {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
  bio?: string
  location?: string
  website?: string
  joinedAt: Date
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const data = userSnap.data()
      return {
        uid: userSnap.id,
        displayName: data.displayName || "",
        email: data.email || "",
        photoURL: data.photoURL || null,
        bio: data.bio || "",
        location: data.location || "",
        website: data.website || "",
        joinedAt: data.createdAt?.toDate() || new Date(),
      }
    }

    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: {
    displayName?: string
    photoURL?: string
    bio?: string
    location?: string
    website?: string
  },
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    // Update Firestore document
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date(),
    })

    // Update Firebase Auth profile if displayName or photoURL is provided
    if (auth.currentUser && (profileData.displayName || profileData.photoURL)) {
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
      })
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

export async function createUserProfile(
  userId: string,
  userData: {
    displayName?: string
    email: string
    photoURL?: string
  },
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    await setDoc(userRef, {
      displayName: userData.displayName || "",
      email: userData.email,
      photoURL: userData.photoURL || null,
      bio: "",
      location: "",
      website: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}
