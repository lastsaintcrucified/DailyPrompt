"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { User } from "firebase/auth";
import Link from "next/link";

export function UserNav({ user }: { user: User }) {
	const handleSignOut = async () => {
		await signOut(auth);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='ghost'
					className='relative h-8 w-8 rounded-full'
				>
					<Avatar className='h-8 w-8'>
						<AvatarImage
							src={user.photoURL || ""}
							alt={user.displayName || "User"}
						/>
						<AvatarFallback>
							{user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-56'
				align='end'
				forceMount
			>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-1'>
						<p className='text-sm font-medium leading-none'>
							{user.displayName || "User"}
						</p>
						<p className='text-xs leading-none text-muted-foreground'>
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href='/dashboard'>Dashboard</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href={`/profile/${user.uid}`}>View Profile</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href='/dashboard/profile'>Edit Profile</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href='/dashboard/bookmarks'>Bookmarks</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
