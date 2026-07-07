import React from "react";

interface StatItem {
    label: string;
    value: React.ReactNode;
    variant?: string;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    stats?: StatItem[];
    children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, stats = [], children }) => {
    return (
        <div className="page-header card d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between mb-3 p-3">
            <div className="page-header-left d-flex align-items-center gap-3">
                <div className="page-header-icon d-flex align-items-center justify-content-center"> 
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 11C17.6569 11 19 9.65685 19 8C19 6.34315 17.6569 5 16 5C14.3431 5 13 6.34315 13 8C13 9.65685 14.3431 11 16 11Z" fill="#2563EB"/>
                        <path d="M8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z" fill="#60A5FA"/>
                        <path d="M4 17C4 14.2386 6.23858 12 9 12H15C17.7614 12 20 14.2386 20 17V18H4V17Z" fill="#93C5FD"/>
                    </svg>
                </div>
                <div>
                    <h2 className="mb-1 page-header-title">{title}</h2>
                    {subtitle && <div className="text-muted small">{subtitle}</div>}
                </div>
            </div>

            <div className="page-header-right d-flex align-items-center gap-3 mt-3 mt-md-0">
                {stats.map((s, idx) => (
                    <div key={idx} className="stat-card d-flex flex-column align-items-center px-3 py-2">
                        <div className="stat-label text-muted small">{s.label}</div>
                        <div className="stat-value fw-bold">{s.value}</div>
                    </div>
                ))}

                {children && <div className="ms-2">{children}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
