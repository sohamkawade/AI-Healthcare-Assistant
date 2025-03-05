import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Use optional chaining and default values to avoid undefined issues
  const { 
    user = null, 
    token = null, 
    setUser = () => {}, 
    setToken = () => {}, 
    logout = () => {}, 
    role = null, 
    loading = false,
    toggle = false,              // Add toggle state 
    setToggle = () => {}        // Add setToggle function 
  } = context;

  const [userType, setUserType] = useState(null);

  useEffect(() => {
    if (user) {
      const type = user.specialization ? 'doctor' : 'patient';
      setUserType(type);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    logout();
  };

  return {
    user,
    userId: user?.id,
    token,
    setUser,
    setToken,
    logout: handleLogout,
    role,
    loading,
    userType,
    toggle,         // Return toggle
    setToggle,      // Return setToggle
  };
};
