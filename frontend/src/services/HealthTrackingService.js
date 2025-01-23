// src/services/HealthTrackingService.js

import { useContext } from 'react';
import { HealthTrackingContext } from '../context/HealthTrackingContext';

export const trackHealthData = (data) => {
    // Logic to integrate wearable device data
    // Example structure of data: { heartRate: 70, steps: 5000, sleepDuration: 7, bloodPressure: '120/80' }

    // You can add logic to process or validate the data before updating the context
    if (data) {
        const { healthData, setHealthData } = useContext(HealthTrackingContext);
        
        // Update health data state with new data
        setHealthData({
            ...healthData, // Keep existing health data
            ...data, // Merge with new data
        });
    } else {
        console.error("No data provided for health tracking.");
    }
};

// Example of a function that simulates fetching data from a wearable device
export const fetchWearableData = async () => {
    // Simulate fetching wearable data
    const simulatedData = {
        heartRate: Math.floor(Math.random() * 100) + 60, // Random heart rate between 60 and 160
        steps: Math.floor(Math.random() * 10000), // Random steps count
        sleepDuration: Math.floor(Math.random() * 8), // Random sleep duration between 0 and 8 hours
        bloodPressure: `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 20) + 70}`, // Random BP
    };

    // Call the tracking function with simulated data
    trackHealthData(simulatedData);
};
