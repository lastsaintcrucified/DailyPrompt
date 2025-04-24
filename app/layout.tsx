import type React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "DailyPrompt",
	description: "Daily writing prompts for creative minds",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
		>
			<body className={inter.className}>
				<ThemeProvider>
					<AuthProvider>
						<div className='min-h-screen flex flex-col'>
							<Navbar />
							<ThemeToggle />
							<main className='flex-1'>{children}</main>
							<Toaster />
						</div>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
