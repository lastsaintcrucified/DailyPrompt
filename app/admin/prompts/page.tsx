"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Calendar, Sparkles } from "lucide-react";
import {
	generateAndSavePrompt,
	saveManualPrompt,
} from "@/app/actions/prompt-actions";
import { getAllPrompts } from "@/lib/firebase/prompts";
import { formatDate } from "@/lib/utils";

// List of admin UIDs who can access this page
const ADMIN_UIDS = ["5yNtbJQkwUQgWedRFnvt2e8ctUB3"]; // Replace with actual admin UIDs

export default function AdminPromptsPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [saving, setSaving] = useState(false);
	const [date, setDate] = useState("");
	const [manualPrompt, setManualPrompt] = useState("");
	interface Prompt {
		id: string;
		date: string;
		text: string;
		source: string;
	}

	const [prompts, setPrompts] = useState<Prompt[]>([]);
	const [generatedPrompt, setGeneratedPrompt] = useState("");

	useEffect(() => {
		// Set default date to tomorrow
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		setDate(tomorrow.toISOString().split("T")[0]);

		// Check if user is admin
		if (!authLoading) {
			if (!user) {
				router.push("/login");
				return;
			}

			if (!ADMIN_UIDS.includes(user.uid)) {
				toast({
					title: "Access denied",
					description: "You don't have permission to access this page",
					variant: "destructive",
				});
				router.push("/");
				return;
			}

			// Load existing prompts
			loadPrompts();
		}
	}, [user, authLoading, router, toast]);

	const loadPrompts = async () => {
		try {
			setLoading(true);
			const allPrompts = await getAllPrompts();
			setPrompts(
				allPrompts.map((prompt) => ({
					...prompt,
					source: prompt.source || "unknown", // Provide a default value for source
				}))
			);
		} catch (error) {
			console.error("Error loading prompts:", error);
			toast({
				title: "Error",
				description: "Failed to load prompts",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleGeneratePrompt = async () => {
		if (!date) {
			toast({
				title: "Date required",
				description: "Please select a date for the prompt",
				variant: "destructive",
			});
			return;
		}

		setGenerating(true);
		try {
			const result = await generateAndSavePrompt(date);

			if (result.success) {
				toast({
					title: "Success",
					description: result.message,
				});
				setGeneratedPrompt(result.prompt || "");
				loadPrompts();
			} else {
				toast({
					title: "Error",
					description: result.message,
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error generating prompt:", error);
			toast({
				title: "Error",
				description: "Failed to generate prompt",
				variant: "destructive",
			});
		} finally {
			setGenerating(false);
		}
	};

	const handleSaveManualPrompt = async () => {
		if (!date) {
			toast({
				title: "Date required",
				description: "Please select a date for the prompt",
				variant: "destructive",
			});
			return;
		}

		if (!manualPrompt.trim()) {
			toast({
				title: "Prompt required",
				description: "Please enter a prompt",
				variant: "destructive",
			});
			return;
		}

		setSaving(true);
		try {
			const result = await saveManualPrompt(date, manualPrompt);

			if (result.success) {
				toast({
					title: "Success",
					description: result.message,
				});
				setManualPrompt("");
				loadPrompts();
			} else {
				toast({
					title: "Error",
					description: result.message,
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error saving prompt:", error);
			toast({
				title: "Error",
				description: "Failed to save prompt",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	if (authLoading || loading) {
		return (
			<div className='container py-10 flex items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	return (
		<div className='container py-10'>
			<div className='max-w-4xl mx-auto space-y-8'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						Prompt Management
					</h1>
					<p className='text-muted-foreground'>
						Generate and manage daily writing prompts
					</p>
				</div>

				<Tabs
					defaultValue='generate'
					className='w-full'
				>
					<TabsList className='grid w-full max-w-md grid-cols-2'>
						<TabsTrigger value='generate'>Generate Prompt</TabsTrigger>
						<TabsTrigger value='manual'>Manual Prompt</TabsTrigger>
					</TabsList>

					<TabsContent
						value='generate'
						className='space-y-4 mt-4'
					>
						<Card>
							<CardHeader>
								<CardTitle>Generate AI Prompt</CardTitle>
								<CardDescription>
									Generate a new prompt using Hugging Face AI (free)
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='prompt-date'>Date</Label>
									<div className='flex items-center gap-2'>
										<Calendar className='h-4 w-4 text-muted-foreground' />
										<Input
											id='prompt-date'
											type='date'
											value={date}
											onChange={(e) => setDate(e.target.value)}
										/>
									</div>
								</div>

								{generatedPrompt && (
									<div className='p-4 bg-muted rounded-md'>
										<p className='font-medium'>Generated Prompt:</p>
										<p className='mt-2 italic'>{generatedPrompt}</p>
									</div>
								)}
							</CardContent>
							<CardFooter>
								<Button
									onClick={handleGeneratePrompt}
									disabled={generating}
								>
									{generating ? (
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									) : (
										<Sparkles className='mr-2 h-4 w-4' />
									)}
									Generate Prompt
								</Button>
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent
						value='manual'
						className='space-y-4 mt-4'
					>
						<Card>
							<CardHeader>
								<CardTitle>Create Manual Prompt</CardTitle>
								<CardDescription>Create a prompt manually</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='manual-prompt-date'>Date</Label>
									<div className='flex items-center gap-2'>
										<Calendar className='h-4 w-4 text-muted-foreground' />
										<Input
											id='manual-prompt-date'
											type='date'
											value={date}
											onChange={(e) => setDate(e.target.value)}
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='manual-prompt-text'>Prompt</Label>
									<Textarea
										id='manual-prompt-text'
										placeholder='Enter your writing prompt here...'
										value={manualPrompt}
										onChange={(e) => setManualPrompt(e.target.value)}
										rows={4}
									/>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									onClick={handleSaveManualPrompt}
									disabled={saving}
								>
									{saving ? (
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									) : null}
									Save Prompt
								</Button>
							</CardFooter>
						</Card>
					</TabsContent>
				</Tabs>

				<div className='space-y-4'>
					<h2 className='text-2xl font-bold tracking-tight'>
						Existing Prompts
					</h2>

					{prompts.length > 0 ? (
						prompts.map((prompt) => (
							<Card key={prompt.id}>
								<CardHeader>
									<CardTitle>{formatDate(new Date(prompt.date))}</CardTitle>
									<CardDescription>
										Source: {prompt.source === "ai" ? "AI Generated" : "Manual"}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className='italic'>{prompt.text}</p>
								</CardContent>
							</Card>
						))
					) : (
						<Card>
							<CardContent className='py-8 text-center'>
								<p className='text-muted-foreground'>No prompts found</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
