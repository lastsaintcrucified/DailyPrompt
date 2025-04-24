"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-provider";
import { useRouter } from "next/navigation";
import { type Entry, toggleLike, toggleBookmark } from "@/lib/firebase/entries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Heart, MessageSquare, Bookmark } from "lucide-react";

interface EntryCardProps {
	entry: Entry;
}

export function EntryCard({ entry }: EntryCardProps) {
	const { user } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(entry.likes);
	const [bookmarked, setBookmarked] = useState(false);
	const [bookmarkCount, setBookmarkCount] = useState(entry.bookmarks);

	// Truncate content for preview
	const previewContent =
		entry.content.length > 200
			? `${entry.content.substring(0, 200)}...`
			: entry.content;

	const handleLike = async () => {
		if (!user) {
			toast({
				title: "Authentication required",
				description: "Please sign in to like entries",
			});
			router.push("/login");
			return;
		}

		try {
			const isLiked = await toggleLike(entry.id, user.uid);
			setLiked(isLiked);
			setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
		} catch (error) {
			console.error("Error liking entry:", error);
			toast({
				title: "Error",
				description: "Failed to like entry",
				variant: "destructive",
			});
		}
	};

	const handleBookmark = async () => {
		if (!user) {
			toast({
				title: "Authentication required",
				description: "Please sign in to bookmark entries",
			});
			router.push("/login");
			return;
		}

		try {
			const isBookmarked = await toggleBookmark(entry.id, user.uid);
			setBookmarked(isBookmarked);
			setBookmarkCount((prev) => (isBookmarked ? prev + 1 : prev - 1));
		} catch (error) {
			console.error("Error bookmarking entry:", error);

			toast({
				title: "Error",
				description: "Failed to bookmark entry",
				variant: "destructive",
			});
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center gap-2'>
					<Avatar className='h-8 w-8'>
						<AvatarImage
							src={entry.authorPhotoURL || ""}
							alt={entry.authorName}
						/>
						<AvatarFallback>{entry.authorName.charAt(0)}</AvatarFallback>
					</Avatar>
					<div>
						<CardTitle className='text-lg'>{entry.title}</CardTitle>
						<CardDescription>
							by{" "}
							<Link
								href={`/profile/${entry.authorId}`}
								className='hover:underline'
							>
								{entry.authorName}
							</Link>
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className='whitespace-pre-line'>{previewContent}</p>
				{entry.tags.length > 0 && (
					<div className='flex flex-wrap gap-2 mt-4'>
						{entry.tags.map((tag) => (
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
			<CardFooter className='flex justify-between'>
				<div className='flex items-center gap-4'>
					<Button
						variant='ghost'
						size='sm'
						className='gap-1'
						onClick={handleLike}
					>
						<Heart
							className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
						/>
						<span>{likeCount}</span>
					</Button>
					<Button
						variant='ghost'
						size='sm'
						className='gap-1'
						asChild
					>
						<Link href={`/entry/${entry.id}`}>
							<MessageSquare className='h-4 w-4' />
							<span>{entry.comments}</span>
						</Link>
					</Button>
					<Button
						variant='ghost'
						size='sm'
						className='gap-1'
						onClick={handleBookmark}
					>
						<Bookmark
							className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`}
						/>
						<span>{bookmarkCount}</span>
					</Button>
				</div>
				<Button
					variant='outline'
					size='sm'
					asChild
				>
					<Link href={`/entry/${entry.id}`}>Read More</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
