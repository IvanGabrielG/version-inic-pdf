/*import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Menu from "./pages/Menu";
import Cargar from "./pages/Cargar";
import Visualizar from "./pages/Visualizar";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Menu />} />
        <Route path="cargar" element={<Cargar />} />
        <Route path="visualizar" element={<Visualizar />} />
      </Route>
    </Routes>
  );
}*/
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded shadow-lg bg-white">
        <h1 className="text-3xl font-bold mb-4">TAILWIND TEST</h1>
        <p className="mb-4">Si ves este texto con estilos Tailwind, Tailwind funciona.</p>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
          Botón rojo (debería ser rojo)
        </button>
      </div>
    </div>
  );
}



