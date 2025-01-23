import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BackButton = () => {
   const navigate = useNavigate();

  return (
    <div className="absolute top-6 left-6">
        <motion.button
          onClick={() => navigate(-1)} 
          className="text-blue-600 flex font-semibold items-center space-x-2 hover:text-blue-800 transition duration-300"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 12H5"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 19l-7-7 7-7"
            />
          </svg>
          <span>Back</span>
        </motion.button>
      </div>
  );
};

export default BackButton;
