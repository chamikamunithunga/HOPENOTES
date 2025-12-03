import { collection, getDocs, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function fetchNews() {
  const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addNewsItem(payload) {
  await addDoc(collection(db, 'news'), {
    ...payload,
    createdAt: serverTimestamp()
  });
}


