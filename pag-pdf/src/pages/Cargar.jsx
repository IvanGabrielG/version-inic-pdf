// src/pages/Cargar.jsx
import React, { useState, useRef } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function Cargar() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("⚠️ Selecciona un archivo PDF");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Error al subir:", data);
        setMessage("❌ Error al subir: " + (data.error || data.message || "Respuesta no OK"));
        return;
      }

      setMessage("✅ Archivo subido con éxito");
      setFile(null);
      setName("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error("Error fetch /api/upload:", err);
      setMessage("❌ Error de conexión con el backend");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Subir PDF</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre del archivo (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0] ?? null)}
            className="border rounded px-3 py-2"
          />

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Subir
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
