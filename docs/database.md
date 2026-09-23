# Base de datos

El esquema se encuentra en `apps/api/prisma/schema.prisma`; las migraciones versionadas en `apps/api/prisma/migrations`. El cliente Prisma se genera con `npm run db:generate -w @luxe/api`. Para aplicar migraciones: `npm run db:migrate -w @luxe/api`. El seed se ejecuta con `npm run db:seed -w @luxe/api`.

El clúster Windows pertenece exclusivamente a este proyecto: `.local/postgres`, usuario `luxe`, base `luxe_woman`, host `127.0.0.1`, puerto `5433`. Su contraseña se genera con un generador criptográfico, se almacena en `.env` y se usa autenticación SCRAM-SHA-256. El archivo temporal requerido por `initdb` se elimina inmediatamente después de inicializar. `.local/postgres.log` contiene el registro del servidor.

`scripts/start-database.ps1` valida que el puerto esté disponible antes de crear/iniciar otro servidor. `scripts/stop-database.ps1` solo opera sobre ese directorio. Ninguno modifica el servicio PostgreSQL ya instalado ni utiliza el puerto habitual 5432. No borres `.local/postgres` para solucionar un error de arranque: revisa primero el registro.

Las entidades principales incluyen usuarios y sesiones, direcciones, categorías, productos e imágenes, variantes con SKU/stock, favoritos, carritos/items, pedidos/items, comprobantes, envíos, notificaciones, ajustes y auditoría. Las claves e índices están declarados en Prisma. El pago y sus estados pertenecen al pedido; la autorización de acceso a comprobantes consulta su propietario o rol.

El seed identifica el entorno como demostración, carga un catálogo ficticio y crea un administrador usando `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`. No se debe ejecutar en producción ni utilizarse como inventario comercial definitivo. Las migraciones y el seed son acciones distintas.

Antes de migraciones de producción, realiza una copia con `pg_dump --format=custom`; restaura periódicamente en una base separada mediante `pg_restore`. Cifra las copias, restrínge sus permisos y respalda también el almacenamiento privado: restaurar solo PostgreSQL no recupera archivos adjuntos.
