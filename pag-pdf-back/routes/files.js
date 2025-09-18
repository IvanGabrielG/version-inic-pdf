// pag-pdf-back/routes/files.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// almacenamiento para reemplazos (nombre único)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});

// fileFilter: aca se hace solo chequeo rápido de mimetype; validación completa después
const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Sólo se permiten archivos PDF (mimetype inválido)'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter
});

// Para validar magic bytes (validación completa) desde disco
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
    return false;
  }
}

// GET /api/files
router.get('/files', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, name, original_name, filename, mime, size, uploaded_at FROM pdf_files ORDER BY uploaded_at DESC`);
    const host = `${req.protocol}://${req.get('host')}`;
    const files = rows.map(r => ({
      id: r.id,
      name: r.name,
      original_name: r.original_name,
      mime: r.mime,
      size: r.size,
      uploaded_at: r.uploaded_at,
      url: `${host}/uploads/${r.filename}`
    }));
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/files/:id -> reemplazar archivo existente, para función de botón "REEMPLAZAR"
router.put('/files/:id', upload.single('file'), async (req, res, next) => {
  const id = req.params.id;

  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo no recibido' });

    // compruebo que exista el registro a reemplazar
    const [rows] = await pool.query('SELECT filename FROM pdf_files WHERE id = ?', [id]);
    if (rows.length === 0) {
      // borro archivo subido porque no hay registro
      try { await fs.promises.unlink(path.join(UPLOADS_DIR, req.file.filename)); } catch (e) { /* ignore */ }
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    const oldFilename = rows[0].filename;
    const newPath = path.join(UPLOADS_DIR, req.file.filename);

    // valido magic bytes del nuevo archivo
    const isPdf = await validatePdf(newPath);
    if (!isPdf) {
      // borrar archivo inválido
      try { await fs.promises.unlink(newPath); } catch (e) { /* ignore */ }
      return res.status(400).json({ error: 'El archivo no tiene cabecera PDF válida' });
    }

    // actualizo DB con nuevo archivo
    await pool.query(
      `UPDATE pdf_files SET original_name = ?, filename = ?, mime = ?, size = ? WHERE id = ?`,
      [req.file.originalname, req.file.filename, req.file.mimetype, req.file.size, id]
    );

    // borro archivo antiguo del disco (si existe)
    const oldPath = path.join(UPLOADS_DIR, oldFilename);
    if (oldFilename && fs.existsSync(oldPath)) {
      try { await fs.promises.unlink(oldPath); } catch (e) { console.warn('No se pudo borrar archivo antiguo:', e.message); }
    }

    res.json({
      success: true,
      message: 'File replaced',
      file: {
        id,
        original_name: req.file.originalname,
        filename: req.file.filename,
        mime: req.file.mimetype,
        size: req.file.size,
        url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      }
    });
  } catch (err) {
    // si algo falla, elimino de nuevo archivo para no dejar basura
    if (req.file && req.file.filename) {
      try { await fs.promises.unlink(path.join(UPLOADS_DIR, req.file.filename)); } catch (e) { /* ignore */ }
    }
    next(err);
  }
});

// DELETE /api/files/:id -> borrar
router.delete('/files/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT filename FROM pdf_files WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'File not found' });

    const filename = rows[0].filename;
    await pool.query('DELETE FROM pdf_files WHERE id = ?', [id]);

    const filepath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filepath)) {
      try { await fs.promises.unlink(filepath); } catch (e) { /* ignore */ }
    }

    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;