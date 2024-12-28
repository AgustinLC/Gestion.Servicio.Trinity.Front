import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./shared/screens/main-page/MainPage";
import LoginPage from "./auth/screens/login-page/LoginPage";
import Footer from "./shared/components/footer/Footer";
import Navbar from "./shared/components/navbar/Navbar";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        // Rutas comunes a cualquier usuario
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        // Rutas del usuario administrador
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
