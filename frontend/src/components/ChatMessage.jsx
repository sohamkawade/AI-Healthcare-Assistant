import React from 'react';

const ChatMessage = ({ message }) => {
  return (
    <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          message.isBot
            ? 'bg-gray-100 text-gray-800'
            : 'bg-indigo-600 text-white'
        } animate-fade-in`}
      >
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;
