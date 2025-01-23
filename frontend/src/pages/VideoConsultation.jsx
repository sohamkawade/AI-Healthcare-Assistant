import React, { useState } from 'react';
import { useChat } from '../context/ChatContext'; // Use your chat context
import { FaVideo, FaMicrophone, FaHistory, FaSmile, FaPaperPlane } from 'react-icons/fa';
import BackButton from '../components/BackButton';

const VideoConsultation = () => {
  const [isConsulting, setIsConsulting] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const { addChatMessage } = useChat(); // Access chat context
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  const startConsultation = () => {
    setIsConsulting(true);
    // Logic to initiate video and audio streams
  };

  const endConsultation = () => {
    setIsConsulting(false);
    // Logic to end the video consultation
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // Add logic to toggle video stream
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // Add logic to toggle audio stream
  };

  const handleSendMessage = (message) => {
    if (message.trim() === '') return;
    addChatMessage(message); // Add message to chat context
    setChatMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleFeedback = (rating) => {
    // Logic to handle feedback rating
    alert(`Thank you for your feedback! You rated: ${rating}`);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl transition-shadow duration-300 hover:shadow-2xl">
      {/* Back Button */}
      <BackButton />
      <h2 className="text-4xl font-bold mb-4 text-center text-blue-700 animate-pulse">Video Consultation</h2>
      <p className="mb-6 text-gray-700 text-center">
        Connect with our healthcare professionals through a virtual consultation.
      </p>

      {/* New Appointment Info Section */}
      <div className="flex flex-col items-center mb-6 p-4 bg-white shadow-md rounded-lg w-full max-w-md">
        <h3 className="text-xl font-semibold text-blue-600">Appointment Info</h3>
        <p className="text-gray-600">Date: 12/24/2024</p>
        <p className="text-gray-600">Time: 10:00 AM</p>
        <p className="text-gray-600">Doctor: Dr. Smith</p>
        <p className="text-gray-600">Specialty: Cardiology</p>
      </div>

      {isConsulting ? (
        <div className="flex flex-col w-full max-w-5xl">
          {/* Video Feed */}
          <div className="video-feed bg-gray-300 h-80 mb-6 rounded-lg flex justify-center items-center border border-gray-400 shadow-inner relative">
            <span className="text-gray-500 text-xl">Video Feed Placeholder</span>
            <div className="absolute top-3 left-3 flex space-x-4">
              <button
                onClick={toggleVideo}
                className={`p-2 rounded-full text-white ${isVideoOn ? 'bg-green-500' : 'bg-red-500'} hover:shadow-lg`}
              >
                <FaVideo size={20} />
              </button>
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-full text-white ${isAudioOn ? 'bg-green-500' : 'bg-red-500'} hover:shadow-lg`}
              >
                <FaMicrophone size={20} />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="controls flex justify-between mb-6">
            <button
              className="bg-indigo-500 text-white py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              onClick={() => {/* Screen sharing logic */}}
            >
              Screen Share
            </button>
            <button
              className="bg-red-500 text-white py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              onClick={endConsultation}
            >
              End Consultation
            </button>
          </div>

          {/* Chat Window */}
          <div className="chat-window border-t border-gray-300 pt-6">
            <h3 className="text-xl font-semibold mb-4 text-center text-blue-600">Chat</h3>
            <div className="messages h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white shadow-md">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`message mb-3 p-3 rounded-lg ${index % 2 === 0 ? 'bg-blue-100' : 'bg-gray-100'} text-gray-700`}
                >
                  {msg}
                </div>
              ))}
            </div>
            <div className="flex mt-4">
              <input
                type="text"
                placeholder="Type your message..."
                className="border border-gray-300 rounded-l-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const message = document.querySelector('input[type="text"]').value;
                  handleSendMessage(message);
                  document.querySelector('input[type="text"]').value = '';
                }}
                className="bg-blue-500 text-white rounded-r-lg p-3 hover:bg-blue-600"
              >
                <FaPaperPlane size={20} />
              </button>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="feedback-section mt-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Rate Your Consultation</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleFeedback('Excellent')}
                className="text-green-500 hover:text-green-600"
              >
                <FaSmile size={30} />
              </button>
              <button
                onClick={() => handleFeedback('Good')}
                className="text-yellow-500 hover:text-yellow-600"
              >
                <FaSmile size={30} />
              </button>
              <button
                onClick={() => handleFeedback('Poor')}
                className="text-red-500 hover:text-red-600"
              >
                <FaSmile size={30} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            onClick={startConsultation}
          >
            Start Consultation
          </button>
          <button
            className="mt-4 flex items-center space-x-2 text-gray-700 font-medium"
            onClick={() => {/* View consultation history logic */}}
          >
            <FaHistory className="text-gray-500" />
            <span>View Consultation History</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoConsultation;
