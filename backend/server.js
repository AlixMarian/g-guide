import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const app = express();
const port = 3006;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(bodyParser.json());

// Database connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'alixmarian1!', //password sa inyo MySQL
  database: 'g-guide'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
  console.log('Connected to the MySQL database.');
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'alixmariang@gmail.com', //replace with actual gmail account nga mu send emails 
    pass: 'ovhv fxwf cxgv ovmq' //special password sa inyo gmail account
  }
});

// Sign-up endpoint
app.post('/signup', async (req, res) => {
  const { fullName, contactNum, emailAddress, password, dataConsent } = req.body;
  console.log('Received signup request:', req.body);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const query = 'INSERT INTO users (full_name, contact_number, email_address, password, data_consent, verification_token, verified) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [fullName, contactNum, emailAddress, hashedPassword, dataConsent ? 1 : 0, verificationToken, 0];

    connection.query(query, values, (err) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      // Send verification email
      const verificationUrl = `http://localhost:5173/verify/${verificationToken}`;
      const mailOptions = {
        from: 'alixmariang@gmail.com', //gmail account nga mu send confirmation emails
        to: emailAddress,
        subject: 'G! Guide Email Verification',
        html: `
          <p>You are now one click away to use G! Guide. Please verify your email by clicking the button below:</p>
          <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Verify Email</a>
        `
      };


      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending verification email:', err);
          return res.status(500).json({ error: 'Email sending failed', details: err.message });
        }
        console.log('Verification email sent:', info.response);
        res.status(200).json({ message: 'User registered successfully. Please check your email to verify your account.' });
      });
    });
  } catch (err) {
    console.error('Error during sign-up process:', err);
    res.status(500).json({ error: 'Sign-up process failed', details: err.message });
  }
});

// Verification endpoint
app.get('/verify/:token', (req, res) => {
  const { token } = req.params;

  const query = 'UPDATE users SET verified = 1, verification_token = NULL WHERE verification_token = ?';
  connection.query(query, [token], (err, results) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(500).json({ success: false, error: 'Database error', details: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    res.json({ success: true });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

//others
app.post('/login', async (req, res) => {
  const { emailAddress, password } = req.body;
  console.log('Received login request:', req.body);

  try {
    const query = 'SELECT * FROM users WHERE email_address = ?';
    connection.query(query, [emailAddress], async (err, results) => {
      if (err) {
        console.error('Error retrieving user:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      if (results.length === 0) {
        console.log('No user found with this email address');
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = results[0];
      if (!user.verified) {
        console.log('User email not verified');
        return res.status(403).json({ error: 'Email not verified' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log('Password does not match');
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log('Login successful');
      res.status(200).json({ message: 'Login successful' });
    });
  } catch (err) {
    console.error('Error during login process:', err);
    res.status(500).json({ error: 'Login process failed', details: err.message });
  }
});

