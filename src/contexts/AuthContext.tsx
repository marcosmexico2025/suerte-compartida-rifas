
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUsers: () => Promise<void>;
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

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*');

      if (error) {
        console.error('Error fetching user profiles:', error);
        return [];
      }

      // Get auth users to get email addresses
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        return [];
      }

      // Ensure authUsers.users exists and is an array
      if (!authUsers || !authUsers.users) {
        console.error('Auth users data is not in expected format:', authUsers);
        return [];
      }

      // Combine profile and auth info
      const combinedUsers = profiles.map(profile => {
        const authUser = authUsers.users && Array.isArray(authUsers.users) 
          ? authUsers.users.find(user => user.id === profile.id)
          : null;
        
        return {
          id: profile.id,
          name: profile.name,
          email: authUser?.email || 'No email',
          color: profile.color,
          role: profile.role as 'admin' | 'operator'
        };
      });

      return combinedUsers;
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      return [];
    }
  };

  // Load users on initial load
  const refreshUsers = async () => {
    const usersList = await fetchUsers();
    setUsers(usersList);
  };

  // Check if user is already logged in
  useEffect(() => {
    const loadInitialData = async () => {
      // Check if user session exists
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profile) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile.name,
            color: profile.color,
            role: profile.role as 'admin' | 'operator'
          });
        }
      }
      
      // Load users
      await refreshUsers();
      
      setIsLoading(false);
    };

    loadInitialData();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profile) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile.name,
            color: profile.color,
            role: profile.role as 'admin' | 'operator'
          });
        }
        
        await refreshUsers();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
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

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profileError && profile) {
          setCurrentUser({
            id: data.user.id,
            email: data.user.email || '',
            name: profile.name,
            color: profile.color,
            role: profile.role as 'admin' | 'operator'
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, isLoading, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
};
