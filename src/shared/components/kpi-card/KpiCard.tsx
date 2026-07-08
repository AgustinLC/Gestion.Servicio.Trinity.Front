import React from "react";
import "./KpiCard.css";

export type KpiTrend = "up" | "down" | "neutral";

interface KpiCardProps {
    icon: string; // Clase de Bootstrap Icons (ej: "bi bi-people-fill")
    iconBg: string;
    iconColor: string;
    label: string;
    value: React.ReactNode;
    valueColor?: string;
    trend?: KpiTrend;
}

const TREND_ICON: Record<KpiTrend, string> = {
    up: "bi bi-graph-up-arrow",
    down: "bi bi-graph-down-arrow",
    neutral: "bi bi-dash-lg",
};

// Tarjeta estándar de indicador para los tableros de Resumen (Fase 5).
// Ícono en círculo de color + valor destacado + badge de tendencia.
const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, iconColor, label, value, valueColor, trend = "neutral" }) => {
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
            <div className={`kpi-card-trend kpi-card-trend-${trend}`}>
                <i className={TREND_ICON[trend]}></i>
            </div>
        </div>
    );
};

export default KpiCard;
