import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'department_admin';
  department: {
    id: string;
    name: string;
    facultyId: string;
    institution: string;
  };
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUser: User = {
  id: 'usr_001',
  name: 'Dr. Rajesh Kumar',
  email: 'rajesh.kumar@university.edu',
  role: 'department_admin',
  department: {
    id: 'dept_cse',
    name: 'Computer Science & Engineering',
    facultyId: 'FAC-CSE-2024',
    institution: 'Geethanjali College of Engineering and Technology',
  },
  phone: '+91 98765 43210',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to the mock user during development to make pages render with sample data
  const [user, setUser] = useState<User | null>(mockUser);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    if (email && password) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(mockUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
