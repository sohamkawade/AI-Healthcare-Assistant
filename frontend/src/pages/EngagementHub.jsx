// src/components/EngagementHub.jsx
import React from 'react';

const EngagementHub = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white shadow-md py-4">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Engagement Hub</h1>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">Profile</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">Logout</a>
          </div>
        </nav>
      </header>

      {/* Main Content Section */}
      <main className="container mx-auto flex-grow p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Personalized Health Content */}
          <section className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Personalized Health Content</h2>
            <p className="text-gray-600">Customizable content feed with health tips and recommendations.</p>
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">View More</button>
          </section>

          {/* Educational Resources */}
          <section className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Educational Resources</h2>
            <ul className="list-disc list-inside text-gray-600">
              <li><a href="#" className="hover:underline">Video Library</a></li>
              <li><a href="#" className="hover:underline">Infographics</a></li>
              <li><a href="#" className="hover:underline">Downloadable Resources</a></li>
            </ul>
          </section>

          {/* Community Forum */}
          <section className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Community Forum</h2>
            <p className="text-gray-600">Join discussions and connect with other patients.</p>
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">Join Forum</button>
          </section>

          {/* Event Calendar */}
          <section className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Event Calendar</h2>
            <p className="text-gray-600">Stay updated with upcoming events.</p>
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">View Events</button>
          </section>

          {/* Survey and Feedback Tools */}
          <section className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Survey and Feedback Tools</h2>
            <p className="text-gray-600">Help us improve by sharing your feedback.</p>
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">Take Survey</button>
          </section>

          {/* Integration with Wearable Devices */}
          <section className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Integration with Wearable Devices</h2>
            <p className="text-gray-600">Sync your data for personalized recommendations.</p>
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">Connect Device</button>
          </section>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-white shadow-md py-4">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">© 2024 AI Healthcare Assistant. All rights reserved.</p>
          <p className="text-gray-600">
            <a href="#" className="hover:underline">Terms of Service</a> | 
            <a href="#" className="hover:underline"> Privacy Policy</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EngagementHub;
