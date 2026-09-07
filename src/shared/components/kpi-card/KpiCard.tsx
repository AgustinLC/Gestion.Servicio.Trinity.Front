import React from "react";
import "./KpiCard.css";

interface KpiCardProps {
    icon: string; // Clase de Bootstrap Icons (ej: "bi bi-people-fill")
    iconBg: string;
    iconColor: string;
    label: string;
    value: React.ReactNode;
    valueColor?: string;
}

// Tarjeta estándar de indicador para los tableros de Resumen. Ícono en
// círculo de color + valor destacado. Sin badge de tendencia (lo tenía
// antes, pero en ningún uso real reflejaba una tendencia calculada — era un
// "up"/"down" fijo por tarjeta sin dato histórico detrás, puro ruido visual
// sin significado); el ícono quedó más grande al liberar ese espacio.
const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, iconColor, label, value, valueColor }) => {
    return (
        <div className="kpi-card">
            <div className="kpi-card-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
                <i className={icon}></i>
            </div>
            <div className="kpi-card-body">
                <div className="kpi-card-label">{label}</div>
                <div className="kpi-card-value" style={valueColor ? { color: valueColor } : undefined}>
                    {value}
                </div>
            </div>
        </div>
    );
};

export default KpiCard;
