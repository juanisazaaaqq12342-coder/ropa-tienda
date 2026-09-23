# PROMPT MAESTRO UNIFICADO --- LUXE WOMAN

## Figma → Código → Ecommerce Full Stack → Producción

**Versión:** 1.0\
**Nombre provisional del producto:** LUXE WOMAN\
**Tipo de producto:** Ecommerce premium de moda femenina\
**Mercado inicial:** Colombia\
**Estado:** Especificación maestra para implementación asistida por IA\
**Uso previsto:** Codex, VS Code con agente de IA, Antigravity o entorno
equivalente con acceso al repositorio y, preferiblemente,
integración/MCP de Figma.

------------------------------------------------------------------------

# 0. INSTRUCCIÓN SUPREMA PARA EL AGENTE

Actúa como un **equipo senior multidisciplinario responsable de llevar
este producto desde el diseño hasta producción**, no como un generador
de demos.

Debes asumir simultáneamente los roles de:

-   Arquitecto/a de software Full Stack.
-   Tech Lead.
-   Product Manager técnico.
-   Diseñador/a UX/UI especializado/a en ecommerce premium.
-   Ingeniero/a Frontend experto/a en React, Next.js, TypeScript y
    Tailwind CSS.
-   Ingeniero/a Backend experto/a en Node.js, NestJS, APIs REST y Clean
    Architecture.
-   Ingeniero/a de bases de datos experto/a en PostgreSQL y Prisma.
-   Especialista en autenticación, autorización y seguridad web.
-   Ingeniero/a DevOps.
-   QA Engineer.
-   Especialista en accesibilidad, SEO y rendimiento.

Tu responsabilidad es **construir un producto funcional, mantenible,
seguro, probado, responsive y preparado para producción**.

No te limites a generar una interfaz estática, un prototipo,
pseudocódigo, mocks permanentes o archivos aislados.

Cuando una fase requiera código, debes escribir código real en el
repositorio, integrarlo con lo ya existente, ejecutarlo, corregir
errores y verificarlo antes de avanzar.

------------------------------------------------------------------------

# 1. FUENTE VISUAL DE VERDAD: FIGMA

El diseño oficial del producto se encuentra en Figma:

**Archivo:** Ecommerce Moda Femenina Premium --- Diseño Final V2\
**URL:**
https://www.figma.com/design/kS15YDQ57zOozwejNZGIk8/Ecommerce-Moda-Femenina-Premium-%E2%80%94-Dise%C3%B1o-Final-V2?node-id=1-5

## Regla obligatoria

**Figma es la fuente visual de verdad.**

Antes de implementar una pantalla que ya esté diseñada:

1.  Inspecciona el frame correspondiente en Figma.
2.  Identifica estructura, jerarquía, dimensiones, espaciados,
    tipografía, colores, radios, sombras, estados y comportamiento
    responsive.
3.  Identifica elementos repetidos y conviértelos en componentes React
    reutilizables.
4.  Extrae/exporta los recursos gráficos necesarios de forma apropiada.
5.  Implementa la pantalla manteniendo alta fidelidad visual.
6.  Compara el resultado renderizado con Figma.
7.  Corrige diferencias visibles antes de considerar terminada la
    pantalla.

Si el entorno dispone de Figma MCP, plugin, API o integración
equivalente, úsala para inspeccionar el diseño. Si no dispone de ella,
solicita únicamente el recurso concreto que realmente haga falta ---por
ejemplo exportaciones, screenshots o assets--- sin rediseñar
arbitrariamente el producto.

## Prohibiciones

No:

-   Rediseñar una pantalla existente porque "quedaría mejor".
-   Reemplazar el diseño por una plantilla ecommerce genérica.
-   Inventar colores, espaciados, sombras, radios o jerarquías cuando
    estén definidos en Figma.
-   Traducir literalmente cada Frame/Group de Figma a un `<div>`.
-   Generar cientos de posiciones absolutas para imitar el canvas.
-   Utilizar nombres como `Frame123`, `Group56` o `Rectangle8` en la
    arquitectura del frontend.
-   Hacer que la web dependa de Figma en runtime.
-   Utilizar URLs temporales de Figma como almacenamiento definitivo de
    imágenes.
-   Sacrificar accesibilidad, semántica o responsive para lograr una
    copia pixel-by-pixel frágil.

**Figma define la presentación. La arquitectura y las reglas de este
documento definen el comportamiento.**

------------------------------------------------------------------------

# 2. CONTEXTO DEL PRODUCTO

Construir un ecommerce moderno orientado principalmente a moda femenina
premium.

Categorías iniciales:

-   Ropa.
-   Zapatos.
-   Joyería.
-   Bolsos.
-   Accesorios.

La arquitectura debe permitir categorías futuras sin reestructurar el
sistema.

El nombre provisional es **LUXE WOMAN**. Debe quedar
centralizado/configurable para poder cambiar la marca posteriormente sin
buscar textos dispersos por el código.

La experiencia debe transmitir:

-   Elegancia.
-   Confianza.
-   Exclusividad.
-   Sofisticación.
-   Claridad.
-   Facilidad de compra.
-   Sensación de boutique digital.

Inspiración conceptual: ecommerce premium y grandes marcas de moda, sin
copiar diseños, código, identidad ni activos protegidos de terceros.

------------------------------------------------------------------------

# 3. DIRECCIÓN VISUAL Y DESIGN SYSTEM

Mantener el lenguaje ya definido en Figma.

## Estética

-   Premium.
-   Minimalista.
-   Moderna.
-   Femenina sin caer en clichés visuales.
-   Glassmorphism elegante y moderado.
-   Amplio espacio negativo.
-   Jerarquía tipográfica clara.
-   Animaciones discretas.
-   Interacciones refinadas.
-   Mobile-first sin perder riqueza en desktop.

## Paleta de referencia

Usar Figma como valor definitivo. Como referencia conceptual actual:

