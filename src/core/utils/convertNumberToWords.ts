const UNIDADES = [
    "", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"
  ];
  
  const DECENAS = [
    "", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", 
    "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"
  ];
  
  const CENTENAS = [
    "", "CIEN", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", 
    "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"
  ];
  
  const especiales: Record<number, string> = {
    10: "DIEZ", 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE",
    15: "QUINCE", 16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
    20: "VEINTE", 21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO",
    25: "VEINTICINCO", 26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
  };
  
  export const convertNumberToWords = (num: number): string => {
    if (num === 0) return "CERO";
  
    if (num in especiales) {
      return especiales[num];
    }
  
    let letras = "";
  
    if (num >= 1000) {
      letras += num === 1000 ? "MIL" : `${convertNumberToWords(Math.floor(num / 1000))} MIL `;
      num %= 1000;
    }
  
    if (num >= 100) {
      letras += num === 100 ? "CIEN" : `${CENTENAS[Math.floor(num / 100)]} `;
      num %= 100;
    }
  
    if (num >= 30) {
      letras += DECENAS[Math.floor(num / 10)];
      if (num % 10 !== 0) letras += ` Y ${UNIDADES[num % 10]}`;
    } else if (num > 0) {
      letras += especiales[num] || UNIDADES[num];
    }
  
    return letras.trim();
  };