import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';

// --- CORS helper ---
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// --- Database config ---
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Safely parse JSON body only for non-GET requests
    let body = req.body;
    if (req.method !== 'GET') {
      if (!body) {
        return res.status(400).json({ error: 'Request body is empty' });
      }
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ error: 'Invalid JSON' });
        }
      }
    }

    // --- GET all todos ---
    if (req.method === 'GET') {
      const [rows] = await connection.query('SELECT * FROM todo ORDER BY created_at DESC');
      return res.status(200).json(rows);
    }

    // --- POST a new todo ---
    if (req.method === 'POST') {
      const { title } = body;
      if (!title) return res.status(400).json({ error: 'Title is required' });

      const [result] = await connection.execute(
        'INSERT INTO todo (title, completed) VALUES (?, ?)',
        [title, 0]
      );

      return res.status(201).json({
        id: (result as any).insertId,
        title,
        completed: false,
      });
    }

    // --- PUT update a todo ---
    if (req.method === 'PUT') {
      const { id, title, completed } = body;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      await connection.execute(
        'UPDATE todo SET title = ?, completed = ? WHERE id = ?',
        [title, completed ? 1 : 0, id]
      );

      return res.status(200).json({ id, title, completed });
    }

    // --- DELETE a todo ---
    if (req.method === 'DELETE') {
      const { id } = body;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      await connection.execute('DELETE FROM todo WHERE id = ?', [id]);
      return res.status(200).json({ id });
    }

    res.setHeader('Allow', 'GET,POST,PUT,DELETE,OPTIONS');
    return res.status(405).end();
  } catch (err) {
    console.error('DB Connection Error:', err);
    return res.status(500).json({ error: 'Database error', message: (err as any).message });
  } finally {
    if (connection) await connection.end();
  }
}
