const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/notifications/send
// body: { userId?, subject, message }
exports.sendNotification = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;

    let recipients = [];

    if (userId) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      recipients = [user.email];
    } else {
      const users = await User.find({}, 'email');
      recipients = users.map((u) => u.email);
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipients,
      subject,
      text: message,
    });

    res.json({ message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
