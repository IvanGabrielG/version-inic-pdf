
-- CREACIÓN DE BASE DE DATOS

CREATE DATABASE IF NOT EXISTS pdf_app;
USE pdf_app;

-- Crear tabla de ejemplo
CREATE TABLE IF NOT EXISTS pdf_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CREACIÓN DE USUARIO Y CONTRASEÑA

-- Crear usuario
CREATE USER 'pdf_user'@'localhost' IDENTIFIED BY 'tu_contra';
-- Dar permisos sobre la base
GRANT ALL PRIVILEGES ON pdf_app.* TO 'pdf_user'@'localhost';
-- Aplicar cambios
FLUSH PRIVILEGES;


