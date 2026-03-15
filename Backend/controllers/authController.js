const { admin, firestore } = require("../config/firebase.js");

const registerUser = async (req, res) => {
  try {
    const { email, firstName, lastName, userName, username } = req.body;
    const finalUserName = userName || username;

    if (!email || !firstName || !lastName || !finalUserName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const firebaseUid = req.user.uid;

    // Check if user already exists in Firestore
    const userDoc = await firestore.collection("users").doc(firebaseUid).get();

    if (userDoc.exists) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Create user document using Firebase UID
    await firestore.collection("users").doc(firebaseUid).set({
      username: finalUserName,
      email,
      firstName,
      lastName,
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: firebaseUid,
        userName: finalUserName,
        email,
        firstName,
        lastName
      }
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = registerUser;