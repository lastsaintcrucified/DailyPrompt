// Using Hugging Face Inference API with authentication
export async function generatePrompt(): Promise<string> {
	try {
		// Check if the API token is available
		if (!process.env.HUGGINGFACE_API_TOKEN) {
			throw new Error(
				"HUGGINGFACE_API_TOKEN is not set in environment variables"
			);
		}

		const response = await fetch(
			"https://api-inference.huggingface.co/models/google/flan-t5-large",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
				},
				body: JSON.stringify({
					inputs:
						"Generate a creative writing prompt that is thought-provoking and unique. The prompt should be 1-2 sentences long.",
					parameters: {
						max_length: 100,
						temperature: 0.7,
						top_p: 0.95,
					},
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`API request failed with status ${response.status}`);
		}

		const result = await response.json();
		// The result is typically an array with the generated text
		const promptText = Array.isArray(result)
			? result[0].generated_text
			: result.generated_text;

		return promptText.trim();
	} catch (error) {
		console.error("Error generating prompt with AI:", error);
		throw new Error("Failed to generate prompt");
	}
}
