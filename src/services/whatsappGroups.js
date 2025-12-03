import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchWhatsappGroups() {
  const q = query(
    collection(db, "whatsappGroups"),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function checkDuplicateWhatsappLink(url) {
  try {
    // Use Firestore query to check for exact URL match (more efficient)
    const q = query(
      collection(db, "whatsappGroups"),
      where("url", "==", url.trim())
    );
    const snap = await getDocs(q);
    return !snap.empty; // If any docs found, it's a duplicate
  } catch (error) {
    console.error("Error checking duplicate WhatsApp link:", error);
    return false;
  }
}


