import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  userDepartment: string | null;
  setUserDepartment: (department: string | null) => void;
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
  const [userDepartment, setUserDepartment] = useState<string | null>(
    localStorage.getItem('userDepartment')
  );

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    userDepartment,
    setUserDepartment: (department: string | null) => {
      setUserDepartment(department);
      if (department) {
        localStorage.setItem('userDepartment', department);
      } else {
        localStorage.removeItem('userDepartment');
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
