require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const nodemailer = require('nodemailer');
const app = express(); 

app.use(bodyParser.json());


// Authentication middleware
function authenticateToken(req, res, next) {
  console.log(res.header)
    const token = req.header('Authorization');
    if (!token) return res.sendStatus(401);
    console.log(token)

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }


// Create an account
app.post('/accounts', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, birthday } = req.body;
    if (!first_name || !last_name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO Account (first_name, last_name, email, phone, password, birthday) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, hashedPassword, birthday],
      function (err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        // Create a transporter object using your SMTP settings
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.gmailUser,
            pass: process.env.gmailPass,
          },
        });

        // Compose the email content
        const mailOptions = {
          from: 'testnode50@gmail.com',
          to: 'mhdmarwan111@gmail.com',
          subject: 'New User Created',
          html: '<p>Thank you for creating new user!</p><p> User Name : '+ first_name+" "+last_name,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });

        res.json({ message: 'Account created successfully' });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});



// Read (Retrieve) an account by ID
app.get('/accounts/:id', authenticateToken, (req, res) => {
  const accountId = req.params.id;

  db.get('SELECT * FROM Account WHERE id = ?', [accountId], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(row);
  });
});



// Update an account by ID
app.put('/accounts/:id',authenticateToken, async (req, res) => {
  const accountId = req.params.id;
  const { first_name, last_name, email, phone, password, birthday } = req.body;

  try {
    // Hash the new password if provided
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    // Update the account
    db.run(
      'UPDATE Account SET first_name = ?, last_name = ?, email = ?, phone = ?, password = ?, birthday = ?, last_modified = CURRENT_TIMESTAMP WHERE id = ?',
      [first_name, last_name, email, phone, hashedPassword, birthday, accountId],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({ message: 'Account updated successfully' });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Delete an account by ID
app.delete('/accounts/:id',authenticateToken, (req, res) => {
  const accountId = req.params.id;

  db.run('DELETE FROM Account WHERE id = ?', [accountId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json({ message: 'Account deleted successfully' });
  });
});



// Authenticate user and issue JWT token
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Received login request for email:', email);

  // Check if email and password are provided
  if (!email || !password) {
    console.log('Invalid request: Email and password are required');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Check if the user exists in the database
  db.get('SELECT * FROM Account WHERE email = ?', email, async (error, row) => {
    if (error) {
      throw new Error(error.message);
    }
    const user = row;

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify the password
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log('Password does not match for email:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: user.id, email: user.email },process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expiration time
      });

      res.json({ token });
    } catch (error) {
      console.error('Bcrypt comparison error:', error);
      // Handle the error
      return res.status(500).json({ error: 'Server Error' });
    }
  });
});
  
  

// List accounts with result limitation
app.get('/accounts', authenticateToken, (req, res) => {
  const limit = req.query.limit || 10;
  db.all(
    'SELECT * FROM Account LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});



// Start the server
app.listen(process.env.port, () => {
  console.log(`Server is running on port ${process.env.port}`);
});
