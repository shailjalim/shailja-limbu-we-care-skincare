import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUser, isAuthenticated } from '../services/api';

const AdminRoute = ({ children }) => {
    const location = useLocation();
    const authenticated = isAuthenticated();
    const user = getUser();

    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminRoute;
