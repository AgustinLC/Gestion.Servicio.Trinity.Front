import React from "react";

interface HintBoxProps {
    icon?: string;
    variant?: "info" | "danger" | "warning";
    className?: string;
    children: React.ReactNode;
}

const VARIANT_ICON: Record<string, string> = {
    danger: "bi bi-exclamation-triangle-fill",
    warning: "bi bi-lightbulb-fill",
    info: "bi bi-info-circle-fill",
};

const HintBox: React.FC<HintBoxProps> = ({
    icon,
    variant = "info",
    className = "",
    children,
}) => {
    const resolvedIcon = icon ?? VARIANT_ICON[variant];
    return (
        <div
            className={`hint-box ${variant !== "info" ? `hint-box-${variant}` : ""} ${className}`}
        >
            <i className={resolvedIcon}></i>
            <span>{children}</span>
        </div>
    );
};

export default HintBox;
