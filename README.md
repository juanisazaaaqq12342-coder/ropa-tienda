# LUXE WOMAN

Boutique de moda femenina para Colombia, con escaparate Next.js, API NestJS y persistencia PostgreSQL mediante Prisma. Importes expresados en pesos colombianos enteros. Los productos iniciales y las operaciones de desarrollo son ficticios.

El estilo sigue la paleta marfil, cacao y champagne del documento proporcionado. El usuario autorizó esta dirección después de agotarse la cuota de Figma; no se afirma una reproducción exacta del archivo de diseño.

## Requisitos

- Node.js 22.12 o superior y npm.
- PostgreSQL 18, o Docker con Compose.
- En Windows, PowerShell. Los scripts esperan los binarios de PostgreSQL en `C:\Program Files\PostgreSQL\18\bin`; aceptan `-PostgresBin` para otra ubicación.

## Iniciar en Windows

Desde la raíz del proyecto:

```powershell
npm.cmd ci
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-database.ps1
npm.cmd run db:setup
npm.cmd run dev
```

Abre [http://localhost:3000](http://localhost:3000). La API escucha en `http://localhost:4000`; su documentación está en `http://localhost:4000/api/docs`.

El script crea un clúster privado dentro de `.local/postgres`, limitado a `127.0.0.1:5433`. No modifica el servicio PostgreSQL del sistema. Genera `.env` con contraseñas aleatorias y se niega a sobrescribir una conexión existente. Es seguro volver a ejecutarlo para iniciar el mismo clúster.

Para entrar a administración, usa el correo `SEED_ADMIN_EMAIL` y la contraseña `SEED_ADMIN_PASSWORD` de tu archivo local `.env`. El seed crea esa cuenta únicamente cuando no existe. No hay una contraseña administrativa universal. Los clientes pueden registrarse desde la tienda.

Para detener la aplicación, presiona `Ctrl+C` en la terminal. Para detener exclusivamente su base de datos:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/stop-database.ps1
```

## Otra base de datos

Copia `.env.example` a `.env`, configura `DATABASE_URL`, `SEED_ADMIN_EMAIL` y una contraseña de desarrollo propia. Ejecuta `npm ci`, `npm run db:setup` y `npm run dev`. Los comandos Prisma y la API leen `.env` desde la raíz del monorepo. Usa siempre migraciones versionadas; `db:setup` aplica las migraciones y carga datos ficticios.

## Comandos

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Inicia web y API para desarrollo. |
| `npm run db:setup` | Genera Prisma, aplica migraciones y ejecuta el seed ficticio. |
| `npm run lint` | Analiza el código. |
| `npm run typecheck` | Verifica TypeScript en ambos proyectos. |
| `npm test` | Ejecuta las pruebas de backend. |
| `npm run build` | Genera el cliente Prisma y compila API y web. |
| `npm run start -w @luxe/api` | Ejecuta la API compilada. |
| `npm run start -w @luxe/web` | Ejecuta la web compilada. |

## Configuración comercial

El modo de desarrollo (`DEMO_MODE=true`) permite probar pedidos sin destinatarios de pago reales. La aplicación identifica este modo. No transfieras dinero usando datos de demostración.

Los destinos e instrucciones de Nequi y Daviplata se administran en configuración; no están escritos en el frontend. Para una tienda real, define números, titulares y tarifas, desactiva el modo demo en configuración y verifica el flujo completo con el responsable del negocio. Subir un comprobante no aprueba un pago: un administrador debe revisarlo.

Google OAuth requiere credenciales del proyecto correspondiente; SMTP requiere un proveedor de correo real. El resto de la tienda se puede probar localmente sin esos proveedores. Consulta [.env.example](.env.example) y la [Guía Maestra de Despliegue a Producción](docs/deployment.md).

## Despliegue a Producción (Hosting y Base de Datos)

Para subir el proyecto a producción con base de datos en la nube (Neon/Supabase/Railway) y hosting (Vercel, Render o VPS con Docker):

👉 **Sigue el instructivo paso a paso detallado en [docs/deployment.md](docs/deployment.md)**, que incluye:
1. **Base de Datos**: Creación del clúster PostgreSQL en Neon o Supabase y ejecución remota de migraciones (`npm run db:migrate`).
2. **Backend API**: Despliegue de NestJS en Render o Railway con persistencia de comprobantes.
3. **Frontend Web**: Despliegue de Next.js en Vercel con CDN y SSL automático.
4. **VPS Todo-en-Uno**: Despliegue con Docker Compose y proxy inverso Caddy con HTTPS.
5. **Configuración de Dominio y DNS**: Registros A y CNAME.
6. **Activación Comercial**: Configuración de números reales de Nequi/Daviplata y desactivación del modo demo.

## Docker

Configura `.env` a partir de `.env.example` y establece `POSTGRES_PASSWORD` con un valor aleatorio alfanumérico. Compose mantiene PostgreSQL dentro de su red privada y publica web/API solo en loopback.

```sh
docker compose up --build -d
docker compose exec api npm run db:seed
docker compose logs -f
```

Las migraciones se ejecutan en un servicio previo al arranque de la API. Los datos y comprobantes se guardan en volúmenes separados. `docker compose down` detiene los servicios y conserva los volúmenes. La receta Docker y CI están preparadas; consulta el estado de validación en [progreso](docs/progress.md).

## Estructura y documentación

- `apps/web`: aplicación Next.js y componentes de tienda/cuenta/administración.
- `apps/api`: módulos NestJS, validación, servicios y modelo Prisma.
- `scripts`: operación de la base de datos local en Windows.
- [Arquitectura](docs/architecture.md), [base de datos](docs/database.md), [API](docs/api.md), [seguridad](docs/security.md), [despliegue](docs/deployment.md), [diseño](docs/figma-implementation.md) y [progreso](docs/progress.md).

No publiques `.env`, `.local`, comprobantes ni mensajes de recuperación. La preparación técnica del despliegue no equivale a una publicación en un dominio real.
