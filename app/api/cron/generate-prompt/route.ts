import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { generatePrompt } from "@/lib/ai";

export async function GET(request: Request) {
	// Verify the request is from Vercel Cron
	const authHeader = request.headers.get("Authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized" },
			{ status: 401 }
		);
	}

	try {
		// Generate prompt for tomorrow
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowDate = tomorrow.toISOString().split("T")[0];

		// Check if a prompt already exists for tomorrow
		const promptRef = doc(db, "prompts", tomorrowDate);
		const promptSnap = await getDoc(promptRef);

		if (promptSnap.exists()) {
			return NextResponse.json({
				success: false,
				message: "A prompt already exists for tomorrow",
			});
		}

		// Generate a new prompt using AI
		const promptText = await generatePrompt();

		// Save the prompt to Firebase
		await setDoc(promptRef, {
			text: promptText,
			date: tomorrowDate,
			createdAt: serverTimestamp(),
			source: "ai",
		});

		return NextResponse.json({
			success: true,
			message: "Prompt generated and saved successfully",
			date: tomorrowDate,
			prompt: promptText,
		});
	} catch (error) {
		console.error("Error in cron job:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to generate prompt",
			},
			{ status: 500 }
		);
	}
}
