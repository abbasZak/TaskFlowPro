const { firestore } = require("../config/firebase.js");

async function getAllNotifications(req, res) {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const snapshot = await firestore
            .collection("notification")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.status(200).json(data);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}


module.exports = { getAllNotifications }