import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';

// --- CORS helper ---
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// --- Database connection ---
const dbConfig = {
  host: process.env.DB_HOST,        // e.g., mysql-production-7313.up.railway.app
  user: process.env.DB_USER,        // your DB user
  password: process.env.DB_PASSWORD,// your DB password
  database: process.env.DB_NAME,    // e.g., todo_app
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    // Handle preflight request
    return res.status(200).end();
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // --- GET todos ---
    if (req.method === 'GET') {
      const [rows] = await connection.query('SELECT * FROM todos');
      return res.status(200).json(rows);
    }

    // --- POST todo ---
    if (req.method === 'POST') {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Text is required' });

      const [result] = await connection.execute(
        'INSERT INTO todos (text, completed) VALUES (?, ?)',
        [text, false]
      );

      return res.status(201).json({ id: (result as any).insertId, text, completed: false });
    }

    // --- PUT todo ---
    if (req.method === 'PUT') {
      const { id, text, completed } = req.body;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      await connection.execute(
        'UPDATE todos SET text = ?, completed = ? WHERE id = ?',
        [text, completed, id]
      );

      return res.status(200).json({ id, text, completed });
    }

    // --- DELETE todo ---
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      await connection.execute('DELETE FROM todos WHERE id = ?', [id]);
      return res.status(200).json({ id });
    }

    // --- Method not allowed ---
    res.setHeader('Allow', 'GET,POST,PUT,DELETE,OPTIONS');
    return res.status(405).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) await connection.end();
  }
}
