import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchDriveLinks() {
  const q = query(
    collection(db, "driveLinks"),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function checkDuplicateDriveLink(url) {
  try {
    const normalizedUrl = url.trim().toLowerCase();
    // Use Firestore query to check for exact URL match (more efficient than fetching all)
    const q = query(
      collection(db, "driveLinks"),
      where("url", "==", url.trim())
    );
    const snap = await getDocs(q);
    return !snap.empty; // If any docs found, it's a duplicate
  } catch (error) {
    console.error("Error checking duplicate drive link:", error);
    return false;
  }
}

