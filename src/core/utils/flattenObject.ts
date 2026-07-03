export const flattenObject = (
  obj: any,
  parentKey = '',
  separator = '_'
): Record<string, any> => {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], newKey, separator));
    } else {
      acc[newKey] = obj[key];
    }
    
    return acc;
  }, {} as Record<string, any>);
};

export const processReportData = (
  data: any[],
  options: {
    exclude?: string[];
    rename?: Record<string, string>;
  } = {}
) => {
  return data.map(item => {
    let flattened = flattenObject(item);

    // Eliminar campos excluidos
    if (options.exclude) {
      options.exclude.forEach(field => delete flattened[field]);
    }

    // Renombrar columnas
    if (options.rename) {
      flattened = Object.keys(flattened).reduce((acc, key) => {
        const newKey = options.rename![key] || key;
        acc[newKey] = flattened[key];
        return acc;
      }, {} as Record<string, any>);
    }

    return flattened;
  });
};