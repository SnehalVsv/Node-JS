const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

// Initialize Redis client
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

// Initialize the express app
const app = express();

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: false }));

// Session middleware
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // In production, set this to `true` for HTTPS
  })
);

// Dummy users (in real-world apps, store users in a database)
const users = [
  { username: 'testuser', password: bcrypt.hashSync('password123', 10) },
];

// Serve CSS
app.use(express.static('public'));

// Middleware to check if the user is logged in
function checkAuth(req, res, next) {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}

