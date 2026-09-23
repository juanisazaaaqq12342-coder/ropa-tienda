# API

La API NestJS se publica bajo `/api/v1`. Swagger está en `/api/docs`. El [contrato de integración](../apps/api/API_CONTRACT.md) describe rutas, payloads y respuestas usadas por el frontend.

`GET /api/v1/health` verifica la disponibilidad del servicio y su conexión a PostgreSQL. Los errores usan mensajes legibles y códigos HTTP; no se deben presentar trazas al comprador.

Los importes son enteros COP. Las solicitudes del navegador incluyen cookies y llegan a través del proxy del mismo origen en Next.js. La API mantiene sesiones en la base de datos y aplica permisos por rol/propiedad en operaciones sensibles.

Los grupos principales son catálogo/categorías/ajustes públicos; autenticación y recuperación; perfil/direcciones/favoritos; carrito; checkout/pedidos/comprobantes; métricas/productos/clientes/configuración/auditoría administrativa.

El checkout recibe dirección, método de pago y una clave de idempotencia. No acepta precios ni totales del navegador como autoridad. El servidor controla disponibilidad, precios y cálculo final. Los comprobantes se envían como multipart con el campo `file`; no se sirven desde una carpeta pública.
