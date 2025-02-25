import React, { useEffect, useState } from "react";
import "./Faq.css";
import { getData } from "../../../core/services/apiService";
import { FaqDto } from "../../../core/models/dto/FaqDto";
import { MainInfoDto } from "../../../core/models/dto/MainInfoDto";
import { getCookie, setCookie } from "../../../core/utils/cookiesUtils";

const Faq: React.FC = () => {
    const [dataMain, setDataMain] = useState<MainInfoDto | null>(null);
    const [dataFaq, setDataFaq] = useState<FaqDto[]>([])
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    //Hook para obtener los datos de la API de información principal
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Verificar si la información está en una cookie
                const cookieData = getCookie("mainInfo");
                if (cookieData) {
                    // Si existe, usar la información de la cookie
                    setDataMain(JSON.parse(cookieData));
                } else {
                    // Si no existe, hacer la petición al backend
                    const response = await getData<MainInfoDto>("/info/data-main");
                    setDataMain(response);
                    // Almacenar la información en una cookie (válida por 7 días)
                    setCookie("mainInfo", JSON.stringify(response), 7);
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

    //Hook para obtener los datos de la API faq
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Verificar si la información está en una cookie
                const cookieData = getCookie("faqInfo");
                if (cookieData) {
                    // Si existe, usar la información de la cookie
                    setDataFaq(JSON.parse(cookieData));
                } else {
                    // Si no existe, hacer la petición al backend
                    const response = await getData<FaqDto[]>("/info/faq");
                    setDataFaq(response);
                    // Almacenar la información en una cookie (válida por 7 días)
                    setCookie("faqInfo", JSON.stringify(response), 7);
                }
            } catch (error) {
                console.error("Error fetching FAQ data:", error);
                setError("Error al cargar las preguntas frecuentes.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    //Funcion para mostrar/ocultar las respuestas
    const toggleAnswer = (index: number) => {
        if (activeIndex === index) {
            setActiveIndex(null); //Si esta activo lo desactiva
        } else {
            setActiveIndex(index); //Si no esta activo lo activa
        }
    };

    // Renderizado condicional para manejar estados de carga y error
    if (loading) {
        return <div className="text-center py-5">Cargando...</div>;
    }
    if (error) {
        return <div className="text-center py-5 text-danger">{error}</div>;
    }

    return (
        <div>
            {/* Header Section */}
            <header className="bg-primary text-white text-center py-5">
                <div className="container">
                    <h1 className="fw-bold">{dataMain?.name}</h1>
                    <p className="lead mt-3">{dataMain?.description}</p>
                    <p className="lead mt-3">
                        FAQ - Preguntas Frecuentes
                    </p>
                </div>
            </header>
            {/* Features Section */}
            <section id="features" className="py-5 bg-light">
                <div className="container">
                    {dataFaq.map((faq, index) => (
                        <div className="faq-item" key={faq.idFaq}>
                            <div className={`faq-question ${activeIndex === index ? "active" : ""}`} onClick={() => toggleAnswer(index)}>
                                {faq.question}
                            </div>
                            <div className="faq-answer" style={{ display: activeIndex === index ? "block" : "none" }}>
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Faq;
