import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaLinkedinIn, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { AiOutlineInstagram } from 'react-icons/ai';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const socialLinks = [
  { path: 'https://facebook.com', icon: <FaFacebookF className='group-hover:text-purple-600 w-5 h-5' /> },
  { path: 'https://instagram.com', icon: <AiOutlineInstagram className='group-hover:text-purple-600 w-5 h-5' /> },
  { path: 'https://linkedin.com', icon: <FaLinkedinIn className='group-hover:text-purple-600 w-5 h-5' /> },
];

const quickLinks = [
  { path: '/home', display: 'Home' },
  { path: '/about', display: 'About Us' },
  { path: '/contact', display: 'Contact Us' },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet connection restored!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('No internet connection. Please check your connection and try again.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!isOnline) {
      toast.error('No internet connection. Please check your connection and try again.');
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5001/api/subscribers/subscribe', {
        email: email.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Thank you for subscribing to our newsletter!');
        setEmail('');
      } else {
        toast.error(response.data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to subscribe. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: '#22C55E',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          },
          warning: {
            style: {
              background: '#F97316',
              color: '#fff',
            },
          },
        }}
      />
      <footer className="relative w-full bg-gradient-to-br text-black mt-8">
        <div className="container mx-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Company Info */}
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-xl md:text-2xl font-bold text-purple-600">AI Healthcare Assistant</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Empowering healthcare with advanced AI solutions for better patient care and medical efficiency.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaMapMarkerAlt className="text-purple-500 flex-shrink-0" />
                    <span className="text-sm">Mumbai, India 1508</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaPhone className="text-purple-500 flex-shrink-0" />
                    <span className="text-sm">+919300000045</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaEnvelope className="text-purple-500 flex-shrink-0" />
                    <span className="text-sm">sohamkawade23@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  {quickLinks.map((item, index) => (
                    <li key={index}>
                      <Link 
                        to={item.path} 
                        className="text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm flex items-center"
                      >
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2 flex-shrink-0"></span>
                        {item.display}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Stay Updated</h4>
                <p className="text-gray-600 text-sm mb-3 md:mb-4">
                  Subscribe to our newsletter for the latest updates and healthcare insights.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    disabled={!isOnline}
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !isOnline}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Subscribing...' : !isOnline ? 'No Internet Connection' : 'Subscribe Now'}
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 mt-8 md:mt-12 pt-6 md:pt-8">
              <div className="flex flex-col items-center space-y-3 md:space-y-4">
                <div className="flex space-x-4">
                  {socialLinks.map((link, index) => (
                    <a 
                      key={index} 
                      href={link.path} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
                <p className="text-gray-600 text-xs md:text-sm text-center">
                  &copy; {year} AI Healthcare Assistant. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
