import React, { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";

interface FloatingFieldsetProps {
    label: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    className?: string;
    children: React.ReactElement<any>;
}

// Envoltorio que dibuja el marco del campo como un <fieldset>, con el label
// como <legend>: es comportamiento nativo del navegador que el borde del
// fieldset nunca se dibuje detrás del legend, así que el label "corta" la
// línea superior de forma limpia sin depender de simular el corte con un
// color de fondo.
//
// Mientras el campo está vacío y sin foco, el label se muestra POR DENTRO
// (como si fuera el valor a completar, un "ghost") y el legend real queda
// colapsado a ancho ~0 (el borde se ve como una línea continua, sin corte).
// Al hacer foco (o al tener un valor real) el legend se expande — recién
// ahí "corta" el borde — y el ghost interno desaparece, dejando el campo
// vacío y listo para escribir.
//
// Compatible con dos formas de child:
// - Form.Control/input/textarea/select nativos: onChange trae un evento,
//   value se lee de e.target.value.
// - Componentes controlados "a medida" (ej: CustomSelect): onChange trae el
//   valor ya resuelto (string), no un evento. El ghost interno solo se
//   muestra para controles nativos, porque los componentes a medida suelen
//   dibujar su propio placeholder y se superpondría con el ghost.
const FloatingFieldset: React.FC<FloatingFieldsetProps> = ({ label, prefix, suffix, className, children }) => {
    const [isFocused, setIsFocused] = useState(false);
    const fieldsetRef = useRef<HTMLFieldSetElement>(null);

    const childProps = isValidElement(children)
        ? (children.props as { value?: unknown; defaultValue?: unknown })
        : {};
    const rawValue = childProps.value ?? childProps.defaultValue;
    const [currentValue, setCurrentValue] = useState(rawValue);

    const isNativeControl = isValidElement(children) && (children.type === Form.Control || typeof children.type === "string");

    // Los <textarea> son multilínea: el cuerpo no puede centrarse
    // verticalmente como con un input de una sola línea (ver CSS).
    const isTextarea = isValidElement(children) && (children.props as { as?: string }).as === "textarea";

    // input[type=date/time/...] dibuja su propio texto de "vacío" (ej:
    // "dd/mm/aaaa") que no es el atributo placeholder y no se puede tapar
    // por CSS: se superponía con nuestro ghost. Estos tipos ya se explican
    // solos, así que directamente no se muestra el ghost para ellos.
    const controlType = isValidElement(children) ? (children.props as { type?: string }).type : undefined;
    const hasOwnEmptyHint = controlType !== undefined && ["date", "time", "month", "week", "datetime-local"].includes(controlType);

    // Bootstrap muestra el <Form.Control.Feedback> vía CSS (".is-invalid ~
    // .invalid-feedback"), que exige que sean HERMANOS directos. Como el
    // control real queda anidado dentro del fieldset, ya no es hermano del
    // feedback (que sigue afuera, al lado del fieldset) — se replica la
    // clase "is-invalid" en el fieldset para que ese selector siga
    // funcionando igual que antes.
    const isInvalid = isValidElement(children) && !!(children.props as { isInvalid?: boolean }).isInvalid;

    // Los campos de react-hook-form suelen ser no controlados. Conservamos el
    // último valor que escribió la persona para que el label no vuelva a
    // superponerse al contenido al perder el foco.
    useEffect(() => {
        if (childProps.value !== undefined) {
            setCurrentValue(childProps.value);
        }
    }, [childProps.value]);

    useEffect(() => {
        if (!isNativeControl) return;
        const input = fieldsetRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select");
        if (input) setCurrentValue(input.value);
    });

    const hasValue = currentValue !== undefined && currentValue !== null && String(currentValue).trim() !== "";
    // Los componentes a medida (ej: CustomSelect) siempre muestran algo
    // dentro (una opción real o su propio placeholder interno), nunca quedan
    // visualmente "vacíos" como un input de texto — así que el label queda
    // siempre arriba para ellos, en vez de depender de un "valor" que puede
    // ser un string vacío perfectamente válido (ej: la opción "-- Cualquiera --").
    // Los input[type=date/time/...] son el mismo caso: al no mostrarse el
    // ghost (ver más abajo), el "hueco" adentro lo ocupa el propio texto
    // nativo del navegador (dd/mm/aaaa), así que el label también queda
    // siempre arriba en vez de esperar un valor.
    const floated = isFocused || hasValue || !isNativeControl || hasOwnEmptyHint;

    const control = isValidElement(children)
        ? cloneElement(children, {
              onFocus: (e: React.FocusEvent<HTMLElement>) => {
                  setIsFocused(true);
                  (children.props as { onFocus?: (e: React.FocusEvent<HTMLElement>) => void }).onFocus?.(e);
              },
              onBlur: (e: React.FocusEvent<HTMLElement>) => {
                  setIsFocused(false);
                  // Solo sincronizar desde target.value si es un control nativo:
                  // botones (ej: el toggle de CustomSelect) también disparan blur
                  // pero su .value no representa la selección real.
                  const target = e.target as HTMLElement;
                  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
                      setCurrentValue(target.value);
                  }
                  (children.props as { onBlur?: (e: React.FocusEvent<HTMLElement>) => void }).onBlur?.(e);
              },
              onChange: (eOrValue: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | string) => {
                  const nextValue = typeof eOrValue === "object" && eOrValue !== null && "target" in eOrValue
                      ? eOrValue.target.value
                      : eOrValue;
                  setCurrentValue(nextValue);
                  (children.props as { onChange?: (arg: typeof eOrValue) => void }).onChange?.(eOrValue);
              },
          })
        : children;

    return (
        <fieldset ref={fieldsetRef} className={`floating-fieldset ${floated ? "floating-fieldset-floated" : ""} ${isInvalid ? "is-invalid" : ""} ${isTextarea ? "floating-fieldset-textarea" : ""} ${className ?? ""}`}>
            <legend className="floating-fieldset-legend">{label}</legend>
            <div className="floating-fieldset-body">
                {prefix && <span className="floating-fieldset-affix">{prefix}</span>}
                <div className="floating-fieldset-input-wrap">
                    {control}
                    {!floated && isNativeControl && !hasOwnEmptyHint && <span className="floating-fieldset-ghost">{label}</span>}
                </div>
                {suffix && <span className="floating-fieldset-affix">{suffix}</span>}
            </div>
        </fieldset>
    );
};

export default FloatingFieldset;
