// Generate a unique video link for the consultation
const generateVideoLink = (appointmentId) => {
  // You can implement your own logic to generate a unique video link
  // For now, we'll just return a simple string
  return `video-consultation-${appointmentId}`;
};

// Validate video consultation time
const validateVideoConsultationTime = (appointmentTime) => {
  const now = new Date();
  const appointment = new Date(appointmentTime);
  
  // Allow joining 5 minutes before the scheduled time
  const fiveMinutesBefore = new Date(appointment.getTime() - 5 * 60 * 1000);
  
  return now >= fiveMinutesBefore;
};

module.exports = {
  generateVideoLink,
  validateVideoConsultationTime
}; 