import React, { useState } from 'react';
import { FaCreditCard, FaCalendarAlt, FaLock } from 'react-icons/fa';
import BackButton from '../components/BackButton';

const BillingDashboard = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate payment form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.cvv) newErrors.cvv = 'CVV is required';
    return newErrors;
  };

  const handlePaymentProcess = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setPaymentSuccess(true);
      setLoading(false);
    }, 2000); // Simulate payment processing delay
  };

  return (
    <div className="flex flex-col w-full p-8 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl rounded-lg max-w-5xl mx-auto">
       {/* Back Button */}
       <BackButton />
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-blue-800">Billing Dashboard</h1>
        <div className="text-gray-600">User Profile</div>
      </header>

      {/* Main Content */}
      <main className="flex flex-wrap lg:flex-nowrap mt-6">
        {/* Left Content - Billing Information and Actions */}
        <section className="flex-1 p-4 bg-white rounded-lg shadow-md">
          {/* Patient Billing Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Patient Billing Information</h2>
            <ul className="text-gray-600">
              <li><strong>Name:</strong> John Doe</li>
              <li><strong>Address:</strong> 123 Main St, Cityville</li>
              <li><strong>Contact:</strong> (123) 456-7890</li>
              <li><strong>Insurance Provider:</strong> HealthCare Inc.</li>
            </ul>
          </div>

          {/* Invoice Generation */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Invoice Generation</h2>
            <ul className="text-gray-600">
              <li><strong>Date:</strong> 10/30/2024</li>
              <li><strong>Invoice #:</strong> INV-001</li>
              <li><strong>Amount:</strong> $500</li>
              <li><strong>Payment Terms:</strong> Due in 30 days</li>
            </ul>
          </div>

          {/* Payment Form */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Payment Information</h2>
            
            {/* Card Number Input */}
            <div className="relative mb-4">
              <FaCreditCard className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number"
                value={formData.cardNumber}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
              {errors.cardNumber && <p className="text-red-500 mt-1">{errors.cardNumber}</p>}
            </div>

            {/* Expiry Date Input */}
            <div className="relative mb-4">
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="expiryDate"
                placeholder="Expiry Date (MM/YY)"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
              {errors.expiryDate && <p className="text-red-500 mt-1">{errors.expiryDate}</p>}
            </div>

            {/* CVV Input */}
            <div className="relative mb-4">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                value={formData.cvv}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
              {errors.cvv && <p className="text-red-500 mt-1">{errors.cvv}</p>}
            </div>

            {/* Payment Processing Button */}
            <button 
              onClick={handlePaymentProcess}
              disabled={loading} 
              className={`bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Process Payment'}
            </button>
          </div>

          {/* Payment Success Message */}
          {paymentSuccess && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
              Payment processed successfully!
            </div>
          )}
        </section>

        {/* Right Content - Sidebar/Analytics */}
        <aside className="lg:w-1/3 p-4 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Billing Analytics</h2>
          <p className="text-gray-600">Coming Soon: Interactive revenue charts, payment breakdowns, and more.</p>
        </aside>
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-center p-4 mt-6 border-t border-gray-300 text-gray-500">
        <span>&copy; 2024 AI Healthcare Assistant</span>
        <div className="flex space-x-4">
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default BillingDashboard;
