const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK with your project ID and credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "g-guide-1368b", // replace with your Firebase project ID
});

const db = admin.firestore();

/**
 * Adds a test document to the Firestore 'submissions' collection.
 * This function is used to trigger Firestore events for testing purposes.
 */
async function addTestDocument() {
  const docRef = db.collection("submissions").doc();
  await docRef.set({
    email: "marianehistoria88@gmail.com",
  });
  console.log("Test document added");
}

addTestDocument().catch(console.error);
