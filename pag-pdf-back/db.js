// pag-pdf-back/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.JAWSDB_URL) {
  // ejemplo: mysql://user:pass@host:port/dbname
  const url = new URL(process.env.JAWSDB_URL);
  pool = mysql.createPool({
    host: url.hostname,
    port: url.port,
    user: url.username,
    password: url.password,
    database: url.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: 10
  });
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'pdf_app',
    waitForConnections: true,
    connectionLimit: 10
  });
}

module.exports = pool;
