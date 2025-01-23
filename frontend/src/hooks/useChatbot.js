// src/hooks/useChatbot.js

import { useContext } from 'react';
import { ChatbotContext } from '../context/ChatbotContext'; // Adjust the path if necessary

const useChatbot = () => {
  const context = useContext(ChatbotContext);

  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }

  const {
    messages,          // Array of chat messages
    sendMessage,       // Function to send a message
    receiveMessage,    // Function to receive messages
    loading,           // Loading state for async actions
    error              // Error state for handling errors
  } = context;

  return {
    messages,
    sendMessage,
    receiveMessage,
    loading,
    error
  };
};

export default useChatbot;
