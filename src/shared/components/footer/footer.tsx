import React from "react";
import { FaFacebookSquare, FaInstagramSquare, FaWhatsappSquare } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
    return (
        <footer className="text-center text-lg-start bg-body-tertiary text-muted pt-2">
            <section className="">
                <div className="container text-center text-md-start mt-5">
                    <div className="row mt-3">
                        <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                            <div>
                                <img src="src/assets/img/water_drop_sky.svg" alt="logo" />
                            </div>
                            <h6 className="text-uppercase fw-bold mb-4">
                                <i className="fas fa-gem me-3"></i>Company name
                            </h6>
                            <p>
                                Here you can use rows and columns to organize your footer content. Lorem ipsum
                                dolor sit amet, consectetur adipisicing elit.
                            </p>
                        </div>
                        <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                            <h6 className="text-uppercase fw-bold mb-4">Dirección</h6>
                            <p>Provincia: Mendoza</p>
                            <p>Departamento: Rivadavia</p>
                            <p>Distrito: Santa María de Oro</p>
                            <p>Calle: Villanueva</p>
                            <Link to="https://www.google.com/maps/place/CLUB+SANTA+MARIA/@-33.207028,-68.4245363,321m/data=!3m1!1e3!4m6!3m5!1s0x967e59fc88ce3c3f:0xb1ff918bf093f8fe!8m2!3d-33.207201!4d-68.423545!16s%2Fg%2F11jsw09_j1?entry=ttu" target="_blank">Ver Ubicacion</Link>
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
                                <Link to="https://www.facebook.com/people/Consorcio-de-agua-potable-Santa-Maria-de-Oro/100058813477291/" target="_blank">
                                    <FaFacebookSquare /> Facebook
                                </Link>
                            </p>
                            <p>
                                <Link to="#">
                                    <FaWhatsappSquare /> Whatsapp
                                </Link>
                            </p>
                            <p>
                                <Link to="#">
                                    <FaInstagramSquare /> Instagram
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <div className="text-center p-4">© 2025 Copyright:</div>
        </footer>
    );
};

export default Footer;