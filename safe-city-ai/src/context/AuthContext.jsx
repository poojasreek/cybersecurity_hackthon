import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email, password, role) => {
    // Simulated auth — replace with Firebase Auth in production
    const mockUsers = {
      police: { name: 'SI Rajesh Kumar', email: 'police@safecity.ai', role: 'police', badge: 'TN-4521' },
      citizen: { name: 'Poojasree', email: 'citizen@safecity.ai', role: 'citizen' },
      admin: { name: 'Admin Officer', email: 'admin@safecity.ai', role: 'admin' },
    };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const userData = mockUsers[role] || mockUsers.police;
          userData.role = role;
          setUser(userData);
          setIsAuthenticated(true);
          resolve(userData);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1200);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
