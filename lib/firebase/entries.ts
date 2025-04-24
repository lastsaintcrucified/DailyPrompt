/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/firebase/config";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
	orderBy,
	serverTimestamp,
	updateDoc,
	increment,
	setDoc,
	limit,
} from "firebase/firestore";

export type Entry = {
	id: string;
	title: string;
	content: string;
	tags: string[];
	promptDate: string;
	authorId: string;
	authorName: string;
	authorPhotoURL: string | null;
	createdAt: Date;
	updatedAt: Date;
	likes: number;
	comments: number;
	bookmarks: number;
};

export async function getEntriesByPromptDate(date: string): Promise<Entry[]> {
	try {
		const entriesRef = collection(db, "entries");
		const q = query(entriesRef, where("promptDate", "==", date));
		const querySnapshot = await getDocs(q);

		const entries: Entry[] = [];
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			entries.push({
				id: doc.id,
				title: data.title,
				content: data.content,
				tags: data.tags || [],
				promptDate: data.promptDate,
				authorId: data.authorId,
				authorName: data.authorName,
				authorPhotoURL: data.authorPhotoURL,
				createdAt: data.createdAt.toDate(),
				updatedAt: data.updatedAt.toDate(),
				likes: data.likes || 0,
				comments: data.comments || 0,
				bookmarks: data.bookmarks || 0,
			});
		});

		return entries;
	} catch (error) {
		console.error("Error getting entries:", error);
		return [];
	}
}

export async function getPopularEntries(count = 10): Promise<Entry[]> {
	try {
		const entriesRef = collection(db, "entries");
		const q = query(entriesRef, orderBy("likes", "desc"), limit(count));
		const querySnapshot = await getDocs(q);

		const entries: Entry[] = [];
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			entries.push({
				id: doc.id,
				title: data.title,
				content: data.content,
				tags: data.tags || [],
				promptDate: data.promptDate,
				authorId: data.authorId,
				authorName: data.authorName,
				authorPhotoURL: data.authorPhotoURL,
				createdAt: data.createdAt.toDate(),
				updatedAt: data.updatedAt.toDate(),
				likes: data.likes || 0,
				comments: data.comments || 0,
				bookmarks: data.bookmarks || 0,
			});
		});

		return entries;
	} catch (error) {
		console.error("Error getting popular entries:", error);
		return [];
	}
}

export async function getEntryById(entryId: string): Promise<Entry | null> {
	try {
		const entryRef = doc(db, "entries", entryId);
		const entrySnap = await getDoc(entryRef);

		if (entrySnap.exists()) {
			const data = entrySnap.data();
			return {
				id: entrySnap.id,
				title: data.title,
				content: data.content,
				tags: data.tags || [],
				promptDate: data.promptDate,
				authorId: data.authorId,
				authorName: data.authorName,
				authorPhotoURL: data.authorPhotoURL,
				createdAt: data.createdAt.toDate(),
				updatedAt: data.updatedAt.toDate(),
				likes: data.likes || 0,
				comments: data.comments || 0,
				bookmarks: data.bookmarks || 0,
			};
		}

		return null;
	} catch (error) {
		console.error("Error getting entry:", error);
		return null;
	}
}

export async function getUserEntries(userId: string): Promise<Entry[]> {
	try {
		const entriesRef = collection(db, "entries");
		const q = query(
			entriesRef,
			where("authorId", "==", userId),
			orderBy("createdAt", "desc")
		);
		const querySnapshot = await getDocs(q);

		const entries: Entry[] = [];
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			entries.push({
				id: doc.id,
				title: data.title,
				content: data.content,
				tags: data.tags || [],
				promptDate: data.promptDate,
				authorId: data.authorId,
				authorName: data.authorName,
				authorPhotoURL: data.authorPhotoURL,
				createdAt: data.createdAt.toDate(),
				updatedAt: data.updatedAt.toDate(),
				likes: data.likes || 0,
				comments: data.comments || 0,
				bookmarks: data.bookmarks || 0,
			});
		});

		return entries;
	} catch (error) {
		console.error("Error getting user entries:", error);
		return [];
	}
}

export async function getUserDrafts(userId: string): Promise<any[]> {
	try {
		const draftsRef = collection(db, "users", userId, "drafts");
		const q = query(
			draftsRef,
			where("published", "==", false),
			orderBy("updatedAt", "desc")
		);
		const querySnapshot = await getDocs(q);

		const drafts: any[] = [];
		querySnapshot.forEach((doc) => {
			const data = doc.data();
			drafts.push({
				id: doc.id,
				title: data.title || "Untitled",
				content: data.content || "",
				tags: data.tags || [],
				promptDate: data.promptDate,
				updatedAt: data.updatedAt?.toDate() || new Date(),
			});
		});

		return drafts;
	} catch (error) {
		console.error("Error getting user drafts:", error);
		return [];
	}
}

export async function getUserBookmarkedEntries(
	userId: string
): Promise<Entry[]> {
	try {
		// First get all bookmarked entry IDs
		const bookmarksRef = collection(db, "users", userId, "bookmarks");
		const q = query(bookmarksRef, where("bookmarked", "==", true));
		const bookmarksSnapshot = await getDocs(q);

		const entryIds: string[] = [];
		bookmarksSnapshot.forEach((doc) => {
			entryIds.push(doc.data().entryId);
		});

		// Then fetch the actual entries
		const entries: Entry[] = [];

		for (const entryId of entryIds) {
			const entry = await getEntryById(entryId);
			if (entry) {
				entries.push(entry);
			}
		}

		return entries;
	} catch (error) {
		console.error("Error getting bookmarked entries:", error);
		return [];
	}
}

export async function toggleLike(
	entryId: string,
	userId: string
): Promise<boolean> {
	try {
		// Check if user already liked the entry
		const likeRef = doc(db, "users", userId, "likes", entryId);
		const likeSnap = await getDoc(likeRef);

		const entryRef = doc(db, "entries", entryId);

		if (likeSnap.exists()) {
			// Unlike
			await updateDoc(entryRef, {
				likes: increment(-1),
			});

			// Remove from user's likes
			await setDoc(likeRef, { liked: false }, { merge: true });

			return false;
		} else {
			// Like
			await updateDoc(entryRef, {
				likes: increment(1),
			});

			// Add to user's likes
			await setDoc(likeRef, {
				liked: true,
				entryId,
				timestamp: serverTimestamp(),
			});

			return true;
		}
	} catch (error) {
		console.error("Error toggling like:", error);
		throw error;
	}
}

export async function toggleBookmark(
	entryId: string,
	userId: string
): Promise<boolean> {
	try {
		// Check if user already bookmarked the entry
		const bookmarkRef = doc(db, "users", userId, "bookmarks", entryId);
		const bookmarkSnap = await getDoc(bookmarkRef);

		const entryRef = doc(db, "entries", entryId);

		if (bookmarkSnap.exists()) {
			// Remove bookmark
			await updateDoc(entryRef, {
				bookmarks: increment(-1),
			});

			// Remove from user's bookmarks
			await setDoc(bookmarkRef, { bookmarked: false }, { merge: true });

			return false;
		} else {
			// Add bookmark
			await updateDoc(entryRef, {
				bookmarks: increment(1),
			});

			// Add to user's bookmarks
			await setDoc(bookmarkRef, {
				bookmarked: true,
				entryId,
				timestamp: serverTimestamp(),
			});

			return true;
		}
	} catch (error) {
		console.error("Error toggling bookmark:", error);
		throw error;
	}
}
