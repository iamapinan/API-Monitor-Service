const nodemailer = require('nodemailer');
const { emailConfig } = require('../config/email');

const sendErrorEmail = async ({ subject, message }) => {
  try {
    const transporter = nodemailer.createTransport(emailConfig);
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: subject,
      text: message
    });
    
    console.log('Error notification email sent');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

module.exports = { sendErrorEmail }; 