import nodemailer from 'nodemailer';
import express from 'express';

const app = express();
app.use(express.json());

// Configure the transporter
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'marianehistoria88@gmail.com',
    pass: 'wsxibnhevdqrbcrb' 
  }
});


// Endpoint to send email
app.post('/send-email', (req, res) => {
  const { email, name } = req.body;

  const mailOptions = {
    from: 'marianehistoria88@gmail.com',
    to: email,
    subject: 'Church Approval Confirmation',
    html: `Dear User, <br><br>Your church <strong>${name}</strong> has been approved.<br><br>Best Regards,<br>Team`
  };


  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Email sent');
    }
  });
});

// Start the server
const PORT = '3000';
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});