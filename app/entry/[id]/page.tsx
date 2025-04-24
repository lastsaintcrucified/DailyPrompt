import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getEntryById } from "@/lib/firebase/entries";
import { getPromptByDate } from "@/lib/firebase/prompts";
import { formatDate } from "@/lib/utils";
import { EntryActions } from "@/components/entry-actions";
import { CalendarIcon, Clock } from "lucide-react";

export default async function EntryPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const entry = await getEntryById(id);

	if (!entry) {
		notFound();
	}

	const prompt = await getPromptByDate(entry.promptDate);

	return (
		<div className='container py-10'>
			<div className='max-w-3xl mx-auto space-y-8'>
				<div>
					<Link
						href={`/community/${entry.promptDate}`}
						className='text-sm text-muted-foreground hover:underline'
					>
						← Back to community entries
					</Link>
				</div>

				<Card>
					<CardHeader>
						<div className='flex items-center gap-4'>
							<Avatar className='h-10 w-10'>
								<AvatarImage
									src={entry.authorPhotoURL || ""}
									alt={entry.authorName}
								/>
								<AvatarFallback>{entry.authorName.charAt(0)}</AvatarFallback>
							</Avatar>
							<div>
								<CardTitle className='text-2xl'>{entry.title}</CardTitle>
								<CardDescription>
									by {entry.authorName} •
									<span className='inline-flex items-center ml-2'>
										<CalendarIcon className='h-3 w-3 mr-1' />
										{new Date(entry.promptDate).toLocaleDateString()}
									</span>{" "}
									•
									<span className='inline-flex items-center ml-2'>
										<Clock className='h-3 w-3 mr-1' />
										{new Date(entry.createdAt).toLocaleTimeString()}
									</span>
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className='space-y-6'>
						{prompt && (
							<div className='bg-muted p-4 rounded-md'>
								<p className='text-sm font-medium mb-1'>
									Prompt for {formatDate(new Date(entry.promptDate))}
								</p>
								<p className='italic'>{prompt.text}</p>
							</div>
						)}

						<div className='prose dark:prose-invert max-w-none'>
							<p className='whitespace-pre-line'>{entry.content}</p>
						</div>

						{entry.tags.length > 0 && (
							<div className='flex flex-wrap gap-2 pt-4'>
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
					<CardFooter>
						<EntryActions entry={entry} />
					</CardFooter>
				</Card>

				<div className='space-y-4'>
					<Separator />
					<h2 className='text-xl font-bold'>Comments</h2>
					<Card>
						<CardContent className='pt-6'>
							<p className='text-center text-muted-foreground py-8'>
								Comments feature coming soon!
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
