// controllers/authController.js
const mysqlDb = require('../config/mysql/db'); // Make sure this path is correct
const { admin, firestore } = require("../config/firebase.js");

const registerUser = async (req, res) => {
    try {
        const { email, firstName, lastName, userName, username } = req.body;
        
        // Handle both userName and username fields
        const finalUserName = userName || username;
        
        console.log('Registration request received:', {
            email,
            firstName,
            lastName,
            userName: finalUserName
        });

        // Validate required fields
        const missingFields = {};
        if (!email) missingFields.email = true;
        if (!firstName) missingFields.firstName = true;
        if (!lastName) missingFields.lastName = true;
        if (!finalUserName) missingFields.userName = true;

        if (Object.keys(missingFields).length > 0) {
            console.log('❌ Missing required fields:', missingFields);
            return res.status(400).json({ 
                message: 'All fields are required.',
                missing: missingFields
            });
        }

        // Check if MySQL connection is available
        if (!mysqlDb) {
            console.error('❌ MySQL connection not available');
            return res.status(500).json({ 
                message: 'Database connection error. MySQL not configured.' 
            });
        }

        // 1. Check MySQL if user exists
        console.log('Checking MySQL for existing user:', email);
        const [mysqlRows] = await mysqlDb.promise().execute(
            "SELECT * FROM users WHERE email = ?", 
            [email]
        );
        console.log('MySQL check result:', mysqlRows.length > 0 ? 'User exists' : 'User not found');

        // 2. Check Firestore if user exists
        console.log('Checking Firestore for existing user:', email);
        const firestoreSnapshot = await firestore
            .collection('users')
            .where('email', '==', email)
            .get();
        
        const firestoreExists = !firestoreSnapshot.empty;
        console.log('Firestore check result:', firestoreExists ? 'User exists' : 'User not found');

        if (mysqlRows.length > 0 || firestoreExists) {
            console.log('❌ User already exists in databases');
            return res.status(409).json({ 
                message: 'User already exists.',
                existsIn: {
                    mysql: mysqlRows.length > 0,
                    firestore: firestoreExists
                }
            });
        }

        // 3. Insert into MySQL
        console.log('Inserting user into MySQL...');
        const [mysqlResult] = await mysqlDb.promise().execute(
            "INSERT INTO users (username, email, First_Name, Last_Name, created_at, email_verified) VALUES (?, ?, ?, ?, NOW(), ?)",
            [finalUserName, email, firstName, lastName, true]
        );

        const mysqlUserId = mysqlResult.insertId;
        console.log('✅ MySQL insert successful, ID:', mysqlUserId);

        // 4. Insert into Firestore
        console.log('Inserting user into Firestore...');
        const firestoreDoc = await firestore.collection('users').add({
            username: finalUserName,
            email: email,
            firstName: firstName,
            lastName: lastName,
            mysqlId: mysqlUserId,
            emailVerified: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            firebaseUid: req.user.uid
        });

        console.log('✅ Firestore insert successful, ID:', firestoreDoc.id);

        // 5. Update MySQL with Firestore ID
        await mysqlDb.promise().execute(
            "UPDATE users SET firestore_id = ? WHERE id = ?",
            [firestoreDoc.id, mysqlUserId]
        );

        console.log('✅ User registered successfully');

        res.status(201).json({ 
            message: 'User registered successfully in both databases.',
            user: { 
                id: mysqlUserId,
                firestoreId: firestoreDoc.id,
                firebaseUid: req.user.uid,
                userName: finalUserName, 
                email, 
                firstName, 
                lastName,
                emailVerified: true
            }
        });

    } catch(err) {
        console.error('❌ Server error in registration:', err);
        res.status(500).json({ 
            message: "Server error. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = registerUser;