import React, { useEffect, useMemo, useRef, useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import "./AutocompleteFilter.css";

export interface AutocompleteFilterOption {
    value: string;
    label: string;
}

interface AutocompleteFilterProps {
    options: AutocompleteFilterOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: string;
    "aria-label"?: string;
    // Para poder envolverlo en FloatingFieldset (mismo criterio que
    // CustomSelect): el label flotante necesita saber cuándo el input
    // interno tiene foco real, y no dispara focus/blur nativos por sí solo
    // al ser un componente compuesto (no un <input> directo).
    onFocus?: React.FocusEventHandler<HTMLElement>;
    onBlur?: React.FocusEventHandler<HTMLElement>;
    // false (default): el valor confirmado siempre es uno de `options`
    // (click en una sugerencia, o Enter con coincidencia exacta); si se
    // sale del campo sin confirmar, el texto tipeado se descarta. Es lo que
    // necesitan los filtros de tabla que comparan por igualdad exacta
    // (useSearch, etc.).
    // true: cada tecla llama a onChange con el texto tal cual (sin exigir
    // que empate con una opción conocida) — para filtros que arman una
    // búsqueda parcial contra el backend (ej. "calle" en
    // BillGenerateFilteredPage, que manda el texto a /operator/search-bills
    // como LIKE). Las sugerencias siguen sirviendo para autocompletar más
    // rápido, pero no son obligatorias.
    freeText?: boolean;
}

const AutocompleteFilter: React.FC<AutocompleteFilterProps> = ({
    options,
    value,
    onChange,
    placeholder = "Buscar...",
    icon,
    "aria-label": ariaLabel,
    onFocus,
    onBlur,
    freeText = false,
}) => {
    const selectedLabel = useMemo(
        () => options.find((option) => option.value === value)?.label ?? "",
        [options, value]
    );
    // En modo texto libre, `value` YA es el texto a mostrar (no hace falta
    // que empate con una opción conocida, a diferencia del modo estricto).
    const displayValue = freeText ? value : selectedLabel;

    const [searchText, setSearchText] = useState(displayValue);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Si el valor cambia desde afuera (ej. "Limpiar filtros"), resincroniza
    // el texto mostrado con la selección real.
    useEffect(() => {
        setSearchText(displayValue);
    }, [displayValue]);

    // Cerrar al hacer click afuera. En modo estricto además descarta texto
    // sin confirmar (mismo criterio que el autocomplete de referencia); en
    // modo libre el texto tipeado ya es el valor aplicado, no hay nada que
    // descartar.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                if (!freeText) setSearchText(selectedLabel);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedLabel, freeText]);

    const filteredOptions = useMemo(() => {
        const term = searchText.trim().toLowerCase();
        if (!term) return options;
        return options
            .filter((option) => option.label.toLowerCase().includes(term))
            .slice(0, 50);
    }, [options, searchText]);

    const commitSelection = (option: AutocompleteFilterOption) => {
        onChange(option.value);
        setSearchText(option.label);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange("");
        setSearchText("");
        setIsOpen(false);
    };

    // Si lo tipeado coincide exactamente (sin importar mayúsculas) con una
    // única opción, Enter la confirma sin necesidad de clickear la sugerencia.
    // En modo texto libre no hace falta: el valor ya se aplicó tecla a tecla.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        const term = searchText.trim().toLowerCase();
        const exactMatch = options.find(
            (option) => option.label.toLowerCase() === term
        );
        if (exactMatch) {
            commitSelection(exactMatch);
        } else {
            (event.target as HTMLInputElement).blur();
        }
    };

    const handleChangeText = (text: string) => {
        setSearchText(text);
        setIsOpen(true);
        if (freeText) onChange(text);
    };

    return (
        <div className="autocomplete-filter" ref={wrapperRef}>
            <InputGroup className="table-toolbar-filter-group">
                {icon && (
                    <InputGroup.Text>
                        <i className={icon}></i>
                    </InputGroup.Text>
                )}
                <Form.Control
                    type="text"
                    className="autocomplete-filter-input"
                    value={searchText}
                    placeholder={placeholder}
                    aria-label={ariaLabel}
                    onFocus={(event) => {
                        setIsOpen(true);
                        onFocus?.(event);
                    }}
                    onChange={(event) => handleChangeText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={(event) => {
                        setIsOpen(false);
                        if (!freeText) setSearchText(selectedLabel);
                        onBlur?.(event);
                    }}
                />
            </InputGroup>

            {searchText && (
                <button
                    type="button"
                    className="autocomplete-filter-clear"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={handleClear}
                    aria-label="Limpiar"
                >
                    <i className="bi bi-x"></i>
                </button>
            )}

            {isOpen && filteredOptions.length > 0 && (
                <ul className="autocomplete-filter-suggestions">
                    {filteredOptions.map((option) => (
                        <li
                            key={option.value}
                            className="autocomplete-filter-suggestion-item"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => commitSelection(option)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteFilter;
