const { admin, firestore } = require("../config/firebase.js");
const db = admin.firestore();



const createNewProject = async (req, res) => {
    


    try {
        const { name, description, dueDate, teamSize, colorCode } = req.body;

        const firebaseId = req.user.uid;

        if (!name || !description || !dueDate || !teamSize || !colorCode) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const parsedTeamSize = parseInt(teamSize);
        if (isNaN(parsedTeamSize)) {
            return res.status(400).json({
                success: false,
                message: "Team size must be a valid number"
            });
        }

        const projectRef = firestore.collection("projects").doc();
        const projectId = projectRef.id;

        const memberRef = projectRef.collection("members").doc(firebaseId);
        const userRef = firestore.collection("users").doc(firebaseId);

        const batch = firestore.batch();

        // Create project
        batch.set(projectRef, {
            name,
            description,
            startDate: admin.firestore.FieldValue.serverTimestamp(),
            dueDate: new Date(dueDate),
            teamSize: parsedTeamSize,
            ownerId: firebaseId,
            status: "active",
            colorCode,
            progress: 0,
            membersCount: 1,
            taskCount: 0,
            completedTasks: 0,
            starred: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        

        batch.set(memberRef, {
            userId: firebaseId,
            role: "owner",
            joinedAt: new Date()
        })

        // Add project to user
        batch.set(userRef, {
            projects: admin.firestore.FieldValue.arrayUnion(projectId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Commit batch
        await batch.commit();

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            projectId,
            project: {
                id: projectId,
                name,
                description,
                dueDate,
                teamSize: parsedTeamSize,
                colorCode,
                status: "active",
                progress: 0
            }
        });

    } catch (err) {
        console.error("Error creating project:", err);

        res.status(500).json({
            success: false,
            message: "Failed to create project",
            error: err.message
        });
    }
};


const getUserProjects = async (req, res) => {
    try {
        const firebaseId = req.user?.uid;

        if (!firebaseId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const projectSnapshot = await firestore
            .collection("projects")
            .where("ownerId", "==", firebaseId)
            .get();

        if (projectSnapshot.empty) {
            return res.status(404).json({ message: "No projects found" });
        }

        const projects = projectSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json({ projects });

    } catch (err) {
     console.error("FULL ERROR:", err);

    if (err.response) {
        console.error("SERVER ERROR:", err.response.data);
    }

    enqueueSnackbar(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Server error occurred",
        { variant: "error" }
    );
}
};

module.exports = { createNewProject, getUserProjects };