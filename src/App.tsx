import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import MainPage from "./shared/features/main-page/MainPage";
import LoginPage from "./auth/features/login-page/LoginPage";
import Faq from "./shared/features/faq/Faq";
import Footer from "./shared/components/footer/footer";
import Navbar from "./shared/components/navbar/Navbar";
import CookieBanner from "./shared/components/cookies/CookieBanner";
import ForgotPasswordPage from "./auth/features/forgot-password-page/ForgotPasswordPage";
import ResetPasswordPage from "./auth/features/reset-password-page/ResetPasswordPage";
import OperatorDashboard from "./operator/features/dashboard/OperatorDashboard";
import AdminDashboard from "./admin/features/dashboard/AdminDashboard";
import User from "./operator/features/user/UserPage";
import ReadingManagement from "./operator/features/reading/reading-management/ReadingManagementPage";
import ReadingTake from "./operator/features/reading/reading-take/ReadingTakePage";
import Resume from "./operator/features/resume/Resume";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CrudFaqPage from "./admin/features/crud-faq/CrudFaqPage";
import CrudFeaturePage from "./admin/features/crud-features/CrudFeaturePage";
import CruDataMainPage from "./admin/features/cru-data-main/CruDataMainPage";
import CrudFeePage from "./admin/features/cru-fee/CruFeePage";
import CruWorkerPage from "./admin/features/workers/CruWorkerPage";
import CruAdministratorPage from "./admin/features/cru-administrators/CruAdministratorPage";
import ServicesUnitsPage from "./admin/features/services-units/ServicesUnitsPage";
import UnitPage from "./admin/features/services-units/UnitPage";
import ServicePage from "./admin/features/services-units/ServicePage";
import BillingParameterPage from "./admin/features/crud-concepts-bills/BillingParameterPage";
import PendigBillsParameterPage from "./operator/features/pendig-bills-parameters/PendigBillParametersPage";
import BillBulkGeneratePage from "./operator/features/generate-bill/BillBulkGeneratePage";
import BillIndividualGeneratePage from "./operator/features/generate-bill/BillIndividualGeneratePage";
import BillManagementPage from "./operator/features/management-bill/BillManagementPage";
import ReportsPage from "./operator/features/reports/ReportPage";
import NewPeriodPage from "./admin/features/period/NewPeriodPage";
import UserDashboard from "./user/features/dashboard/UserDashboard";
import UserBills from "./user/features/bills/UserBills";
import UserConsumptions from "./user/features/consumptions/UserConsumptions";
import UserPersonalData from "./user/features/personaldata/UserPersonalData";
import UserResume from "./user/features/resume/UserResume";
import ModalityPage from "./admin/features/modality/ModalityPage";
import ProtectedRoute from "./auth/features/protected-route/ProtectedRoute";
import RoleProtectedRoute from "./auth/features/protected-route/RoleProtectedRoute";
import DiscountManagementPage from "./admin/features/discounts/DiscountManagementPage";
import DiscountsPage from "./operator/features/discounts/DiscountsPage";
import BillGenerateFilteredPage from "./operator/features/generate-bill/BillGenerateFilteredPage";
import NotFoundPage from "./shared/features/not-found-page/NotFoundPage";

