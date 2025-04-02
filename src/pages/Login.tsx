
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';

const Login = () => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }
  
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <LoginForm />
    </div>
  );
};

export default Login;
