// context/AuthProvider.tsx
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthFormData, SignupStep } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<SignupStep>(() => {
    // Try to get saved step from localStorage
    const savedStep = localStorage.getItem('registrationStep');
    return (savedStep as SignupStep) || "Register";
  });

  const [formData, setFormData] = useState<AuthFormData>(() => {
    // Try to get saved form data from localStorage
    const savedData = localStorage.getItem('registrationFormData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
    // Default values
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      verified: false,
      username: ""
    };
  });

  // Save to localStorage whenever formData or step changes
  useEffect(() => {
    localStorage.setItem('registrationFormData', JSON.stringify(formData));
    console.log('Saved form data to localStorage:', formData);
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('registrationStep', step);
    console.log('Saved step to localStorage:', step);
  }, [step]);

  // Log form data changes
  useEffect(() => {
    console.log('AuthProvider - Form data updated:', formData);
  }, [formData]);

  useEffect(() => {
    console.log('AuthProvider - Step updated:', step);
  }, [step]);

  return (
    <AuthContext.Provider value={{ step, setStep, formData, setFormData }}>
      {children}
    </AuthContext.Provider>
  );
}