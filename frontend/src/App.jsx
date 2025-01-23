import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Appointment from './pages/Appointment';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import DoctorSignup from './pages/DoctorSignup';
import Profile from './pages/Profile';
import VideoConsultation from './pages/VideoConsultation';
import MedicationReminder from './pages/MedicationReminder';
import HealthTracker from './pages/HealthTracker';
import BillingDashboard from './pages/BillingDashboard';
import EngagementHub from './pages/EngagementHub';
import Chatbot from './pages/Chatbot';
import ForgotPassword from './pages/ForgotPassword';
import NotificationProvider from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { SnackbarProvider } from 'notistack';

const App = () => {
  return (
    <NotificationProvider>
      <ChatProvider>
        <Router>
          <ConditionalNavbar />
          <MainContent />
          <ConditionalFooter />
          <ToastContainer />
        </Router>
      </ChatProvider>
    </NotificationProvider>
  );
};

const MainContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/doctor-signup" element={<DoctorSignup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/video-consultation" element={<VideoConsultation />} />
      <Route path="/medication-reminder" element={<MedicationReminder />} />
      <Route path="/health-tracker" element={<HealthTracker />} />
      <Route path="/billing-dashboard" element={<BillingDashboard />} />
      <Route path="/engagement-hub" element={<EngagementHub />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
};

const ConditionalNavbar = () => {
  const location = useLocation();
  return location.pathname === '/' ? <Navbar /> : null;
};

const ConditionalFooter = () => {
  const location = useLocation();
  const footerPaths = ['/'];
  return footerPaths.includes(location.pathname) ? <Footer /> : null;
};

export default App;
