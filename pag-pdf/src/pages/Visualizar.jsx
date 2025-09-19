// src/pages/Visualizar.jsx
import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Visualizar() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null); // id del archivo cuyo form de reemplazo está abierto
  const [newFile, setNewFile] = useState(null);

  // Normaliza distintas formas en que el backend puede devolver los campos
  const normalize = (f) => {
    const id = f.id ?? f.ID ?? f.file_id ?? (typeof f === "object" && f.rawId ? f.rawId : null);
    const filename =
      f.filename ?? f.file_name ?? f.file ?? f.original_name ?? f.originalname ?? "";
    const original_name = f.original_name ?? f.originalname ?? f.original ?? f.name ?? "";
    const size = f.size ?? f.file_size ?? 0;
    const uploaded_at = f.uploaded_at ?? f.uploadedAt ?? f.created_at ?? f.createdAt ?? null;
    const url = f.url ?? (filename ? `${API_URL}/uploads/${filename}` : "");

    const visibleName =
      f.name ?? original_name ?? filename ?? (id ? `Archivo ${id}` : "(sin nombre)");

    return {
      raw: f,
      id,
      filename,
      original_name,
      size,
      uploaded_at,
      url,
      name: visibleName,
    };
  };

  const fetchFiles = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/files`);
      const data = await res.json();
      console.log("GET /api/files ->", data); // Para debuggear y observar si algo sale raro

      if (!Array.isArray(data)) {
        setFiles([]);
        setMessage("Respuesta inesperada del servidor (no es un array). Revisa consola.");
        setLoading(false);
        return;
      }

      const normalized = data.map(normalize);
      setFiles(normalized);
      if (normalized.length === 0) setMessage("No hay archivos subidos aún.");
    } catch (err) {
      console.error("Error cargando /api/files:", err);
      setFiles([]);
      setMessage("Error cargando archivos (ver consola).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este archivo?")) return;
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/files/${id}`, { method: "DELETE" });
      if (!res.ok) {
        let errBody = {};
        try { errBody = await res.json(); } catch (e) {console.error(e)}
        setMessage("❌ No se pudo eliminar: " + (errBody.message || errBody.error || res.statusText));
        return;
      }
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setMessage("✅ Archivo eliminado correctamente");
    } catch (err) {
      console.error("DELETE error:", err);
      setMessage("Error al conectar con el backend al eliminar (ver consola).");
    }
  };

  const handleReplaceClick = (id) => {
    setSelectedFileId((cur) => (cur === id ? null : id)); // togglear abrir/cerrar
    setNewFile(null);
    setMessage("");
  };

  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!newFile) {
      setMessage("Selecciona un PDF para reemplazar");
      return;
    }
    if (!selectedFileId) {
      setMessage("Id de archivo no seleccionado");
      return;
    }

    const formData = new FormData();
    formData.append("file", newFile);

    try {
      const res = await fetch(`${API_URL}/api/files/${selectedFileId}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        let errBody = {};
        try { errBody = await res.json(); } catch (e) {console.error(e)}
        setMessage("❌ Error reemplazando: " + (errBody.message || errBody.error || res.statusText));
        return;
      }

      setMessage("✅ Archivo reemplazado correctamente");
      setSelectedFileId(null);
      setNewFile(null);
      // recargar lista para reflejar cambios
      fetchFiles();
    } catch (err) {
      console.error("PUT replace error:", err);
      setMessage("❌ Error de conexión al reemplazar (ver consola).");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Archivos disponibles</h2>

      {loading && <p className="text-sm text-gray-600 mb-4">Cargando archivos...</p>}
      {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}

      <ul className="space-y-3">
        {files.map((f, idx) => (
          <li
            key={f.id ?? f.filename ?? idx}
            className="flex flex-col border p-3 rounded shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <a
                  href={f.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline truncate"
                  title={f.original_name || f.filename || ""}
                >
                  {f.name}
                </a>
                <div className="text-sm text-gray-500 mt-1">
                  {f.original_name ? <span>{f.original_name}</span> : null}
                  {f.size ? <span>{f.original_name ? " — " : ""}{Math.round(f.size / 1024)} KB</span> : null}
                  {f.uploaded_at ? <span>{(f.size || f.original_name) ? " — " : ""}{f.uploaded_at}</span> : null}
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={f.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Ver
                </a>

                <button
                  onClick={() => handleReplaceClick(f.id)}
                  className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Actualizar
                </button>

                <button
                  onClick={() => handleDelete(f.id)}
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {/* Para abrir un formulario de reemplazo in-line */}
            {selectedFileId === f.id && (
              <form onSubmit={handleReplaceSubmit} className="mt-3 flex items-center gap-2">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setNewFile(e.target.files[0] ?? null)}
                  className="flex-1"
                />
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFileId(null); setNewFile(null); }}
                  className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancelar
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}