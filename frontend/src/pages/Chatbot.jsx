import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { sendMessageToNLPService } from "../context/ChatContext";
import { FaPaperPlane, FaTrash } from "react-icons/fa";
import BackButton from "../components/BackButton";

// Function to format the time as hh:mm AM/PM
const formatTime = () => {
  const hours = new Date().getHours();
  const minutes = new Date().getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  return `${formattedHours}:${formattedMinutes} ${period}`;
};

const Chatbot = () => {
  const { chatHistory, addChatMessage, clearChatHistory } = useChat();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Typing indicator
  const chatContainerRef = useRef(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (input.trim()) {
      // Send user message
      const userMessage = {
        sender: "user",
        text: input,
        timestamp: formatTime(),
      };
      addChatMessage(userMessage);
      setInput("");

      // Typing indicator
      setIsTyping(true);

      // Send message to NLP service and get bot response
      const reply = await sendMessageToNLPService(input);
      const botMessage = {
        sender: "bot",
        text: reply,
        timestamp: formatTime(),
      };
      addChatMessage(botMessage);

      // Stop typing indicator after bot response
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    clearChatHistory(); // Clears the chat history from context
  };

  useEffect(() => {
    // Auto scroll to the bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      {/* Back Button */}
      <BackButton />
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative flex flex-col h-[80vh]">
        {/* Clear Chat Button */}
        <button
          onClick={handleClearChat}
          className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition duration-300"
        >
          <FaTrash />
        </button>

        <h2 className="text-center text-3xl font-semibold text-gray-800 mb-6">
          Chat with AI
        </h2>

        <div
          ref={chatContainerRef}
          className="overflow-y-auto flex-grow p-4 bg-slate-100 rounded-lg border border-gray-300 mb-4"
          style={{ minHeight: "300px", maxHeight: "500px" }} // Ensure the chat area has a min and max height
        >
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col mb-4 ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`p-2 max-w-xs rounded-lg ${msg.sender === "user" ? "bg-teal-300" : "bg-gray-200 text-black"}`}
              >
                <div className="flex flex-col">
                  <span>{msg.text}</span>
                  <div className="flex justify-between items-center mt-1">
                    <span></span> {/* Empty space for alignment */}
                    <span className="text-xs text-gray-700">{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="p-2 max-w-xs rounded-lg bg-gray-200 text-black">
                <div className="animate-pulse text-center">Bot is typing...</div>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="flex items-center border-t-2 border-gray-200 pt-4">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            className="flex-grow p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 text-white ml-3 transition-transform hover:scale-110"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