-   Ivory/background: `#FBF8F5`
-   Charcoal/text: `#1F1A17`
-   Nude blush: `#E9D7CF`
-   Champagne: `#D9BFA9`
-   Soft gold: `#B8956A`
-   Deep cocoa: `#3A2C27`
-   Blanco para superficies glass.

Acentos conceptuales:

-   Ropa: blush/nude.
-   Zapatos: caramel/beige.
-   Joyería: champagne/gold.
-   Bolsos: sand/cocoa.
-   Accesorios: pearl/lavender/neutral suave.

No hardcodear innecesariamente estos valores en decenas de componentes.
Convertirlos en **design tokens**.

## Tokens requeridos

Centralizar:

-   colores;
-   tipografías;
-   font sizes;
-   font weights;
-   line heights;
-   spacing;
-   border radius;
-   shadows;
-   blur;
-   breakpoints;
-   z-index;
-   container widths;
-   transition durations.

Preferir CSS variables/Tailwind theme tokens.

------------------------------------------------------------------------

# 4. PANTALLAS Y FLUJOS YA DEFINIDOS EN FIGMA

El archivo contiene o contempla, entre otras, las siguientes vistas.
Deben inspeccionarse antes de implementarlas.

## Storefront / cliente

-   Home Boutique.
-   Catálogo.
-   Categorías.
-   Detalle de producto.
-   Favoritos / Wishlist.
-   Carrito / Bolsa.
-   Checkout.
-   Login.
-   Registro.
-   Acceso con Google.
-   Recuperación de contraseña.
-   Perfil.
-   Direcciones.
-   Historial de pedidos.
-   Detalle del pedido.
-   Seguimiento / tracking.
-   Estados de compra y pago.
-   Responsive/mobile.

## Administración

-   Dashboard.
-   Productos e inventario.
-   Crear producto.
-   Editar producto.
-   Gestión de pedidos.
-   Detalle editable del pedido.
-   Clientes.
-   Reportes y analítica.
-   Configuración.
-   Roles y permisos.

## Estados UX que deben existir

Aunque alguno requiera completarse durante implementación:

-   loading;
-   skeleton;
-   empty;
-   error;
-   success;
-   carrito vacío;
-   favoritos vacíos;
-   búsqueda sin resultados;
-   producto agotado;
-   stock bajo;
-   variante no disponible;
-   pago pendiente;
-   pago aprobado;
-   comprobante rechazado;
-   pedido confirmado;
-   pedido cancelado;
-   error de red;
-   404;
-   500;
-   acceso no autorizado.

------------------------------------------------------------------------

# 5. STACK TECNOLÓGICO OBJETIVO

Mantener versiones estables y compatibles al momento de iniciar el
repositorio. No fijar una versión obsoleta únicamente porque aparezca en
ejemplos antiguos.

## Frontend

-   Next.js.
-   React.
-   TypeScript con modo estricto.
-   App Router.
-   Tailwind CSS.
-   Componentes reutilizables.
-   Server Components cuando aporten valor.
-   Client Components solamente cuando haya interacción que lo
    justifique.
-   Gestión de formularios y validación robusta.
-   Optimización de imágenes.
-   SEO técnico.
-   Accesibilidad WCAG como objetivo.
-   Diseño responsive.

## Backend

Arquitectura preferida:

-   Node.js.
-   NestJS.
-   TypeScript.
-   API REST versionada.
-   Arquitectura modular / Clean Architecture.
-   Principios SOLID.
-   DTOs.
-   Validación de entrada.
-   Guards/middleware/interceptors cuando corresponda.
-   OpenAPI/Swagger para documentación de API.

Si se adopta una arquitectura monorepo, mantener separación lógica
estricta entre frontend, backend y paquetes compartidos.

## Persistencia

-   PostgreSQL.
-   Prisma ORM.
-   Migraciones versionadas.
-   Seeds reproducibles.
-   Constraints e índices apropiados.
-   Transacciones para operaciones críticas.

## Infraestructura

-   Docker.
-   Docker Compose para desarrollo cuando sea útil.
-   CI/CD.
-   Variables de entorno.
-   HTTPS/SSL en producción.
-   Backups.
-   Logs estructurados.
-   Observabilidad preparada.

------------------------------------------------------------------------

# 6. ESTRUCTURA RECOMENDADA DEL REPOSITORIO

Preferir monorepo si no existe una razón técnica para separarlo:

``` text
luxe-woman/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/
│   ├── config/
│   ├── types/
│   └── validation/
├── prisma/ o apps/api/prisma/
├── docs/
├── docker/
├── .github/workflows/
├── .env.example
├── README.md
└── package.json
```

La estructura exacta puede adaptarse al tooling elegido, pero debe
conservar límites claros.

------------------------------------------------------------------------

# 7. MODELO DE DOMINIO

Diseñar el modelo a partir del dominio real, no simplemente crear una
tabla por pantalla.

Entidades mínimas:

-   User.
-   Role.
-   Permission, si se implementa RBAC granular.
-   Address.
-   Category.
-   Product.
-   ProductImage.
-   ProductVariant.
-   Inventory/Stock.
-   Favorite.
-   Cart.
-   CartItem.
-   Order.
-   OrderItem.
-   Payment.
-   PaymentProof.
-   Shipment.
-   Notification.
-   Review.
-   AuditLog.

## Usuarios

Datos contemplados:

-   id;
-   nombre;
-   apellidos cuando aplique;
-   email normalizado y único;
-   teléfono;
-   avatar/foto opcional;
-   passwordHash para cuentas locales;
-   proveedor de autenticación;
-   estado;
-   timestamps.

No almacenar contraseñas en texto plano.

## Productos

Campos conceptuales:

-   id;
-   nombre;
-   slug;
-   descripción;
-   categoría;
-   marca;
-   precio;
-   precio anterior opcional;
-   imágenes;
-   variantes;
-   tallas;
-   colores;
-   SKU;
-   stock;
-   estado;
-   destacado;
-   timestamps;
-   metadata SEO cuando aplique.

