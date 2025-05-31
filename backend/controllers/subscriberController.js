const Subscriber = require('../models/Subscriber');
const { sendSubscriptionEmail } = require('../services/subscriptionEmailService');
const dns = require('dns').promises;

// Function to check internet connectivity
const checkInternetConnection = async () => {
  try {
    // Try to resolve Google's DNS
    await dns.resolve('google.com');
    return true;
  } catch (error) {
    return false;
  }
};

const subscribe = async (req, res) => {
  try {
    // Check internet connection first
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'No internet connection. Please check your connection and try again.'
      });
    }

    const { email } = req.body;

    // Check if subscriber already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'You are already subscribed to our newsletter.'
      });
    }

    // Create new subscriber
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Send welcome email with specific subject and HTML
    const emailSubject = 'Welcome to AI Healthcare Assistant - Your Healthcare Journey Begins!';
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px 0; border-bottom: 2px solid #E5E7EB;">
          <h1 style="color: #4F46E5; margin: 0; font-size: 28px; font-weight: 600;">AI Healthcare Assistant</h1>
          <p style="color: #6B7280; margin-top: 10px; font-size: 16px;">Your Trusted Healthcare Partner</p>
        </div>
        
        <!-- Main Content Section -->
        <div style="background-color: #F8FAFC; padding: 30px; border-radius: 12px; margin: 20px 0;">
          <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Welcome to Our Healthcare Community!</h2>
          <p style="color: #4B5563; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
            Dear Valued Subscriber,<br><br>
            We're thrilled to welcome you to the AI Healthcare Assistant community! Your subscription marks the beginning of an exciting journey towards smarter, more efficient healthcare management.
          </p>
          
          <!-- Benefits Section -->
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 2px solid #E5E7EB;">
            <h3 style="color: #4F46E5; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What You'll Receive:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #4B5563;">
              <li style="margin-bottom: 12px;">📊 Weekly insights on AI advancements in healthcare</li>
              <li style="margin-bottom: 12px;">👨‍⚕️ Expert medical advice and best practices</li>
              <li style="margin-bottom: 12px;">🔬 Exclusive access to healthcare innovation updates</li>
              <li style="margin-bottom: 12px;">💡 Personalized healthcare tips and recommendations</li>
            </ul>
          </div>
        </div>

        <!-- Support Section -->
        <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
          <h3 style="color: #4F46E5; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Need Help?</h3>
          <p style="color: #4B5563; margin: 0 0 15px 0; font-size: 14px;">
            Our dedicated support team is here to assist you with any questions or concerns:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #4B5563;">
            <li style="margin-bottom: 8px;">📞 Call us: +1 (555) 123-4567</li>
            <li style="margin-bottom: 8px;">✉️ Email: support@aihealthcare.com</li>
            <li style="margin-bottom: 8px;">⏰ Hours: Monday - Friday, 9:00 AM - 6:00 PM EST</li>
          </ul>
        </div>

        <!-- Footer Section -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center;">
          <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
            This email was sent to ${email}. If you did not subscribe to our newsletter, please ignore this email.
          </p>
          <div style="margin-top: 15px;">
            <a href="#" style="color: #4F46E5; text-decoration: none; margin: 0 10px; font-size: 14px;">Privacy Policy</a>
            <span style="color: #D1D5DB;">|</span>
            <a href="#" style="color: #4F46E5; text-decoration: none; margin: 0 10px; font-size: 14px;">Terms of Service</a>
          </div>
        </div>
      </div>`;

    const emailSent = await sendSubscriptionEmail(email, emailSubject, emailHtml);
    
    if (!emailSent) {
      console.error('Failed to send welcome email to:', email);
      // Continue with success response even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.'
    });
  }
};

module.exports = {
  subscribe
}; 