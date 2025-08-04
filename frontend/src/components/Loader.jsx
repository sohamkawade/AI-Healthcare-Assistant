// src/components/Loader.jsx
import React from 'react';
import './Loader.css';


const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="loader">
        <div className="spinner"></div>
        <p className="text-gray-700 font-semibold mt-4">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
