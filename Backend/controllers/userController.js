const { admin } = require("../config/firebase.js");


const getUserInfo =  async (req, res) => {
    try {
        const uid = req.user.uid;     
        
        if (uid) {
            const doc = await admin.firestore().collection("users").doc(uid).get();

        if (!doc.exists) {
            return res.status(200).send("User not Found");
        }

        res.json(doc.data());
    }

        

    } catch (err) {
        console.log(err.message);
    }
}

module.exports = getUserInfo;