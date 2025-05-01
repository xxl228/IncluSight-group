
import { db } from './firebase-logs.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const sessionId = crypto.randomUUID(); // unique per visit

// You could also track when the session started
const sessionStart = new Date().toISOString();

export async function logEvent(type, elementId, datasetId, duration = null) {
  try {
    await addDoc(collection(db, "interaction_logs"), {
      sessionId,
      sessionStart, 
      type,
      elementId,
      datasetId,
      duration,
      timestamp: serverTimestamp()
    });
    console.log("📦 Logged to Firebase:", { type, elementId, datasetId, duration });
  } catch (e) {
    console.error("❌ Error logging event to Firebase:", e);
  }

  
}
