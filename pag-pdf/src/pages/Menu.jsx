import React from "react";
import { Link } from "react-router-dom";

export default function Menu() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <h1 className="text-3xl font-bold text-center">MENÚ PRINCIPAL</h1>

      <div className="flex flex-col sm:flex-row gap-6">
        <Link
          to="/cargar"
          className="px-8 py-4 bg-green-500 text-white rounded shadow hover:bg-green-600 transition text-center"
        >
          Cargar PDF
        </Link>
        <Link
          to="/visualizar"
          className="px-8 py-4 bg-purple-500 text-white rounded shadow hover:bg-purple-600 transition text-center"
        >
          Ver PDFs
        </Link>
      </div>
    </div>
  );
}


