import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Destructure values with default values to avoid undefined errors
  const { 
    user = null, 
    token = null, 
    setUser = () => {}, 
    setToken = () => {}, 
    logout = () => {}, 
    role = null,
    setRole = () => {}, // Add setRole with default empty function
    loading = false,
    toggle = false,  // Toggle state
    setToggle = () => {}  // Set Toggle function
  } = context;

  const [userType, setUserType] = useState(null);

  // Effect to determine userType (doctor or patient) based on user object
  useEffect(() => {
    if (user) {
      const type = user.specialization ? 'doctor' : 'patient';
      setUserType(type);
      setRole(type); // Set role based on user type
    }
  }, [user, setRole]);

  // Logout function to clear user data and localStorage
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); // Remove userId from localStorage
    localStorage.removeItem('role'); // Also remove role from localStorage
    setUser(null);
    setToken(null);
    setRole(null); // Reset role
    logout();
  };

  // Ensure userId is fetched from context or localStorage
  const userId = user?.id || localStorage.getItem('userId'); // Fallback to localStorage if user is not available

  useEffect(() => {
    // If user is available, store userId in localStorage
    if (user?.id) {
      localStorage.setItem('userId', user.id);
    }
  }, [user]);

  return {
    user,
    userId, // Ensure userId is properly set
    token,
    setUser,
    setToken,
    logout: handleLogout,
    role,
    setRole, // Export setRole
    loading,
    userType,
    toggle,         // Return toggle
    setToggle,      // Return setToggle
  };
};
