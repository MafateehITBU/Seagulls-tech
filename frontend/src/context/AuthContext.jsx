import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookie from 'js-cookie';
import axiosInstance from '../axiosConfig';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    position: null,
    name: null,
    email: null,
    photo: null,
    phone: null,
    bio: null
  });
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId, position) => {
    try {
      const token = Cookie.get('token');
      if (!token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const endpoint = position === 'admin' || position === 'superadmin' 
        ? `/admin/${userId}`
        : `/tech/${userId}`;

      const response = await axiosInstance.get(endpoint, config);

      if (!response.data) return;

      setUser({
        id: response.data._id || userId,
        position: position,
        name: response.data.name || '',
        email: response.data.email || '',
        photo: response.data.photo || '',
        phone: response.data.phone || '',
        bio: response.data.bio || ''
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const token = Cookie.get('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const { id, position } = decoded;

          setUser(prev => ({
            ...prev,
            id,
            position
          }));

          await fetchUserData(id, position);

        } catch (error) {
          console.error('Error initializing user:', error);
          Cookie.remove('token');
        }
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/admin/signin", {
        email,
        password,
      });
      
      Cookie.set("token", response.data.token, { expires: 1 });
      
      const decoded = jwtDecode(response.data.token);
      const { id, position } = decoded;

      setUser(prev => ({
        ...prev,
        id,
        position
      }));

      await fetchUserData(id, position);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookie.remove('token');
    setUser({
      id: null,
      position: null,
      name: null,
      email: null,
      photo: null,
      phone: null,
      bio: null
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user?.id
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