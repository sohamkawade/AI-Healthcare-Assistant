// src/context/ChatContext.js
import React, { createContext, useContext, useState } from 'react';

// Create the Chat Context
const ChatContext = createContext();

// Custom hook to use the Chat Context
export const useChat = () => {
  return useContext(ChatContext);
};

// Function to send messages to NLP service
const sendMessageToNLPService = async (message) => {
  const response = await fetch('YOUR_NLP_API_ENDPOINT', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY', // If required
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  return data.reply; // Adjust based on your API response structure
};

// Chat Provider Component
const ChatProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);

  // Function to add a chat message
  const addChatMessage = (message) => {
    setChatHistory((prev) => [...prev, message]);
  };

  // Function to clear the chat history
  const clearChatHistory = () => {
    setChatHistory([]);
  };

  return (
    <ChatContext.Provider value={{ chatHistory, setChatHistory, addChatMessage, clearChatHistory, sendMessageToNLPService }}>
      {children}
    </ChatContext.Provider>
  );
};

export { ChatProvider, sendMessageToNLPService }; // Exporting sendMessageToNLPService
