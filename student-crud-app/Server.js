const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Student = require('./models/Student');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/student-crud-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Session middleware
app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/student-crud-app' }),
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Middleware to check login
function checkAuth(req, res, next) {
  if (req.session.isLoggedIn) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Routes
// Register route
app.get('/register', (req, res) => {
    res.render('register');
  });
  
  app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.redirect('/login');
  });
  
  // Login route
  app.get('/login', (req, res) => {
    res.render('login');
  });
  
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (user && await user.checkPassword(password)) {
      req.session.isLoggedIn = true;
      req.session.userId = user._id;
      res.redirect('/students');
    } else {
      res.send('Invalid username or password');
    }
  });
  
  // Logout route
  app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
  });
  
  // Students CRUD operations
  app.get('/students', checkAuth, async (req, res) => {
    const students = await Student.find();
    res.render('students', { students });
  });
  
  app.post('/students', checkAuth, async (req, res) => {
    const { name, age, course } = req.body;
    await new Student({ name, age, course }).save();
    res.redirect('/students');
  });
  
  app.get('/students/:id/edit', checkAuth, async (req, res) => {
    const student = await Student.findById(req.params.id);
    res.render('edit-student', { student });
  });
  
  app.post('/students/:id', checkAuth, async (req, res) => {
    const { name, age, course } = req.body;
    await Student.findByIdAndUpdate(req.params.id, { name, age, course });
    res.redirect('/students');
  });
  
  app.post('/students/:id/delete', checkAuth, async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/students');
  });

  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });
  