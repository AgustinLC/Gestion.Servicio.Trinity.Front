import type { ChangeHandler, UseFormRegisterReturn } from "react-hook-form";

// El atributo HTML `min` en un <input type="number"> no alcanza para
// bloquear valores negativos: el navegador deja tipear el "-" igual, solo
// marca el campo como inválido (checkValidity) sin impedir nada — y varios
// inputs numéricos del sistema ni siquiera se validan antes de usarse (van
// directo a un query param o a un guardado). Este helper se usa en el
// onChange de esos inputs para directamente ignorar el cambio cuando el
// valor tipeado es negativo, en vez de solo señalarlo como inválido.
export function isNegativeInput(value: string): boolean {
    return value !== "" && Number(value) < 0;
}

// Mismo problema en los campos registrados con react-hook-form, pero con una
// vuelta de tuerca: register(...) deja el input SIN CONTROLAR (no le pasa
// `value`, maneja el DOM directo por ref). En un input controlado (ver
// isNegativeInput más arriba) alcanza con no actualizar el estado — React
// vuelve a pintar el valor anterior y lo tipeado desaparece solo. Acá no hay
// re-render que lo corrija: si el onChange no hace nada, el navegador deja
// igual el "-" que el usuario ya escribió en pantalla. Por eso este wrapper
// corrige `event.target.value` a mano (le saca el "-") antes de dejar que
// react-hook-form procese el evento, así el DOM y el estado del form quedan
// sincronizados en el valor corregido.
export function withNonNegativeGuard<T extends UseFormRegisterReturn>(registered: T): T {
    const originalOnChange = registered.onChange;
    const onChange: ChangeHandler = (event) => {
        const input = event.target as HTMLInputElement;
        if (input.value.includes("-")) {
            input.value = input.value.replace(/-/g, "");
        }
        return originalOnChange(event);
    };
    return { ...registered, onChange };
}
