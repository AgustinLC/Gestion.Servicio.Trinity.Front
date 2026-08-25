import React, { useEffect, useRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("es", es);

// Convierte entre el string "YYYY-MM-DD" que ya usaba todo el sistema (el
// mismo formato que devolvía el <input type="date"> nativo que reemplaza
// este componente) y el objeto Date que pide react-datepicker. A mano en
// vez de con `new Date(value)`/`date.toISOString()`: esas dos interpretan
// la fecha en UTC, y con el uso horario de Argentina (UTC-3) eso corre la
// fecha un día para atrás.
function parseISODate(value: string): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

function toISODate(date: Date | null): string {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

interface AppDatePickerProps {
    // "YYYY-MM-DD" o "" — mismo formato que ya usaba <input type="date">,
    // así que reemplazarlo en un campo existente no pide tocar el resto del
    // estado/validación de ese formulario.
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
    minDate?: Date;
    maxDate?: Date;
    disabled?: boolean;
    isInvalid?: boolean;
    // Por default se puede limpiar (como cualquier <input type="date">,
    // que siempre tuvo su propia "x" nativa); false para los campos donde
    // la fecha es obligatoria y no tiene sentido dejarlo vacío.
    isClearable?: boolean;
    placeholder?: string;
}

// Arma "dd/MM/yyyy" mientras se escribe, sin dejar completar un día mayor a
// 31 ni un mes mayor a 12: si el primer dígito de alguno de los dos ya no
// puede formar un valor válido (ej. día que arranca con "5", mes con "3"),
// se le antepone un cero y se pasa directo al siguiente segmento — igual
// que la fecha de vencimiento de una tarjeta. Si el valor de dos dígitos se
// pasa del máximo (ej. "35" para el día), se recorta al máximo (31/12). No
// valida días por mes (ej. 30 de febrero): eso lo sigue resolviendo la
// validación del formulario al confirmar.
function buildMaskedDate(rawDigits: string): string {
    let i = 0;
    const readSegment = (max: number): string => {
        if (i >= rawDigits.length) return "";
        const first = rawDigits[i];
        if (Number(first) * 10 > max) {
            i += 1;
            return `0${first}`;
        }
        if (i + 1 >= rawDigits.length) {
            i += 1;
            return first;
        }
        const second = rawDigits[i + 1];
        const value = Number(first + second);
        i += 2;
        if (value === 0) return "01";
        if (value > max) return String(max).padStart(2, "0");
        return first + second;
    };

    const day = readSegment(31);
    if (day.length < 2) return day;
    const month = readSegment(12);
    if (month.length < 2) return `${day}/${month}`;
    const year = rawDigits.slice(i, i + 4);
    return `${day}/${month}/${year}`;
}

// Enmascara lo que se tipea a mano: se queda solo con los dígitos y arma la
// fecha con buildMaskedDate. También se lo llama cuando se elige una fecha
// haciendo click en el calendario (react-datepicker invoca el mismo
// onChangeRaw ahí), pero en ese caso el target del evento no es el input
// sino el día clickeado, por eso el `instanceof` es necesario: sin él, leer
// `target.value` de un <div> tira y corta la selección por click a mitad de
// camino. Muta el value del evento en el momento, antes de que
// react-datepicker lo lea para intentar parsear la fecha.
//
// Guarda el último valor formateado en el propio input (dataset) para poder
// distinguir "está escribiendo" de "está borrando": el auto-completado (cero
// adelante, barra apenas se completan los 2 dígitos) sirve al escribir, pero
// si se aplica también al borrar, un solo backspace borra la barra o el cero
// y esta función se los vuelve a poner en el mismo instante, dejándolos
// imposibles de borrar.
function formatTypedInput(event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) {
    const target = event?.target;
    if (!(target instanceof HTMLInputElement)) return;
    const prevFormatted = target.dataset.maskValue ?? "";
    const isDeleting = target.value.length < prevFormatted.length;
    const rawDigits = target.value.replace(/\D/g, "").slice(0, 8);

    let formatted: string;
    if (isDeleting) {
        if (rawDigits.length > 4) {
            formatted = `${rawDigits.slice(0, 2)}/${rawDigits.slice(2, 4)}/${rawDigits.slice(4)}`;
        } else if (rawDigits.length > 2) {
            formatted = `${rawDigits.slice(0, 2)}/${rawDigits.slice(2)}`;
        } else {
            formatted = rawDigits;
        }
    } else {
        formatted = buildMaskedDate(rawDigits);
    }

    target.dataset.maskValue = formatted;
    target.value = formatted;
}

const AppDatePicker: React.FC<AppDatePickerProps> = ({
    value,
    onChange,
    onBlur,
    onFocus,
    minDate,
    maxDate,
    disabled,
    isInvalid,
    isClearable = true,
    placeholder,
}) => {
    // react-datepicker refoca el input a mano después de limpiarlo con la
    // "x" (sendFocusBackToInput), pero ese refoco puntual pisa su propio
    // estado interno para no reabrir el calendario y, de paso, se salta el
    // onFocus que le pasamos por props. Sin este listener nativo, el label
    // de FloatingFieldset no se entera de ese foco y queda tapado por el
    // valor si se vuelve a escribir después de limpiar.
    const wrapperRef = useRef<HTMLDivElement>(null);
    const onFocusRef = useRef(onFocus);
    onFocusRef.current = onFocus;

    useEffect(() => {
        const input = wrapperRef.current?.querySelector("input");
        if (!input) return;
        const handleNativeFocus = (event: FocusEvent) => {
            onFocusRef.current?.(event as unknown as React.FocusEvent<HTMLElement>);
        };
        input.addEventListener("focus", handleNativeFocus);
        return () => input.removeEventListener("focus", handleNativeFocus);
    }, []);

    // Si se limpia el valor (botón "x", reset del formulario, etc.) sin pasar
    // por formatTypedInput, hay que resetear el dataset a mano: si no, al
    // volver a escribir se compara contra el valor formateado viejo y la
    // primera barra tarda un dígito de más en aparecer.
    useEffect(() => {
        if (value) return;
        const input = wrapperRef.current?.querySelector("input");
        if (input) delete input.dataset.maskValue;
    }, [value]);

    return (
        <div ref={wrapperRef} className="w-100">
            <DatePicker
                selected={parseISODate(value)}
                onChange={(date: Date | null) => onChange(toISODate(date))}
                onChangeRaw={formatTypedInput}
                onBlur={onBlur}
                onFocus={onFocus}
                locale="es"
                dateFormat="dd/MM/yyyy"
                placeholderText={placeholder}
                className={`form-control${isInvalid ? " is-invalid" : ""}`}
                wrapperClassName="w-100"
                minDate={minDate}
                maxDate={maxDate}
                disabled={disabled}
                isClearable={isClearable && !disabled}
                showPopperArrow={false}
            />
        </div>
    );
};

export default AppDatePicker;
