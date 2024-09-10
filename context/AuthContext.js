'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from cookies on initial load
    const storedUser = Cookies.get('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const authenticateUser = async (userData) => {
    setUser(userData);
    Cookies.set('userData', JSON.stringify(userData), { expires: 7 });
  };

  const unauthenticateUser = () => {
    setUser(null);
    Cookies.remove('userData');
  };

  const logout = useCallback(() => {
    setUser(null);
    window.location.href = '/logout';
  }, []);

  const value = {
    user,
    loading,
    authenticateUser,
    unauthenticateUser,
    logout, // Add this line
  };

  return (
    <AuthContext.Provider value={value}>
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