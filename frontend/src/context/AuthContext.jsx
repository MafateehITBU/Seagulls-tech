import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookie from 'js-cookie';
import axiosInstance from '../axiosConfig';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId) => {
    try {
      if (!userId) return;
      
      const position = user?.position;
      if (!position) return;

      const endpoint = position === 'tech' 
        ? `http://localhost:8000/api/tech/${userId}`
        : `http://localhost:8000/api/admin/${userId}`;
      
      const response = await axiosInstance.get(endpoint);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    }
  };

  useEffect(() => {
    const token = Cookie.get('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userInfo = {
          id: decoded.id,
          position: decoded.position
        };
        setUser(userInfo);
        fetchUserData(decoded.id);
      } catch (error) {
        console.error('Error decoding token:', error);
        Cookie.remove('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/admin/signin", {
        email,
        password,
      });
      
      Cookie.set("token", response.data.token, { expires: 1 });
      
      const decoded = jwtDecode(response.data.token);
      const userInfo = {
        id: decoded.id,
        position: decoded.position
      };
      setUser(userInfo);
      await fetchUserData(decoded.id);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    Cookie.remove('token');
    setUser(null);
    setUserData(null);
  };

  const value = {
    user,
    userData,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    fetchUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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