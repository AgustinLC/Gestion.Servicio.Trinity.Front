# Changelog

Todas las modificaciones importantes de este proyecto serán documentadas en este archivo.

El formato está basado en **Keep a Changelog** y el proyecto utiliza **Semantic Versioning (SemVer)**.

---

## [2.0.0] - 2026-09-07

Rediseño visual completo del sitio y revisión integral del comportamiento responsive, junto con una gran cantidad de mejoras de experiencia de usuario, componentes reutilizables y corrección de errores.

### Highlights

* Rediseño visual completo del sitio (paleta, tipografía, layout y componentes).
* Modales de confirmación en todas las acciones que modifican datos, para prevenir pérdida de cambios o navegación accidental.
* Revisión y corrección integral del comportamiento responsive en formularios, modales y tablas de todo el sitio.
* Nueva pantalla de error cuando falla la conexión con el servidor, con reintento antes de recargar.

### Added

#### Componentes reutilizables

* `RoundedDonutChart`: gráfico de torta propio con puntas redondeadas consistentes (reemplaza el de Recharts, que tenía un bug de bordes desparejos con proporciones desiguales).
* `ConnectionErrorPage`: pantalla global que reemplaza la app cuando una petición autenticada no logra conectar con el backend, con botón de reintento que comprueba la conexión antes de recargar.
* `ConfirmModal` aplicado a todas las acciones que mutan datos y todavía no lo tenían (edición de datos personales, cambio de contraseña, suscripción a factura digital, actualización de fecha de vencimiento, entre otras).
* Esqueletos de carga (skeletons) para tablas, con scroll horizontal igual que la tabla real en vez de comprimir las columnas.
* Botón "Limpiar"/"Reiniciar" en formularios y filtros, habilitado solo cuando hay algo cargado.
* Paginación dinámica de tablas según la cantidad de registros.

#### Otros

* Año de copyright y versión de la aplicación dinámicos, tomados de `package.json` en tiempo de build.

### Improved

* Sistema de filtros y buscadores unificado en todas las tablas del sitio.
* Toolbar de tablas: agrupamiento de botones de acción en pantallas angostas.
* Notificaciones de error mediante toast en reemplazo de `alert()` bloqueantes del navegador.

### Fixed

* Posicionamiento incorrecto de dropdowns/menús dentro de modales y en el primer click del menú de usuario del navbar.
* Desbordamiento de tarjetas y gráficos en pantallas angostas (Estado del período, Usuarios por tarifa).
* Chips de estado ("Pagada en término", etc.) que se deformaban en columnas angostas.
* Submenús del sidebar sin flecha indicadora de abierto/cerrado en mobile.
* Zoom automático del navegador al enfocar campos de formulario en mobile.

### Technical

* Se agrega `d3-shape` como dependencia para el renderizado de gráficos de dona.
* Ajuste de configuración de Prettier (`printWidth`) para evitar conflictos entre el formateo automático y el estilo del código.
* Refactor de `RoleProtectedRoute` (de `children` a prop `element`) para permitir rutas de una sola línea sin pelear con el formateador.

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
