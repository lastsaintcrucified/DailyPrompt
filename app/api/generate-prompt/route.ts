import { NextResponse } from "next/server";
import { generatePrompt } from "@/lib/ai";

export async function GET() {
	try {
		const prompt = await generatePrompt();
		return NextResponse.json({ success: true, prompt });
	} catch (error) {
		console.error("Error generating prompt:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to generate prompt" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const { date } = await request.json();

		if (!date) {
			return NextResponse.json(
				{ success: false, message: "Date is required" },
				{ status: 400 }
			);
		}

		const prompt = await generatePrompt();
		return NextResponse.json({ success: true, prompt, date });
	} catch (error) {
		console.error("Error generating prompt:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to generate prompt" },
			{ status: 500 }
		);
	}
}
