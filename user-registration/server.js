const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import User model

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/user_registration', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve the form page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/form.html'));
});

// Handle form submission and file upload
app.post('/register', upload.array('files', 5), async (req, res) => {
  const { name, email } = req.body;
  const files = req.files;

  // Validate form data
  if (!name || !email || !files) {
    return res.status(400).send('All fields are required.');
  }

  try {
    // Store data in MongoDB
    const fileNames = files.map(file => file.filename);
    const user = new User({
      name,
      email,
      files: fileNames
    });
    await user.save();
    res.send('Registration Successful!');
  } catch (error) {
    res.status(500).send('Error registering user.');
  }
});

// List uploaded files
app.get('/files', async (req, res) => {
  try {
    const users = await User.find();
    res.render('files', { users });
  } catch (error) {
    res.status(500).send('Error fetching files.');
  }
});

// Route to download a file
app.get('/download/:filename', (req, res) => {
  const file = path.join(__dirname, 'public/uploads/', req.params.filename);
  res.download(file);
});

// Set view engine (Optional if you're using files.ejs)
app.set('view engine', 'ejs');

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
