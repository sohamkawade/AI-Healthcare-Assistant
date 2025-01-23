import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { user, token, setUser, setToken, logout, role, loading, registerUser, setDoctorData, doctorData } = context;
  return { user, token, setUser, setToken, logout, role, loading, registerUser, setDoctorData, doctorData };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('');
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setRole(userData.role || '');
      } catch {
        localStorage.removeItem('user');
      }
    }

    const storedDoctorData = localStorage.getItem('doctorData');
    if (storedDoctorData) {
      try {
        const doctorData = JSON.parse(storedDoctorData);
        setDoctorData(doctorData);
      } catch {
        localStorage.removeItem('doctorData');
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setRole(user.role || '');
    } else {
      localStorage.removeItem('user');
    }

    if (doctorData) {
      localStorage.setItem('doctorData', JSON.stringify(doctorData));
    } else {
      localStorage.removeItem('doctorData');
    }
  }, [token, user, doctorData]);

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('');
    setDoctorData(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('doctorData');
  };

  const registerUser = (userData) => {
    setUser(userData);
    setToken(userData.token);
    setRole(userData.role || '');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  const registerDoctor = (doctorData) => {
    setDoctorData(doctorData);
    localStorage.setItem('doctorData', JSON.stringify(doctorData));
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, setUser, setToken, logout, role, loading, 
      registerUser, setDoctorData, doctorData, registerDoctor 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
