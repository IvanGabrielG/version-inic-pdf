require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require('./db'); // importamos el pool de db


const uploadRouter = require('./routes/upload');
const filesRouter = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 4000;

//
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Servir la carpeta de uploads de forma estática
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Rutas API
app.use('/api', uploadRouter);
app.use('/api', filesRouter);

app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Endpoint de prueba para comprobar conexión a MySQL
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Conexión a DB exitosa ✅', result: rows[0].result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error conectando a DB ❌', error: error.message });
  }
});

// manejador genérico de errores (útil para errores de multer)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

