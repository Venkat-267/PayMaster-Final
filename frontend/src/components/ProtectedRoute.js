import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({children, requiredRole}) => {
    const {isAuthenticated, getUserRole} = useAuth();

    if(!isAuthenticated()){
        return <Navigate to="/login" replace />
    }

    if(requiredRole!==undefined){
        const userRole = getUserRole();
        if(userRole!==requiredRole){
            return <Navigate to="/dashboard\" replace />
        }
    }
    return children;
};

export default ProtectedRoute;