const Message = require('../models/Message');
const nodemailer = require('nodemailer');

// Setup email transport
const getTransporter = async () => {
  let config = {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // Automatically generate a test Ethereal account if credentials aren't provided
  if (!config.auth.user || !config.auth.pass) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      config.host = 'smtp.ethereal.email';
      config.port = 587;
      config.auth = {
        user: testAccount.user,
        pass: testAccount.pass,
      };
      console.log(`Generated Ethereal Mail Credentials: ${testAccount.user} / ${testAccount.pass}`);
    } catch (err) {
      console.error('Ethereal test account generation failed, falling back to local logs:', err.message);
    }
  }

  return nodemailer.createTransport(config);
};

// Send message (User Contact Form Submission)
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all details' });
    }

    const newMessage = await Message.create({ name, email, subject, message });

    // Send email asynchronously
    (async () => {
      try {
        const transporter = await getTransporter();
        const mailOptions = {
          from: process.env.EMAIL_FROM || '"Behencode Contact" <contact@behencode.co>',
          to: process.env.ADMIN_EMAIL || 'admin@behencode.co',
          subject: `Contact Inquiry: ${subject}`,
          text: `You have a new message from ${name} (${email}):\n\nSubject: ${subject}\n\nMessage:\n${message}`,
          html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${message}</p>
          `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email notification sent. Message ID: ${info.messageId}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`Email preview link (Ethereal): ${previewUrl}`);
        }
      } catch (err) {
        console.error('Email notify background error:', err.message);
      }
    })();

    res.status(201).json({ success: true, message: 'Your message has been sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all contact messages (Admin protected)
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a contact message (Admin protected)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    await message.deleteOne();
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
