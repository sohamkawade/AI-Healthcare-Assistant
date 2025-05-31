import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addChatMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const value = {
    messages,
    isOpen,
    addChatMessage,
    toggleChat,
    clearChat,
    setToggle: toggleChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 