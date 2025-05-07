import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookie from 'js-cookie';
import axiosInstance from '../axiosConfig';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    position: null,
    name: null,
    email: null,
    photo: null,
    phone: null,
    bio: null,
  });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);  // New state for notifications

  const fetchUserData = async (userId, position) => {
    try {
      const token = Cookie.get('token');
      if (!token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const endpoint =
        position === 'admin' || position === 'superadmin'
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
        bio: response.data.bio || '',
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Check if there are any notifications in localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
    setNotifications(savedNotifications);

    const initializeUser = async () => {
      const token = Cookie.get('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const { id, position } = decoded;

        await fetchUserData(id, position); // to make sure user is fetched

        const socketInstance = io('http://localhost:8000');
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          console.log('Socket connected:', socketInstance.id);
          socketInstance.emit('register', { position, userId: id });
        });

        // Listen for new notifications from the server
        socketInstance.on('new-notification', (notification) => {
          // Ensure that the notification is valid and has a notifID
          if (notification.notifID && notification.title && notification.message) {
            setNotifications((prevNotifications) => {
              // Check if the notification already exists (based on notifID)
              const exists = prevNotifications.some(
                (notif) => notif.notifID === notification.notifID
              );

              // If it doesn't exist, add it
              if (!exists) {
                const updatedNotifications = [...prevNotifications, notification];
                localStorage.setItem('notifications', JSON.stringify(updatedNotifications)); // Save to localStorage
                return updatedNotifications;
              }

              // If it exists, return the previous notifications without adding the duplicate
              return prevNotifications;
            });

            // Play the notification sound when a new notification is received
            const notificationSound = new Audio('/notification.mp3');
            notificationSound.play();
          } else {
            console.log('Received invalid notification, ignoring...', notification);
          }
        });
      } catch (error) {
        console.error('Error initializing user:', error);
        Cookie.remove('token');
      } finally {
        setLoading(false); // only after everything's done
      }
    };

    initializeUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/admin/signin', {
        email,
        password,
      });

      Cookie.set('token', response.data.token, { expires: 1 });

      const decoded = jwtDecode(response.data.token);
      const { id, position } = decoded;

      await fetchUserData(id, position);

      const socketInstance = io('http://localhost:8000');
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        socketInstance.emit('register', { position, userId: id });
      });

      // Listen for new notifications from the server
      socketInstance.on('new-notification', (notification) => {
        // Ensure that the notification is valid and has a notifID
        if (notification.notifID && notification.title && notification.message) {
          setNotifications((prevNotifications) => {
            // Check if the notification already exists (based on notifID)
            const exists = prevNotifications.some(
              (notif) => notif.notifID === notification.notifID
            );

            // If it doesn't exist, add it
            if (!exists) {
              const updatedNotifications = [...prevNotifications, notification];
              localStorage.setItem('notifications', JSON.stringify(updatedNotifications)); // Save to localStorage
              return updatedNotifications;
            }

            // If it exists, return the previous notifications without adding the duplicate
            return prevNotifications;
          });

          // Play the notification sound when a new notification is received
          const notificationSound = new Audio('/notification.mp3');
          notificationSound.play();
        } else {
          console.log('Received invalid notification, ignoring...', notification);
        }
      });

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
      bio: null,
    });
    if (socket) {
      socket.disconnect();
      console.log('Socket disconnected on logout');
    }
  };

  const removeNotification = (notifID) => {
    // Remove the notification with the given notifID
    const updatedNotifications = notifications.filter((notif) => notif.notifID !== notifID);
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications)); // Update localStorage
  };

  const value = {
    user,
    loading,
    socket,
    notifications,
    login,
    logout,
    removeNotification,
    isAuthenticated: !!user?.id,
    updateUser: (newUserData) => {
      setUser((prev) => ({
        ...prev,
        ...newUserData,
      }));
    },
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