require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Contact = require('./models/Contact');
const User = require('./models/User');
const Instructor = require('./models/Instructor');
const Content = require('./models/Content');
const Review = require('./models/Review');
const Event = require('./models/Event');

const app = express();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to check database connection
const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn(`[API] Database not connected. Readiness: ${mongoose.connection.readyState}`);
    return res.status(503).json({ error: 'Database connection is still initializing. Please retry in a moment.' });
  }
  next();
};

app.use('/api', checkDB);

// Database Connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://seung6649_db_user:40mZ6K6yZY0od04Q@ac-tdtohpn.ypjnxys.mongodb.net/taekwondo-db?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  family: 4, 
  serverSelectionTimeoutMS: 5000
})
.then(async () => {
    console.log('[MON] MongoDB connected successfully');
    
    // Diagnostic counts
    try {
      const iCount = await Instructor.countDocuments();
      const cCount = await Content.countDocuments();
      console.log(`[MON] Connected. Ready to serve: ${iCount} instructors, ${cCount} content items.`);
    } catch (countErr) {
      console.error('[MON] Critical Query Failure after connection:', countErr.message);
    }
    
    // Seed Admin User
    const adminExists = await User.findOne({ username: 'Admin' });
    if (!adminExists) {
        const admin = new User({ username: 'Admin', password: 'Seung@123' });
        await admin.save();
        console.log('Admin user seeded successfully');
    }

    // Seed Initial Site Content
    const initialContent = [
      { sectionKey: 'about_text', content: 'Taekwondo is a traditional Korean martial art focused on striking and kicking. More than just physical combat, it is a way of life that instills the tenets of Courtesy, Integrity, Perseverance, Self-Control, and Indomitable Spirit. At STC, you will learn self-defense alongside valuable life skills.' },
      { sectionKey: 'vision_text', content: 'To be the premier martial arts institution globally, fostering a community where individuals of all backgrounds can unlock their ultimate physical and mental potential through dynamic, elite Taekwondo training.' },
      { sectionKey: 'mission_text', content: 'Our mission is to empower students through disciplined instruction, instilling confidence, resilience, and respect. We commit to providing a safe, incredibly motivating environment led by world-class certified instructors.' }
    ];

    for (const item of initialContent) {
      const exists = await Content.findOne({ sectionKey: item.sectionKey });
      if (!exists) await new Content(item).save();
    }

    // Seed Initial Instructors if empty
    const instructorCount = await Instructor.countDocuments();
    if (instructorCount === 0) {
      await Instructor.create([
        { name: 'Master Seung', belt: '7th Dan Black Belt', bio: 'Head Coach with over 20 years of international competitive experience.', role: 'Head Coach' },
        { name: 'Coach Sarah', belt: '4th Dan Black Belt', bio: 'Head of Kids Programs and Poomsae specialist.', role: 'Senior Instructor' }
      ]);
    }
})
.catch((err) => console.error('MongoDB connection error:', err));

// --- API ROUTES ---

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      res.status(200).json({ message: 'Login successful', user: { username: user.username, role: user.role } });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Contact Inquiries CRUD
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (err) {
    console.error('Error submitting inquiry:', err);
    res.status(500).json({ error: 'Error submitting inquiry', details: err.message });
  }
});

app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts || []);
  } catch (err) {
    res.status(500).json({ error: 'Unable to retrieve inquiries.' });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error while deleting inquiry' });
  }
});

// CMS Content CRUD
app.get('/api/reviews', async (req, res) => {
  try {
    // Return latest 10 reviews
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(10);
    res.json(reviews || []);
  } catch (err) {
    res.status(500).json({ error: 'Unable to retrieve reviews.', detailed: err.message });
  }
});

app.post('/api/reviews', upload.single('image'), async (req, res) => {
  try {
    const { name, stars, text } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const newReview = new Review({ name, stars, text, imageUrl });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Error submitting review', details: err.message });
  }
});

