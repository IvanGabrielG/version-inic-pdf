import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegación fija arriba */}
      <header className="bg-gray-100 shadow-md">
        <nav className="max-w-5xl mx-auto flex justify-center space-x-6 py-4">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Menú
          </Link>
          <Link
            to="/cargar"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Cargar
          </Link>
          <Link
            to="/visualizar"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Visualizar
          </Link>
        </nav>
      </header>

      {/* Contenido de cada página */}
      <main className="flex flex-col items-center justify-start mt-8">
        <Outlet />
      </main>
    </div>
  );
}
