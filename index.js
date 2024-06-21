const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Set up MySQL connection
const db =' mysql --user avnadmin --password=AVNS_Pt77Qn3tm0nOtLYE_Kx --host mysql-19e18526-kingshawkat3-1eb9.e.aivencloud.com --port 27396 defaultdb'


// Set up multer storage for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Define the destination folder for storing uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename for each uploaded file
    }
});

// Initialize multer middleware
const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});
// Add item to category with image
app.post('/api/items/:categoryId', upload.single('image'), (req, res) => {
    const { categoryId } = req.params;
    const { name, price } = req.body;
    const imageUrl = req.file ? req.file.filename : null; // Get the filename of the uploaded image, if it exists

    db.query('INSERT INTO items (name, price, category_id, image_url) VALUES (?, ?, ?, ?)', [name, price, categoryId, imageUrl], (err, results) => {
        if (err) {
            console.error('Error adding item:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(201).json({ id: results.insertId, name, price, imageUrl });
    });
});
// remove item
app.delete('/api/items/:itemId', (req, res) => {
    const { itemId } = req.params;
    db.query('DELETE FROM items WHERE id = ?', [itemId], (err, results) => {
        if (err) {
            console.error('Error removing item:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Item removed' });
    });
});

// update item 
app.put('/api/items/:itemId', upload.single('image'), (req, res) => {
    const { itemId } = req.params;
    const { name, price } = req.body;
    const imageUrl = req.file ? req.file.filename : null; // Get the filename of the uploaded image, if it exists

    db.query('UPDATE items SET name = ?, price = ?, image_url = ? WHERE id = ?', [name, price, imageUrl, itemId], (err, results) => {
        if (err) {
            console.error('Error updating item:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ id: itemId, name, price, imageUrl });
    });
});

// Fetch categories
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

// Add category
app.post('/api/categories', (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO categories (name) VALUES (?)', [name], (err, results) => {
        if (err) {
            console.error('Error adding category:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(201).json({ id: results.insertId, name });
    });
});
// edit category
app.put('/api/categories/:categoryId', (req, res) => {
    const { categoryId } = req.params;
    const { name } = req.body;
    db.query('UPDATE categories SET name = ? WHERE id = ?', [name, categoryId], (err, results) => {
        if (err) {
            console.error('Error updating category:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ id: categoryId, name });
    });
});

// Remove category
app.delete('/api/categories/:categoryId', (req, res) => {
    const { categoryId } = req.params;
    db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err, results) => {
        if (err) {
            console.error('Error removing category:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Category removed' });
    });
});


// Fetch items by category
app.get('/api/items/:categoryId', (req, res) => {
    const { categoryId } = req.params;
    db.query('SELECT * FROM items WHERE category_id = ?', [categoryId], (err, results) => {
        if (err) {
            console.error('Error fetching items:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

//make order post request
app.post('/api/orders', (req, res) => {
    const { tableNumber, items } = req.body;
    db.query('INSERT INTO orders (table_number) VALUES (?)', [tableNumber], (err, results) => {
        if (err) {
            console.error('Error adding order:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const orderId = results.insertId;
        const orderItems = items.map(item => [orderId, item.id, item.quantity]);
        db.query('INSERT INTO order_items (order_id, item_id, quantity) VALUES ?', [orderItems], (err, results) => {
            if (err) {
                console.error('Error adding order items:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({ id: orderId, tableNumber, items });
        });
    });
});

// Fetch orders
app.get('/api/orders', (req, res) => {
    const query = `
        SELECT orders.id AS order_id, 
               orders.table_number, 
               orders.accepted, 
               orders.created_at AS order_created_at, 
               GROUP_CONCAT(items.name) AS item_names, 
               SUM(items.price * order_items.quantity) AS total_price
        FROM orders
        JOIN order_items ON orders.id = order_items.order_id
        JOIN items ON order_items.item_id = items.id
        GROUP BY orders.id
        ORDER BY orders.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        const orders = results.map(row => ({
            id: row.order_id,
            tableNumber: row.table_number,
            accepted: row.accepted,
            createdAt: row.order_created_at,
            items: row.item_names.split(','), // Convert comma-separated item names to an array
            totalPrice: row.total_price
        }));
        
        res.json(orders);
    });
});


// Accept order
app.put('/api/orders/:orderId/accept', (req, res) => {
    const { orderId } = req.params;
    db.query('UPDATE orders SET accepted = TRUE WHERE id = ?', [orderId], (err, results) => {
        if (err) {
            console.error('Error accepting order:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Order accepted' });
    });
});

// Remove order
app.delete('/api/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    db.query('DELETE FROM orders WHERE id = ?', [orderId], (err, results) => {
        if (err) {
            console.error('Error removing order:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Order removed' });
    });
});


// Handle errors
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
