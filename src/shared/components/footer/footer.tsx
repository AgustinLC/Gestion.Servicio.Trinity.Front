import React, { useEffect, useState } from "react";
import logo from "../../../assets/img/logoFooter.svg";
import { FaFacebookSquare, FaInstagramSquare, FaWhatsappSquare } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getData } from "../../../core/services/apiService";
import { FooterInfoDto } from "../../../core/models/dto/FooterInfoDto";
import { getCookie, setCookie } from "../../../core/utils/cookiesUtils";
import { hasConsentFor } from "../../../core/utils/cookiesUtils";

const Footer: React.FC = () => {

    //Estado para manejar la información principal
    const [data, setData] = useState<FooterInfoDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    //Hook para obtener los datos de la API de información principal
    useEffect(() => {
        const fetchData = async () => {
            try {
                let mainData = null;

                // Solo usar las cookies si el usuario dio su consentimiento
                if (hasConsentFor("essential")) {
                    // Verificar si la información está en una cookie
                    const cookieData = getCookie("footerInfo");
                    if (cookieData) {
                        // Si existe, usar la información de la cookie
                        mainData = JSON.parse(cookieData);
                    }
                }

                if (mainData) {
                    // Si existe, usar la información de la cookie
                    setData(mainData);
                } else {
                    const response = await getData<FooterInfoDto>("/info/footer");
                    setData(response);

                    // Solo guardar si hay consentimiento
                    if (hasConsentFor("essential")) {
                        // Almacenar la información en una cookie (válida por 7 días)
                        setCookie("footerInfo", JSON.stringify(response), 7);
                        //console.log("Cookie de Footer Guardada");
                    }
                }
            } catch (error) {
                console.error(error);
                setError("Error al cargar la información principal");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    //Renderizado condicional para manejar los estados de carga y error
    if (loading) {
        return <div className="text-center py-5">Cargando..</div>
    }
    if (error) {
        return <div className="text-center py-5">{error}</div>
    }

    return (
        <footer className="text-center text-lg-start bg-body-tertiary text-muted pt-2 mt-auto">
            <section className="">
                <div className="container text-center text-md-start mt-5">
                    <div className="row mt-3">
                        <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                            <div>
                                <img src={logo} alt="logo" />
                            </div>
                            <h6 className="text-uppercase fw-bold mb-4">
                                <i className="fas fa-gem me-3">{data?.name}</i>
                            </h6>
                            <p>
                                {data?.slogan}
                            </p>
                        </div>
                        <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Dirección</h6>
                            <p>Provincia: {data?.province}</p>
                            <p>Departamento: {data?.location}</p>
                            <p>Distrito: {data?.district}</p>
                            <p>Calle: {data?.street}</p>
                            <Link to={data?.mapsUrl || "#"} target="_blank">Ver ubicación</Link>
                        </div>
                        <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Compañia</h6>
                            <p>
                                <Link to="#">Acerca de</Link>
                            </p>
                            <p>
                                <Link to="#">Trabajos</Link>
                            </p>
                            <p>
                                <Link to="/faq">Preguntas frecuentes</Link>
                            </p>
                            <p>
                                <Link to="#">Servicios</Link>
                            </p>
                        </div>
                        <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Contactos</h6>
                            <p>
                                <Link to={data?.facebookUrl || "#"} target="_blank">
                                    <FaFacebookSquare /> Facebook
                                </Link>
                            </p>
                            <p>
                                <Link to={data?.whatsappUrl || "#"} target="_blank">
                                    <FaWhatsappSquare /> Whatsapp
                                </Link>
                            </p>
                            <p>
                                <Link to={data?.instagramUrl || "#"} target="_blank">
                                    <FaInstagramSquare /> Instagram
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <div className="text-center p-4">© 2025 Trinity. Todos los derechos reservados</div>
        </footer>
    );
};

export default Footer;