import React from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { RiHealthBookLine, RiSecurePaymentFill } from 'react-icons/ri';

const Footer = () => {
  return (
    <footer className="bg-[#1E2A38] text-[#E0E6ED] py-8 px-6">
      <div className="container mx-auto">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-start mb-8">
          {/* Company Information */}
          <div className="mb-8 lg:mb-0 lg:w-1/3">
            <h4 className="font-semibold text-2xl text-[#64B5F6]">AI Healthcare Assistant</h4>
            <p className="text-sm mt-2">Innovative healthcare solutions with advanced AI technologies.</p>
            <p className="text-sm mt-2">123 Main St, Anytown, India 12345</p>
            <p className="text-sm">Phone: +91 (555) 123-4567</p>
            <p className="text-sm">
              Email: <a href="mailto:info@aihealthcare.com" className="hover:underline text-[#64B5F6]">info@aihealthcare.com</a>
            </p>
          </div>

          {/* Quick Links */}
          <div className="mb-8 lg:mb-0 lg:w-1/4">
            <h4 className="font-semibold text-2xl text-[#FFC107]">Quick Links</h4>
            <ul className="space-y-2 mt-2 text-sm">
              {['About Us', 'Contact Us', 'Terms of Service', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <a 
                    href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="hover:underline hover:text-[#A8D1E7] transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="lg:w-1/4">
            <h4 className="font-semibold text-2xl text-[#FFC107]">Follow Us</h4>
            <div className="flex space-x-4 mt-4 text-lg">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-[#64B5F6] transition-colors duration-200">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-[#64B5F6] transition-colors duration-200">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-[#64B5F6] transition-colors duration-200">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        {/* Middle Section - Newsletter and Trust Badges */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start mb-8">
          {/* Newsletter Signup */}
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h4 className="font-semibold text-2xl text-[#64B5F6]">Stay Updated</h4>
            <p className="text-sm mt-2 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 w-full lg:w-3/4 text-gray-900 rounded-l border border-gray-300 focus:border-[#64B5F6] transition-colors duration-300 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#FFC107] text-white px-4 py-2 rounded-r hover:bg-[#FFA500] transform hover:scale-105 transition-transform duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col items-center lg:items-start space-y-4 text-sm">
            <div className="flex items-center space-x-2">
              <RiHealthBookLine className="text-2xl text-[#64B5F6]" />
              <p>HIPAA Compliant</p>
            </div>
            <div className="flex items-center space-x-2">
              <RiSecurePaymentFill className="text-2xl text-[#64B5F6]" />
              <p>PCI-DSS Certified</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-500 pt-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} AI Healthcare Assistant Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
