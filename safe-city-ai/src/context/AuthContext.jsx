import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Login failed');
      
      return data; // needs_mfa or needs_otp
    } catch (err) {
      throw err;
    }
  };

  const verifySecurity = async (verificationData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/verify-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Verification failed');

      const userData = { email: verificationData.email, role: data.role, token: data.token };
      setUser(userData);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, verifySecurity, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
