import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  userProfile: string | null;
  setUserProfile: (profile: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<string | null>(
    localStorage.getItem('userProfile')
  );

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    userProfile,
    setUserProfile: (profile: string | null) => {
      setUserProfile(profile);
      if (profile) {
        localStorage.setItem('userProfile', profile);
      } else {
        localStorage.removeItem('userProfile');
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
