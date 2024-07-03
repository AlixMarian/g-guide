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

app.post('/signup', async (req, res) => {
  const { fullName, contactNum, emailAddress, password, dataConsent } = req.body;
  console.log('Received signup request:', req.body); // Log the received data

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    const query = 'INSERT INTO users (FullName, ContactNumber, EmailAddress, Password, DataConsent) VALUES (?, ?, ?, ?, ?)';
    const values = [fullName, contactNum, emailAddress, hashedPassword, dataConsent];

    connection.query(query, values, (err, results) => {
      if (err) {
        console.error('Error inserting data:', err); // Log error
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      console.log('Data inserted successfully:', results); // Log success
      res.status(200).json({ message: 'User registered successfully' });
    });
  } catch (err) {
    console.error('Error during sign-up process:', err);
    res.status(500).json({ error: 'Sign-up process failed', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