// Events & Updates CRUD
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events || []);
  } catch (err) {
    res.status(500).json({ error: 'Unable to retrieve events.', detailed: err.message });
  }
});

app.post('/api/events', upload.single('image'), async (req, res) => {
  try {
    const { title, description, eventDate } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const newEvent = new Event({ title, description, eventDate: eventDate || Date.now(), imageUrl });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: 'Error creating event' });
  }
});

app.put('/api/events/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, eventDate } = req.body;
    const updateData = { title, description, eventDate };
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error updating event' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (err) {
    res.status(500).json({ error: 'Error removing event' });
  }
});

// Instructors CRUD
app.get('/api/instructors', async (req, res) => {
  try {
    console.log('[API] Fetching instructors...');
    const instructors = await Instructor.find().sort({ createdAt: -1 });
    console.log(`[API] Found ${instructors.length} instructors.`);
    res.json(instructors || []);
  } catch (err) {
    console.error('[API] Error fetching instructors FAIL:', err.message);
    res.status(500).json({ 
      error: 'Unable to retrieve instructors at this time.', 
      detailed: err.message,
      stack: err.stack 
    });
  }
});

app.post('/api/instructors', upload.single('image'), async (req, res) => {
  try {
    const { name, belt, bio, role, phone } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const newInstructor = new Instructor({ name, belt, bio, role, phone, imageUrl });
    await newInstructor.save();
    res.status(201).json(newInstructor);
  } catch (err) {
    res.status(500).json({ error: 'Error adding instructor' });
  }
});

app.put('/api/instructors/:id', upload.single('image'), async (req, res) => {
  try {
    console.log(`[API] Updating instructor ID: ${req.params.id}`);
    const { name, belt, bio, role, phone } = req.body;
    const updateData = { name, belt, bio, role, phone };
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
      console.log(`[API] New photo uploaded: ${updateData.imageUrl}`);
    }
    const updated = await Instructor.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      console.warn(`[API] Instructor not found for update: ${req.params.id}`);
      return res.status(404).json({ error: 'Instructor not found' });
    }
    console.log(`[API] Instructor ${updated.name} updated successfully.`);
    res.json(updated);
  } catch (err) {
    console.error(`[API] Error updating instructor ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Error updating instructor', detailed: err.message });
  }
});

app.delete('/api/instructors/:id', async (req, res) => {
  try {
    console.log(`Instructor Deletion Requested: ${req.params.id}`);
    const deleted = await Instructor.findByIdAndDelete(req.params.id);
    if (deleted) {
      console.log(`Instructor Deleted Successfully: ${req.params.id}`);
      res.json({ message: 'Instructor removed' });
    } else {
      console.warn(`Instructor Not Found for Deletion: ${req.params.id}`);
      res.status(404).json({ error: 'Instructor not found' });
    }
  } catch (err) {
    console.error(`Error deleting instructor ${req.params.id}:`, err);
    res.status(500).json({ error: 'Error deleting instructor' });
  }
});

// Website Content CRUD
app.get('/api/content', async (req, res) => {
  try {
    const content = await Content.find();
    res.json(content || []);
  } catch (err) {
    console.error('[API] Error fetching content:', err.message);
    res.status(500).json({ error: 'Unable to load website content.', detailed: err.message });
  }
});

app.put('/api/content/:key', async (req, res) => {
  try {
    const { content } = req.body;
    await Content.findOneAndUpdate(
      { sectionKey: req.params.key },
      { content, lastUpdated: Date.now() },
      { upsert: true }
    );
    res.json({ message: 'Content updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating content' });
  }
});

// Contact/Inquiries
app.get('/api/contacts', async (req, res) => {
    try {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching contacts' });
    }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Validate
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Save to DB
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    res.status(201).json({ message: 'Contact message received!' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('TaeKwonDo Elite API is running.');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
