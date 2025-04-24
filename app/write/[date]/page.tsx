"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getPromptByDate } from "@/lib/firebase/prompts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function WritePage({
	params,
}: {
	params: Promise<{ date: string }>;
}) {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	const [prompt, setPrompt] = useState("");
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [tags, setTags] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [publishing, setPublishing] = useState(false);
	const [draftId, setDraftId] = useState<string | null>(null);
	const { date } = use(params);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
			toast({
				title: "Authentication required",
				description: "Please sign in to write an entry",
			});
		}
	}, [user, authLoading, router, toast]);

	useEffect(() => {
		async function loadPromptAndDraft() {
			try {
				// Load prompt
				const promptData = await getPromptByDate(date);
				if (promptData) {
					setPrompt(promptData.text);
				}

				// Check for existing draft
				if (user) {
					const draftRef = doc(db, "users", user.uid, "drafts", date);
					const draftSnap = await getDoc(draftRef);

					if (draftSnap.exists()) {
						const data = draftSnap.data();
						setTitle(data.title || "");
						setContent(data.content || "");
						setTags(data.tags?.join(", ") || "");
						setDraftId(draftSnap.id);
					}
				}
			} catch (error) {
				console.error("Error loading prompt or draft:", error);
				toast({
					title: "Error",
					description: "Failed to load prompt or draft",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		}

		if (user) {
			loadPromptAndDraft();
		}
	}, [date, user, toast]);

	const saveDraft = async () => {
		if (!user) return;

		setSaving(true);
		try {
			const draftRef = doc(db, "users", user.uid, "drafts", date);
			await setDoc(
				draftRef,
				{
					title,
					content,
					tags: tags
						.split(",")
						.map((tag) => tag.trim())
						.filter((tag) => tag),
					promptDate: date,
					updatedAt: serverTimestamp(),
				},
				{ merge: true }
			);

			setDraftId(date);
			toast({
				title: "Draft saved",
				description: "Your draft has been saved successfully",
			});
		} catch (error) {
			console.error("Error saving draft:", error);
			toast({
				title: "Error",
				description: "Failed to save draft",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const publishEntry = async () => {
		if (!user) return;

		if (!title.trim()) {
			toast({
				title: "Title required",
				description: "Please add a title for your entry",
				variant: "destructive",
			});
			return;
		}

		if (!content.trim()) {
			toast({
				title: "Content required",
				description: "Please write some content for your entry",
				variant: "destructive",
			});
			return;
		}

		setPublishing(true);
		try {
			// Create entry document
			const entryRef = doc(db, "entries", `${user.uid}_${date}`);
			await setDoc(entryRef, {
				title,
				content,
				tags: tags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag),
				promptDate: date,
				authorId: user.uid,
				authorName: user.displayName || "Anonymous",
				authorPhotoURL: user.photoURL || null,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				likes: 0,
				comments: 0,
				bookmarks: 0,
			});

			// Delete draft if it exists
			if (draftId) {
				const draftRef = doc(db, "users", user.uid, "drafts", draftId);
				await setDoc(draftRef, { published: true }, { merge: true });
			}

			toast({
				title: "Entry published",
				description: "Your entry has been published successfully",
			});

			router.push(`/community/${date}`);
		} catch (error) {
			console.error("Error publishing entry:", error);
			toast({
				title: "Error",
				description: "Failed to publish entry",
				variant: "destructive",
			});
		} finally {
			setPublishing(false);
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
			<div className='max-w-4xl mx-auto space-y-6'>
				<Card>
					<CardHeader>
						<CardTitle>Today&apos;s Prompt</CardTitle>
						<CardDescription>{formatDate(new Date(date))}</CardDescription>
					</CardHeader>
					<CardContent>
						<p className='text-lg'>{prompt}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Write Your Entry</CardTitle>
						<CardDescription>
							Share your thoughts, stories, or reflections based on today&apos;s
							prompt
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Input
								placeholder='Title'
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>
						<div className='space-y-2'>
							<Textarea
								placeholder='Write your entry here...'
								className='min-h-[300px]'
								value={content}
								onChange={(e) => setContent(e.target.value)}
							/>
						</div>
						<div className='space-y-2'>
							<Input
								placeholder='Tags (comma separated)'
								value={tags}
								onChange={(e) => setTags(e.target.value)}
							/>
						</div>
					</CardContent>
					<CardFooter className='flex justify-between'>
						<Button
							variant='outline'
							onClick={saveDraft}
							disabled={saving}
						>
							{saving ? (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							) : (
								<Save className='mr-2 h-4 w-4' />
							)}
							Save Draft
						</Button>
						<Button
							onClick={publishEntry}
							disabled={publishing}
						>
							{publishing ? (
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							) : null}
							Publish Entry
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
