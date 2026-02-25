import { AuthContext } from "./AuthContext";
import { useContext } from "react";

export const useAuth = () => {
    const context = useContext(AuthContext);

    if ( !context ) throw new Error("useAuth must be inside authProvider")

    return context;
}