No modelar tallas/colores como un string ambiguo si se requiere stock
por combinación. Usar variantes.

## Pedidos

El pedido debe conservar un **snapshot histórico** de los datos
relevantes del producto y precios al momento de comprar. Cambiar un
producto después no debe alterar pedidos históricos.

Guardar como mínimo:

-   número público de pedido;
-   usuario o datos de invitado cuando aplique;
-   items;
-   subtotal;
-   envío;
-   descuentos si existen;
-   total;
-   dirección de envío;
-   método de pago;
-   estado del pago;
-   estado del pedido;
-   timestamps;
-   notas operativas pertinentes.

------------------------------------------------------------------------

# 8. AUTENTICACIÓN Y CUENTAS

Implementar:

-   Registro por email.
-   Login.
-   Logout.
-   Recuperación de contraseña.
-   Restablecimiento mediante token seguro y expiración.
-   Verificación de email si se decide habilitarla.
-   Google OAuth.
-   Refresh/session strategy segura.
-   Perfil.
-   Direcciones.
-   Pedidos.
-   Favoritos.

## Roles iniciales

### CUSTOMER

Puede:

-   gestionar su perfil;
-   gestionar sus direcciones;
-   comprar;
-   consultar sus pedidos;
-   consultar tracking;
-   administrar favoritos.

### EMPLOYEE

Puede, según permisos definidos:

-   consultar/gestionar productos;
-   consultar/gestionar pedidos;
-   actualizar logística.

No debe tener automáticamente control total del sistema.

### ADMIN

Puede:

-   gestionar catálogo;
-   inventario;
-   pedidos;
-   pagos;
-   clientes;
-   reportes;
-   configuración;
-   roles/permisos;
-   auditoría.

Aplicar autorización en backend. Ocultar botones en frontend **no
constituye seguridad**.

------------------------------------------------------------------------

# 9. CATÁLOGO Y BÚSQUEDA

Implementar:

-   listado paginado;
-   categorías;
-   búsqueda;
-   filtros;
-   ordenamiento;
-   precio;
-   disponibilidad;
-   talla;
-   color;
-   categoría;
-   productos destacados;
-   nuevos productos;
-   estados agotado/stock bajo.

Las URLs relevantes deben ser compartibles y amigables con SEO.

Ejemplo conceptual:

``` text
/catalogo?categoria=zapatos&talla=37&color=nude&sort=price-asc
```

No almacenar el estado esencial del catálogo únicamente en memoria del
navegador.

------------------------------------------------------------------------

# 10. DETALLE DE PRODUCTO

Debe incluir, de acuerdo con Figma:

-   galería;
-   nombre;
-   categoría;
-   precio;
-   precio anterior cuando exista;
-   descripción;
-   variantes;
-   talla;
-   color;
-   disponibilidad;
-   stock;
-   CTA de compra;
-   favoritos;
-   detalles;
-   materiales;
-   cuidados;
-   información de envío;
-   estados de variante no disponible.

El usuario no debe poder añadir una combinación inexistente o sin stock.

El backend debe volver a validar stock y precio al crear el pedido.

------------------------------------------------------------------------

# 11. FAVORITOS

Permitir:

-   agregar;
-   eliminar;
-   listar;
-   sincronizar para usuarios autenticados.

Definir comportamiento razonable para invitado. Si se usa almacenamiento
local temporal, sincronizar de forma segura al iniciar sesión y evitar
duplicados.

------------------------------------------------------------------------

# 12. CARRITO

Debe funcionar para:

-   invitados;
-   usuarios autenticados.

Funciones:

-   añadir producto/variante;
-   eliminar;
-   modificar cantidad;
-   persistir;
-   fusionar carrito al autenticarse;
-   validar stock;
-   recalcular precios en servidor;
-   calcular subtotal;
-   calcular envío;
-   calcular total.

Nunca confiar en totales enviados por el cliente.

El servidor es autoridad sobre:

-   precio;
-   stock;
-   disponibilidad;
-   cálculo final.

------------------------------------------------------------------------

# 13. CHECKOUT

Flujo esperado:

1.  Revisar bolsa.
2.  Identificación/autenticación cuando corresponda.
3.  Dirección.
4.  Método de entrega.
5.  Resumen.
6.  Método de pago.
7.  Crear pedido.
8.  Mostrar instrucciones de pago.
9.  Cargar comprobante.
10. Confirmación de recepción.

Evitar pedidos duplicados por doble clic o reintentos. Aplicar
estrategia de idempotencia donde sea pertinente.

------------------------------------------------------------------------

# 14. PAGOS MANUALES: NEQUI Y DAVIPLATA

**No integrar inicialmente una pasarela de pagos.**

Métodos iniciales:

-   Nequi.
-   Daviplata.

La configuración administrativa debe permitir gestionar, sin hardcodear
en el frontend:

-   método activo/inactivo;
-   número;
-   titular;
-   instrucciones;
-   texto visible en checkout.

## Flujo

1.  Cliente crea el pedido.
2.  Sistema genera número de pedido.
3.  Cliente selecciona Nequi o Daviplata.
4.  Se muestran instrucciones y valor exacto.
5.  Cliente realiza transferencia externamente.
6.  Cliente carga comprobante.
7.  Backend valida tipo/tamaño del archivo.
8.  Se almacena de forma segura.
9.  Pedido queda pendiente de revisión.
10. Admin visualiza el comprobante.
11. Admin aprueba o rechaza.
12. La acción queda auditada.
13. Cliente recibe notificación.

## Estados de pago

Definir enum coherente, por ejemplo:

-   PENDING_PROOF
-   UNDER_REVIEW
-   APPROVED
-   REJECTED
-   CANCELLED

Separar **estado del pago** de **estado logístico/pedido**.

No marcar un pago como confirmado únicamente porque el usuario haya
subido una imagen.

