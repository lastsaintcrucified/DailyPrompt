"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-provider";
import { UserNav } from "@/components/user-nav";
import { Loader2 } from "lucide-react";

export default function Navbar() {
	const pathname = usePathname();
	const { user, loading } = useAuth();

	return (
		<header className='border-b'>
			<div className='container flex h-16 items-center justify-between'>
				<div className='flex items-center gap-6'>
					<Link
						href='/'
						className='font-bold text-xl'
					>
						DailyPrompt
					</Link>
					<nav className='hidden md:flex gap-6'>
						<Link
							href='/'
							className={
								pathname === "/" ? "font-medium" : "text-muted-foreground"
							}
						>
							Home
						</Link>
						<Link
							href='/community'
							className={
								pathname.startsWith("/community")
									? "font-medium"
									: "text-muted-foreground"
							}
						>
							Community
						</Link>
						{user && (
							<Link
								href='/dashboard'
								className={
									pathname.startsWith("/dashboard")
										? "font-medium"
										: "text-muted-foreground"
								}
							>
								Dashboard
							</Link>
						)}
					</nav>
				</div>
				<div className='flex items-center gap-2'>
					{/* <ModeToggle /> */}
					{loading ? (
						<Button
							variant='ghost'
							size='icon'
							disabled
						>
							<Loader2 className='h-4 w-4 animate-spin' />
						</Button>
					) : user ? (
						<UserNav user={user} />
					) : (
						<Button
							asChild
							variant='default'
						>
							<Link href='/login'>Sign In</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
