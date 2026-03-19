const { admin } = require("../config/firebase.js");
const db = admin.firestore();

async function sendInvitation(req, res) {
    try {
        const { email, Role } = req.body;
        const firebaseId = req.user.uid;
        const projectId = req.params.projectId;

        if (!email || !Role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const usersDoc = await db.collection("users").doc(firebaseId).get();

        if (!usersDoc.exists) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const projectRef = db.collection("projects").doc(projectId);
        const inviteesRef = projectRef.collection("invitees");
        const membersRef = projectRef.collection("members");
        const usersRef = db.collection("users");

        // ✅ Check if already a member
        const memberSnapshot = await membersRef
            .where("email", "==", email)
            .limit(1)
            .get();

        // Get users id to send invitation
        const userSnapshot = await usersRef.where("email", "==", email).limit(1).get();

        
        if ( userSnapshot.empty ) {
            return res.status(404).json({message: "User does not have a taskflow pro account"});
        }


        if (!memberSnapshot.empty) {
            return res.status(400).json({
                message: "User is already a member of this project"
            });
        }

        // ✅ Check if already invited
        const inviteSnapshot = await inviteesRef
            .where("email", "==", email)
            .limit(1)
            .get();

        if (!inviteSnapshot.empty) {
            return res.status(400).json({
                message: "User has already been invited"
            });
        }

        const doc = userSnapshot.docs[0];

        // Send invitation
        await inviteesRef.add({
            email: email,
            Role: Role,
            status: "Pending",
            invitedBy: firebaseId,
            invitedUserId: doc.id,
            invitedAt: new Date()
        });

        res.status(200).json({
            message: "Invitation sent successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to send request",
            error: err.message
        });
    }
}

module.exports = { sendInvitation };