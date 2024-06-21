const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For file names

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve images

// PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:  process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log full error stack
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- File Upload Configuration (Consider using cloud storage instead) ---

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Local storage (not ideal for production)
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage });

// --- API Routes (Rewritten) ---

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    handleError(res, err, 'Failed to fetch categories');
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(res, err, 'Failed to add category');
  }
});

// ... (Re-write all other category routes using the same pattern)

// Items
app.post('/api/items/:categoryId', upload.single('image'), async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, price } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      'INSERT INTO items (name, price, category_id, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, categoryId, imageUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(res, err, 'Failed to add item');
  }
});

// ... (Re-write all other item routes using the same pattern)

// Orders
// ... (Re-write all order routes using the same pattern)


// --- Helper Function ---
function handleError(res, err, defaultMessage) {
  console.error(err.stack); // Log the error for debugging
  res.status(500).json({ error: defaultMessage }); // Generic error for client
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
