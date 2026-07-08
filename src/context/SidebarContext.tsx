import React, { createContext, useState, useCallback, useContext, useEffect } from "react";

interface SidebarContextProps {
  isMobile: boolean;
  sidebarOpen: boolean; // Mobile: si el drawer está abierto
  toggleSidebar: () => void; // Botón hamburguesa del navbar (solo mobile)
  closeSidebar: () => void; // Usado al navegar en mobile para cerrar el drawer
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Detecta cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // La hamburguesa solo controla el drawer en mobile (en desktop el sidebar es siempre fijo)
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  return (
    <SidebarContext.Provider value={{ isMobile, sidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextProps => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar debe ser usado dentro de un SidebarProvider");
  }
  return context;
};
