import React from "react";

interface StatItem {
    label: string;
    value: React.ReactNode;
    icon?: string; // Clase de Bootstrap Icons (ej: "bi bi-people-fill")
    iconBg?: string;
    iconColor?: string;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string; // Clase de Bootstrap Icons (ej: "bi bi-people-fill")
    stats?: StatItem[];
    children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon = "bi bi-grid-1x2-fill", stats = [], children }) => {
    return (
        <div className="page-header d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between mb-3">
            <div className="page-header-left d-flex align-items-center gap-3">
                <div className="page-header-icon d-flex align-items-center justify-content-center">
                    <i className={icon}></i>
                </div>
                <div>
                    <h2 className="mb-1 page-header-title">{title}</h2>
                    {subtitle && <div className="text-muted small">{subtitle}</div>}
                </div>
            </div>

            <div className="page-header-right d-flex flex-wrap align-items-center gap-3 mt-3 mt-md-0">
                {stats.map((s, idx) => (
                    <div key={idx} className="stat-card d-flex align-items-center gap-2 px-3 py-2">
                        {s.icon && (
                            <div
                                className="stat-card-icon d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: s.iconBg ?? "rgba(0, 119, 255, 0.1)", color: s.iconColor ?? "var(--bs-primary)" }}
                            >
                                <i className={s.icon}></i>
                            </div>
                        )}
                        <div>
                            <div className="stat-label text-muted small">{s.label}</div>
                            <div className="stat-value fw-bold">{s.value}</div>
                        </div>
                    </div>
                ))}

                {children && <div className="ms-2">{children}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
