const { admin } = require("../config/firebase.js");
const db = admin.firestore();

async function sendInvitation(req, res) {
    try {
        const { email, role } = req.body;
        const firebaseId = req.user.uid;
        const projectId = req.params.projectId;

        if (!email || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Normalize email to lowercase for consistent comparison
        const normalizedEmail = email.toLowerCase().trim();

        const usersDoc = await db.collection("users").doc(firebaseId).get();

        if (!usersDoc.exists) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const projectRef = db.collection("projects").doc(projectId);
        const inviteesRef = projectRef.collection("invitees");
        const membersRef = projectRef.collection("members");
        const usersRef = db.collection("users");
        const notificationsRef = db.collection("notifications");

        // Get user ID of the person being invited
        const userSnapshot = await usersRef
            .where("email", "==", normalizedEmail)
            .limit(1)
            .get();

        if (userSnapshot.empty) {
            return res.status(404).json({ 
                message: "User does not have a TaskFlow Pro account" 
            });
        }

        const invitedUserDoc = userSnapshot.docs[0];
        const invitedUserId = invitedUserDoc.id;

        // DEBUG: Log all members to see their structure
        console.log("Checking members collection...");
        const allMembers = await membersRef.get();
        allMembers.forEach(doc => {
            console.log("Member document:", doc.id, "Data:", doc.data());
        });

        // Check if already a member - try multiple possible field names
        const memberCheckQueries = await Promise.all([
            membersRef.where("email", "==", normalizedEmail).limit(1).get(),
            membersRef.where("Email", "==", normalizedEmail).limit(1).get(),
            membersRef.where("userEmail", "==", normalizedEmail).limit(1).get(),
            membersRef.where("userId", "==", invitedUserId).limit(1).get()
        ]);

        const isMember = memberCheckQueries.some(query => !query.empty);
        
        if (isMember) {
            console.log("User is already a member - found in one of the checks");
            return res.status(400).json({
                message: "User is already a member of this project"
            });
        }

        // Check if already invited - also normalize email
        const inviteSnapshot = await inviteesRef
            .where("email", "==", normalizedEmail)
            .limit(1)
            .get();

        if (!inviteSnapshot.empty) {
            const inviteData = inviteSnapshot.docs[0].data();
            console.log("Existing invitation found:", inviteData);
            
            return res.status(400).json({
                message: `User has already been invited (Status: ${inviteData.status || 'Pending'})`
            });
        }

        // Send invitation
        await inviteesRef.add({
            email: normalizedEmail,
            Role: role,
            status: "Pending",
            invitedBy: firebaseId,
            invitedUserId: invitedUserId,
            invitedAt: new Date()
        });

        await notificationsRef.add({
            userId: invitedUserId,
            message: "You have a new invitation to project",
            type: "INVITE",
            isRead: false,
            createdAt: new Date()
        })

        console.log(`Invitation sent successfully to ${normalizedEmail} for project ${projectId}`);

        res.status(200).json({
            message: "Invitation sent successfully",
            data: {
                email: normalizedEmail,
                role: role,
                status: "Pending"
            }
        });

    } catch (err) {
        console.error("Error in sendInvitation:", err);
        res.status(500).json({
            success: false,
            message: "Failed to send invitation",
            error: err.message
        });
    }
}

module.exports = { sendInvitation };