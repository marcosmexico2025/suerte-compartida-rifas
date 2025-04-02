
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Home } from 'lucide-react';

const DashboardHeader = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="bg-white border-b py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Panel de Control</h1>
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentUser?.color || '#6B7280' }}
          ></div>
          <span>{currentUser?.name} ({currentUser?.role})</span>
        </div>
        
        <div className="flex space-x-2">
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home size={16} className="mr-1" />
              Inicio
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={16} className="mr-1" />
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
