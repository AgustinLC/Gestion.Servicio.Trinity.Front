import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./shared/features/main-page/MainPage";
import LoginPage from "./auth/features/login-page/LoginPage";
import Faq from "./shared/features/faq/Faq";
import Footer from "./shared/components/footer/footer";
import Navbar from "./shared/components/navbar/Navbar";
import ForgotPasswordPage from "./auth/features/forgot-password-page/ForgotPasswordPage";
import ResetPasswordPage from "./auth/features/reset-password-page/ResetPasswordPage";
import OperatorDashboard from "./operator/features/dashboard/OperatorDashboard";
import AdminDashboard from "./admin/features/dashboard/AdminDashboard";
import User from "./operator/features/user/UserPage";
import ReadingManagement from "./operator/features/reading/reading-management/ReadingManagementPage"
import ReadingTake from "./operator/features/reading/reading-take/ReadingTakePage"
import Resume from "./operator/features/resume/Resume";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CrudFaqPage from "./admin/features/crud-faq/CrudFaqPage";

const App: React.FC = () => {
  return (
    <Router>
      {/* Barra de navegacion */}
      <Navbar />
      <Routes>

        {/* Rutas sin permisos comunes a cualquier usuario */}
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/faq" element={<Faq />} />

        {/* Rutas solo para usuario operario */}
        <Route path="/dashboard/operator" element={<OperatorDashboard />}>
          <Route path="resume" element={<Resume />} />
          <Route path="users" element={<User />} />
          <Route path="readings/management" element={<ReadingManagement />} />
          <Route path="readings/take" element={<ReadingTake />} />
        </Route>

        {/* Rutas solo para usuario administrador */}
        <Route path="/dashboard/admin" element={<AdminDashboard />}>
          <Route path="faq" element={<CrudFaqPage />} />
        </Route>
      </Routes>
      {/* Pie de pagina */}
      <Footer />
      {/* Notificaciones/Alertas */}
      <ToastContainer position="top-center" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />
    </Router>
  );
};

export default App;
