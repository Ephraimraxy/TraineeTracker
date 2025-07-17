
import nodemailer from 'nodemailer';

// Email configuration - you'll need to set these up in your environment
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@cssfarms.ng',
      to: email,
      subject: 'CSS FARMS - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2d5a2d; color: white; padding: 20px; text-align: center;">
            <img src="https://cssfarms.ng/wp-content/uploads/2024/12/scrnli_QWDQo0eIg5qH8M.png" alt="CSS FARMS" style="height: 60px; margin-bottom: 10px;">
            <h1>Email Verification</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #2d5a2d;">Welcome to CSS FARMS Training Program!</h2>
            
            <p>Thank you for registering with CSS FARMS Nigeria. To complete your registration, please verify your email address using the verification code below:</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-bottom: 10px;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #2d5a2d; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #666;">This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.</p>
            
            <p style="color: #666; margin-top: 30px;">
              Best regards,<br>
              <strong>CSS FARMS Nigeria Team</strong>
            </p>
          </div>
          
          <div style="background-color: #2d5a2d; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© 2024 CSS FARMS Nigeria. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Test email configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service connection failed:', error);
    return false;
  }
}
