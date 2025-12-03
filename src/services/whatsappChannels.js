import { collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "../firebase";

export async function fetchWhatsappChannels() {
  try {
    const q = query(
      collection(db, "whatsappChannels"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching whatsapp channels:", error);
    return [];
  }
}

export async function checkDuplicateWhatsappChannelLink(url) {
  try {
    const q = query(
      collection(db, "whatsappChannels"),
      where("url", "==", url)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error("Error checking duplicate whatsapp channel link:", error);
    return false;
  }
}

