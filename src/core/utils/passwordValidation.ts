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

// Genera una contraseña temporal random que cumple PASSWORD_RULES por
// construcción (un carácter de cada categoría + relleno, después mezclado).
// Se excluyen caracteres ambiguos (I/O/0/1) para que sea más fácil de
// transcribir a mano si el operador se la tiene que dictar al usuario.
const TEMP_PASSWORD_UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const TEMP_PASSWORD_LOWERCASE = "abcdefghijkmnpqrstuvwxyz";
const TEMP_PASSWORD_NUMBERS = "23456789";
const TEMP_PASSWORD_SPECIALS = "!@#$%&*?";

export function generateSecurePassword(length = 10): string {
    const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
    const allChars = TEMP_PASSWORD_UPPERCASE + TEMP_PASSWORD_LOWERCASE + TEMP_PASSWORD_NUMBERS + TEMP_PASSWORD_SPECIALS;

    const required = [
        pick(TEMP_PASSWORD_UPPERCASE),
        pick(TEMP_PASSWORD_LOWERCASE),
        pick(TEMP_PASSWORD_NUMBERS),
        pick(TEMP_PASSWORD_SPECIALS),
    ];
    const filler = Array.from({ length: Math.max(0, length - required.length) }, () => pick(allChars));

    const chars = [...required, ...filler];
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
}
