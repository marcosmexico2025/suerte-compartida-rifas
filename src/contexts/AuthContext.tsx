
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

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
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load users from Supabase
  const loadUsers = async () => {
    try {
      const { data: userProfiles, error } = await supabase
        .from('user_profiles')
        .select('*');

      if (error) {
        console.error('Error fetching user profiles:', error);
        return [];
      }

      return userProfiles.map((profile): User => ({
        id: profile.id,
        email: '', // Email is not stored in the profiles table for security
        name: profile.name,
        color: profile.color || '#6B7280',
        role: profile.role as 'admin' | 'operator'
      }));
    } catch (error) {
      console.error('Error in loadUsers:', error);
      return [];
    }
  };

  // Check if user is already logged in and load all users
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user profile data
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile.name,
              color: profile.color,
              role: profile.role as 'admin' | 'operator'
            };
            setCurrentUser(userData);
          }
        }

        // Load all users
        const allUsers = await loadUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile.name,
              color: profile.color,
              role: profile.role as 'admin' | 'operator'
            };
            setCurrentUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      // User profile will be set via the onAuthStateChange listener
      return !!data.session;
    } catch (error) {
      console.error('Unexpected login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
