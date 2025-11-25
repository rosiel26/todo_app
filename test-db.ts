import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'metro.proxy.rlwy.net',
      port: 57931,
      user: 'root',
      password: 'svNINQpuiSZkgQAgyIUEEjOmKsQkAqbC',
      database: 'railway',
      ssl: { rejectUnauthorized: false },
    });

    const [rows] = await connection.query('SELECT 1+1 AS result');
    console.log('Connection successful:', rows);
    await connection.end();
  } catch (err) {
    console.error('DB connection failed:', err);
  }
}

testConnection();
