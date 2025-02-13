import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./shared/features/main-page/MainPage";
import LoginPage from "./auth/features/login-page/LoginPage";
import Faq from "./shared/features/faq/Faq";
import Footer from "./shared/components/footer/footer";
import Navbar from "./shared/components/navbar/Navbar";
import ForgotPasswordPage from "./auth/features/forgot-password-page/ForgotPasswordPage";
import ResetPasswordPage from "./auth/features/reset-password-page/ResetPasswordPage";
import OperatorDashboard from "./operator/features/dashboard/Dashboard";
import User from "./operator/features/user/User";
import Resume from "./operator/features/resume/Resume";

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
          <Route path="resume" element={<Resume />} />
          <Route path="users" element={<User />} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
