"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { generatePrompt } from "@/lib/ai";

export async function generateAndSavePrompt(date: string) {
	try {
		// Check if a prompt already exists for this date
		const promptRef = doc(db, "prompts", date);
		const promptSnap = await getDoc(promptRef);

		if (promptSnap.exists()) {
			return {
				success: false,
				message: "A prompt already exists for this date",
			};
		}

		// Generate a new prompt using AI
		const promptText = await generatePrompt();

		// Save the prompt to Firebase
		await setDoc(promptRef, {
			text: promptText,
			date: date,
			createdAt: serverTimestamp(),
			source: "ai",
		});

		revalidatePath("/");
		revalidatePath("/community");
		revalidatePath(`/community/${date}`);

		return {
			success: true,
			message: "Prompt generated and saved successfully",
			prompt: promptText,
		};
	} catch (error) {
		console.error("Error generating and saving prompt:", error);
		return {
			success: false,
			message: "Failed to generate and save prompt",
		};
	}
}

export async function saveManualPrompt(date: string, text: string) {
	try {
		if (!text.trim()) {
			return { success: false, message: "Prompt text cannot be empty" };
		}

		// Check if a prompt already exists for this date
		const promptRef = doc(db, "prompts", date);
		const promptSnap = await getDoc(promptRef);

		if (promptSnap.exists()) {
			return {
				success: false,
				message: "A prompt already exists for this date",
			};
		}

		// Save the prompt to Firebase
		await setDoc(promptRef, {
			text: text.trim(),
			date: date,
			createdAt: serverTimestamp(),
			source: "manual",
		});

		revalidatePath("/");
		revalidatePath("/community");
		revalidatePath(`/community/${date}`);

		return {
			success: true,
			message: "Prompt saved successfully",
		};
	} catch (error) {
		console.error("Error saving manual prompt:", error);
		return {
			success: false,
			message: "Failed to save prompt",
		};
	}
}
