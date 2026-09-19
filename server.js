require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const User = require('./models/User');
const Enquiry = require('./models/Enquiry');
const GalleryItem = require('./models/GalleryItem');
const VideoItem = require('./models/VideoItem');
const ResultItem = require('./models/ResultItem');
const TestimonialItem = require('./models/TestimonialItem');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Function to seed initial static photos into the database if empty
const seedGallery = async () => {
  try {
    const count = await GalleryItem.countDocuments();
    if (count === 0) {
      const staticPhotos = [
        { title: 'Moment 2', imagePath: 'photos/Picture2.png' },
        { title: 'Moment 3', imagePath: 'photos/Picture3.png' },
        { title: 'Moment 4', imagePath: 'photos/Picture4.png' },
        { title: 'Moment 5', imagePath: 'photos/Picture5.png' },
        { title: 'Moment 6', imagePath: 'photos/Picture6.png' },
        { title: 'Moment 7', imagePath: 'photos/Picture7.png' },
        { title: 'Moment 8', imagePath: 'photos/Picture8.png' },
        { title: 'Moment 9', imagePath: 'photos/Picture9.png' },
        { title: 'Moment 10', imagePath: 'photos/Picture10.png' },
        { title: 'Moment 11', imagePath: 'photos/Picture11.png' },
        { title: 'Moment 12', imagePath: 'photos/Picture12.png' },
        { title: 'Moment 13', imagePath: 'photos/Picture13.png' },
        { title: 'Moment 14', imagePath: 'photos/Picture14.png' },
        { title: 'Moment 15', imagePath: 'photos/Picture15.png' },
        { title: 'Moment 16', imagePath: 'photos/Picture16.png' }
      ];
      await GalleryItem.insertMany(staticPhotos);
      console.log('Static gallery photos successfully seeded to database.');
    }
  } catch (err) {
    console.error('Error seeding gallery:', err);
  }
};

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cognition_academy';
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('MongoDB Connected Successfully!');
    await seedGallery();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Enable CORS for all requests (e.g. Live Server debugging)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve Static Files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// User Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, phone, course, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all required fields.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      course,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: { name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password.' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Incorrect email or password.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect email or password.' });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Submit Enquiry
app.post('/api/enquiry', async (req, res) => {
  try {
    const { studentName, parentName, phone, whatsapp, currentClass, course, school, message } = req.body;

    if (!studentName || !phone || !course) {
      return res.status(400).json({ error: 'Please fill all required fields (*).' });
    }

    const newEnquiry = new Enquiry({
      studentName,
      parentName,
      phone,
      whatsapp,
      currentClass,
      course,
      school,
      message
    });

    await newEnquiry.save();

    res.status(201).json({
      success: true,
      message: 'Enquiry received successfully!'
    });
  } catch (error) {
    console.error('Enquiry error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Admin Authentication Middleware
const checkAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin password.' });
  }
  next();
};

// Admin Routes

// Verify Admin Password
app.get('/api/admin/verify', checkAdminAuth, (req, res) => {
  res.json({ success: true, message: 'Authenticated successfully!' });
});

// Get All Enquiries
app.get('/api/admin/enquiries', checkAdminAuth, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (error) {
    console.error('Fetch enquiries error:', error);
    res.status(500).json({ error: 'Server error fetching enquiries.' });
  }
});

// Update Enquiry (Status & Notes)
app.put('/api/admin/enquiries/:id', checkAdminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    if (!updatedEnquiry) {
      return res.status(404).json({ error: 'Enquiry not found.' });
    }
    res.json({ success: true, enquiry: updatedEnquiry });
  } catch (error) {
    console.error('Update enquiry error:', error);
    res.status(500).json({ error: 'Server error updating enquiry.' });
  }
});

// Delete Enquiry
app.delete('/api/admin/enquiries/:id', checkAdminAuth, async (req, res) => {
  try {
    const deleted = await Enquiry.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Enquiry not found.' });
    }
    res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    res.status(500).json({ error: 'Server error deleting enquiry.' });
  }
});

// Gallery API Routes

// Get All Gallery Items
app.get('/api/gallery', async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    console.error('Fetch gallery error:', error);
    res.status(500).json({ error: 'Server error fetching gallery.' });
  }
});

// Upload Photo (Base64)
app.post('/api/admin/gallery', checkAdminAuth, async (req, res) => {
  try {
    const { title, imageBase64, fileName } = req.body;
    if (!imageBase64 || !fileName) {
      return res.status(400).json({ error: 'Image content and file name are required.' });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const fileExt = path.extname(fileName) || '.png';
    const uniqueName = `photos_${Date.now()}${fileExt}`;
    const uploadPath = path.join(__dirname, 'public', 'photos', uniqueName);

    // Ensure directory exists
    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

    // Write file to disk
    fs.writeFileSync(uploadPath, buffer);

    const newPhoto = new GalleryItem({
      title: title || '',
      imagePath: `photos/${uniqueName}`
    });
    await newPhoto.save();

    res.status(201).json({ success: true, photo: newPhoto });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Server error uploading photo.' });
  }
});

// Delete Photo
app.delete('/api/admin/gallery/:id', checkAdminAuth, async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    const diskPath = path.join(__dirname, 'public', item.imagePath);
    if (fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
      } catch (err) {
        console.error('Disk delete error (ignored):', err);
      }
    }

    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Photo deleted successfully.' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Server error deleting photo.' });
  }
});

