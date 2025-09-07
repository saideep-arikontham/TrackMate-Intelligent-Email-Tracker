import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL || '';

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('trackmate_token');
    const storedUser = localStorage.getItem('trackmate_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async () => {
    // Start OAuth by asking backend for the Google auth URL, then redirect
    const res = await fetch(`${API}/api/auth/google/url`);
    if (!res.ok) throw new Error('Failed to get auth URL');
    const data = await res.json();
    window.location.href = data.authUrl;
  };

  // Handle backend redirect: /auth/callback#token=...
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#token=')) {
      const tok = new URLSearchParams(hash.slice(1)).get('token');
      if (tok) {
        setToken(tok);
        localStorage.setItem('trackmate_token', tok);
        // Fetch user profile
        fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${tok}` } })
          .then(r => r.json())
          .then(u => {
            setUser(u);
            localStorage.setItem('trackmate_user', JSON.stringify(u));
            setIsAuthenticated(true);
          })
          .catch(() => {})
          .finally(() => {
            // Clean the URL to the app root
            window.history.replaceState({}, document.title, '/');
          });
      }
    }
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('trackmate_token');
    localStorage.removeItem('trackmate_user');
  };

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
