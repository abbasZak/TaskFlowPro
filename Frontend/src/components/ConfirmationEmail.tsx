import React, { useState, useEffect } from 'react';
import { FiMail, FiArrowLeft, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebaseConfig';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from './context/useAuth';

export const ConfirmationEmail = () => {
    const [email, setEmail] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    const { setStep } = useAuth();

    useEffect(() => {
        // Get the user's email from auth
        const user = auth.currentUser;
        if (user?.email) {
            setEmail(user.email);
        }

        // Animate elements on mount
        const timer = window.setTimeout(() => {
            document.querySelectorAll('.animate-on-mount').forEach(el => {
                el.classList.add('opacity-100', 'translate-y-0');
            });
        }, 100);

        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (countdown > 0) {
            interval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else {
            setResendDisabled(false);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [countdown]);

    const handleResendEmail = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                setResendDisabled(true);
                setCountdown(60); // 60 seconds cooldown
                
                await sendEmailVerification(user, {
                    url: `${window.location.origin}/verify-success`,
                    handleCodeInApp: true
                });
                
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Error resending verification email:', error);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#6747ce] to-[#8b6fe0] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-pulse delay-500"></div>
                
                {/* Floating envelopes animation */}
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-white/5"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `float ${10 + i * 2}s linear infinite`,
                            animationDelay: `${i * 2}s`,
                            transform: 'rotate(15deg)',
                            fontSize: `${3 + i}rem`
                        }}
                    >
                        ✉️
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md">
                {/* Success Toast */}
                {showSuccess && (
                    <div className="absolute -top-20 left-0 right-0 mx-auto w-fit animate-slideDown">
                        <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                            <FiCheckCircle className="text-white" />
                            <span>Verification email sent successfully!</span>
                        </div>
                    </div>
                )}

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl">
                    
                    {/* Animated Icon Container */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            {/* Pulsing rings */}
                            <div className="absolute inset-0 bg-[#6747ce] rounded-full opacity-20 animate-ping"></div>
                            <div className="absolute inset-0 bg-[#6747ce] rounded-full opacity-30 animate-pulse delay-300"></div>
                            
                            {/* Main icon */}
                            <div className="relative bg-gradient-to-br from-[#6747ce] to-[#8b6fe0] p-6 rounded-full shadow-xl transform transition-transform duration-500 hover:rotate-12">
                                <FiMail className="text-white text-5xl animate-float" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-3 animate-on-mount opacity-0 translate-y-4 transition-all duration-700">
                        Check Your Email
                    </h1>

                    {/* Description */}
                    <div className="text-center mb-8 animate-on-mount opacity-0 translate-y-4 transition-all duration-700 delay-200">
                        <p className="text-gray-600 mb-2">
                            We've sent a verification link to:
                        </p>
                        <p className="text-[#6747ce] font-semibold text-lg bg-[#6747ce]/5 py-2 px-4 rounded-lg inline-block break-all">
                            {email || 'your email address'}
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8 animate-on-mount opacity-0 translate-y-4 transition-all duration-700 delay-400">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-[#6747ce] text-white rounded-full flex items-center justify-center text-sm shrink-0">1</span>
                            <span>Open your email inbox</span>
                        </h3>
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-[#6747ce] text-white rounded-full flex items-center justify-center text-sm shrink-0">2</span>
                            <span>Click on the verification link</span>
                        </h3>
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <span className="w-6 h-6 bg-[#6747ce] text-white rounded-full flex items-center justify-center text-sm shrink-0">3</span>
                            <span>Return to login and sign in</span>
                        </h3>
                        
                        {/* Tip box */}
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <span className="font-semibold">💡 Tip:</span> Don't forget to check your spam folder if you don't see the email in your inbox.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 animate-on-mount opacity-0 translate-y-4 transition-all duration-700 delay-600">
                        {/* Resend Button */}
                        <button
                            onClick={handleResendEmail}
                            disabled={resendDisabled}
                            className={`w-full bg-white border-2 border-[#6747ce] text-[#6747ce] font-semibold py-4 px-6 rounded-xl 
                                transition-all duration-300 flex items-center justify-center gap-2 group
                                ${resendDisabled 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-[#6747ce] hover:text-white hover:scale-105 hover:shadow-xl active:scale-95'
                                }`}
                        >
                            <FiRefreshCw className={`group-hover:rotate-180 transition-transform duration-500 ${resendDisabled ? 'animate-spin' : ''}`} />
                            {resendDisabled 
                                ? `Resend available in ${countdown}s` 
                                : 'Resend Verification Email'
                            }
                        </button>

                        {/* Back to Login Button */}
                        <button
                            onClick={handleBackToLogin}
                            className="w-full bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white font-semibold py-4 px-6 rounded-xl 
                                transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                            Back to Login
                        </button>
                    </div>

                    {/* Email not received help */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>
                            Didn't receive the email?{' '}
                            <button 
                                onClick={handleResendEmail}
                                disabled={resendDisabled}
                                className="text-[#6747ce] hover:text-[#8b6fe0] font-medium hover:underline focus:outline-none disabled:opacity-50 disabled:hover:no-underline"
                            >
                                Click to resend
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-white/80 text-sm mt-8">
                    The verification link will expire in 24 hours
                </p>
            </div>
        </div>
    );
};

// Add these animations to your global CSS file (e.g., index.css or App.css)
/*
@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(15deg); }
    50% { transform: translateY(-20px) rotate(15deg); }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

.animate-slideDown {
    animation: slideDown 0.5s ease-out forwards;
}

.delay-200 {
    transition-delay: 200ms;
}

.delay-400 {
    transition-delay: 400ms;
}

.delay-600 {
    transition-delay: 600ms;
}

.animate-on-mount {
    transition-property: opacity, transform;
}
*/

export default ConfirmationEmail;