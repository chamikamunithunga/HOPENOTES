import { collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchYoutubeChannels() {
  try {
    const q = query(
      collection(db, "youtubeChannels"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching youtube channels:", error);
    return [];
  }
}

export async function checkDuplicateYoutubeChannelLink(url) {
  try {
    const q = query(
      collection(db, "youtubeChannels"),
      where("url", "==", url)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error("Error checking duplicate youtube channel link:", error);
    return false;
  }
}

