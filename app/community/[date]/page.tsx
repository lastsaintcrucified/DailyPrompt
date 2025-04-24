import Link from "next/link";
import { getPromptByDate } from "@/lib/firebase/prompts";
import { getEntriesByPromptDate } from "@/lib/firebase/entries";
import { formatDate } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EntryCard } from "@/components/entry-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function CommunityPage({
	params,
}: {
	params: Promise<{ date: string }>;
}) {
	const { date } = await params;
	const prompt = await getPromptByDate(date);
	const entries = await getEntriesByPromptDate(date);

	// Sort entries by likes (for top) and by date (for recent)
	const topEntries = [...entries].sort((a, b) => b.likes - a.likes);
	const recentEntries = [...entries].sort(
		(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
	);

	return (
		<div className='container py-10'>
			<div className='max-w-4xl mx-auto space-y-8'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						Community Entries
					</h1>
					<p className='text-muted-foreground'>{formatDate(new Date(date))}</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Prompt</CardTitle>
						<CardDescription>Today&apos;s writing prompt</CardDescription>
					</CardHeader>
					<CardContent>
						<p className='text-lg'>
							{prompt?.text || "No prompt available for this date."}
						</p>
					</CardContent>
				</Card>

				<div className='flex justify-between items-center'>
					<h2 className='text-2xl font-bold tracking-tight'>Entries</h2>
					<Button asChild>
						<Link href={`/write/${date}`}>Write Entry</Link>
					</Button>
				</div>

				<Tabs
					defaultValue='recent'
					className='w-full'
				>
					<TabsList className='grid w-full max-w-xs grid-cols-2'>
						<TabsTrigger value='recent'>Recent</TabsTrigger>
						<TabsTrigger value='top'>Top</TabsTrigger>
					</TabsList>
					<TabsContent
						value='recent'
						className='space-y-4 mt-4'
					>
						{recentEntries.length > 0 ? (
							recentEntries.map((entry) => (
								<EntryCard
									key={entry.id}
									entry={entry}
								/>
							))
						) : (
							<div className='text-center py-10'>
								<p className='text-muted-foreground'>
									No entries yet. Be the first to write!
								</p>
								<Button
									asChild
									className='mt-4'
								>
									<Link href={`/write/${date}`}>Write Entry</Link>
								</Button>
							</div>
						)}
					</TabsContent>
					<TabsContent
						value='top'
						className='space-y-4 mt-4'
					>
						{topEntries.length > 0 ? (
							topEntries.map((entry) => (
								<EntryCard
									key={entry.id}
									entry={entry}
								/>
							))
						) : (
							<div className='text-center py-10'>
								<p className='text-muted-foreground'>
									No entries yet. Be the first to write!
								</p>
								<Button
									asChild
									className='mt-4'
								>
									<Link href={`/write/${date}`}>Write Entry</Link>
								</Button>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
