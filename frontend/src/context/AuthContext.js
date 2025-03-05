import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context; // Return full context object directly
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('');
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false); 

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
  }, []);

  useEffect(() => {
    localStorage.setItem('token', token || '');
    localStorage.setItem('user', user ? JSON.stringify(user) : '');
    localStorage.setItem('doctorData', doctorData ? JSON.stringify(doctorData) : '');
  }, [token, user, doctorData]);

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('');
    setDoctorData(null);
    localStorage.clear();
  };

  const registerUser = (userData) => {
    setUser(userData);
    setToken(userData.token);
    setRole(userData.role || '');
  };

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
