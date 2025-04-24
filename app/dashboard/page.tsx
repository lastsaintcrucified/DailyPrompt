/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { CardFooter } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-provider";
import { getUserEntries, getUserDrafts, Entry } from "@/lib/firebase/entries";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EntryCard } from "@/components/entry-card";
import { Loader2, Edit, BookmarkIcon } from "lucide-react";

export default function DashboardPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [published, setPublished] = useState<Entry[]>([]);
	const [drafts, setDrafts] = useState<Entry[]>([]);
	const [bookmarks, setBookmarks] = useState<Entry[]>([]);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		}
	}, [user, authLoading, router]);

	useEffect(() => {
		async function loadUserContent() {
			if (!user) return;

			try {
				setLoading(true);

				// Load user's published entries
				const entries = await getUserEntries(user.uid);
				setPublished(entries);

				// Load user's drafts
				const draftEntries = await getUserDrafts(user.uid);
				setDrafts(draftEntries);

				// TODO: Load user's bookmarks
				// This would require a separate function to get bookmarked entries
			} catch (error) {
				console.error("Error loading user content:", error);
			} finally {
				setLoading(false);
			}
		}

		if (user) {
			loadUserContent();
		}
	}, [user]);

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
					<h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
					<p className='text-muted-foreground'>
						Manage your entries, drafts, and bookmarks
					</p>
				</div>

				<Tabs
					defaultValue='published'
					className='w-full'
				>
					<TabsList className='grid w-full max-w-md grid-cols-3'>
						<TabsTrigger value='published'>Published</TabsTrigger>
						<TabsTrigger value='drafts'>Drafts</TabsTrigger>
						<TabsTrigger value='bookmarks'>Bookmarks</TabsTrigger>
					</TabsList>

					<TabsContent
						value='published'
						className='space-y-4 mt-4'
					>
						{published.length > 0 ? (
							published.map((entry) => (
								<EntryCard
									key={entry.id}
									entry={entry}
								/>
							))
						) : (
							<Card>
								<CardHeader>
									<CardTitle>No published entries</CardTitle>
									<CardDescription>
										You haven&apos;t published any entries yet.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button asChild>
										<Link href='/'>Write your first entry</Link>
									</Button>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					<TabsContent
						value='drafts'
						className='space-y-4 mt-4'
					>
						{drafts.length > 0 ? (
							drafts.map((draft) => (
								<Card key={draft.id}>
									<CardHeader>
										<CardTitle>{draft.title || "Untitled Draft"}</CardTitle>
										<CardDescription>
											Last updated:{" "}
											{new Date(draft.updatedAt).toLocaleDateString()}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<p className='line-clamp-3'>
											{draft.content || "No content yet"}
										</p>
										{draft.tags.length > 0 && (
											<div className='flex flex-wrap gap-2 mt-4'>
												{draft.tags.map((tag) => (
													<Badge
														key={tag}
														variant='secondary'
													>
														{tag}
													</Badge>
												))}
											</div>
										)}
									</CardContent>
									<CardFooter>
										<Button asChild>
											<Link href={`/write/${draft.promptDate}`}>
												<Edit className='mr-2 h-4 w-4' />
												Continue Writing
											</Link>
										</Button>
									</CardFooter>
								</Card>
							))
						) : (
							<Card>
								<CardHeader>
									<CardTitle>No drafts</CardTitle>
									<CardDescription>
										You don&apos;t have any drafts saved.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button asChild>
										<Link href='/'>Start writing</Link>
									</Button>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					<TabsContent
						value='bookmarks'
						className='space-y-4 mt-4'
					>
						{bookmarks.length > 0 ? (
							bookmarks.map((entry) => (
								<EntryCard
									key={entry.id}
									entry={entry}
								/>
							))
						) : (
							<Card>
								<CardHeader>
									<CardTitle>No bookmarks</CardTitle>
									<CardDescription>
										You haven&apos;t bookmarked any entries yet.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button asChild>
										<Link href='/community'>
											<BookmarkIcon className='mr-2 h-4 w-4' />
											Browse Community
										</Link>
									</Button>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
