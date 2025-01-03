import React, { useEffect, useState } from "react";
import { FaStar, FaRocket, FaCode } from "react-icons/fa";
import { getData } from "../../../core/services/apiService";
import { MainData } from "../../../core/models/entity/MainData";

const MainPage: React.FC = () => {
  const [data, setData] = useState<MainData | null>(null);

  //Hook para obtener los datos de la API 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData<MainData>("/data/main");
        setData(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Header Section */}
      <header className="bg-primary text-white text-center py-5">
        <div className="container">
          <h1 className="display-4 fw-bold">{data?.type}</h1>
          <h3 className="display-4 fw-bold">{data?.title}</h3>
          <p className="lead mt-3">
            La solución ideal para simplificar tus tareas y potenciar tus resultados.
          </p>
          <a href="#features" className="btn btn-light btn-lg mt-4">
            Conoce más
          </a>
        </div>
      </header>
      {/* Features Section */}
      <section id="features" className="py-5 bg-light">
        <div className="container text-center">
          <h2 className="fw-bold">Características Principales</h2>
          <p className="text-muted">Todo lo que necesitas en un solo lugar.</p>
          <div className="row mt-4">
            <div className="col-md-4">
              <FaRocket size={50} className="text-primary mb-3" />
              <h5 className="fw-bold">Rendimiento Óptimo</h5>
              <p>Experiencia rápida y sin interrupciones para los usuarios.</p>
            </div>
            <div className="col-md-4">
              <FaStar size={50} className="text-primary mb-3" />
              <h5 className="fw-bold">Interfaz Moderna</h5>
              <p>Diseños atractivos y fáciles de usar.</p>
            </div>
            <div className="col-md-4">
              <FaCode size={50} className="text-primary mb-3" />
              <h5 className="fw-bold">Tecnología Avanzada</h5>
              <p>Implementación con las últimas herramientas y frameworks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold">Planes de Precios</h2>
          <p className="text-muted">Elige el plan que mejor se adapte a tus necesidades.</p>
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card border-primary">
                <div className="card-body">
                  <h5 className="card-title fw-bold">Básico</h5>
                  <h6 className="card-price">$10/mes</h6>
                  <p className="text-muted">Funcionalidades esenciales.</p>
                  <a href="#" className="btn btn-primary">
                    Seleccionar
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-success">
                <div className="card-body">
                  <h5 className="card-title fw-bold">Profesional</h5>
                  <h6 className="card-price">$30/mes</h6>
                  <p className="text-muted">Funciones avanzadas y soporte premium.</p>
                  <a href="#" className="btn btn-success">
                    Seleccionar
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-warning">
                <div className="card-body">
                  <h5 className="card-title fw-bold">Empresarial</h5>
                  <h6 className="card-price">$50/mes</h6>
                  <p className="text-muted">Soluciones personalizadas.</p>
                  <a href="#" className="btn btn-warning">
                    Seleccionar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainPage;
