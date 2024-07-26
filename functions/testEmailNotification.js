const admin = require("firebase-admin");
require("dotenv").config();
// eslint-disable-next-line max-len
const serviceAccount = require("./g-guide-1368b-firebase-adminsdk-496bd-f4a25f2faa.json");

// Initialize Firebase Admin SDK with your service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
    // eslint-disable-next-line max-len
    email: "marianehistoria88@gmail.com", // replace with a valid email for testing
  });
  console.log("Test document added");
}

addTestDocument().catch(console.error);
