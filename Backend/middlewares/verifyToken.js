const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
    try {
        console.log('=== Token Verification Started ===');
        console.log('Admin object exists:', !!admin);
        console.log('Admin.auth exists:', !!admin.auth);

        const authHeader = req.headers.authorization;
        console.log('Auth header present:', !!authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No token provided or invalid format');
            return res.status(401).json({ 
                message: 'No token provided or invalid format',
                code: 'NO_TOKEN'
            });
        }

        const token = authHeader.split('Bearer ')[1];
        console.log('Token extracted, length:', token.length);

        try {
            // Verify the token
            const decodedToken = await admin.auth().verifyIdToken(token);
            console.log('✅ Token verified successfully for user:', decodedToken.email);
            console.log('Email verified:', decodedToken.email_verified);

            // Check if email is verified
            if (!decodedToken.email_verified) {
                console.log('❌ Email not verified for:', decodedToken.email);
                return res.status(403).json({ 
                    message: 'Email not verified. Please verify your email before proceeding.',
                    code: 'EMAIL_NOT_VERIFIED',
                    email: decodedToken.email
                });
            }

            console.log('✅ Email verified, proceeding with request');
            
            // Add user info to request
            req.user = decodedToken;
            req.userId = decodedToken.uid;
            req.email = decodedToken.email;
            
            next();
            
        } catch (verifyError) {
            console.error('❌ Token verification failed:', verifyError.message);
            
            if (verifyError.code === 'auth/id-token-expired') {
                return res.status(401).json({ 
                    message: 'Token has expired. Please login again.',
                    code: 'TOKEN_EXPIRED'
                });
            }
            
            if (verifyError.code === 'auth/argument-error') {
                return res.status(401).json({ 
                    message: 'Invalid token format.',
                    code: 'INVALID_TOKEN_FORMAT'
                });
            }
            
            return res.status(401).json({ 
                message: 'Invalid token.',
                code: 'INVALID_TOKEN',
                error: verifyError.message 
            });
        }
        
    } catch (error) {
        console.error('❌ Unexpected error in token verification:', error);
        return res.status(500).json({ 
            message: 'Internal server error during token verification.',
            code: 'SERVER_ERROR'
        });
    }
};

module.exports = verifyToken;