import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiCheckCircle, FiArrowRight, FiLogIn, FiStar, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebaseConfig';
import { useAuth } from './context/useAuth';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';

export const ConfirmationSuccessful = () => {
    const [countdown, setCountdown] = useState(5);
    const [showConfetti, setShowConfetti] = useState(false);
    const [apiError, setApiError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();
    const { formData } = useAuth();
    const hasRegisteredRef = useRef(false);
    const apiCallInProgressRef = useRef(false);

    // ConfirmationSuccessful.tsx
 // Handle registration only after verification
    // ConfirmationSuccessful.tsx - Updated registerUser function
// In ConfirmationSuccessful.tsx - Update the registerUser function
// In ConfirmationSuccessful.tsx - Complete registerUser function with the addition
const registerUser = useCallback(async (user: any) => {
    if (apiCallInProgressRef.current || hasRegisteredRef.current) return;
    
    try {
        apiCallInProgressRef.current = true;
        
        // Double-check verification
        if (!user.emailVerified) {
            throw new Error('Email not verified yet');
        }
        
        const token = await user.getIdToken(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        
        // Get the latest form data from context
        console.log('Current form data from context:', formData);
        
        // Also check localStorage directly as a backup
        const savedData = localStorage.getItem('registrationFormData');
        console.log('Saved data from localStorage:', savedData);
        
        let userData;
        
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                userData = {
                    email: parsedData.email,
                    firstName: parsedData.firstName,
                    lastName: parsedData.lastName,
                    userName: parsedData.username || parsedData.userName,
                };
            } catch (e) {
                console.error('Failed to parse saved data', e);
            }
        }
        
        // If we couldn't get data from localStorage, use formData from context
        if (!userData || !userData.email) {
            userData = {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                userName: formData.username || formData.userName,
            };
        }
        
        console.log('Final user data to send:', userData);
        
        // Validate all fields are present
        if (!userData.email || !userData.firstName || !userData.lastName || !userData.userName) {
            throw new Error(`Missing required fields: ${JSON.stringify({
                email: !!userData.email,
                firstName: !!userData.firstName,
                lastName: !!userData.lastName,
                userName: !!userData.userName
            })}`);
        }
        
        const response = await axios.post(`${apiUrl}/api/auth/register-user`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000,
        });
        
        console.log('Registration successful:', response.data);
        hasRegisteredRef.current = true;
        setApiError("");
        
        // 🔴 ADD THE LOCALSTORAGE CLEARING RIGHT HERE 🔴
        // Clear localStorage after successful registration
        localStorage.removeItem('registrationFormData');
        localStorage.removeItem('registrationStep');
        console.log('✅ Cleared registration data from localStorage');
        
        // You might also want to clear the password from memory for security
        // But keep the user logged in or redirect as needed
        
    } catch (err: any) {
        console.error("Registration error details:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            data: err.response?.data
        });
        
        if (err.message !== 'Email not verified yet') {
            setApiError(err.response?.data?.message || err.message || 'Failed to register user');
        }
    } finally {
        apiCallInProgressRef.current = false;
    }
}, [formData]);

    // Handle auth state changes
      useEffect(() => {
        let mounted = true;
        let checkCount = 0;
        const maxChecks = 30; // Check for 30 seconds max
        
        const checkVerification = setInterval(async () => {
            if (!mounted || checkCount >= maxChecks) {
                clearInterval(checkVerification);
                return;
            }
            
            const user = auth.currentUser;
            if (user) {
                await user.reload(); // Reload user to get latest emailVerified status
                if (user.emailVerified) {
                    clearInterval(checkVerification);
                    console.log('Email verified, proceeding with registration...');
                    await registerUser(user);
                }
            }
            checkCount++;
        }, 1000); // Check every second
        
        return () => {
            mounted = false;
            clearInterval(checkVerification);
        };
    }, [registerUser]);

    // Handle countdown and redirect
    useEffect(() => {
        setShowConfetti(true);
        
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Use setTimeout to avoid state update during render
                    setTimeout(() => {
                        navigate('/login');
                    }, 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleManualRedirect = useCallback(() => {
        navigate('/login');
    }, [navigate]);

    const handleRetry = useCallback(async () => {
        setApiError("");
        hasRegisteredRef.current = false;
        apiCallInProgressRef.current = false;
        
        const user = auth.currentUser;
        if (user) {
            await registerUser(user);
        }
    }, [registerUser]);

    // Don't show error for 401 in development
    const shouldShowError = apiError && !apiError.includes('Unauthorized');

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#6747ce] to-[#8b6fe0] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient orbs */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-pulse delay-500"></div>
                
                {/* Floating stars */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-white/10"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `float ${8 + i * 2}s ease-in-out infinite`,
                            animationDelay: `${i * 0.5}s`,
                            fontSize: `${2 + i}rem`,
                            transform: `rotate(${Math.random() * 360}deg)`
                        }}
                    >
                        <FiStar />
                    </div>
                ))}
            </div>

            {/* Confetti Animation */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                animation: `confetti ${3 + Math.random() * 4}s ease-in forwards`,
                                animationDelay: `${Math.random() * 0.5}s`,
                                transform: `rotate(${Math.random() * 360}deg)`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md">
                {/* Success Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl">
                    
                    {/* Show API Error if any (excluding 401) */}
                    {shouldShowError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm mb-2">{apiError}</p>
                            <button
                                onClick={handleRetry}
                                className="text-[#6747ce] text-sm font-medium hover:underline"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Success Animation */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            {/* Pulsing rings */}
                            <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping"></div>
                            <div className="absolute inset-0 bg-green-500 rounded-full opacity-30 animate-pulse delay-300"></div>
                            
                            {/* Main success icon */}
                            <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-full shadow-xl transform transition-all duration-500 hover:scale-110 hover:rotate-3">
                                <FiCheckCircle className="text-white text-6xl animate-success-check" />
                            </div>
                        </div>
                    </div>

                    {/* Success Title */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-3">
                        Email Verified!
                    </h1>

                    {/* Success Message */}
                    <div className="text-center mb-6">
                        <p className="text-gray-600 text-lg mb-2">
                            Your email has been successfully verified.
                        </p>
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                            <FiZap className="text-green-500" />
                            <span className="text-sm font-medium">Account activated</span>
                        </div>
                    </div>

                    {/* Features/Benefits */}
                    <div className="bg-gradient-to-r from-[#6747ce]/5 to-[#8b6fe0]/5 rounded-xl p-6 mb-8">
                        <h3 className="font-semibold text-gray-700 mb-4 text-center">
                            What you can do now:
                        </h3>
                        <div className="space-y-3">
                            {[
                                'Access all task management features',
                                'Create and organize projects',
                                'Collaborate with team members',
                                'Track your productivity'
                            ].map((feature, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center gap-3 text-gray-600"
                                >
                                    <div className="w-1.5 h-1.5 bg-[#6747ce] rounded-full animate-pulse"></div>
                                    <span className="text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Redirect Info */}
                    <div className="text-center mb-6">
                        <p className="text-gray-500 mb-2">
                            Redirecting to login in...
                        </p>
                        <div className="flex justify-center items-center gap-2">
                            <div className="relative w-16 h-16">
                                {/* Circular countdown */}
                                <svg className="w-16 h-16 transform -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        className="text-gray-200"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={2 * Math.PI * 28}
                                        strokeDashoffset={2 * Math.PI * 28 * (1 - countdown / 5)}
                                        className="text-[#6747ce] transition-all duration-1000"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#6747ce]">
                                    {countdown}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {/* Login Now Button */}
                        <button
                            onClick={handleManualRedirect}
                            className="w-full bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white font-semibold py-4 px-6 rounded-xl 
                                transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            <FiLogIn className="group-hover:-translate-y-0.5 transition-transform duration-300" />
                            Login Now
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                        </button>

                        {/* Browse as Guest Link */}
                        <div className="text-center">
                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-500 hover:text-[#6747ce] text-sm transition-colors duration-200 hover:underline"
                            >
                                Continue as guest for now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="text-center mt-8 space-y-2">
                    <p className="text-white/80 text-sm animate-pulse">
                        ✨ Your account is now ready to use ✨
                    </p>
                    <p className="text-white/60 text-xs">
                        Thank you for verifying your email address
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationSuccessful;