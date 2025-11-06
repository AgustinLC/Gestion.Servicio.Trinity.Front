import { useState, useEffect } from "react";

/**
 * Hook reutilizable para búsquedas y filtros.
 * @param data Lista de datos completa.
 * @param searchableKeys Claves sobre las que buscar (admite rutas anidadas tipo 'residenceDto.street').
 * @param filters Objeto de filtros opcional (por ejemplo { street: "Av. Siempre Viva" }).
 */

export function useSearch<T extends Record<string, any>>(
  data: T[],
  searchableKeys: string[],
  filters: Record<string, string | number | null> = {}
) {
  const [filteredData, setFilteredData] = useState<T[]>(data);

  const handleSearch = (query: string) => {
    const q = query.trim().toLowerCase();

    let result = data;

    // Aplicar filtros por campo (ej: calle, distrito)
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) => {
          const fieldValue = getNestedValue(item, key);
          return String(fieldValue).toLowerCase() === String(value).toLowerCase();
        });
      }
    });

    // Si hay texto de búsqueda, aplicarlo también
    if (q) {
      result = result.filter((item) =>
        searchableKeys.some((key) => {
          const value = getNestedValue(item, key);
          return value && String(value).toLowerCase().includes(q);
        })
      );
    }

    setFilteredData(result);
  };

  // Refresca resultados cuando cambian los datos o los filtros
  useEffect(() => {
    handleSearch("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, JSON.stringify(filters)]);

  return { filteredData, handleSearch, setFilteredData };
}

// Utilidad para acceder a propiedades anidadas como "residenceDto.street"
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
}