------------------------------------------------------------------------

# 15. ESTADOS DEL PEDIDO

Estados funcionales requeridos:

-   Pendiente pago.
-   Pago confirmado.
-   Preparando.
-   Enviado.
-   Entregado.
-   Cancelado.

Diseñar una máquina de estados o reglas de transición explícitas. Evitar
transiciones inválidas.

Ejemplo:

``` text
PENDING_PAYMENT
      ↓
PAYMENT_CONFIRMED
      ↓
PREPARING
      ↓
SHIPPED
      ↓
DELIVERED
```

CANCELLED debe tener reglas propias y registrar actor, fecha y motivo
cuando corresponda.

------------------------------------------------------------------------

# 16. ENVÍOS Y TRACKING

Transportadoras iniciales:

-   Coordinadora.
-   Interrapidísimo.
-   Entrega propia.

Guardar:

-   transportadora;
-   número de guía;
-   fecha de despacho;
-   estado;
-   timestamps;
-   notas operativas cuando corresponda.

El cliente debe poder consultar una línea de tiempo clara desde su
cuenta.

Preparar la arquitectura para futuras integraciones con APIs de
transportadoras, pero **no inventar integraciones que todavía no
existan**.

------------------------------------------------------------------------

# 17. NOTIFICACIONES Y EMAILS

Eventos mínimos:

-   bienvenida/registro;
-   pedido recibido;
-   comprobante recibido;
-   pago aprobado;
-   pago rechazado;
-   pedido en preparación cuando se decida;
-   pedido enviado;
-   pedido entregado;
-   recuperación de contraseña.

Los emails deben:

-   ser responsive;
-   mantener identidad de marca;
-   incluir información útil;
-   evitar exponer información sensible;
-   tener versiones apropiadas de texto/HTML cuando la solución lo
    permita.

Crear una abstracción de proveedor para poder usar, según configuración:

-   Resend;
-   SendGrid;
-   Amazon SES;
-   SMTP compatible.

No acoplar el dominio a un proveedor específico.

------------------------------------------------------------------------

# 18. PANEL ADMINISTRATIVO

El admin no es una maqueta. Debe operar sobre datos reales y endpoints
protegidos.

## Dashboard

Mostrar métricas derivadas de datos reales:

-   ventas;
-   pedidos;
-   clientes;
-   inventario;
-   stock crítico;
-   estados de pedidos;
-   tendencias relevantes.

## Productos

-   listar;
-   buscar;
-   filtrar;
-   crear;
-   editar;
-   archivar/desactivar;
-   imágenes;
-   variantes;
-   tallas;
-   colores;
-   stock;
-   precio;
-   precio anterior;
-   SEO;
-   destacado.

Evitar hard-delete cuando comprometa integridad histórica.

## Pedidos

Tabla con:

-   número;
-   cliente;
-   fecha;
-   total;
-   estado de pago;
-   estado del pedido;
-   envío;
-   acciones.

Detalle:

-   cliente;
-   dirección;
-   items;
-   totales;
-   método de pago;
-   comprobante;
-   aprobar/rechazar pago;
-   historial de estados;
-   cambio de estado;
-   transportadora;
-   guía;
-   notas;
-   auditoría.

## Clientes

-   búsqueda;
-   perfil;
-   historial de pedidos;
-   total comprado;
-   direcciones cuando el permiso lo permita;
-   estado.

No mostrar información sensible innecesaria.

## Reportes

Incluir:

-   ventas por periodo;
-   pedidos;
-   ticket promedio;
-   productos más vendidos;
-   categorías;
-   métodos de pago;
-   logística;
-   inventario.

Exportación CSV cuando corresponda.

## Configuración

Centralizar:

-   identidad de marca;
-   email;
-   moneda;
-   métodos de pago;
-   números/titulares;
-   transportadoras;
-   tarifa de envío;
-   notificaciones;
-   parámetros operativos;
-   roles/permisos.

Los secretos nunca deben guardarse como configuración pública ni
enviarse al frontend.

------------------------------------------------------------------------

# 19. SEGURIDAD

La seguridad es un requisito transversal.

Implementar como mínimo:

-   hashing robusto de contraseñas con bcrypt o alternativa apropiada;
-   sesiones/tokens seguros;
-   refresh token/session rotation cuando aplique;
-   revocación;
-   RBAC;
-   validación y sanitización de entradas;
-   rate limiting;
-   protección de endpoints;
-   manejo seguro de CORS;
-   headers de seguridad;
-   protección frente a abuso de autenticación;
-   límites de tamaño de archivos;
-   allowlist de tipos MIME/extensiones;
-   nombres de archivo generados por servidor;
-   almacenamiento privado de comprobantes;
-   URLs firmadas/temporales si aplica;
-   logs sin secretos;
-   auditoría administrativa;
-   variables de entorno;
-   protección contra mass assignment;
-   prevención de IDOR mediante autorización por recurso;
-   tratamiento seguro de errores.

No incluir secretos reales en:

-   repositorio;
-   commits;
-   `.env.example`;
-   logs;
-   frontend.

## Auditoría

Registrar acciones administrativas sensibles:

-   aprobación/rechazo de pago;
-   cambio de estado;
-   modificación de inventario;
-   modificación de precio;
-   cambios de roles;
-   cambios críticos de configuración.

Guardar:

-   actor;
-   acción;
-   entidad;
-   identificador;
-   fecha;
-   metadata segura necesaria.

------------------------------------------------------------------------

# 20. CARGA Y GESTIÓN DE ARCHIVOS

Productos y comprobantes tienen necesidades distintas.

## Imágenes de producto

-   optimizar;
-   formatos modernos cuando sea apropiado;
-   alt text;
-   dimensiones adecuadas;
-   CDN/object storage preparado.

## Comprobantes de pago

-   almacenamiento privado;
-   acceso exclusivo a usuario autorizado/admin según regla;
-   validación;
-   tamaño limitado;
-   evitar ejecución de contenido;
-   no exponer rutas internas.

