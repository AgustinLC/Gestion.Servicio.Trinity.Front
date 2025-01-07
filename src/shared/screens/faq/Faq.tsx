import React, { useEffect, useState } from "react";
import "./Faq.css";
import { getData } from "../../../core/services/apiService";
import { MainData } from "../../../core/models/entity/MainData";

const Faq: React.FC = () => {
    const [data, setData] = useState<MainData | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

    const toggleAnswer = (index: number) => {
        setActiveIndex(index === activeIndex ? null : index);
    };

    return (
        <div>
        {/* Header Section */}
        <header className="bg-primary text-white text-center py-5 mt-4">
            <div className="container">
                <h1 className="display-4 fw-bold">{data?.type}</h1>
                <h3 className="display-4 fw-bold">{data?.title}</h3>
                <p className="lead mt-3 fs-2">
                    FAQ - Preguntas Frecuentes
                </p>
            </div>
        </header>
        {/* Features Section */}
        <section id="features" className="py-5 bg-light">
            <div className="container">
                {[
                    { question: "¿Cómo puedo consultar mis expensas mensuales?", answer: "Puedes consultar tus expensas ingresando al sistema con tu usuario y contraseña. Una vez dentro, dirígete a la sección 'Expensas' donde podrás descargar el detalle de cada mes." },
                    { question: "¿Qué hago si detecto un error en mi factura de expensas?", answer: "Si encuentras un error en tu factura, puedes reportarlo directamente desde la sección 'Soporte' del sistema. Adjunta una descripción del problema y, si es posible, captura de pantalla del error. Nuestro equipo de administración se pondrá en contacto contigo." },
                    { question: "¿Cómo actualizo mis datos personales en el sistema?", answer: "Para actualizar tus datos, accede a la sección 'Perfil' dentro del sistema. Desde ahí podrás modificar tu información, como correo electrónico, número de teléfono o domicilio alternativo. Recuerda guardar los cambios." },
                    { question: "¿Qué métodos de pago están disponibles para las expensas?", answer: "El sistema admite transferencias bancarias, tarjetas de débito/crédito y pagos a través de billeteras electrónicas como Mercado Pago. Puedes consultar los detalles en la sección 'Pagos'." },
                    { question: "¿Cómo reporto problemas en las áreas comunes?", answer: "Puedes reportar problemas o necesidades de mantenimiento en las áreas comunes accediendo a la sección 'Reclamos y Solicitudes'. Describe el problema y, si es necesario, adjunta fotos. Esto agilizará el proceso de atención." },
                    { question: "¿Dónde puedo ver los documentos oficiales del consorcio?", answer: "En la sección 'Documentos', encontrarás los reglamentos, actas de reuniones, presupuestos y otros documentos importantes del consorcio. Puedes descargarlos en formato PDF." },
                    { question: "¿Cómo participo en las reuniones virtuales del consorcio?", answer: "Cuando se programe una reunión, recibirás una notificación con un enlace para unirte a través del sistema o mediante una videollamada (Zoom o similar). Las instrucciones estarán disponibles en la sección 'Comunicaciones'." },
                    { question: "¿Qué hago si olvidé mi contraseña?", answer: "Si olvidaste tu contraseña, haz clic en '¿Olvidaste tu contraseña?' en la pantalla de inicio de sesión. Ingresa tu correo electrónico registrado y recibirás un enlace para restablecerla." },
                    { question: "¿Puedo delegar el acceso al sistema a otra persona?", answer: "Sí, puedes otorgar acceso a un familiar o representante legal. Esto se configura desde la sección 'Gestión de Usuarios'. Es necesario proporcionar los datos del nuevo usuario y establecer sus permisos." },
                    { question: "¿Qué debo hacer si tengo una consulta urgente fuera del horario de atención?", answer: "En caso de urgencias (como rotura de caños o cortes de electricidad en áreas comunes), puedes utilizar la opción de 'Emergencias' en el sistema, donde encontrarás los contactos directos de los proveedores de servicio." }
                ].map((faq, index) => (
                    <div className="faq-item" key={index}>
                        <div
                            className={`faq-question ${activeIndex === index ? "active" : ""}`}
                            onClick={() => toggleAnswer(index)}
                        >
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
