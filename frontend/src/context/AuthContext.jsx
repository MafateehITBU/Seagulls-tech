import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookie from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(Cookie.get('token') || null);
  const [position, setPosition] = useState(Cookie.get('position') || null);
  const [id, setId] = useState(Cookie.get('id') || null);

  const login = (newToken, newPosition, newId) => {
    setToken(newToken);
    setPosition(newPosition);
    setId(newId);
    
    // Set cookies with expiration
    Cookie.set('token', newToken, { expires: 1 }); // 1 day
    Cookie.set('position', newPosition, { expires: 1 });
    Cookie.set('id', newId, { expires: 1 });
  };

  const logout = () => {
    setToken(null);
    setPosition(null);
    setId(null);
    
    // Remove cookies
    Cookie.remove('token');
    Cookie.remove('position');
    Cookie.remove('id');
  };

  return (
    <AuthContext.Provider value={{ token, position, id, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 