const AppContent: React.FC = () => {
  const location = useLocation();

  // Rutas donde queremos mostrar el Footer
  const showFooterPaths = ["/", "/faq", "/login", "/forgot-password", "/reset-password"];
  
  // Verificar si es una ruta 404 (cualquier ruta que no esté en las rutas definidas)
  const isNotFoundPage = !location.pathname.startsWith("/dashboard") && 
                         !showFooterPaths.includes(location.pathname) &&
                         location.pathname !== "/faq";

  const shouldShowFooter = showFooterPaths.includes(location.pathname) || isNotFoundPage;

  return (
    <>
      {/* Barra de navegacion */}
      <Navbar />
      <Routes>
        {/* Rutas sin permisos comunes a cualquier usuario */}
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/faq" element={<Faq />} />

        {/* Rutas solo para usuario común */}
        <Route path="/dashboard/user" element={<RoleProtectedRoute allowedRoles={["ROLE_USER"]}><UserDashboard /></RoleProtectedRoute>}>
          <Route path="resume" element={<RoleProtectedRoute allowedRoles={["ROLE_USER"]}><UserResume /></RoleProtectedRoute>} />
          <Route path="bills" element={<RoleProtectedRoute allowedRoles={["ROLE_USER"]}><UserBills /></RoleProtectedRoute>} />
          <Route path="consumptions" element={<RoleProtectedRoute allowedRoles={["ROLE_USER"]}><UserConsumptions /></RoleProtectedRoute>} />
          <Route path="personal-data" element={<RoleProtectedRoute allowedRoles={["ROLE_USER"]}><UserPersonalData /></RoleProtectedRoute>} />
        </Route>

        {/* Rutas solo para usuario operario */}
        <Route path="/dashboard/operator" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><OperatorDashboard /></RoleProtectedRoute>}>
          <Route path="resume" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><Resume /></RoleProtectedRoute>} />
          <Route path="users" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><User /></RoleProtectedRoute>} />
          <Route path="readings/management" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><ReadingManagement /></RoleProtectedRoute>} />
          <Route path="readings/take" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><ReadingTake /></RoleProtectedRoute>} />
          <Route path="parameters/bills" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><PendigBillsParameterPage /></RoleProtectedRoute>} />
          <Route path="bills/bulk-generate" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><BillBulkGeneratePage /></RoleProtectedRoute>} />
          <Route path="bills/individual-generate" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><BillIndividualGeneratePage /></RoleProtectedRoute>} />
          <Route path="bills/generate-filtered" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><BillGenerateFilteredPage /></RoleProtectedRoute>} />
          <Route path="bills/management" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><BillManagementPage /></RoleProtectedRoute>} />
          <Route path="reports" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><ReportsPage /></RoleProtectedRoute>} />
          <Route path="discounts" element={<RoleProtectedRoute allowedRoles={["ROLE_OPERATOR"]}><DiscountsPage /></RoleProtectedRoute>} />
        </Route>

        {/* Rutas solo para usuario administrador */}
        <Route path="/dashboard/admin" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminDashboard /></RoleProtectedRoute>}>
          <Route path="faq" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><CrudFaqPage /></RoleProtectedRoute>} />
          <Route path="functions" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><CrudFeaturePage /></RoleProtectedRoute>} />
          <Route path="data-main" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><CruDataMainPage /></RoleProtectedRoute>} />
          <Route path="fee" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><CrudFeePage /></RoleProtectedRoute>} />
          <Route path="workers" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><CruWorkerPage /></RoleProtectedRoute>} />
          <Route path="administrators" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><CruAdministratorPage /></RoleProtectedRoute>} />
          <Route path="services-units" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><ServicesUnitsPage /></RoleProtectedRoute>} />
          <Route path="units" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><UnitPage /></RoleProtectedRoute>} />
          <Route path="services" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><ServicePage /></RoleProtectedRoute>} />
          <Route path="billing-parameters" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><BillingParameterPage /></RoleProtectedRoute>} />
          <Route path="new/period" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><NewPeriodPage /></RoleProtectedRoute>} />
          <Route path="modalities" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><ModalityPage /></RoleProtectedRoute>} />
          <Route path="discounts/management" element={<RoleProtectedRoute allowedRoles={["ROLE_ADMIN"]}><DiscountManagementPage /></RoleProtectedRoute>} />
        </Route>

        {/* Ruta catch-all para páginas no encontradas */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Pie de pagina */}
      {shouldShowFooter && <Footer />}

      {/* Banner de cookies */}
      <CookieBanner />

      {/* Notificaciones/Alertas */}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
