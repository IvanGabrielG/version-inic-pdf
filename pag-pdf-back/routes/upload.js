// pag-pdf-back/routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// storage y nombre único
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

// fileFilter: comprobación básica (mimetype)
const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Sólo se permiten archivos PDF (mimetype inválido)"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12 MB
  fileFilter
});

// helper: valida magic bytes leyendo primeros 4 bytes del archivo en disco
async function validatePdf(filePath) {
  try {
    const fd = await fs.promises.open(filePath, 'r');
    try {
      const buffer = Buffer.alloc(4);
      const { bytesRead } = await fd.read(buffer, 0, 4, 0);
      if (bytesRead < 4) return false;
      const header = buffer.toString('utf8', 0, 4);
      return header === '%PDF';
    } finally {
      await fd.close();
    }
  } catch (err) {
    // fallo al abrir/leer -> inválido
    return false;
  }
}

// POST /api/upload
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Archivo no recibido' });

    const { filename, originalname, mimetype, size } = req.file;
    const savedPath = path.join(UPLOADS_DIR, filename);

    // Validar magic bytes ahora que el archivo ya está en disco
    const isPdf = await validatePdf(savedPath);
    if (!isPdf) {
      // borrar archivo inválido
      try { await fs.promises.unlink(savedPath); } catch (e) { /* ignore */ }
      return res.status(400).json({ error: 'El archivo no tiene cabecera PDF válida' });
    }

    // Insertar metadatos en BD
    const sql = `INSERT INTO pdf_files (name, original_name, filename, mime, size) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [name || null, originalname, filename, mimetype, size]);

    res.json({
      success: true,
      id: result.insertId,
      file: {
        id: result.insertId,
        name: name || null,
        original_name: originalname,
        filename,
        mime: mimetype,
        size
      }
    });
  } catch (err) {
    // Si algo falla después de guardar el archivo, intentar eliminarlo para no dejar basura
    if (req.file && req.file.filename) {
      const attemptPath = path.join(UPLOADS_DIR, req.file.filename);
      try { await fs.promises.unlink(attemptPath); } catch (e) { /* ignore */ }
    }
    next(err);
  }
});

module.exports = router;
