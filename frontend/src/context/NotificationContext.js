import React, { createContext, useState, useContext } from 'react';

export const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addNotification = (message, type = 'info') => {
    const newNotification = { message, type, id: Date.now() };
    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => removeNotification(newNotification.id), 3000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, isOpen, toggle }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;

