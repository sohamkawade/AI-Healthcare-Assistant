import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context for the Auth state
export const AuthContext = createContext();

// Custom hook to use the Auth context in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // If the context is not available, throw an error
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// The AuthProvider component, which will wrap the rest of the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('');
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);

  // This effect runs once to get the data from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedDoctorData = localStorage.getItem('doctorData');

      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedDoctorData) setDoctorData(JSON.parse(storedDoctorData));
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
    }
  }, []); // Empty dependency array means this effect runs once after initial render

  // This effect runs whenever the token, user, or doctor data changes
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (doctorData) localStorage.setItem('doctorData', JSON.stringify(doctorData));
  }, [token, user, doctorData]); // These dependencies ensure it runs when these values change

  // Log out function to reset the state and clear localStorage
  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('');
    setDoctorData(null);
    localStorage.clear(); // Clear all localStorage data on logout
  };

  // Register a new user and store the data in the context and localStorage
  const registerUser = (userData) => {
    setUser(userData);
    setToken(userData.token);
    setRole(userData.role || '');
  };

  // Register a new doctor and store the data in the context and localStorage
  const registerDoctor = (doctorData) => {
    setDoctorData(doctorData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        logout,
        role,
        loading,
        registerUser,
        registerDoctor,
        setDoctorData,
        doctorData,
        toggle,
        setToggle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
