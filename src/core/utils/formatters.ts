// Funciones de formato
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date?: Date | string | null) => {
  if (!date) return "-";

  // Las fechas que llegan de la API vienen como string (ISO), no como Date;
  // Intl.DateTimeFormat.format() rompe si se le pasa un string directamente.
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  if (isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
};
