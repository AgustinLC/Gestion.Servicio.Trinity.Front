import type { ChangeHandler, UseFormRegisterReturn } from "react-hook-form";

export function isNegativeInput(value: string): boolean {
    return value !== "" && Number(value) < 0;
}

export function withNonNegativeGuard<T extends UseFormRegisterReturn>(
    registered: T
): T {
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
