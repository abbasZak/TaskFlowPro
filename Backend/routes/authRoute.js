const express = require("express");
const router = express.Router();
const registerUser = require("../controllers/authController.js");
const verifyToken = require("../middlewares/verifyToken.js");
const { admin } = require('../config/firebase');

// Test endpoint to check verification status
router.get("/check-verification", verifyToken, (req, res) => {
    res.json({
        message: 'Token is valid and email is verified',
        user: {
            email: req.user.email,
            emailVerified: req.user.email_verified,
            uid: req.user.uid
        }
    });
});

// Public route to resend verification email
router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Get user by email
        const user = await admin.auth().getUserByEmail(email);
        
        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Generate email verification link
        const link = await admin.auth().generateEmailVerificationLink(email);
        
        // Here you would send the email via your email service
        // For now, just return the link (in production, send email)
        
        res.json({ 
            message: 'Verification email sent',
            verificationLink: link // Remove this in production
        });
        
    } catch (error) {
        console.error('Error resending verification:', error);
        
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(500).json({ message: 'Failed to resend verification email' });
    }
});

// Protected registration route (requires verified email)
router.post("/register-user", verifyToken, registerUser);

module.exports = router;