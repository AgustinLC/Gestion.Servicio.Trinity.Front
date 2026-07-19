import { Dropdown } from "react-bootstrap";

// Dropdown reutilizable con un punto de color por opción, tanto en el botón
// (según la opción seleccionada) como en cada ítem del menú. Mismo patrón
// que el filtro de "Inconsistencias" de ReadingControlPage, generalizado
// para poder reusarlo en cualquier campo/filtro con estados de color (por
// ahora: Estado del usuario, en el formulario y en el filtro de la tabla).
export interface DotDropdownOption {
    value: string;
    label: string;
    color?: string;
}

interface DotDropdownProps {
    options: DotDropdownOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: string; // Clase de Bootstrap Icons para el ícono a la izquierda del botón
    className?: string;
}

const DotDropdown: React.FC<DotDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    icon,
    className = "",
}) => {
    const selected = options.find((option) => option.value === value);

    return (
        <Dropdown className={`w-100 ${className}`}>
            <Dropdown.Toggle
                variant="outline-secondary"
                className="alert-filter-toggle w-100 d-flex align-items-center justify-content-between"
            >
                <span className="d-inline-flex align-items-center gap-2">
                    {icon && <i className={`${icon} text-secondary`}></i>}
                    {selected?.color && (
                        <span
                            className="d-inline-block rounded-circle"
                            style={{ width: "10px", height: "10px", backgroundColor: selected.color }}
                            aria-hidden="true"
                        ></span>
                    )}
                    <span>{selected?.label ?? placeholder}</span>
                </span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100">
                {options.map((option) => (
                    <Dropdown.Item
                        key={option.value}
                        active={value === option.value}
                        onClick={() => onChange(option.value)}
                        className="d-flex align-items-center gap-2"
                    >
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

export default DotDropdown;
