import express from 'express';
import { createTransport } from 'nodemailer';
import cors from 'cors';

const app = express();
const port = 3006;

app.use(cors()); // Enable all CORS requests
app.use(express.json());

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: 'marianehistoria88@gmail.com',
    pass: 'wsxibnhevdqrbcrb'
  }
});

app.post('/send-email', async (req, res) => {
  const { email, name } = req.body;

  const mailApproved = {
    from: 'marianehistoria88@gmail.com',
    to: email,
    subject: 'Church Registration Approved',
    text: `Hello ${name},\n\nYour church registration has been approved.\n\nBest regards,\nThe Team`
  };

  try {
    const info = await transporter.sendMail(mailApproved);
    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error });
  }
});

app.post('/send-rejection-email', async (req, res) => {
  const { email, name } = req.body;

  const mailReject = {
    from: 'marianehistoria88@gmail.com',
    to: email,
    subject: 'Church Registration Rejected',
    text: `Hello ${name},\n\nWe regret to inform you that your church registration has been rejected.\n\nBest regards,\nThe Team`
  };

  try {
    const info = await transporter.sendMail(mailReject);
    res.status(200).json({ message: 'Rejection email sent successfully', info });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send rejection email', error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
