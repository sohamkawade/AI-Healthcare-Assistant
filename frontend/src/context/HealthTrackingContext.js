import React, { createContext, useState, useEffect } from 'react';

// Create the Health Tracking Context
export const HealthTrackingContext = createContext();

// HealthTrackingProvider component to wrap around the application
export const HealthTrackingProvider = ({ children }) => {
    // State to store health data (e.g., heart rate, steps, etc.)
    const [healthData, setHealthData] = useState({
        heartRate: null,
        steps: null,
        sleepDuration: null,
        bloodPressure: null,
    });

    // Function to update health data
    const updateHealthData = (newData) => {
        setHealthData((prevData) => ({
            ...prevData,
            ...newData,
        }));
    };

    // Function to reset health data (if needed)
    const resetHealthData = () => {
        setHealthData({
            heartRate: null,
            steps: null,
            sleepDuration: null,
            bloodPressure: null,
        });
    };

    // Example: Simulating fetching data from a wearable device
    useEffect(() => {
        // Simulate fetching data from a wearable device every 10 seconds
        const interval = setInterval(() => {
            // Replace this with actual data fetching logic
            const simulatedData = {
                heartRate: Math.floor(Math.random() * (100 - 60 + 1)) + 60, // Random heart rate between 60 and 100
                steps: Math.floor(Math.random() * 10000), // Random step count
                sleepDuration: Math.floor(Math.random() * 8), // Random sleep duration in hours
                bloodPressure: `${Math.floor(Math.random() * 40) + 90}/${Math.floor(Math.random() * 40) + 60}`, // Random BP
            };
            updateHealthData(simulatedData);
        }, 10000);

        // Clean up the interval on unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <HealthTrackingContext.Provider value={{ healthData, updateHealthData, resetHealthData }}>
            {children}
        </HealthTrackingContext.Provider>
    );
};
