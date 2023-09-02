const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

app.use(cors());
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/fileDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const schoolSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  board: { type: String, required: true },
  percentage: { type: Number, required: true },
  year: { type: Number, required: true },
  location: { type: String, required: true },
});

const collegeSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  department: { type: String, required: true },
  percentage: { type: Number, required: true },
  year: { type: Number, required: true },
  location: { type: String, required: true },
});


const personalSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNo: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  school: schoolSchema,
  college: collegeSchema,
});


const fileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: String,
  contentType: String,
  data: Buffer,
});


const User = mongoose.model('User', userSchema);
const Personal = mongoose.model('Personal', personalSchema);
const File = mongoose.model('File', fileSchema);

// Middleware to verify JWT token and role
function verifyTokenAndRole(role) {
  return (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(403).json({ error: 'Access denied' });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }

      if (decoded.role !== role) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      req.userId = decoded.userId;
      next();
    });
  };
}

// Register route
app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName ,email, password, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'user', // Default role is 'user'
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokenPayload = {
      userId: user._id,
      email: user.email, // Include email in the payload
      role: user.role,
    };

    // Create a JWT token
    const token = jwt.sign(tokenPayload, process.env.JWT_KEY, { expiresIn: '30d' });
    console.log(`User with email ${email} successfully logged in.`);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Protected route with role-based authorization
app.get('/protected-route', verifyTokenAndRole('user'), (req, res) => {
  res.status(200).json({ message: 'Protected route accessed successfully' });
});

// GET route to retrieve personal information
app.get('/personal/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const personalInfo = await Personal.findOne({ email });
    if (!personalInfo) {
      return res.status(404).json({ error: 'Personal information not found' });
    }
    res.status(200).json(personalInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve personal information' });
  }
});

app.post('/personal', async (req, res) => {
  try {
    const { fullName, email, mobileNo, permanentAddress, school, college} = req.body;

    // Check if the user already exists
    const existingPersonal = await Personal.findOne({ email });
    if (existingPersonal) {
      return res.status(400).json({ error: 'Personal information already exists' });
    }
    const newPersonal = new Personal({
      fullName,
      email,
      mobileNo,
      permanentAddress,
      school,
      college,
    });

    await newPersonal.save();
    res.status(201).json({ message: 'Personal information added successfully' });
  } catch (error) {
    if (error.code === 11000) { 
      // Duplicate key error (unique constraint violation)
      res.status(400).json({ error: 'Email already exists' });
    } else {

      console.error('Error adding personal information:', error);
      res.status(500).json({ error: 'Failed to add personal information' });
    }
  }
});

app.get('/currentUser', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userEmail = decodedToken.email; // Assuming you stored the user's email in the token
    const user = await User.findOne({ email: userEmail });
    console.log('Decoded Token',decodedToken);
    console.log('userEmail',userEmail);
    console.log('user',user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Find the user's personal information using the user's ID
    const personalInfo = await Personal.findOne({ email: userEmail });
    if (!personalInfo) {
      console.log('Personal information not found for email:', userEmail);
      return res.status(404).json({ error: 'Personal information not found' });
    }
    console.log('Personal information found:', personalInfo);
    res.status(200).json(personalInfo);
  } catch (error) {
    console.error('Error retrieving personal information:', error);
    res.status(500).json({ error: 'Failed to retrieve personal information' });
  }
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB limit
  },
});

// Example route to upload a file
app.post('/upload', upload.single('file'), async (req, res) => {
  const { originalname, mimetype, buffer } = req.file;
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId;

    const file = new File({
      user: userId, // Associate the file with the user
      filename: originalname,
      contentType: mimetype,
      data: buffer,
    });

    await file.save();
    res.status(200).send('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Server Error');
  }
});

app.get('/userFile', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId; // Assuming you stored the user's ID in the token
    const userFiles = await File.find({ user: userId });

    if (userFiles.length === 0) {
      return res.status(404).json({ error: "User's files not found" });
    }
    res.status(200).json(userFiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user files' });
  }
});

app.get('/files', async (req, res) => {
  try {
    const files = await File.find({}, 'filename'); 
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).send('Server Error');
  }
});


app.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const file = await File.findOne({ filename });

    if (!file) {
      return res.status(404).send('File not found');
    }

    res.setHeader('Content-Disposition', `attachment; filename=${file.filename}`);
    res.setHeader('Content-Type', file.contentType);
    res.send(file.data);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Server Error');
  }
});


app.delete('/delete/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const deletedFile = await File.findOneAndDelete({ filename });

    if (!deletedFile) {
      return res.status(404).send('File not found');
    }

    res.status(200).send('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send('Server Error');
  }
});




const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
