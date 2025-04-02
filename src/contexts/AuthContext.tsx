
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';

// Initial test users (in a real application this would come from Supabase)
const initialUsers: User[] = [
  {
    id: '1',
    email: 'juanes_2006_2@hotmail.com',
    name: 'Admin',
    color: '#9b87f5',
    role: 'admin'
  },
  {
    id: '2',
    email: 'paboncamachomayra@gmail.com',
    name: 'Operator 1',
    color: '#0EA5E9',
    role: 'operator'
  },
  {
    id: '3',
    email: 'gerenciacomercial@jspsoluciones.online',
    name: 'Operator 2',
    color: '#F97316',
    role: 'operator'
  }
];

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would validate with Supabase
    // For now, we just check if the email exists in our initial users
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
