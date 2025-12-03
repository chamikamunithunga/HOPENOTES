import { collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchTelegramGroups() {
  try {
    const q = query(
      collection(db, "telegramGroups"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching telegram groups:", error);
    return [];
  }
}

export async function checkDuplicateTelegramLink(url) {
  try {
    const q = query(
      collection(db, "telegramGroups"),
      where("url", "==", url)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error("Error checking duplicate telegram link:", error);
    return false;
  }
}

