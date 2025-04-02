
import React from 'react';
import { useRaffle } from '@/contexts/RaffleContext';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const RaffleHeader = () => {
  const { settings } = useRaffle();
  const { currentUser } = useAuth();

  return (
    <div className="relative w-full bg-gray-50 py-6 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={settings.image_url} 
              alt={settings.title}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{settings.title}</h1>
              <p className="text-sm text-gray-600">
                Precio por número: ${settings.price_per_number.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div>
            {currentUser ? (
              <Link to="/dashboard">
                <Button variant="default">
                  Panel de Control
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="default">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleHeader;
