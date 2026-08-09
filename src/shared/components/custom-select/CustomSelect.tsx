import { Dropdown } from "react-bootstrap";

export interface CustomSelectOption {
    value: string;
    label: string;
    icon?: string; // Clase de Bootstrap Icons (ej: "bi bi-geo-alt")
    color?: string; // Color del punto (ej: STATUS_DOT_COLORS[status])
    disabled?: boolean;
}

interface CustomSelectProps {
    options: CustomSelectOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    // Ícono fijo a la izquierda del botón (no cambia según la opción
    // seleccionada). Si se omite, se usa el ícono/punto de la opción activa.
    icon?: string;
    disabled?: boolean;
    // Mismo criterio que Form.Control/Form.Select: borde rojo + se apoya en
    // el <Form.Control.Feedback type="invalid"> de al lado para el mensaje
    // (este componente no renderiza el mensaje en sí, como tampoco lo hace
    // Form.Select).
    isInvalid?: boolean;
    // Por default ocupa el 100% del contenedor (igual que Form.Select). Poner
    // en false para un control angosto que solo mida lo que su contenido
    // necesita (ej. el selector de "X por página" de ReusableTable).
    fullWidth?: boolean;
    className?: string;
    "aria-label"?: string;
    // Para poder envolverlo en FloatingFieldset: el label flotante necesita
    // saber cuándo el toggle tiene foco real (no dispara focus/blur nativos
    // por sí solo, hay que reenviarlos al botón).
    onFocus?: React.FocusEventHandler<HTMLElement>;
    onBlur?: React.FocusEventHandler<HTMLElement>;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    icon,
    disabled,
    isInvalid,
    fullWidth = true,
    className = "",
    "aria-label": ariaLabel,
    onFocus,
    onBlur,
}) => {
    const selected = options.find((option) => option.value === value);

    return (
        <Dropdown className={`custom-select ${fullWidth ? "w-100" : ""} ${className}`} drop="down">
            <Dropdown.Toggle
                variant="outline-secondary"
                disabled={disabled}
                aria-label={ariaLabel}
                onFocus={onFocus}
                onBlur={onBlur}
                className={`custom-select-toggle alert-filter-toggle w-100 d-flex align-items-center justify-content-between ${isInvalid ? "is-invalid" : ""}`}
            >
                <span className="d-inline-flex align-items-center gap-2 text-truncate">
                    {icon ? (
                        <i className={`${icon} text-secondary`}></i>
                    ) : selected?.icon ? (
                        <i className={selected.icon}></i>
                    ) : selected?.color ? (
                        <span
                            className="d-inline-block rounded-circle"
                            style={{ width: "10px", height: "10px", backgroundColor: selected.color }}
                            aria-hidden="true"
                        ></span>
                    ) : null}
                    <span className="text-truncate">{selected?.label ?? placeholder}</span>
                </span>
            </Dropdown.Toggle>
            <Dropdown.Menu popperConfig={{ modifiers: [{ name: "flip", enabled: false }] }}>
                {options.map((option) => (
                    <Dropdown.Item
                        key={option.value}
                        active={value === option.value}
                        disabled={option.disabled}
                        onClick={() => onChange(option.value)}
                        className="d-flex align-items-center gap-2"
                    >
                        {option.icon && <i className={option.icon}></i>}
                        {option.color && (
                            <span
                                className="d-inline-block rounded-circle"
                                style={{ width: "10px", height: "10px", backgroundColor: option.color }}
                                aria-hidden="true"
                            ></span>
                        )}
                        <span>{option.label}</span>
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default CustomSelect;
