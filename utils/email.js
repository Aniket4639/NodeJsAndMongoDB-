const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter object
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email configuration options
  const mailOptions = {
    from: 'nodeJsMongoDB <no-reply@yourapp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // (Optional) Uncomment if sending HTML templates later
  };

  // 3) Actually send the email using a Promise-based action
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
