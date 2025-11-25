import mysql from 'mysql2/promise';

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize the table if it doesn't exist
const initTable = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    connection.release();
  }
};

// Serverless function handler
export default async function handler(req, res) {
  await initTable(); // ensure table exists
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const [rows] = await pool.query('SELECT * FROM todos ORDER BY completed ASC, created_at DESC');
        res.status(200).json(rows);
        break;
      }

      case 'POST': {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const [result] = await pool.query('INSERT INTO todos (text) VALUES (?)', [text]);
        const [newTodo] = await pool.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
        res.status(201).json(newTodo[0]);
        break;
      }

      case 'PUT': {
        const { id, text, completed } = req.body;
        if (!id) return res.status(400).json({ error: 'ID is required' });

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
        res.status(200).json({ message: 'Todo updated' });
        break;
      }

      case 'DELETE': {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'ID is required' });

        await pool.query('DELETE FROM todos WHERE id = ?', [id]);
        res.status(200).json({ message: 'Todo deleted' });
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