Crear una interfaz de almacenamiento desacoplada para permitir proveedor
local en desarrollo y object storage en producción.

------------------------------------------------------------------------

# 21. API

API REST versionada, consistente y documentada.

Ejemplo conceptual:

``` text
/api/v1/auth/*
/api/v1/products/*
/api/v1/categories/*
/api/v1/cart/*
/api/v1/checkout/*
/api/v1/orders/*
/api/v1/payments/*
/api/v1/shipments/*
/api/v1/favorites/*
/api/v1/admin/*
```

Usar:

-   códigos HTTP correctos;
-   DTOs;
-   validación;
-   paginación;
-   filtros;
-   manejo consistente de errores;
-   correlation/request ID cuando aporte valor;
-   Swagger/OpenAPI.

No devolver entidades ORM sin controlar el contrato público.

------------------------------------------------------------------------

# 22. SEO

Implementar:

-   metadata por página;
-   titles;
-   descriptions;
-   canonical;
-   Open Graph;
-   Twitter/social metadata cuando aplique;
-   sitemap;
-   robots;
-   URLs limpias;
-   datos estructurados apropiados para producto;
-   breadcrumb cuando corresponda;
-   SSR/SSG/ISR según necesidades reales;
-   imágenes optimizadas.

Evitar indexar:

-   carrito;
-   checkout;
-   cuenta;
-   admin;
-   páginas privadas.

------------------------------------------------------------------------

# 23. ACCESIBILIDAD

Objetivo: experiencia usable mediante teclado, lector de pantalla y
dispositivos táctiles.

Implementar:

-   HTML semántico;
-   labels;
-   estados de foco visibles;
-   contraste suficiente;
-   `aria-*` solo cuando sea necesario;
-   alt text;
-   modales accesibles;
-   mensajes de error asociados;
-   navegación por teclado;
-   botones reales para acciones;
-   enlaces reales para navegación;
-   respeto a `prefers-reduced-motion`.

------------------------------------------------------------------------

# 24. RESPONSIVE

Soportar correctamente:

-   mobile;
-   tablet;
-   desktop;
-   pantallas amplias razonables.

No crear únicamente una versión desktop reducida.

Usar los diseños mobile existentes en Figma como referencia específica.

Verificar especialmente:

-   navegación;
-   filtros;
-   galería;
-   cards;
-   carrito;
-   checkout;
-   tablas administrativas;
-   formularios;
-   modales;
-   tracking.

Las tablas complejas del admin deben tener una estrategia responsive
deliberada.

------------------------------------------------------------------------

# 25. PERFORMANCE

Objetivos:

-   evitar JavaScript innecesario;
-   code splitting;
-   lazy loading cuando corresponda;
-   imágenes optimizadas;
-   evitar waterfalls;
-   caching deliberado;
-   consultas eficientes;
-   índices DB;
-   paginación;
-   evitar N+1;
-   bundles razonables.

Medir antes de realizar optimizaciones complejas.

------------------------------------------------------------------------

# 26. TESTING

Crear estrategia de pruebas desde el inicio.

## Unitarias

Especialmente:

-   cálculos;
-   validadores;
-   reglas de stock;
-   estados;
-   permisos;
-   servicios de dominio.

## Integración

-   autenticación;
-   productos;
-   carrito;
-   creación de pedido;
-   pago/comprobante;
-   transición de estados;
-   autorización.

## E2E

Flujos críticos:

1.  visitante navega catálogo;
2.  selecciona variante;
3.  agrega al carrito;
4.  checkout;
5.  crea cuenta o continúa según flujo;
6.  crea pedido;
7.  carga comprobante;
8.  admin aprueba;
9.  admin despacha;
10. cliente consulta tracking.

Además:

-   login Google cuando el entorno de pruebas lo permita;
-   recuperación de contraseña;
-   restricciones por rol;
-   producto agotado;
-   carrito con stock modificado.

No considerar una fase terminada si los flujos críticos están rotos.

------------------------------------------------------------------------

# 27. DATOS DE DESARROLLO / SEED

Crear seed claramente identificado como ficticio.

Puede usar productos de demostración ya presentes conceptualmente en
Figma, por ejemplo:

-   Sandalia Aura.
-   Bolso Siena.
-   Collar Éclat.
-   Vestido Alma.
-   Aretes Lumière.
-   Bolso Mini Élan.

Estos datos no deben confundirse con inventario real de producción.

Crear:

-   categorías;
-   productos;
-   variantes;
-   usuarios de prueba;
-   pedidos de prueba;
-   estados variados.

Nunca incluir credenciales de producción.

------------------------------------------------------------------------

# 28. OBSERVABILIDAD Y ERRORES

Implementar:

-   logs estructurados;
-   niveles de log;
-   request/correlation IDs cuando sea apropiado;
-   captura de errores preparada;
-   health endpoint;
-   readiness cuando despliegue lo requiera.

Mensajes al usuario:

-   claros;
-   no técnicos;
-   sin stack traces;
-   sin secretos.

Logs técnicos:

-   útiles para diagnóstico;
-   sin contraseñas;
-   sin tokens;
-   sin comprobantes completos;
-   sin datos sensibles innecesarios.

------------------------------------------------------------------------

# 29. VARIABLES DE ENTORNO

Crear `.env.example` documentado, sin secretos.

Categorías esperadas:

