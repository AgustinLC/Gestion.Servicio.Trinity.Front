import React from "react";
import { Status } from "../../../core/models/dto/Status";
import { STATUS_BADGE_CLASS, STATUS_OPTIONS } from "../labels-traductor/statusStyles";

interface StatusSegmentedControlProps {
    value?: Status;
    onChange: (value: Status) => void;
}

// Selector de estado en 3 botones (en vez de dropdown), para cuando las 3
// opciones ameritan estar siempre visibles de un vistazo (formulario de
// usuario). Reutiliza los mismos colores/clases que el resto del sistema
// (STATUS_OPTIONS/STATUS_BADGE_CLASS de statusStyles.ts).
const StatusSegmentedControl: React.FC<StatusSegmentedControlProps> = ({ value, onChange }) => {
    return (
        <div className="status-segmented-control">
            {STATUS_OPTIONS.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        className={`status-segmented-option ${isActive ? `active ${STATUS_BADGE_CLASS[option.value]}` : ""}`}
                        style={isActive ? { borderColor: option.color } : undefined}
                        onClick={() => onChange(option.value)}
                    >
                        <span className="status-dot" style={{ backgroundColor: option.color }}></span>
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default StatusSegmentedControl;
