# Arquitectura

El monorepo npm contiene dos aplicaciones TypeScript. Next.js App Router renderiza la tienda y encapsula solicitudes del navegador bajo `/api/v1`; una reescritura las dirige a NestJS. Las lecturas de servidor usan `API_URL`. PostgreSQL conserva usuarios, sesiones, catálogo, variantes, carritos, pedidos, comprobantes, logística y auditoría; Prisma aporta consultas tipadas y migraciones versionadas.

Los precios son enteros COP. Los totales se calculan en la API a partir de productos activos y variantes. El pedido conserva un snapshot de nombres, precios, imágenes, dirección y variantes. Los cambios futuros de catálogo no reescriben ese historial.

Los invitados reciben un carrito identificado por cookie; al iniciar sesión se fusiona con el carrito de la cuenta. El checkout requiere autenticación y una clave de idempotencia. La reserva de inventario y creación del pedido se ejecutan como una operación de base de datos; los reintentos con la misma clave recuperan el pedido.

Los estados de pago y de entrega son independientes. Los comprobantes permanecen en almacenamiento privado y se entregan mediante endpoints autorizados. La revisión administrativa registra la decisión; la logística solo avanza cuando corresponde según el pago y las transiciones permitidas.

Los roles iniciales son CUSTOMER, EMPLOYEE y ADMIN. Las comprobaciones se ejecutan en la API. EMPLOYEE tiene acceso operativo limitado; la configuración, pagos y gestión de roles requieren ADMIN. Los informes se calculan desde datos persistidos.

El desarrollo utiliza almacenamiento local privado y puede registrar mensajes en archivos privados cuando SMTP no está disponible. Producción requiere almacenamiento persistente, correo configurado, secretos propios y HTTPS. No hay dependencia de Figma durante la ejecución.
