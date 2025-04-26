import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { getCurrentPrompt } from "@/lib/firebase/prompts";
import { formatDate } from "@/lib/utils";

export default async function Home() {
	const currentPrompt = await getCurrentPrompt();
	const today = new Date();
	const formattedDate = formatDate(today);

	return (
		<div className='container py-10 '>
			<div className='max-w-4xl mx-auto space-y-10 flex-col items-center lg:items-start'>
				<div className='text-center space-y-4'>
					<h1 className='text-4xl font-bold tracking-tight'>DailyPrompt</h1>
					<p className='text-xl text-muted-foreground'>
						Unleash your creativity with daily writing prompts
					</p>
				</div>

				<Card className='border-2'>
					<CardHeader>
						<CardTitle className='flex justify-between items-center'>
							<span>Today&apos;s Prompt</span>
							<span className='text-sm font-normal text-muted-foreground'>
								{formattedDate}
							</span>
						</CardTitle>
						<CardDescription>Get inspired and start writing</CardDescription>
					</CardHeader>
					<CardContent>
						<p className='text-xl font-medium'>
							{currentPrompt?.text || "Loading today's prompt..."}
						</p>
					</CardContent>
					<CardFooter className='flex justify-between'>
						<Button
							variant='outline'
							asChild
						>
							<Link href={`/community/${today.toISOString().split("T")[0]}`}>
								View Community Entries
							</Link>
						</Button>
						<Button asChild>
							<Link href={`/write/${today.toISOString().split("T")[0]}`}>
								Write Entry
							</Link>
						</Button>
					</CardFooter>
				</Card>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					<Card>
						<CardHeader>
							<CardTitle>Write</CardTitle>
							<CardDescription>Respond to daily prompts</CardDescription>
						</CardHeader>
						<CardContent>
							<p>
								Express yourself through writing with our daily creative
								prompts.
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Share</CardTitle>
							<CardDescription>Join the community</CardDescription>
						</CardHeader>
						<CardContent>
							<p>Share your entries with a community of writers and readers.</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Grow</CardTitle>
							<CardDescription>Improve your writing</CardDescription>
						</CardHeader>
						<CardContent>
							<p>
								Receive feedback, likes, and comments to help you grow as a
								writer.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
