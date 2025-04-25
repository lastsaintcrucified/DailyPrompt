import { db } from "@/lib/firebase/config"
import { collection, doc, getDoc, getDocs, query, orderBy, limit } from "firebase/firestore"

export type Prompt = {
  id: string
  text: string
  date: string
  createdAt: Date
  source?: "ai" | "manual"
}

export async function getCurrentPrompt(): Promise<Prompt | null> {
  try {
    const today = new Date()
    const dateString = today.toISOString().split("T")[0]

    const promptRef = doc(db, "prompts", dateString)
    const promptSnap = await getDoc(promptRef)

    if (promptSnap.exists()) {
      const data = promptSnap.data()
      return {
        id: promptSnap.id,
        text: data.text,
        date: data.date,
        createdAt: data.createdAt.toDate(),
        source: data.source || "manual",
      }
    } else {
      // If no prompt exists for today, get the most recent one
      const promptsRef = collection(db, "prompts")
      const q = query(promptsRef, orderBy("date", "desc"), limit(1))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        return {
          id: doc.id,
          text: data.text,
          date: data.date,
          createdAt: data.createdAt.toDate(),
          source: data.source || "manual",
        }
      }

      return null
    }
  } catch (error) {
    console.error("Error getting current prompt:", error)
    return null
  }
}

export async function getPromptByDate(date: string): Promise<Prompt | null> {
  try {
    const promptRef = doc(db, "prompts", date)
    const promptSnap = await getDoc(promptRef)

    if (promptSnap.exists()) {
      const data = promptSnap.data()
      return {
        id: promptSnap.id,
        text: data.text,
        date: data.date,
        createdAt: data.createdAt.toDate(),
        source: data.source || "manual",
      }
    }

    return null
  } catch (error) {
    console.error("Error getting prompt by date:", error)
    return null
  }
}

export async function getAllPrompts(): Promise<Prompt[]> {
  try {
    const promptsRef = collection(db, "prompts")
    const q = query(promptsRef, orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)

    const prompts: Prompt[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      prompts.push({
        id: doc.id,
        text: data.text,
        date: data.date,
        createdAt: data.createdAt.toDate(),
        source: data.source || "manual",
      })
    })

    return prompts
  } catch (error) {
    console.error("Error getting all prompts:", error)
    return []
  }
}

export async function getRecentPrompts(count = 7): Promise<Prompt[]> {
  try {
    const promptsRef = collection(db, "prompts")
    const q = query(promptsRef, orderBy("date", "desc"), limit(count))
    const querySnapshot = await getDocs(q)

    const prompts: Prompt[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      prompts.push({
        id: doc.id,
        text: data.text,
        date: data.date,
        createdAt: data.createdAt.toDate(),
        source: data.source || "manual",
      })
    })

    return prompts
  } catch (error) {
    console.error("Error getting recent prompts:", error)
    return []
  }
}
