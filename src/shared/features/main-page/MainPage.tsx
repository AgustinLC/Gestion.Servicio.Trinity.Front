import React, { useEffect, useState } from "react";
import { FaStar, FaRocket, FaCode } from "react-icons/fa";
import { getData } from "../../../core/services/apiService";
import { MainInfoDto } from "../../../core/models/dto/MainInfoDto";

const MainPage: React.FC = () => {

  //Estado para manejar la información principal
  const [data, setData] = useState<MainInfoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Hook para obtener los datos de la API de información principal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData<MainInfoDto>("/info/data-main");
        setData(response);
      } catch (error) {
        console.error(error);
        setError("Error al cargar la información principal");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  //Iconos para las funcionalidades
  const featureIcons: { [key: number]: JSX.Element } = {
    1: <FaRocket size={50} className="text-primary mb-3" />, // Icono cohete
    2: <FaStar size={50} className="text-primary mb-3" />, // Icono estrella
    3: <FaCode size={50} className="text-primary mb-3" />, // Icono código
  };

  //Bordes para los planes
  const planBorder: { [key: number]: string } = {
    1: "border-success", // Borde verde
    2: "border-primary", // Borde azul
    3: "border-warning", // Borde amarillo
    4: "border-danger", // Borde rojo
  };

  //Renderizado condicional para manejar los estados de carga y error
  if (loading) {
    return <div className="text-center py-5">Cargando..</div>
  }
  if (error) {
    return <div className="text-center py-5">{error}</div>
  }

  //Renderizado de la página principal
  return (
    <div>
      {/* Header Section */}
      <header className="bg-primary text-white text-center py-5">
        <div className="container">
          <h1 className="fw-bold">{data?.name}</h1>
          <p className="lead mt-3">
            {data?.description}
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
            {/* Iterar sobre los features */}
            {data?.features.map((feature) => (
              <div className="col-md-4" key={(feature.idFeature)}>
                {featureIcons[feature.idFeature] || <FaStar size={50} className="text-primary mb-3" />}
                <h5 className="fw-bold">{feature.name}</h5>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold">Planes de Precios</h2>
          <p className="text-muted">Elige el plan que mejor se adapte a tus necesidades.</p>
          <div className="row mt-4">
            {/* Iterar sobre los planes */}
            {data?.plans.map((fee) => (
              <div className="col-md-3 my-2" key={(fee.idFee)}>
                <div className={`card ${planBorder[fee.idFee] || "border-primary"}`}>
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{fee.name}</h5>
                    <h6 className="card-price">${fee.price}</h6>
                    <p className="text-muted">{fee.description}</p>
                    <p className="text-muted">Consumo max: {fee.consumptionMax}{data.unitActive}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >
    </div >
  );
};

export default MainPage;
