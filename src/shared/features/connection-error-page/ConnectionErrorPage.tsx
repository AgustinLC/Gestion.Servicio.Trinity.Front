import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../../../config/axiosConfig";
import { useConnectionError } from "../../../context/ConnectionErrorContext";
import "./ConnectionErrorPage.css";

const ConnectionErrorPage: React.FC = () => {
    const navigate = useNavigate();
    const { clearConnectionError } = useConnectionError();
    const [isRetrying, setIsRetrying] = useState(false);
    const handleReload = async () => {
        setIsRetrying(true);
        try {
            await axiosInstance.get("/info/data-main", { timeout: 8000 });
            window.location.reload();
        } catch (err) {
            const stillDown = axios.isAxiosError(err) && !err.response;
            if (!stillDown) {
                window.location.reload();
                return;
            }
            toast.error("No pudimos conectarnos con el servidor. Intentá nuevamente.");
            setIsRetrying(false);
        }
    };

    const handleGoHome = () => {
        clearConnectionError();
        navigate("/");
    };

    return (
        <div className="connection-error-page">
            <div className="connection-error-blob connection-error-blob-1"></div>
            <div className="connection-error-blob connection-error-blob-2"></div>

            <div className="connection-error-card content-fade-in-slide">
                <div className="connection-error-icon">
                    <i className="bi bi-hdd-network"></i>
                    <span className="connection-error-icon-badge">
                        <i className="bi bi-x-lg"></i>
                    </span>
                </div>

                <h1 className="connection-error-title">No pudimos cargar la información</h1>
                <p className="connection-error-message">Ocurrió un error interno en el servidor. Puede deberse a un problema de conexión o a un mantenimiento temporal.</p>
                <p className="connection-error-hint">Por favor, intentá nuevamente o volvé al inicio.</p>

                <div className="d-flex justify-content-center gap-2 flex-wrap mt-4">
                    <button type="button" className="btn btn-primary" onClick={handleReload} disabled={isRetrying}>
                        <i className={`bi bi-arrow-clockwise me-1${isRetrying ? " connection-error-spin" : ""}`}></i>
                        {isRetrying ? "Comprobando..." : "Recargar"}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleGoHome} disabled={isRetrying}>
                        <i className="bi bi-house me-1"></i>
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectionErrorPage;
