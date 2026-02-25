// FullRegistration.tsx
import { useAuth } from "./context/useAuth";
import Register from "./Register";
import { ConfirmationEmail } from "./ConfirmationEmail";
import ConfirmationSuccessful from "./ConfirmationSuccessful";
import { useEffect } from "react";


// Add this temporarily in your FullRegistration.tsx or wherever appropriate
const DebugData = () => {
    const { formData, step } = useAuth();
    
    useEffect(() => {
        console.log('🔍 DEBUG - Current step:', step);
        console.log('🔍 DEBUG - Form data:', formData);
        console.log('🔍 DEBUG - LocalStorage:', localStorage.getItem('registrationFormData'));
    }, [step, formData]);
    
    return null; // This component doesn't render anything
};

// Add it to your FullRegistration component
export const FullRegistration = () => {
    const { step } = useAuth(); 
    
    return (
        <>
            <DebugData />
            {step === "Register" && <Register />}
            {step === "verify-email" && <ConfirmationEmail />}   
            {step === "email-successful" && <ConfirmationSuccessful />}
        </>
    );
};