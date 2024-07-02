import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3006;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'g-guide'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database.');
});

// API endpoints
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.get('/users', (req, res) => {
  const query = 'SELECT * FROM website_visitor';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results);
  });
});

app.post('/signup', (req, res) => {
  const { RoleID, AStatusID, RStatusID, ChurchID, WbvFullName, WbvPhoneNumber, WbvPassword, WbvStatus } = req.body;
  const query = 'INSERT INTO website_visitor (RoleID, AStatusID, RStatusID, ChurchID, WbvFullName, WbvPhoneNumber, WbvPassword, WbvStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(query, [RoleID, AStatusID, RStatusID, ChurchID, WbvFullName, WbvPhoneNumber, WbvPassword, WbvStatus], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'User registered successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
