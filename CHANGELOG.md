# Changelog

Todas las modificaciones importantes de este proyecto serán documentadas en este archivo.

El formato está basado en **Keep a Changelog** y el proyecto utiliza **Semantic Versioning (SemVer)**.

---

## [1.0.0] - 2026-07-02

Primera versión estable del frontend del sistema **Gestión Servicio Trinity**.

### Highlights

* Gestión integral del consorcio desde una única plataforma.
* Paneles independientes para Administradores, Operadores y Usuarios.
* Generación automática e individual de facturas.
* Integración con Mercado Pago para pagos en línea.
* Control de lecturas, deudas y balance financiero.
* Exportación de reportes y generación de documentos PDF.

### Added

#### Autenticación

* Inicio de sesión mediante JWT.
* Recuperación de contraseña por correo electrónico.

#### Paneles

* Dashboard administrativo con módulos de gestión.
* Dashboard de operador con herramientas operativas.
* Dashboard de usuario con funcionalidades de autoservicio.
* Panel de resumen con indicadores y gráficos.

#### Gestión administrativa

* Gestión de trabajadores (operadores).
* Gestión de administradores.
* Gestión de datos principales del consorcio (proveedor).
* Gestión de tarifas y cuotas.
* Gestión de descuentos (fijos, manuales y condicionales).
* Gestión de servicios y unidades de medida.
* Asociación de servicios con unidades.
* Gestión de modalidades de servicio.
* Gestión de funcionalidades del sistema.
* Gestión de preguntas frecuentes (FAQ).

#### Facturación

* Gestión de parámetros de facturación.
* Generación de nuevos períodos de facturación.
* Configuración de parámetros para documentos PDF.
* Parámetros pendientes de facturación por usuario.
* Generación masiva e individual de facturas.
* Gestión de facturas activas y anuladas.
* Envío de notificaciones por correo electrónico.
* Actualización masiva de fechas de vencimiento.

#### Usuarios y Consumos

* Gestión completa de usuarios (CRUD).
* Gestión de lecturas de medidores.
* Toma rápida de lecturas mediante filtros.
* Matriz de control de lecturas con detección de anomalías.
* Consulta de facturas por parte del usuario.
* Descarga de facturas en PDF.
* Visualización del historial de consumos y lecturas.
* Edición de datos personales.
* Cambio de contraseña.

#### Reportes y Control

* Control de balance, deuda y morosidad.
* Generación de avisos de corte.
* Exportación de reportes en formato XLSX.
* Exportación de facturas en formato PDF.

### Improved

* Diseño responsive basado en Bootstrap 5.
* Animaciones y notificaciones mediante Toast.
* Componentes reutilizables con soporte de ordenamiento y paginación.
* Optimización de la generación de facturas PDF (V2).
* Generación de documentos PDF para deuda y avisos de desconexión.
* Traducción de estados y etiquetas al español.
* Mejora de la experiencia de usuario en navegación y administración.

### Security

* Autenticación basada en JWT con almacenamiento seguro de la sesión.
* Interceptor Axios para incorporación automática del token Bearer.
* Protección de rutas según el rol del usuario.
* Redirección automática al iniciar una nueva autenticación cuando la sesión expira.
* Modelo de autorización jerárquico (ADMIN hereda permisos de OPERADOR).

### Technical

* React 18.3.
* TypeScript.
* Vite 5.4 con SWC.
* Bootstrap 5.3.3 y React Bootstrap.
* React Router DOM v6.
* Axios.
* Recharts.
* react-pdf/renderer.
* react-hook-form.
* react-toastify.
* SheetJS (xlsx).
* ESLint 9.
* pnpm.
