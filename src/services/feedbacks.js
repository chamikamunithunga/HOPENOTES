import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, limit } from "firebase/firestore";
import { db } from "../firebase";

export async function saveFeedback(name, feedback) {
  try {
    await addDoc(collection(db, "feedbacks"), {
      name: name.trim(),
      feedback: feedback.trim(),
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving feedback:", error);
    throw error;
  }
}

export async function fetchFeedbacks() {
  try {
    const q = query(
      collection(db, "feedbacks"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    throw error;
  }
}

