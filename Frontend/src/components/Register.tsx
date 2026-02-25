// Register.tsx - Complete with left side preserved
import React, { useState, useEffect } from 'react';
import TaskFlowLogo from '../assets/images/TaskFlowLogo-removebg-preview.png';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { auth } from '../config/firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useAuth } from './context/useAuth';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [error, setError] = useState<string>('');
    
    const { formData, setFormData, setStep } = useAuth();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    // Initialize form data safely
    useEffect(() => {
        // Only set if formData is empty or undefined
        if (!formData.firstName && !formData.lastName && !formData.email) {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                verified: false,
                username: ''
            });
        }
    }, []);

    // Calculate password strength
    useEffect(() => {
        const password = formData?.password || '';
        let strength = 0;
        
        if (password.length > 6) strength += 25;
        if (password.length > 10) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9!@#$%^&*]/.test(password)) strength += 25;
        
        setPasswordStrength(strength);
    }, [formData?.password]);

    // Safe getter for form values with fallback to empty string
    const getFieldValue = (field: keyof typeof formData): string => {
        return (formData[field] as string) || '';
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    // In Register.tsx - Update the handleSubmitButton function
async function handleSubmitButton(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Safe validation with optional chaining
    if (!formData?.email || !formData?.password || !formData?.firstName || !formData?.lastName || !formData?.username) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
    }

    // Validate password length
    if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
    }

    try {
        const { email, password } = formData;

        // Create auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user, {
            url: `${window.location.origin}/verify-success`,
            handleCodeInApp: true
        });

        // IMPORTANT: Create a copy of the form data and save it
        const dataToSave = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password, // You might want to clear this for security
            verified: false,
            username: formData.username
        };

        console.log('Saving form data before navigation:', dataToSave);
        
        // Update form data
        setFormData(dataToSave);

        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
            setStep("verify-email");
        }, 100);

    } catch (err: any) {
        console.error('Registration error:', err);
        // Handle specific Firebase errors
        switch (err.code) {
            case 'auth/email-already-in-use':
                setError('This email is already registered. Please login instead.');
                break;
            case 'auth/invalid-email':
                setError('Please enter a valid email address.');
                break;
            case 'auth/weak-password':
                setError('Password should be at least 6 characters.');
                break;
            default:
                setError(`An error occurred: ${err.message || 'Please try again.'}`);
        }
    } finally {
        setIsLoading(false);
    }
}

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 25) return 'bg-red-500';
        if (passwordStrength <= 50) return 'bg-orange-500';
        if (passwordStrength <= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-[#6747ce] to-[#8b6fe0] overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Left side - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-8 animate-fadeIn">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-xl animate-ping"></div>
                        <div className="relative bg-white/10 backdrop-blur-lg rounded-full p-8 mb-6 animate-float">
                            <img 
                                src={TaskFlowLogo} 
                                alt="TaskFlow Logo" 
                                className="w-64 h-auto relative z-10 drop-shadow-2xl" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-md animate-slideUp">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8">
                        
                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm text-center">{error}</p>
                                {error.includes('not enabled') && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-yellow-700 text-xs">
                                            <strong>Quick fix:</strong> Go to Firebase Console → Authentication → Sign-in method → Enable Email/Password
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile header */}
                        <div className="lg:hidden text-center mb-6">
                            <div className="flex justify-center mb-4">
                                <div className="bg-[#6747ce] p-3 rounded-full">
                                    <img 
                                        src={TaskFlowLogo} 
                                        alt="TaskFlow Logo" 
                                        className="w-12 h-12 object-contain" 
                                    />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                        </div>

                        {/* Desktop header */}
                        <h2 className="hidden lg:block text-2xl font-bold mb-6 text-gray-800">
                            Create an Account
                        </h2>
                        
                        <form className="space-y-4">
                            {/* Username Field */}
                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-medium" htmlFor="username">
                                    Username
                                </label>
                                <input
                                    className={`w-full py-3 px-4 text-gray-700 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                                        focusedField === 'username' 
                                            ? 'border-[#6747ce] ring-4 ring-[#6747ce]/20' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    id="username"
                                    type="text"
                                    placeholder="John_sam"
                                    value={getFieldValue('username')}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                />
                            </div>

                            {/* First Name Field */}
                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-medium" htmlFor="firstName">
                                    First Name
                                </label>
                                <input
                                    className={`w-full py-3 px-4 text-gray-700 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                                        focusedField === 'firstName' 
                                            ? 'border-[#6747ce] ring-4 ring-[#6747ce]/20' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    id="firstName"
                                    type="text"
                                    placeholder="John"
                                    value={getFieldValue('firstName')}
                                    onFocus={() => setFocusedField('firstName')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                />
                            </div>

                            {/* Last Name Field */}
                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-medium" htmlFor="lastName">
                                    Last Name
                                </label>
                                <input
                                    className={`w-full py-3 px-4 text-gray-700 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                                        focusedField === 'lastName' 
                                            ? 'border-[#6747ce] ring-4 ring-[#6747ce]/20' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    id="lastName"
                                    type="text"
                                    placeholder="Doe"
                                    value={getFieldValue('lastName')}
                                    onFocus={() => setFocusedField('lastName')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-medium" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    className={`w-full py-3 px-4 text-gray-700 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                                        focusedField === 'email' 
                                            ? 'border-[#6747ce] ring-4 ring-[#6747ce]/20' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={getFieldValue('email')}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                            
                            {/* Password Field */}
                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-medium" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        className={`w-full py-3 px-4 text-gray-700 border-2 rounded-lg transition-all duration-300 focus:outline-none pr-12 ${
                                            focusedField === 'password' 
                                                ? 'border-[#6747ce] ring-4 ring-[#6747ce]/20' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={getFieldValue('password')}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6747ce]"
                                    >
                                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                    </button>
                                </div>
                                
                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 h-1">
                                            <div className={`flex-1 h-full rounded-l transition-all duration-300 ${passwordStrength > 0 ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                                            <div className={`flex-1 h-full transition-all duration-300 ${passwordStrength > 25 ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                                            <div className={`flex-1 h-full transition-all duration-300 ${passwordStrength > 50 ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                                            <div className={`flex-1 h-full rounded-r transition-all duration-300 ${passwordStrength > 75 ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Register Button */}
                            <button
                                className="relative w-full bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white font-bold py-4 px-6 rounded-lg focus:outline-none transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                onClick={handleSubmitButton}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating Account...
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </button>

                            {/* Login Link */}
                            <div className="text-center pt-4">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <a 
                                        href="/login" 
                                        className="text-[#6747ce] font-medium hover:text-[#8b6fe0] transition-colors duration-200 hover:underline"
                                    >
                                        Sign in
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;