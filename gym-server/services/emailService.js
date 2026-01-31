const nodemailer = require('nodemailer');
const { formatIndianPrice, getPlanAmount, getPlanDisplayName } = require('../utils/formatters');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// Template for registration confirmation
const createRegistrationEmail = (user) => {
  const amount = getPlanAmount(user.plan);
  const planName = getPlanDisplayName(user.plan);
  const formattedAmount = formatIndianPrice(amount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Star Gym</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Welcome to Star Gym! 💪</h1>
          <p style="color: #666; margin-top: 10px;">Your fitness journey begins here</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px;">Dear ${user.name},</p>
          <p style="color: #444; line-height: 1.5;">Thank you for registering with Star Gym! We're excited to have you join our fitness family. Your registration has been successfully received and is pending approval.</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0; font-size: 18px;">Membership Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Plan Selected:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Amount to Pay:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Start Date:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(user.startDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">End Date:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(user.endDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Payment Status:</td>
              <td style="padding: 8px 0; color: #ff9800; font-weight: bold;">Pending</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #f57c00; margin: 0;">⚠️ Important Note:</p>
          <p style="color: #666; margin: 10px 0 0 0;">Your membership will be activated once the payment is confirmed by our admin team.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin-bottom: 5px;">Need help? Contact us:</p>
          <p style="color: #666; margin: 0;">📍 Address: 2nd floor, Krishiv complex, Swaminarayan mandir Rd, Petlad, 388450</p>
          <p style="color: #666; margin: 5px 0;">📞 Phone: 9313720714</p>
          <p style="color: #666; margin: 5px 0;">📧 Email: stargympetlad0205@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for payment confirmation
const createPaymentConfirmationEmail = (user, receiptUrl) => {
  const amount = getPlanAmount(user.plan);
  const planName = getPlanDisplayName(user.plan);
  const formattedAmount = formatIndianPrice(amount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation - Star Gym</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Payment Confirmed! 🎉</h1>
          <p style="color: #666; margin-top: 10px;">Your Star Gym membership is now active</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px;">Dear ${user.name},</p>
          <p style="color: #444; line-height: 1.5;">Great news! Your payment has been confirmed and your membership is now active. Welcome to the Star Gym family!</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0; font-size: 18px;">Membership Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Plan:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Start Date:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(user.startDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">End Date:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(user.endDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Status:</td>
              <td style="padding: 8px 0; color: #4caf50; font-weight: bold;">Active</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #2e7d32; margin: 0;">✨ Getting Started:</p>
          <ul style="color: #666; margin: 10px 0 0 0; padding-left: 20px;">
            <li>Visit our gym during operational hours</li>
            <li>Bring your ID for first-time check-in</li>
            <li>Join our orientation session</li>
            <li>Download our mobile app for schedules</li>
          </ul>
        </div>

        ${receiptUrl && receiptUrl.trim() ? `
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 10px; border: 2px dashed #dee2e6;">
          <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📄 Your Payment Receipt</h3>
          <p style="color: #666; margin: 0 0 20px 0; font-size: 14px;">Download your official payment receipt for your records</p>
          <a href="${receiptUrl.replace(/"/g, '&quot;')}" 
             target="_blank"
             rel="noopener noreferrer"
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;"
             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.6)';"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.4)';">
            📥 Download Receipt
          </a>
          <p style="color: #999; margin: 15px 0 0 0; font-size: 12px;">Keep this receipt safe for your records</p>
          <p style="color: #999; margin: 10px 0 0 0; font-size: 11px;">If the download doesn't start automatically, right-click the button and select "Save link as..."</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin-bottom: 5px;">Need help? Contact us:</p>
          <p style="color: #666; margin: 0;">📍 Address: 2nd floor, Krishiv complex, Swaminarayan mandir Rd, Petlad, 388450</p>
          <p style="color: #666; margin: 5px 0;">📞 Phone: 9313720714</p>
          <p style="color: #666; margin: 5px 0;">📧 Email: stargympetlad0205@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmail = async (options) => {
  try {
    console.log('Attempting to send email to:', options.email);
    console.log('Using SMTP settings:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER
    });

    const mailOptions = {
      from: {
        name: 'Star Gym',
        address: process.env.EMAIL_USER
      },
      to: options.email,
      subject: options.subject,
      html: options.customEmail || options.html,
      headers: {
        'X-Mailer': 'StarGym Mailer',
        'X-Priority': '1',
        'Importance': 'high'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Template for password reset OTP
const createPasswordResetOTPEmail = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP - Star Gym Admin</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Password Reset OTP 🔐</h1>
          <p style="color: #666; margin-top: 10px;">Star Gym Admin Panel</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px;">Hello,</p>
          <p style="color: #444; line-height: 1.5;">You requested to reset your password for your Star Gym admin account. Use the OTP below to verify your identity:</p>
        </div>

        <div style="text-align: center; margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 15px;">
          <p style="color: #fff; margin: 0 0 15px 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; display: inline-block; min-width: 200px;">
            <p style="color: #f59e0b; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
          </div>
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #f57c00; margin: 0; font-weight: bold;">⚠️ Important:</p>
          <ul style="color: #666; margin: 10px 0 0 0; padding-left: 20px;">
            <li>This OTP will expire in 10 minutes</li>
            <li>If you didn't request this, please ignore this email</li>
            <li>For security, never share this OTP with anyone</li>
            <li>Enter this OTP on the password reset page to continue</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin-bottom: 5px;">Need help? Contact us:</p>
          <p style="color: #666; margin: 0;">📍 Address: 2nd floor, Krishiv complex, Swaminarayan mandir Rd, Petlad, 388450</p>
          <p style="color: #666; margin: 5px 0;">📞 Phone: 9313720714</p>
          <p style="color: #666; margin: 5px 0;">📧 Email: stargympetlad0205@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for Contact Form (Admin Notification)
const createContactAdminEmail = (contact) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Inquiry Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; border-top: 5px solid #fbbf24;">
        <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">New Inquiry from Contact Form</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px 0; color: #666; font-weight: bold; width: 30%;">Name:</td>
            <td style="padding: 10px 0; color: #333;">${contact.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666; font-weight: bold;">Email:</td>
            <td style="padding: 10px 0; color: #333;">${contact.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666; font-weight: bold;">Phone:</td>
            <td style="padding: 10px 0; color: #333;">${contact.phone}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666; font-weight: bold;">Subject:</td>
            <td style="padding: 10px 0; color: #333;">${contact.subject}</td>
          </tr>
        </table>

        <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 5px; border-left: 4px solid #fbbf24;">
          <h3 style="margin-top: 0; color: #333;">Message:</h3>
          <p style="color: #555; line-height: 1.6; white-space: pre-line;">${contact.message}</p>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
          Received on: ${new Date().toLocaleString()}
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for Contact Form (User Thank You)
const createContactUserEmail = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Thank you for contacting Star Gym</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; border-top: 5px solid #fbbf24; text-align: center;">
        <h1 style="color: #fbbf24;">Thank You! 💪</h1>
        <p style="color: #444; font-size: 18px;">Hi ${name},</p>
        <p style="color: #666; line-height: 1.6;">We have received your message and appreciate you reaching out to <strong>Star Gym</strong>. Our team is currently reviewing your inquiry and will get back to you as soon as possible (usually within 24 hours).</p>
        
        <div style="margin: 30px 0; padding: 20px; border: 1px dashed #ddd; color: #888;">
          Stay motivated and keep shining!
        </div>

        <div style="text-align: left; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
          <p style="margin: 0; font-weight: bold; color: #333;">Best Regards,</p>
          <p style="margin: 5px 0 0 0; color: #fbbf24; font-weight: bold;">The Star Gym Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for store payment balance notification
const createStoreBalanceEmail = (sale, customerName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Received - Star Gym Store</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Payment Received! 🛍️</h1>
          <p style="color: #666; margin-top: 10px;">Star Gym Store Order Update</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px;">Dear ${customerName},</p>
          <p style="color: #444; line-height: 1.5;">We have received your payment for your recent order at Star Gym Store. Here is your current balance information:</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0; font-size: 18px;">Order & Payment Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Total Order Amount:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">₹${sale.totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Total Amount Paid:</td>
              <td style="padding: 8px 0; color: #4caf50; font-weight: bold;">₹${sale.paidAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; border-top: 1px solid #ddd;">Remaining Balance:</td>
              <td style="padding: 8px 0; color: #f44336; font-weight: bold; border-top: 1px solid #ddd; font-size: 18px;">₹${sale.balanceAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #f57c00; margin: 0; font-weight: bold;">⚠️ Action Required:</p>
          <p style="color: #666; margin: 10px 0 0 0;">Please ensure the remaining balance of <strong>₹${sale.balanceAmount.toLocaleString()}</strong> is cleared at your earliest convenience to maintain your official professional standing.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin-bottom: 5px;">Star Gym Store Management</p>
          <p style="color: #666; margin: 0;">📍 Address: Petlad, 388450</p>
          <p style="color: #666; margin: 5px 0;">📞 Phone: 9313720714</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for store purchase success (full payment)
const createStorePurchaseSuccessEmail = (sale, customerName) => {
  const itemsList = sale.items.map(item => `
    <tr>
      <td style="padding: 8px 0; color: #444;">${item.product.name || 'Product'}</td>
      <td style="padding: 8px 0; color: #444; text-align: center;">x${item.quantity}</td>
      <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">₹${(item.priceAtSale * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful - Star Gym Store</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #e8f5e9; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
            <span style="font-size: 30px; line-height: 60px;">✅</span>
          </div>
          <h1 style="color: #2e7d32; margin: 0;">Payment Successful! 🎉</h1>
          <p style="color: #666; margin-top: 10px;">Thank you for your purchase at Star Gym Store</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px;">Dear ${customerName},</p>
          <p style="color: #444; line-height: 1.5;">Great news! Your payment for the order has been successfully completed. Your order is now being processed.</p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
          <h2 style="color: #374151; margin-top: 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #edf2f7;">
                <th style="text-align: left; padding: 8px 0; color: #666; font-size: 13px;">Item</th>
                <th style="text-align: center; padding: 8px 0; color: #666; font-size: 13px;">Qty</th>
                <th style="text-align: right; padding: 8px 0; color: #666; font-size: 13px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td colspan="2" style="padding: 15px 0 5px; color: #374151; font-weight: bold;">Total Amount Paid:</td>
                <td style="padding: 15px 0 5px; color: #2e7d32; font-weight: bold; text-align: right; font-size: 18px;">₹${sale.paidAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 0; color: #6b7280; font-size: 12px;">Payment Method:</td>
                <td style="padding: 0; color: #6b7280; font-size: 12px; text-align: right;">${sale.paymentMode.toUpperCase()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #1e40af; margin: 0; font-weight: bold;">📦 What's Next?</p>
          <p style="color: #1e40af; margin: 10px 0 0 0; font-size: 14px;">Your items will be ready for pickup at the gym reception. Please show this email to the desk manager to collect your products.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin-bottom: 5px; font-weight: bold;">Star Gym Petlad</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">2nd floor, Krishiv complex, Swaminarayan mandir Rd, Petlad, 388450</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">Customer Support: 9313720714</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for password reset (legacy - kept for backward compatibility)
const createPasswordResetEmail = (resetURL) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Star Gym Admin</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Password Reset Request 🔐</h1>
          <p style="color: #666; margin-top: 10px;">Star Gym Admin Panel</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px;">Hello,</p>
          <p style="color: #444; line-height: 1.5;">You requested to reset your password for your Star Gym admin account. Click the button below to reset your password:</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" 
             style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);">
            Reset Password
          </a>
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #f57c00; margin: 0; font-weight: bold;">⚠️ Important:</p>
          <ul style="color: #666; margin: 10px 0 0 0; padding-left: 20px;">
            <li>This link will expire in 10 minutes</li>
            <li>If you didn't request this, please ignore this email</li>
            <li>For security, never share this link with anyone</li>
          </ul>
        </div>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #666; margin: 0; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #333; margin: 10px 0 0 0; font-size: 12px; word-break: break-all;">${resetURL}</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin-bottom: 5px;">Need help? Contact us:</p>
          <p style="color: #666; margin: 0;">📍 Address: 2nd floor, Krishiv complex, Swaminarayan mandir Rd, Petlad, 388450</p>
          <p style="color: #666; margin: 5px 0;">📞 Phone: 9313720714</p>
          <p style="color: #666; margin: 5px 0;">📧 Email: stargympetlad0205@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Export all functions in a single object
module.exports = {
  sendEmail,
  createRegistrationEmail,
  createPaymentConfirmationEmail,
  createStoreBalanceEmail,
  createContactAdminEmail,
  createContactUserEmail,
  createStorePurchaseSuccessEmail,
  createPasswordResetEmail,
  createPasswordResetOTPEmail
};