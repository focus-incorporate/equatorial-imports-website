// Email configuration for production
// You can use services like Resend, SendGrid, or Nodemailer

export const emailConfig = {
  // For Resend (recommended)
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    from: 'orders@equatorialimports.sc',
    adminEmail: 'admin@equatorialimports.sc'
  },
  
  // For SendGrid
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: 'orders@equatorialimports.sc',
    adminEmail: 'admin@equatorialimports.sc'
  },
  
  // For SMTP (Nodemailer)
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    from: 'orders@equatorialimports.sc',
    adminEmail: 'admin@equatorialimports.sc'
  }
};

// Example environment variables needed:
// RESEND_API_KEY=your_resend_api_key
// SENDGRID_API_KEY=your_sendgrid_api_key
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_SECURE=false
// SMTP_USER=your_email@gmail.com
// SMTP_PASS=your_app_password