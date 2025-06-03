// src/components/Notification.jsx
import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const Notification = () => {
  const { notifications } = useContext(NotificationContext);

  return (
    <div className="fixed top-0 right-0 mt-4 mr-4 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-blue-500 text-white p-2 rounded mb-2 transition duration-300"
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default Notification;
