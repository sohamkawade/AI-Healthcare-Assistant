import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { AiFillGithub, AiOutlineInstagram } from 'react-icons/ai';

const socialLinks = [
  { path: 'https://github.com', icon: <AiFillGithub className='group-hover:text-purple-600 w-6 h-6' /> },
  { path: 'https://instagram.com', icon: <AiOutlineInstagram className='group-hover:text-purple-600 w-6 h-6' /> },
  { path: 'https://linkedin.com', icon: <FaLinkedinIn className='group-hover:text-purple-600 w-6 h-6' /> },
];

const quickLinks = [
  { path: '/home', display: 'Home' },
  { path: '/about', display: 'About Us' },
  { path: '/services', display: 'Services' },
  { path: '/contact', display: 'Contact Us' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="top-0 left-0 right-0 z-50 p-20 font-sans bg-gradient-to-br text-black mt-8">
      <div className="container mx-auto flex flex-col items-center">
        <div className="flex flex-col lg:flex-row justify-between mb-8 w-full">
          <div className="lg:w-1/3">
            <h4 className="font-semibold text-2xl text-purple-600">AI Healthcare Assistant</h4>
            <p className="text-sm mt-2">Innovative healthcare solutions with advanced AI technologies.</p>
            <p className="text-sm">123 Main St, Anytown, India 12345</p>
            <p className="text-sm">Phone: +91 (555) 123-4567</p>
            <p className="text-sm">
              Email: <a href="mailto:info@aihealthcare.com" className="hover:underline text-purple-600">info@aihealthcare.com</a>
            </p>
          </div>

          <div className="lg:w-1/4">
            <h4 className="font-semibold text-2xl text-purple-600">Quick Links</h4>
            <ul className="space-y-2 mt-2 text-sm">
              {quickLinks.map((item, index) => (
                <li key={index}>
                  <Link to={item.path} className="hover:underline hover:text-purple-600 transition-colors duration-200">
                    {item.display}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/3">
            <h4 className="font-semibold text-2xl text-purple-600">Stay Updated</h4>
            <p className="text-sm mt-2 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <form className="flex">
              <input type="email" placeholder="Your email address" className="px-4 py-2 w-full text-black rounded-l border focus:outline-none" />
              <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-r hover:bg-purple-800 transition-transform duration-200">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-400 pt-4 text-center text-sm w-full">
          <div className="flex justify-center space-x-4 mt-4">
            {socialLinks.map((link, index) => (
              <a key={index} href={link.path} target="_blank" rel="noopener noreferrer" className='hover:text-purple-600 transition-colors duration-200'>
                {link.icon}
              </a>
            ))}
          </div>
          <p className="mt-4">&copy; {year} AI Healthcare Assistant Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
