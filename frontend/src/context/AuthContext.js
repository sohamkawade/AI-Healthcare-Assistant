import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context for the Auth state
export const AuthContext = createContext();

// Custom hook to use the Auth context in components
export const useAuth = () => {
  const context = useContext(AuthContext);

  // If the context is not available, throw an error
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// The AuthProvider component, which will wrap the rest of the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggle, setToggle] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Save notifications to localStorage
  const saveNotifications = (notifications) => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  // Load notifications and filter those within 1 day
  const loadNotifications = () => {
    const storedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;

    return storedNotifications.filter((notification) => {
      const notificationTime = new Date(notification.timestamp).getTime();
      return notificationTime >= oneDayAgo;
    });
  };

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = { ...notification, timestamp: new Date() };
    const updatedNotifications = [...notifications, newNotification];

    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const loadedNotifications = loadNotifications();

      if (storedToken) setToken(storedToken);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set role based on userType from login response
        setRole(parsedUser.userType || (parsedUser.specialization ? 'doctor' : 'patient'));
      }
      setNotifications(loadedNotifications);
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      // Set role based on userType or specialization
      const userRole = user.userType || (user.specialization ? 'doctor' : 'patient');
      localStorage.setItem('role', userRole);
      setRole(userRole);
    }
    if (doctorData) localStorage.setItem('doctorData', JSON.stringify(doctorData));
  }, [token, user, doctorData]);

  // Log out function to reset the state and clear localStorage
  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    setDoctorData(null);
    setNotifications([]);
    localStorage.clear();
  };

  // Register a new user
  const registerUser = (userData) => {
    setUser(userData);
    setToken(userData.token);
    setRole(userData.role || '');
  };

  // Register a new doctor
  const registerDoctor = (doctorData) => {
    setDoctorData(doctorData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        logout,
        role,
        setRole,
        loading,
        registerUser,
        registerDoctor,
        setDoctorData,
        doctorData,
        toggle,
        setToggle,
        notifications,
        addNotification,
        clearNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
