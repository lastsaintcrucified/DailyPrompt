import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyCePuppBP6WNcuBzFKMpDwQ50X7isg6dx0",
		NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "dailyprompt-17891.firebaseapp.com",
		NEXT_PUBLIC_FIREBASE_PROJECT_ID: "dailyprompt-17891",
		NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
			"dailyprompt-17891.firebasestorage.app",
		NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1001827749758",
		NEXT_PUBLIC_FIREBASE_APP_ID: "1:1001827749758:web:3f4ec81573b5d45920ed2f",
		NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-Q5F7MDDQFX",
	},
};

export default nextConfig;
