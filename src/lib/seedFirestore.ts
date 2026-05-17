import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { harbourTowerData, facilitiesData, enterpriseData } from "./internal_databases.ts";

export async function seedEvidenceStore() {
  if (getApps().length === 0) {
    initializeApp({ projectId: "excellent-flag-489709-r2" });
  }
  const db = getFirestore();

  const workspaces = {
    "harbour-tower": harbourTowerData.documents.map(d => ({
      id: d.id,
      zone: d.tags.includes("risk") || d.tags.includes("finance") ? "restricted" : "diagnostic",
      content: `${d.fileName} - ${d.tags.join(', ')}`,
      tags: d.tags
    })).concat(harbourTowerData.risks.map(r => ({
      id: r.id,
      zone: "public",
      content: `Risk: ${r.riskTitle} - ${r.description}`,
      tags: ["risk"]
    }))),
    "facilities": facilitiesData.documents || [],
    "enterprise": enterpriseData.documents || []
  };

  const batch = db.batch();
  let count = 0;

  for (const [workspaceId, evidenceArray] of Object.entries(workspaces)) {
    for (const evidence of evidenceArray) {
      const docRef = db.collection('workspaces').doc(workspaceId).collection('evidenceStore').doc(evidence.id);
      batch.set(docRef, { ...evidence, workspaceId });
      count++;
    }
  }

  await batch.commit();
  console.log(`Successfully seeded ${count} evidence items to Firestore.`);
}
