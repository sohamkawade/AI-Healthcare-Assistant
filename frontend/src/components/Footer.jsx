import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { AiOutlineInstagram } from 'react-icons/ai';
import axios from 'axios';
import { toast } from 'react-toastify';

const socialLinks = [
  { path: 'https://facebook.com', icon: <FaFacebookF className='group-hover:text-purple-600 w-5 h-5' /> },
  { path: 'https://instagram.com', icon: <AiOutlineInstagram className='group-hover:text-purple-600 w-5 h-5' /> },
  { path: 'https://linkedin.com', icon: <FaLinkedinIn className='group-hover:text-purple-600 w-5 h-5' /> },
];

const quickLinks = [
  { path: '/home', display: 'Home' },
  { path: '/about', display: 'About Us' },
  { path: '/services', display: 'Services' },
  { path: '/contact', display: 'Contact Us' },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5001/api/subscribers/subscribe', {
        email: email
      });

      if (response.data.success) {
        toast.success('Thank you for subscribing to our newsletter!', {theme:'colored'});
        setEmail('');
      } else {
        toast.error(response.data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="top-0 left-0 right-0 z-50 p-20 font-sans bg-gradient-to-br text-black mt-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h4 className="text-2xl font-bold text-purple-600">AI Healthcare Assistant</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Empowering healthcare with advanced AI solutions for better patient care and medical efficiency.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-gray-600">
                <FaMapMarkerAlt className="text-purple-500" />
                <span className="text-sm">123 Main St, Anytown, India 12345</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaPhone className="text-purple-500" />
                <span className="text-sm">+91 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaEnvelope className="text-purple-500" />
                <span className="text-sm">info@aihealthcare.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.path} 
                    className="text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm flex items-center"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></span>
                    {item.display}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Stay Updated</h4>
            <p className="text-gray-600 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and healthcare insights.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-400 mt-12 pt-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-3">
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
            <p className="text-gray-600 text-sm text-center">
              &copy; {year} AI Healthcare Assistant. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