// Video API Routes

// Get All Videos
app.get('/api/videos', async (req, res) => {
  try {
    const items = await VideoItem.find().sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    console.error('Fetch videos error:', error);
    res.status(500).json({ error: 'Server error fetching videos.' });
  }
});

// Add Video
app.post('/api/admin/videos', checkAdminAuth, async (req, res) => {
  try {
    const { title, youtubeId, subject } = req.body;
    if (!title || !youtubeId || !subject) {
      return res.status(400).json({ error: 'Title, YouTube ID, and Subject are required.' });
    }

    const newVideo = new VideoItem({ title, youtubeId, subject });
    await newVideo.save();

    res.status(201).json({ success: true, video: newVideo });
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({ error: 'Server error adding video.' });
  }
});

// Delete Video
app.delete('/api/admin/videos/:id', checkAdminAuth, async (req, res) => {
  try {
    const deleted = await VideoItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Video not found.' });
    }
    res.json({ success: true, message: 'Video deleted successfully.' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Server error deleting video.' });
  }
});

// Results API Routes

// Get All Results
app.get('/api/results', async (req, res) => {
  try {
    const items = await ResultItem.find().sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    console.error('Fetch results error:', error);
    res.status(500).json({ error: 'Server error fetching results.' });
  }
});

// Upload Result Topper Card
app.post('/api/admin/results', checkAdminAuth, async (req, res) => {
  try {
    const { studentName, imageBase64, fileName, year } = req.body;
    if (!imageBase64 || !fileName || !year) {
      return res.status(400).json({ error: 'Image content, file name, and year are required.' });
    }

    // Save imageBase64 directly in imagePath instead of writing to disk
    const newResult = new ResultItem({
      studentName: studentName || '',
      imagePath: imageBase64,
      year: String(year).trim()
    });
    await newResult.save();

    res.status(201).json({ success: true, result: newResult });
  } catch (error) {
    console.error('Upload result error:', error);
    res.status(500).json({ error: 'Server error uploading result topper card.' });
  }
});

// Delete Result Topper Card
app.delete('/api/admin/results/:id', checkAdminAuth, async (req, res) => {
  try {
    const item = await ResultItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Result item not found.' });
    }

    // Only delete local disk files, skip if base64 or external url
    if (item.imagePath && !item.imagePath.startsWith('data:') && !item.imagePath.startsWith('http://') && !item.imagePath.startsWith('https://')) {
      const diskPath = path.join(__dirname, 'public', item.imagePath);
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (err) {
          console.error('Disk delete error (ignored):', err);
        }
      }
    }

    await ResultItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Result topper card deleted successfully.' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ error: 'Server error deleting result topper card.' });
  }
});

// Testimonials API Routes

// Get All Testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const items = await TestimonialItem.find().sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    console.error('Fetch testimonials error:', error);
    res.status(500).json({ error: 'Server error fetching testimonials.' });
  }
});

// Upload Video Testimonial (Now registers videoUrl instead of base64 upload)
app.post('/api/admin/testimonials', checkAdminAuth, async (req, res) => {
  try {
    const { studentName, college, videoUrl } = req.body;
    if (!studentName || !college || !videoUrl) {
      return res.status(400).json({ error: 'Student name, college, and video URL are required.' });
    }

    const newTestimonial = new TestimonialItem({
      studentName,
      college,
      videoPath: videoUrl.trim()
    });
    await newTestimonial.save();

    res.status(201).json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    console.error('Upload testimonial error:', error);
    res.status(500).json({ error: 'Server error uploading video testimonial.' });
  }
});

// Delete Video Testimonial
app.delete('/api/admin/testimonials/:id', checkAdminAuth, async (req, res) => {
  try {
    const item = await TestimonialItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Testimonial not found.' });
    }

    // Only delete local disk files, skip if external link
    if (item.videoPath && !item.videoPath.startsWith('http://') && !item.videoPath.startsWith('https://') && !item.videoPath.startsWith('data:')) {
      const diskPath = path.join(__dirname, 'public', item.videoPath);
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (err) {
          console.error('Disk delete error (ignored):', err);
        }
      }
    }

    await TestimonialItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Server error deleting testimonial.' });
  }
});

// Serve main page (fallback for index)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local Access: http://localhost:${PORT}`);
});
