import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./shared/screens/main-page/MainPage";
import LoginPage from "./auth/screens/login-page/LoginPage";
import Faq from "./shared/screens/faq/Faq";
import Footer from "./shared/components/footer/footer";
import Navbar from "./shared/components/navbar/Navbar";
import ForgotPasswordPage from "./auth/screens/forgot-password-page/ForgotPasswordPage";
import ResetPasswordPage from "./auth/screens/reset-password-page/ResetPasswordPage";
import OperatorDashboard from "./operator/screens/dashboard/Dashboard";
import User from "./admin/screens/user/User";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        // Rutas sin permisos comunes a cualquier usuario
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/faq" element={<Faq />} />
        // Rutas solo para usuario operario
        <Route path="/dashboard/operator" element={<OperatorDashboard />}>
          <Route path="users" element={<User />} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
