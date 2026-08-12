// Reglas de validación reutilizables para combinar con register(name, {...})
// de react-hook-form. Cada helper devuelve solo el fragmento de opciones que
// le corresponde (required, maxLength, pattern, etc.), así que se pueden
// combinar varias en un mismo campo con combineRules(...).
//
// Ojo: si dos fragmentos definen la MISMA key (ej: dos "pattern" distintos,
// como email + noSpecialChars), el último pisa al anterior — para esos casos
// hay que escribir un regex propio que cubra ambas condiciones a la vez, en
// vez de combinar dos reglas de tipo pattern.
import { ValidationRule } from "react-hook-form";

export const REQUIRED_MESSAGE = "Este campo es obligatorio";

// No se deriva de RegisterOptions<TFieldValues, TFieldName>: esa tiene 3
// props (deps, validate, value) cuyo tipo depende de esos genéricos
// concretos del formulario en el que se use, y además es una unión
// discriminada por valueAsNumber/valueAsDate/pattern que no sobrevive un
// Omit limpio. Como estos helpers son genéricos y nunca tocan esas 3 props
// ni ese discriminante, se define una interfaz propia con solo los campos
// que sí usamos — así el resultado calza estructuralmente con el
// RegisterOptions específico de CUALQUIER formulario al pasarlo a
// register(name, combineRules(...)).
interface Rules {
    required?: string | ValidationRule<boolean>;
    min?: ValidationRule<number | string>;
    max?: ValidationRule<number | string>;
    maxLength?: ValidationRule<number>;
    minLength?: ValidationRule<number>;
    pattern?: ValidationRule<RegExp>;
}

export const requiredRule = (message: string = REQUIRED_MESSAGE): Rules => ({
    required: message,
});

export const maxLengthRule = (max: number, message?: string): Rules => ({
    maxLength: { value: max, message: message ?? `No puede superar los ${max} caracteres` },
});

export const minLengthRule = (min: number, message?: string): Rules => ({
    minLength: { value: min, message: message ?? `Debe tener al menos ${min} caracteres` },
});

// Para campos de largo fijo (ej: CUIT, CBU): un solo mensaje, no dos reglas
// con mensajes distintos que se pisarían entre sí.
export const exactLengthRule = (length: number, message?: string): Rules => {
    const finalMessage = message ?? `Debe tener exactamente ${length} caracteres`;
    return {
        minLength: { value: length, message: finalMessage },
        maxLength: { value: length, message: finalMessage },
    };
};

export const emailRule = (message: string = "Ingresá un correo electrónico válido"): Rules => ({
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message },
});

export const onlyDigitsRule = (message: string = "Solo se permiten números"): Rules => ({
    pattern: { value: /^\d*$/, message },
});

// Letras (con acentos/ñ), números y espacios: para nombres, direcciones, etc.
// donde no tiene sentido admitir simbolos como # % & * / etc.
export const noSpecialCharsRule = (message: string = "No se permiten caracteres especiales"): Rules => ({
    pattern: { value: /^[a-zA-ZÀ-ÿñÑ0-9\s]*$/, message },
});

export const numericRangeRule = (min: number, max: number, message?: string): Rules => {
    const finalMessage = message ?? `El valor debe estar entre ${min} y ${max}`;
    return {
        min: { value: min, message: finalMessage },
        max: { value: max, message: finalMessage },
    };
};

// Para campos numéricos con un solo límite (la mayoría: no suele haber un
// "máximo" natural para un precio, un importe, un conteo, etc.).
export const minValueRule = (min: number, message?: string): Rules => ({
    min: { value: min, message: message ?? `El valor debe ser mayor o igual a ${min}` },
});

// Combina varios fragmentos de reglas en un solo objeto para pasarle a
// register(name, combineRules(requiredRule(), maxLengthRule(50))).
export function combineRules(...rules: Rules[]): Rules {
    return Object.assign({}, ...rules);
}
