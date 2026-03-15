// Login.tsx - Complete with left side preserved
import React, { useState } from 'react';
import TaskFlowLogo from '../assets/images/TaskFlowLogo-removebg-preview.png';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebaseConfig'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState<string>('');
    const [rememberMe, setRememberMe] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
        });
    
    const navigate = useNavigate();

    const apiUrl = import.meta.env.VITE_API_URL

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    async function handleSubmitButton(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
        );

        const token = await userCredential.user.getIdToken();

        await axios.get(`${apiUrl}/api/protected`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // SUCCESS
        navigate('/');

    } catch (e: any) {
        setError(e.message || "Login failed");
    } finally {
        setIsLoading(false);
    }
}

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        // Navigate to forgot password page or show modal
        console.log('Forgot password clicked');
        // navigate('/forgot-password');
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
                    <div className="text-center text-white">
                        <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
                        <p className="text-lg opacity-90">Continue your productivity journey</p>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-md animate-slideUp">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8">
                        
                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm text-center">{error}</p>
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
                            <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
                            <p className="text-gray-600 text-sm mt-1">Sign in to continue</p>
                        </div>

                        {/* Desktop header */}
                        <div className="hidden lg:block mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Sign In
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                Welcome back! Please enter your details
                            </p>
                        </div>
                        
                        <form className="space-y-5">
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
                                    value={formData.email}
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
                                        value={formData.password}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6747ce] transition-colors duration-200"
                                    >
                                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-[#6747ce] border-gray-300 rounded focus:ring-[#6747ce] focus:ring-2 cursor-pointer"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                                        Remember me
                                    </span>
                                </label>
                                <button
                                    onClick={handleForgotPassword}
                                    className="text-sm text-[#6747ce] hover:text-[#8b6fe0] font-medium transition-colors duration-200 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Login Button */}
                            <button
                                className="relative w-full bg-gradient-to-r from-[#6747ce] to-[#8b6fe0] text-white font-bold py-4 px-6 rounded-lg focus:outline-none transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                type="button"
                                onClick={handleSubmitButton}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                            {/* Demo Credentials (Optional - for testing) */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-500 text-center mb-2">
                                    Demo Credentials (click to fill)
                                </p>
                                <div className="flex gap-2 justify-center text-xs">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({
                                                email: 'demo@taskflow.com',
                                                password: 'demo123'
                                            });
                                        }}
                                        className="px-3 py-1 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                                    >
                                        Demo User
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({
                                                email: 'test@example.com',
                                                password: 'password123'
                                            });
                                        }}
                                        className="px-3 py-1 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                                    >
                                        Test User
                                    </button>
                                </div>
                            </div>

                            {/* Register Link */}
                            <div className="text-center pt-4">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <a 
                                        href="/register" 
                                        className="text-[#6747ce] font-medium hover:text-[#8b6fe0] transition-colors duration-200 hover:underline"
                                    >
                                        Create an account
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
    
export default Login;