import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface ConnectionErrorContextValue {
    hasConnectionError: boolean;
    clearConnectionError: () => void;
}

const ConnectionErrorContext = createContext<ConnectionErrorContextValue | null>(null);

// axiosConfig.ts vive fuera del árbol de React (es un módulo plano), así
// que no puede llamar a un setState directamente. En su lugar, el
// Provider registra acá su propio setter al montarse, y triggerConnectionError
// (exportada) lo invoca desde el interceptor de errores.
let notifyConnectionError: (() => void) | null = null;

export const triggerConnectionError = () => {
    notifyConnectionError?.();
};

export const ConnectionErrorProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [hasConnectionError, setHasConnectionError] = useState(false);

    useEffect(() => {
        notifyConnectionError = () => setHasConnectionError(true);
        return () => {
            notifyConnectionError = null;
        };
    }, []);

    const clearConnectionError = useCallback(() => {
        setHasConnectionError(false);
    }, []);

    return <ConnectionErrorContext.Provider value={{ hasConnectionError, clearConnectionError }}>{children}</ConnectionErrorContext.Provider>;
};

export const useConnectionError = (): ConnectionErrorContextValue => {
    const context = useContext(ConnectionErrorContext);
    if (!context) {
        throw new Error("useConnectionError debe usarse dentro de un ConnectionErrorProvider");
    }
    return context;
};
