import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otpRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('Email not found. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split('').forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP', {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/auth/verify-otp', {
        email,
        otp: otpString
      });

      if (response.data.success) {
        setOtpVerified(true);
        toast.success('OTP verified successfully!', {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting', {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }

    setLoading(true);
    try {
      const resetResponse = await axios.post('http://localhost:5001/api/auth/reset-password', {
        email,
        otp: otp.join(''),
        newPassword
      });

      if (resetResponse.data.success) {
        toast.success('Password reset successfully! Please login with your new password.', {
          duration: 5000,
          position: 'top-right',
        });
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      if (newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => {
    setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            style: {
              background: '#22C55E',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#22C55E',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
        }}
      />
      <motion.div
        className="bg-white shadow-lg rounded-lg p-7 max-w-lg w-full mx-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-3xl font-bold text-center text-black mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Reset Password
        </motion.h2>

        <motion.p
          className="text-gray-600 text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {otpVerified 
            ? 'Please enter your new password'
            : 'Enter the 6-digit OTP sent to your email'
          }
        </motion.p>

        <form onSubmit={otpVerified ? handleSubmit : (e) => { e.preventDefault(); verifyOtp(); }}>
          {!otpVerified ? (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <label className="block text-black font-semibold mb-2">OTP</label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    maxLength="1"
                    className="w-12 h-12 text-center text-xl font-bold border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-300 text-gray-800"
                    placeholder="•"
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <label htmlFor="newPassword" className="block text-black font-semibold mb-2">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearError('newPassword');
                  }}
                  required
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800 ${
                    errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your new password"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                )}
              </motion.div>

              <motion.div
                className="mb-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <label htmlFor="confirmPassword" className="block text-black font-semibold mb-2">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError('confirmPassword');
                  }}
                  required
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800 ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your new password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </motion.div>
            </>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded-lg font-semibold text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            } transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {loading 
              ? (otpVerified ? 'Resetting...' : 'Verifying...')
              : (otpVerified ? 'Reset Password' : 'Verify OTP')
            }
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 font-medium">
            Didn&apos;t receive the OTP?{' '}
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-purple-600 hover:text-purple-800 transition-all duration-300 transform hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword; 