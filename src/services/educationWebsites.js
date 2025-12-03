import { collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchEducationWebsites() {
  try {
    const q = query(
      collection(db, "educationWebsites"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching education websites:", error);
    return [];
  }
}

export async function checkDuplicateWebsiteLink(url) {
  try {
    const q = query(
      collection(db, "educationWebsites"),
      where("url", "==", url)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error("Error checking duplicate website link:", error);
    return false;
  }
}

