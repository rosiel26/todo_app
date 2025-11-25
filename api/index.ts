
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to set up the database table
const setupDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    // Create table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false
      )
    `);

    // Check if 'created_at' column exists
    const [columns] = await connection.query("SHOW COLUMNS FROM `todos` LIKE 'created_at'");
    
    // If the column doesn't exist, add it
    if ((columns as any).length === 0) {
      await connection.query("ALTER TABLE `todos` ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      console.log('Table "todos" has been updated with the "created_at" column.');
    }
    
    console.log('Table "todos" is ready.');
  } catch (error) {
    console.error("Error setting up the database:", error);
  } finally {
    connection.release();
  }
};

// API routes
// Get all todos, with optional date filtering
app.get('/api/todos', async (req, res) => {
  try {
    const { filterDate } = req.query;
    // Sort by completion status first (incomplete on top), then by creation date (newest on top)
    let query = 'SELECT * FROM todos ORDER BY completed ASC, created_at DESC';
    const params = [];

    if (filterDate && typeof filterDate === 'string' && filterDate.length > 0) {
      query = 'SELECT * FROM todos WHERE DATE(created_at) = ? ORDER BY completed ASC, created_at DESC';
      params.push(filterDate);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Add a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const [result] = await pool.query('INSERT INTO todos (text) VALUES (?)', [text]);
    const insertId = (result as any).insertId;
    const [newTodoResult] = await pool.query('SELECT * FROM todos WHERE id = ?', [insertId]);
    const newTodo = (newTodoResult as any)[0];
    
    // Log the object to the server console
    console.log('Newly created to-do:', newTodo);

    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// Update a todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;

    if (text === undefined && completed === undefined) {
      return res.status(400).json({ error: 'Text or completed is required' });
    }

    let query = 'UPDATE todos SET ';
    const params = [];

    if (text !== undefined) {
      query += 'text = ?';
      params.push(text);
    }

    if (completed !== undefined) {
      if (params.length > 0) query += ', ';
      query += 'completed = ?';
      params.push(completed);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    res.json({ message: 'Todo updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM todos WHERE id = ?', [id]);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});


app.listen(port, async () => {
  await setupDatabase();
  console.log(`Server is running on http://localhost:${port}`);
});