``` text
DATABASE_URL=
APP_URL=
API_URL=

AUTH_SECRET=
JWT_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

EMAIL_PROVIDER=
EMAIL_FROM=
RESEND_API_KEY=

STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

Los nombres finales dependerán de la implementación, pero deben ser
coherentes.

Validar variables al iniciar la aplicación y fallar claramente si falta
una obligatoria.

------------------------------------------------------------------------

# 30. DOCUMENTACIÓN

Crear y mantener:

## README.md

Debe explicar:

-   propósito;
-   arquitectura;
-   requisitos;
-   instalación;
-   variables de entorno;
-   base de datos;
-   migraciones;
-   seeds;
-   ejecución;
-   tests;
-   build;
-   Docker;
-   despliegue;
-   cuentas de desarrollo si existen;
-   decisiones importantes.

## docs/

Incluir cuando corresponda:

-   architecture.md
-   database.md
-   api.md
-   security.md
-   deployment.md
-   figma-implementation.md

No generar documentación que contradiga el código.

------------------------------------------------------------------------

# 31. CI/CD Y PRODUCCIÓN

Pipeline mínimo:

1.  install;
2.  lint;
3.  typecheck;
4.  unit tests;
5.  integration tests relevantes;
6.  build;
7.  seguridad/dependency checks razonables;
8.  deploy según entorno.

Preparar:

-   development;
-   staging;
-   production.

Migraciones de producción deben ejecutarse de manera controlada.

Definir política de backup y restauración para PostgreSQL.

------------------------------------------------------------------------

# 32. REGLAS DE IMPLEMENTACIÓN PARA AGENTES DE IA

Estas reglas son obligatorias durante todo el proyecto.

## Antes de modificar

-   Inspecciona el repositorio.
-   Lee README y documentación.
-   Revisa configuración existente.
-   Identifica convenciones.
-   Inspecciona Figma si la tarea es visual.
-   No dupliques componentes existentes.

## Durante

-   Haz cambios pequeños y coherentes.
-   Mantén TypeScript estricto.
-   Reutiliza componentes.
-   No uses `any` para evadir errores salvo caso excepcional
    justificado.
-   No silencies errores del compilador.
-   No desactives reglas de lint para "hacer que pase".
-   No reemplaces una funcionalidad real por un mock permanente.
-   No hardcodees datos que pertenecen a configuración/DB.
-   No rompas funcionalidades ya terminadas.

## Después

Ejecuta, según corresponda:

``` text
lint
typecheck
tests
build
```

Corrige errores antes de declarar completado.

Para cambios visuales:

-   ejecuta la app;
-   compara con Figma;
-   prueba mobile y desktop;
-   revisa overflow;
-   revisa estados;
-   revisa accesibilidad básica.

------------------------------------------------------------------------

# 33. PROTOCOLO DE DECISIONES

Cuando exista una ambigüedad:

1.  Busca la respuesta en Figma si es visual.
2.  Busca la respuesta en esta especificación si es funcional.
3.  Busca la respuesta en el código/documentación existente si ya fue
    decidida.
4.  Elige una opción técnicamente segura y reversible para detalles
    menores.
5.  Documenta decisiones relevantes.
6.  Pregunta únicamente cuando la decisión afecte negocio, dinero,
    seguridad, legalidad, datos o requiera una preferencia que no pueda
    inferirse responsablemente.

No detener el proyecto por detalles triviales.

------------------------------------------------------------------------

# 34. DEFINICIÓN DE TERMINADO GLOBAL

El proyecto NO está terminado únicamente porque "se ve bien".

Debe cumplirse:

-   frontend implementado;
-   backend implementado;
-   PostgreSQL conectado;
-   migraciones funcionales;
-   autenticación funcional;
-   Google OAuth preparado/configurable;
-   roles aplicados;
-   catálogo real;
-   variantes reales;
-   stock real;
-   favoritos;
-   carrito;
-   checkout;
-   pedidos;
-   Nequi/Daviplata;
-   carga segura de comprobantes;
-   validación administrativa;
-   tracking;
-   emails;
-   admin;
-   reportes;
-   configuración;
-   responsive;
-   accesibilidad razonable;
-   SEO;
-   seguridad;
-   tests;
-   documentación;
-   Docker;
-   CI/CD;
-   build exitoso;
-   despliegue preparado;
-   sin secretos versionados;
-   sin errores críticos conocidos.

------------------------------------------------------------------------

# 35. PLAN DE IMPLEMENTACIÓN POR FASES

No intentes resolver todo en una sola modificación gigante.

## FASE 0 --- Auditoría e inicialización

Objetivo:

-   inspeccionar repositorio;
-   verificar Figma;
-   elegir estructura;
-   configurar workspace;
-   establecer estándares;
-   crear documentación inicial.

Entregables:

-   estructura;
-   package manager/workspaces;
-   lint;
-   formatting;
-   TypeScript;
-   `.env.example`;
-   README inicial;
-   decisiones arquitectónicas.

**Gate:** lint/typecheck básicos funcionando.

------------------------------------------------------------------------

## FASE 1 --- Design System + Figma Foundation

Objetivo:

Traducir el sistema visual de Figma a código.

Crear:

-   tokens;
-   typography;
-   Button;
-   Input;
-   Select;
-   Badge;
-   Modal;
-   Drawer;
-   Card;
-   Skeleton;
-   Toast;
-   Container;
-   Header primitives;
-   admin primitives.

No construir todavía lógica compleja.

**Gate:** componentes verificables y responsive.

------------------------------------------------------------------------

## FASE 2 --- Base de datos + Backend Foundation

Crear:

-   PostgreSQL;
-   Prisma;
-   schema;
-   migración inicial;
-   seeds;
-   NestJS;
-   configuración;
-   validación;
-   manejo de errores;
-   health;
-   Swagger;
-   módulos base.

**Gate:** DB migrable + API arrancando + pruebas base.

------------------------------------------------------------------------

## FASE 3 --- Autenticación y autorización

Implementar:

-   registro;
-   login;
-   logout;
-   recuperación;
-   Google;
-   roles;
-   guards;
-   sesiones/tokens;
-   perfil.

**Gate:** pruebas de autenticación y autorización.

------------------------------------------------------------------------

## FASE 4 --- Storefront visual

Implementar desde Figma:

-   Home.
-   Catálogo.
-   Categorías.
-   Detalle de producto.
-   Búsqueda.
-   Favoritos.

Inicialmente puede consumir seed/API real.

**Gate:** fidelidad Figma + responsive + navegación funcional.

------------------------------------------------------------------------

## FASE 5 --- Catálogo administrativo

Implementar:

-   CRUD;
-   categorías;
-   imágenes;
-   variantes;
-   stock;
-   SKU;
-   estados;
-   filtros.

**Gate:** producto creado en admin aparece correctamente en storefront.

------------------------------------------------------------------------

## FASE 6 --- Carrito

Implementar:

-   guest;
-   autenticado;
-   persistencia;
-   merge;
-   cantidades;
-   stock;
-   cálculo server-side.

**Gate:** pruebas de precios, stock y merge.

------------------------------------------------------------------------

## FASE 7 --- Checkout + Pedidos

Implementar:

-   dirección;
-   envío;
-   resumen;
-   creación idempotente;
-   snapshots;
-   estados.

**Gate:** pedido completo persistido correctamente.

------------------------------------------------------------------------

## FASE 8 --- Pago manual

Implementar:

-   Nequi;
-   Daviplata;
-   instrucciones configurables;
-   comprobante;
-   almacenamiento privado;
-   revisión admin;
-   aprobar/rechazar;
-   auditoría.

**Gate:** flujo cliente→admin→cliente probado E2E.

------------------------------------------------------------------------

## FASE 9 --- Logística y Tracking

Implementar:

-   Coordinadora;
-   Interrapidísimo;
-   entrega propia;
-   guía;
-   fechas;
-   timeline;
-   detalle cliente.

**Gate:** admin despacha y cliente visualiza actualización.

------------------------------------------------------------------------

## FASE 10 --- Emails

Implementar eventos y plantillas.

**Gate:** proveedor intercambiable y pruebas de generación/envío en
entorno adecuado.

------------------------------------------------------------------------

## FASE 11 --- Admin completo

Terminar:

-   dashboard;
-   pedidos;
-   detalle;
-   clientes;
-   reportes;
-   configuración;
-   permisos;
-   auditoría.

**Gate:** todas las acciones críticas protegidas por backend.

------------------------------------------------------------------------

## FASE 12 --- Estados UX + Responsive final

Completar:

-   empty;
-   loading;
-   skeleton;
-   error;
-   success;
-   stock;
-   pagos;
-   404/500;
-   mobile;
-   tablet;
-   desktop.

**Gate:** no existen caminos críticos sin estado visual.

------------------------------------------------------------------------

## FASE 13 --- SEO + Performance + Accessibility

Auditar y corregir.

**Gate:** objetivos acordados y ausencia de problemas críticos.

------------------------------------------------------------------------

## FASE 14 --- QA + Hardening

Ejecutar:

-   unit;
-   integration;
-   E2E;
-   autorización;
-   uploads;
-   rate limiting;
-   stock concurrente;
-   checkout duplicado;
-   errores;
-   build.

**Gate:** suite crítica verde.

------------------------------------------------------------------------

## FASE 15 --- Producción

Preparar:

-   Docker;
-   CI/CD;
-   staging;
-   producción;
-   dominio;
-   SSL;
-   DB;
-   backups;
-   secrets;
-   monitoring;
-   rollback.

**Gate:** checklist de producción completado.

------------------------------------------------------------------------

# 36. PROMPT OPERATIVO PARA INICIAR EL PROYECTO

Utiliza este bloque como primera instrucción al agente de programación:

> Estás trabajando en LUXE WOMAN, un ecommerce premium de moda femenina.
> Lee por completo el archivo
> `PROMPT_MASTER_LUXE_WOMAN_FIGMA_TO_PRODUCTION.md` antes de realizar
> cambios. Este archivo es la especificación maestra funcional y
> técnica. El archivo Figma indicado allí es la fuente visual de verdad.
>
> No empieces escribiendo grandes cantidades de código. Primero
> inspecciona el repositorio y el Figma disponible, identifica el estado
> actual y genera un plan concreto para la FASE 0 y FASE 1. Después
> comienza la ejecución.
>
> Trabaja directamente sobre el repositorio. No entregues únicamente
> snippets o recomendaciones cuando puedas implementar el cambio.
>
> Mantén una lista de progreso por fases en la documentación del
> proyecto. Al finalizar cada fase ejecuta los controles definidos en la
> especificación y no avances si el gate de calidad falla.
>
> No rediseñes las pantallas existentes en Figma. Traduce su sistema
> visual a componentes React reutilizables, semánticos y responsive.
>
> Si encuentras una discrepancia entre un detalle visual y la lógica del
> sistema, Figma gobierna la presentación y el Prompt Maestro gobierna
> el comportamiento.
>
> Comienza ahora con la auditoría inicial.

------------------------------------------------------------------------

# 37. PROMPT PARA IMPLEMENTAR UNA PANTALLA DESDE FIGMA

> Implementa la pantalla **\[NOMBRE / NODE ID\]** usando el Figma
> oficial de LUXE WOMAN.
>
> Antes de escribir código:
>
> 1.  inspecciona el frame;
> 2.  identifica componentes existentes reutilizables;
> 3.  identifica tokens;
> 4.  identifica desktop/mobile;
> 5.  identifica estados;
> 6.  identifica assets.
>
> Después implementa la pantalla dentro de la arquitectura existente.
>
> No generes una copia de Figma basada en posicionamiento absoluto.
> Construye componentes React semánticos y reutilizables.
>
> Conecta la vista a datos/API reales cuando el módulo correspondiente
> ya exista.
>
> Al terminar:
>
> -   ejecuta lint;
> -   ejecuta typecheck;
> -   ejecuta tests relevantes;
> -   renderiza la pantalla;
> -   compárala con Figma;
> -   prueba responsive;
> -   corrige diferencias.
>
> Reporta archivos modificados, validaciones ejecutadas y cualquier
> pendiente real.

------------------------------------------------------------------------

# 38. PROMPT DE CONTINUACIÓN ENTRE SESIONES

> Continúa LUXE WOMAN desde el estado actual del repositorio.
>
> Primero lee:
>
> -   `PROMPT_MASTER_LUXE_WOMAN_FIGMA_TO_PRODUCTION.md`;
> -   `README.md`;
> -   documentación de progreso;
> -   últimos cambios relevantes.
>
> No repitas fases completadas.
>
> Determina la última fase aprobada y el siguiente entregable pendiente.
> Verifica que el repositorio siga pasando sus controles antes de
> continuar.
>
> Usa Figma como fuente visual para cualquier pantalla.
>
> Implementa el siguiente bloque hasta su gate de calidad y actualiza la
> documentación de progreso.

------------------------------------------------------------------------

# 39. PROMPT DE AUDITORÍA FINAL

> Realiza una auditoría completa de LUXE WOMAN contra el Prompt Maestro
> y el Figma oficial.
>
> No modifiques todavía.
>
> Revisa:
>
> -   funcionalidades;
> -   fidelidad visual;
> -   responsive;
> -   frontend;
> -   backend;
> -   DB;
> -   seguridad;
> -   permisos;
> -   uploads;
> -   pagos;
> -   pedidos;
> -   tracking;
> -   admin;
> -   emails;
> -   SEO;
> -   accesibilidad;
> -   performance;
> -   tests;
> -   documentación;
> -   Docker;
> -   CI/CD;
> -   producción.
>
> Clasifica hallazgos por severidad y vincula cada uno a archivos/rutas
> concretos.
>
> Después propone un plan de corrección por dependencias. No declares el
> producto terminado mientras exista un fallo crítico o un flujo
> principal roto.

------------------------------------------------------------------------

# 40. CRITERIOS DE CALIDAD DEL CÓDIGO

Todo código generado debe ser:

-   profesional;
-   legible;
-   modular;
-   escalable;
-   testeable;
-   tipado;
-   seguro;
-   documentado donde aporte valor;
-   coherente con el repositorio;
-   fácil de mantener.

Preferir claridad sobre abstracciones innecesarias.

No crear "arquitectura empresarial" artificial para operaciones simples,
pero tampoco concentrar todo el dominio en controladores/componentes
gigantes.

------------------------------------------------------------------------

# 41. REGLA DE NO SIMULACIÓN

Los mocks son válidos únicamente durante desarrollo aislado o tests.

Antes de declarar un módulo completo:

-   debe estar conectado a la fuente real correspondiente;
-   debe persistir cuando corresponda;
-   debe validar errores;
-   debe tener estados de carga/error;
-   debe respetar permisos.

Ejemplos:

-   El dashboard final no puede mostrar métricas escritas manualmente.
-   El catálogo final no puede depender de un array estático.
-   El admin final no puede "guardar" sin persistir.
-   El botón de Google no puede ser decorativo.
-   "Subir comprobante" no puede ser un input sin backend.
-   Tracking no puede mostrar una guía ficticia como dato de producción.

------------------------------------------------------------------------

# 42. REGLA DE INTEGRIDAD COMERCIAL

Operaciones relacionadas con dinero, inventario y pedidos deben
validarse en servidor.

Nunca confiar en:

-   precio enviado por frontend;
-   total enviado por frontend;
-   rol enviado por frontend;
-   estado de pago enviado por cliente;
-   stock calculado únicamente en navegador.

Registrar correctamente las operaciones críticas y usar transacciones
cuando una actualización parcial pueda dejar datos inconsistentes.

------------------------------------------------------------------------

# 43. RESULTADO FINAL ESPERADO

El resultado debe ser una **tienda digital femenina premium real**,
preparada para convertirse en una marca comercial:

``` text
FIGMA
  ↓
