import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const newNotification = { message, type, id: Date.now() };
    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => removeNotification(newNotification.id), 3000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
