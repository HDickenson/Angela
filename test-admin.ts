import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
try {
  initializeApp({ projectId: "excellent-flag-489709-r2" });
  console.log("Admin OK", getApps().length);
} catch(e) {
  console.error(e);
}
