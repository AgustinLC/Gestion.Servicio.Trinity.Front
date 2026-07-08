// Paleta pastel para avatares de filas de tabla. Se elige un color de forma
// determinística a partir de un texto (ej: nombre completo o id), para que
// cada fila mantenga siempre el mismo color entre renders.
const AVATAR_PALETTE = [
    { bg: "#dbeafe", color: "#1d4ed8" }, // azul
    { bg: "#fce7f3", color: "#be185d" }, // rosa
    { bg: "#ffedd5", color: "#c2410c" }, // naranja
    { bg: "#dcfce7", color: "#15803d" }, // verde
    { bg: "#ede9fe", color: "#6d28d9" }, // violeta
    { bg: "#fef9c3", color: "#a16207" }, // amarillo
    { bg: "#cffafe", color: "#0e7490" }, // celeste
    { bg: "#fee2e2", color: "#b91c1c" }, // rojo
];

export const getAvatarColor = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % AVATAR_PALETTE.length;
    return AVATAR_PALETTE[index];
};
