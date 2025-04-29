const nodemailer = require('nodemailer');

// ⭐ Email Transporter Setup (SMTP server like Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER, // Your email
        pass: process.env.SMTP_PASS  // Your email password or app password
    }
});

// ⭐ Function to Send Emails
const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: `"CEX Crypto Exchange" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
