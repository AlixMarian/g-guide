import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';

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
  password: 'root',
  database: 'g-guide'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
  console.log('Connected to the MySQL database.');
});

// API endpoints
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Sign-up endpoint
app.post('/signup', async (req, res) => {
  const { fullName, contactNum, emailAddress, password, dataConsent } = req.body;
  console.log('Received signup request:', req.body);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (full_name, contact_number, email_address, password, data_consent) VALUES (?, ?, ?, ?, ?)';
    const values = [fullName, contactNum, emailAddress, hashedPassword, dataConsent ? 1 : 0];

    connection.query(query, values, (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.status(200).json({ message: 'User registered successfully' });
    });
  } catch (err) {
    console.error('Error during sign-up process:', err);
    res.status(500).json({ error: 'Sign-up process failed', details: err.message });
  }
});


// Login endpoint
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



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
