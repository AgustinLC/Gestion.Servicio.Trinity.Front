import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

const NotFoundPage: React.FC = () => {
  return (
    <div>
      {/* Header Section - Similar a MainPage */}
      <header className="bg-primary text-white text-center py-5">
        <div className="container">
          <FaExclamationTriangle size={80} className="mb-4" />
          <h1 className="fw-bold display-4">404</h1>
          <p className="lead mt-3">
            Página no encontrada
          </p>
        </div>
      </header>

      {/* Content Section */}
      <section className="py-5 bg-light">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <h2 className="fw-bold mb-4">Lo sentimos, la página que buscas no existe</h2>
              <p className="text-muted mb-4">
                Es posible que la página haya sido movida, eliminada o que la URL sea incorrecta.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/" className="btn btn-primary btn-lg">
                  <FaHome className="me-2" />
                  Volver al Inicio
                </Link>
                <button 
                  onClick={() => window.history.back()} 
                  className="btn btn-outline-primary btn-lg"
                >
                  Volver Atrás
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-5">
        <div className="container text-center">
          <h3 className="fw-bold mb-4">¿Necesitas ayuda?</h3>
          <p className="text-muted mb-4">
            Si crees que esto es un error, por favor contacta con el soporte técnico.
          </p>
          <Link to="/faq" className="btn btn-outline-secondary">
            Ver Preguntas Frecuentes
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;

