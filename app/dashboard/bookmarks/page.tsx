"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-provider";
import { Entry, getUserBookmarkedEntries } from "@/lib/firebase/entries";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EntryCard } from "@/components/entry-card";
import { Loader2, BookmarkIcon } from "lucide-react";

export default function BookmarksPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [bookmarks, setBookmarks] = useState<Entry[]>([]);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		}
	}, [user, authLoading, router]);

	useEffect(() => {
		async function loadBookmarks() {
			if (!user) return;

			try {
				setLoading(true);
				const bookmarkedEntries = await getUserBookmarkedEntries(user.uid);
				setBookmarks(bookmarkedEntries);
			} catch (error) {
				console.error("Error loading bookmarks:", error);
			} finally {
				setLoading(false);
			}
		}

		if (user) {
			loadBookmarks();
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
					<h1 className='text-3xl font-bold tracking-tight'>Bookmarks</h1>
					<p className='text-muted-foreground'>
						Entries you have saved for later
					</p>
				</div>

				<div className='space-y-4'>
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
				</div>
			</div>
		</div>
	);
}
