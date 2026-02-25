const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Check if service account is loaded correctly
console.log('Service account email:', serviceAccount.client_email);

// Initialize Firebase Admin
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount) 
    });
    console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
}

const firestore = admin.firestore();
console.log('✅ Firebase Firestore initialized');

// Export both admin and firestore
module.exports = {
    admin,
    firestore
};