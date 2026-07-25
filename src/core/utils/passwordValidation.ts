// Única fuente de verdad para las reglas de complejidad de contraseña,
// usada en todos los lugares donde un usuario (operador o cliente final)
// puede definir/cambiar una contraseña a mano: el reseteo rápido desde
// Usuarios (UserPage), el cambio de contraseña propio (UserPersonalData) y
// el flujo de "olvidé mi contraseña" (ResetPasswordPage).

export const MIN_PASSWORD_LENGTH = 4;

export interface PasswordRule {
    key: string;
    label: string;
    test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
    { key: "length", label: `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`, test: (value) => value.length >= MIN_PASSWORD_LENGTH },
    { key: "uppercase", label: "Una letra mayúscula", test: (value) => /[A-Z]/.test(value) },
    { key: "number", label: "Un número", test: (value) => /[0-9]/.test(value) },
    { key: "special", label: "Un carácter especial", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export function getPasswordRuleResults(value: string): (PasswordRule & { passed: boolean })[] {
    return PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(value) }));
}

export function isPasswordValid(value: string): boolean {
    return PASSWORD_RULES.every((rule) => rule.test(value));
}
