// src/hooks/useHealthTracking.js
import { useContext } from 'react';
import { HealthTrackingContext } from '../context/HealthTrackingContext'; // Adjust the path if necessary

const useHealthTracking = () => {
  const context = useContext(HealthTrackingContext);

  if (!context) {
    throw new Error('useHealthTracking must be used within a HealthTrackingProvider');
  }

  return context;
};

export default useHealthTracking;
