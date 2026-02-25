// context/AuthContext.tsx
import { createContext } from "react";

export type SignupStep = "Register" | "verify-email" | "email-successful" | "Dashboard";

export type AuthFormData = {    
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    verified: boolean,
    username: string,  // Make this required, not optional
    userName?: string  // Optional for backward compatibility
}

export type signUpContextType = {
    step: SignupStep,
    setStep: (step: SignupStep) => void;
    formData: AuthFormData,
    setFormData: React.Dispatch<React.SetStateAction<AuthFormData>>
} 

export const AuthContext = createContext<signUpContextType | null>(null);