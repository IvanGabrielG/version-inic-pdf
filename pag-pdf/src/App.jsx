import { Routes, Route } from "react-router-dom";
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
}



