import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaLock, FaCheck, FaTimes } from 'react-icons/fa';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const otpRefs = useRef([]);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('Please request a password reset first');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/auth/verify-otp', {
        email,
        otp: otpString
      });

      if (response.data.success) {
        setIsVerified(true);
        toast.success('OTP verified successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/auth/reset-password', {
        email,
        otp: otp.join(''),
        newPassword
      });

      if (response.data.success) {
        toast.success('Password reset successfully!');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <FaLock className="mx-auto text-purple-600 text-4xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            {isVerified ? 'Enter your new password' : 'Enter the OTP sent to your email'}
          </p>
        </div>

        {!isVerified ? (
          <div className="space-y-6">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
              ))}
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.join('').length !== 6}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all
                ${isLoading || otp.join('').length !== 6
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="Confirm new password"
              />
            </div>
            <button
              onClick={handleResetPassword}
              disabled={isLoading || !newPassword || !confirmPassword}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all
                ${isLoading || !newPassword || !confirmPassword
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword; 