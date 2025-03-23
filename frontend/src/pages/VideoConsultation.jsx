import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVideoSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const VideoConsultation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <FaVideoSlash className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Video Consultation Disabled</h2>
          <p className="text-gray-500 mt-2">This service is currently unavailable.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;