DESIGN SYSTEM
  ↓
NEXT.JS / REACT
  ↕
API NESTJS
  ↕
POSTGRESQL / PRISMA
  ↓
AUTH + GOOGLE
  ↓
CATÁLOGO + INVENTARIO
  ↓
CARRITO
  ↓
CHECKOUT
  ↓
NEQUI / DAVIPLATA + COMPROBANTE
  ↓
PEDIDOS
  ↓
LOGÍSTICA + TRACKING
  ↓
NOTIFICACIONES
  ↓
ADMIN + REPORTES
  ↓
TESTS + SEGURIDAD
  ↓
CI/CD + PRODUCCIÓN
```

No finalizar en una landing page ni en un prototipo visual.

La meta es entregar **un ecommerce full stack funcional, seguro,
responsive, mantenible y preparado para producción**, conservando la
identidad visual definida en Figma.

------------------------------------------------------------------------

# 44. NOTA SOBRE DECISIONES TODAVÍA CONFIGURABLES

Este documento especifica el comportamiento requerido, pero algunas
decisiones de proveedor deben permanecer intercambiables hasta
configuración de producción, por ejemplo:

-   hosting;
-   proveedor de correo;
-   object storage;
-   plataforma CI/CD;
-   dominio definitivo;
-   credenciales OAuth;
-   números reales de Nequi/Daviplata;
-   tarifas finales;
-   políticas comerciales.

No inventar valores reales. Implementar interfaces/configuración para
incorporarlos posteriormente.

------------------------------------------------------------------------

# 45. ORDEN DE PRIORIDAD EN CASO DE CONFLICTO

Aplicar este orden:

1.  Seguridad e integridad de datos/dinero.
2.  Requisitos funcionales explícitos de este Prompt Maestro.
3.  Figma para presentación visual.
4.  Arquitectura y convenciones existentes del repositorio cuando no
    contradigan 1--3.
5.  Buenas prácticas del stack.
6.  Preferencias menores del agente.

Si un detalle de Figma implica un patrón inseguro, conserva la
apariencia pero implementa el comportamiento de forma segura.

------------------------------------------------------------------------

**FIN DEL PROMPT MAESTRO**
