# Guía Maestra de Despliegue a Producción — LUXE WOMAN

Esta guía detalla el procedimiento paso a paso para desplegar en producción el ecommerce **LUXE WOMAN**, abarcando el aprovisionamiento de la base de datos PostgreSQL, el hosting del backend (API NestJS), el hosting del frontend (Next.js), la configuración de dominio con HTTPS, variables de entorno y activación comercial.

---

## Índice

1. [Arquitectura de Producción](#1-arquitectura-de-producción)
2. [Paso 1: Aprovisionar la Base de Datos PostgreSQL](#paso-1-aprovisionar-la-base-de-datos-postgresql)
3. [Paso 2: Ejecutar Migraciones y Crear Administrador Inicial](#paso-2-ejecutar-migraciones-y-crear-administrador-inicial)
4. [Paso 3: Hosting del Backend (API NestJS)](#paso-3-hosting-del-backend-api-nestjs)
5. [Paso 4: Hosting del Frontend (Next.js)](#paso-4-hosting-del-frontend-nextjs)
6. [Paso 5: Alternativa Todo en Uno (VPS con Docker Compose)](#paso-5-alternativa-todo-en-uno-vps-con-docker-compose)
7. [Paso 6: Dominio, DNS y Certificados SSL](#paso-6-dominio-dns-y-certificados-ssl)
8. [Paso 7: Configuración Comercial y Salida a Producción](#paso-7-configuración-comercial-y-salida-a-producción)
9. [Paso 8: Backups y Monitoreo](#paso-8-backups-y-monitoreo)

---

## 1. Arquitectura de Producción

El sistema se compone de tres capas desacopladas:
- **Base de Datos**: PostgreSQL 16 a 18 con autenticación SCRAM-SHA-256 o SSL.
- **Backend API**: Node.js / NestJS en el puerto `4000` (o `$PORT`), exponiendo `/api/v1` y `/api/docs`. Requiere almacenamiento persistente para comprobantes privados de pago.
- **Frontend Web**: Next.js 16 con SSR/SSG en el puerto `3000`, consumiendo la API de manera segura.

---

## Paso 1: Aprovisionar la Base de Datos PostgreSQL

Puedes elegir un proveedor administrado en la nube (recomendado por facilidad y mantenimiento cero) o un servidor propio.

### Opción A: Neon Postgres (Recomendada Serverless — Plan Gratuito Disponible)
1. Ingresa a [https://neon.tech](https://neon.tech) y crea una cuenta.
2. Crea un nuevo proyecto llamado `luxe-woman`.
3. Selecciona la región más cercana (ejemplo: `us-east-1` o `us-east-2` para Colombia/Latinoamérica).
4. En el dashboard, copia la cadena de conexión **Connection String**.
5. Asegúrate de seleccionar el modo **Direct Connection** (o pooled connection con `?sslmode=require`).
   - Ejemplo: `postgresql://usuario:contraseña@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Opción B: Supabase (Alternativa muy popular y robusta)
1. Ingresa a [https://supabase.com](https://supabase.com) y crea una cuenta.
2. Crea un nuevo proyecto `luxe-woman` y define una contraseña segura para la base de datos.
3. Dirígete a **Project Settings** > **Database** > **Connection string** > selecciona **URI** (modo directo puerto `5432` o connection pooling en puerto `6543`).
   - Ejemplo: `postgresql://postgres.xyz:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`

### Opción C: Render PostgreSQL / Railway
1. En [Railway](https://railway.app) o [Render](https://render.com), haz clic en **New** > **PostgreSQL**.
2. Copia la variable `DATABASE_URL` generada.

### Opción D: Servidor VPS propio (Docker)
Si tienes un VPS (Ubuntu 22.04/24.04), puedes levantar PostgreSQL con Docker:
```bash
docker run -d \
  --name luxe-postgres \
  --restart always \
  -e POSTGRES_USER=luxe \
  -e POSTGRES_PASSWORD='TU_CONTRASEÑA_SEGURA_ALEATORIA' \
  -e POSTGRES_DB=luxe_woman \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:18-alpine
```
Tu `DATABASE_URL` será: `postgresql://luxe:TU_CONTRASEÑA_SEGURA_ALEATORIA@IP_DE_TU_VPS:5432/luxe_woman?schema=public`

---

## Paso 2: Ejecutar Migraciones y Crear Administrador Inicial

Una vez que tengas tu `DATABASE_URL` de producción, debes aplicar el esquema de la base de datos.

### 1. Aplicar las migraciones desde tu terminal local:
En la raíz de este proyecto, ejecuta (reemplaza con tu URL real):

**En Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://usuario:contraseña@host:5432/db?sslmode=require"
npm.cmd run db:migrate -w @luxe/api
```

**En Linux / macOS:**
```bash
DATABASE_URL="postgresql://usuario:contraseña@host:5432/db?sslmode=require" npm run db:migrate -w @luxe/api
```
Esto creará todas las tablas (`User`, `Product`, `Category`, `Order`, `PaymentProof`, `ShopConfig`, etc.).

### 2. Crear la configuración inicial y cuenta administrativa:
Para crear el usuario administrador inicial y las categorías base en la base de datos de producción:

```powershell
$env:DATABASE_URL="postgresql://usuario:contraseña@host:5432/db?sslmode=require"
$env:SEED_ADMIN_EMAIL="admin@tudominio.com"
$env:SEED_ADMIN_PASSWORD="CreaUnaContraseñaFuerteDe16+Caracteres!"
$env:NODE_ENV="development" # Solo para permitir la inicialización controlada
npx tsx apps/api/prisma/seed.ts
```
> [!IMPORTANT]
> Guarda esa contraseña de administrador en un gestor seguro como 1Password o Bitwarden. Con ella ingresarás a `https://tudominio.com/cuenta` para gestionar la tienda.

---

## Paso 3: Hosting del Backend (API NestJS)

### Opción A: Despliegue en Render (PaaS)
1. Sube tu código a un repositorio privado en GitHub o GitLab.
2. Ingresa a [https://render.com](https://render.com) y crea un **Web Service**.
3. Selecciona tu repositorio.
4. Configuración del servicio:
   - **Environment**: `Node`
   - **Root Directory**: Deja en blanco (raíz)
   - **Build Command**:
     ```bash
     npm ci && npm run db:generate -w @luxe/api && npm run build -w @luxe/api
     ```
   - **Start Command**:
     ```bash
     npm run start -w @luxe/api
     ```
5. En la sección **Environment Variables**, agrega:
   | Variable | Valor | Descripción |
   | --- | --- | --- |
   | `NODE_ENV` | `production` | Entorno de producción |
   | `DATABASE_URL` | `postgresql://...` | Conexión de Neon/Supabase |
   | `APP_URL` | `https://tudominio.com` | Dominio público de la web |
   | `API_URL` | `https://api.tudominio.com` | Dominio público de la API |
   | `API_PORT` | `4000` | Puerto interno (o Render asigna `$PORT`) |
   | `JWT_SECRET` | *(64 caracteres aleatorios)* | Secreto para tokens |
   | `SESSION_SECRET` | *(64 caracteres aleatorios)* | Secreto para cookies de sesión |
   | `PRIVATE_STORAGE_PATH` | `/var/data/uploads` | Directorio privado de comprobantes |
   | `DEMO_MODE` | `false` | Activa modo comercial real |
   | `RESEND_API_KEY` | `re_123456789...` | *(Recomendado)* API Key de Resend (envío instantáneo HTTPS) |
   | `SMTP_FROM` | `LUXE WOMAN <pedidos@tudominio.com>` | Remitente oficial |
   | `SMTP_HOST` | `smtp-relay.brevo.com` | Alternativa: Servidor SMTP de Brevo o Gmail |
   | `SMTP_PORT` | `587` | Puerto SMTP (587 para TLS o 465 para SSL) |
   | `SMTP_USER` | `tu-usuario@brevo.com` | Usuario SMTP |
   | `SMTP_PASS` | `tu-clave-smtp` | Clave SMTP |
6. **Configuración de Correo Transaccional**:
   - **Opción A (Resend - Recomendada)**:
     1. Regístrate en [Resend.com](https://resend.com) (gratis hasta 3.000 correos/mes).
     2. Ve a **API Keys** y crea una llave. Copia el valor (`re_...`).
     3. Asígnala a `RESEND_API_KEY` en tus variables de entorno.
     4. Prueba el envío ejecutando localmente: `npm run test:email tu-correo@gmail.com`.
   - **Opción B (Brevo)**:
     1. Regístrate en [Brevo.com](https://www.brevo.com) (gratis hasta 300 correos/día).
     2. Ve a **Transactional** > **Settings** > **Configuration** y copia los datos SMTP:
        - `SMTP_HOST=smtp-relay.brevo.com`
        - `SMTP_PORT=587`
        - `SMTP_USER=tu-correo-brevo`
        - `SMTP_PASS=tu-clave-smtp-brevo`
     3. Prueba el envío ejecutando localmente: `npm run test:email tu-correo@gmail.com`.
7. **Almacenamiento persistente**:
   - En Render, dirígete a **Disks** y agrega un disco persistente montado en `/var/data/uploads` (con 1 GB es suficiente para miles de comprobantes).

### Opción B: Despliegue en Railway
1. En [Railway](https://railway.app), crea un nuevo proyecto desde el repositorio GitHub.
2. Agrega las mismas variables de entorno mencionadas arriba.
3. En Settings:
   - **Build Command**: `npm ci && npm run db:generate -w @luxe/api && npm run build -w @luxe/api`
   - **Start Command**: `npm run start -w @luxe/api`
4. Añade un **Volume** persistente conectado a `/app/.local/uploads`.

---

## Paso 4: Hosting del Frontend (Next.js)

### Despliegue en Vercel (Recomendado)
Vercel es la plataforma nativa de Next.js y ofrece CDN global, SSL automático y rendimiento óptimo.

1. Ve a [https://vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **Add New...** > **Project** e importa tu repositorio.
3. En la configuración del proyecto:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Haz clic en Edit y selecciona `apps/web`.
4. En **Environment Variables**, agrega:
   | Variable | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `https://api.tudominio.com/api/v1` |
   | `API_URL` | `https://api.tudominio.com` |
5. Haz clic en **Deploy**.
6. En 1-2 minutos, tu sitio web estará publicado en una URL de Vercel.

---

## Paso 5: Alternativa Todo en Uno (VPS con Docker Compose)

Si prefieres tener **todo en un único servidor VPS** (DigitalOcean, Hetzner, AWS EC2, Linode, Hostinger VPS de ~$5 a $10 USD/mes):

El repositorio ya incluye un `Dockerfile` multi-stage y un `compose.yaml` optimizados para producción.

1. Contrata un VPS con **Ubuntu 24.04 LTS**.
2. Conéctate por SSH e instala Docker y Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. Clona tu repositorio en el VPS:
   ```bash
   git clone https://github.com/tu-usuario/luxe-woman.git /var/www/luxe-woman
   cd /var/www/luxe-woman
   ```
4. Crea el archivo `.env` de producción a partir de `.env.example`:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Rellena contraseñas seguras aleatorias y configura:
   ```env
   NODE_ENV=production
   POSTGRES_PASSWORD=GeneraUnaClaveMuySegura12345
   APP_URL=https://tudominio.com
   API_URL=https://tudominio.com/api/v1
   NEXT_PUBLIC_API_URL=https://tudominio.com/api/v1
   DEMO_MODE=false
   ```
5. Inicia todos los servicios (Postgres, Migraciones, API y Web):
   ```bash
   docker compose up -d --build
   ```
6. Inicializa el administrador:
   ```bash
   docker compose exec api npx tsx prisma/seed.ts
   ```
7. Instala Caddy para tener HTTPS y certificados SSL automáticos con 3 líneas:
   ```bash
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install caddy -y
   ```
8. Configura `/etc/caddy/Caddyfile`:
   ```caddy
   tudominio.com {
       # Redirigir llamadas de API al contenedor de NestJS
       handle /api/* {
           reverse_proxy 127.0.0.1:4000
       }
       # El resto de solicitudes van al contenedor de Next.js
       handle {
           reverse_proxy 127.0.0.1:3000
       }
   }
   ```
9. Recarga Caddy:
   ```bash
   sudo systemctl reload caddy
   ```
   ¡Listo! Tu sitio estará corriendo en `https://tudominio.com` con SSL automático grado A+.

---

## Paso 6: Dominio, DNS y Certificados SSL

En tu proveedor de dominios (GoDaddy, Namecheap, Google Domains, Cloudflare):

### Si usas Vercel (Web) + Render (API):
- Crea un registro **A** o **CNAME**:
  - `tudominio.com` → CNAME hacia `cname.vercel-dns.com` (o la IP indicada por Vercel).
  - `api.tudominio.com` → CNAME hacia tu dirección de Render (`luxe-api.onrender.com`).

### Si usas un VPS propio:
- Crea los siguientes registros DNS tipo **A**:
  - Host `@` (o `tudominio.com`) → `IP_PUBLICA_DE_TU_VPS`
  - Host `www` → `IP_PUBLICA_DE_TU_VPS`
  - Host `api` → `IP_PUBLICA_DE_TU_VPS`

---

## Paso 7: Configuración Comercial y Salida a Producción

Una vez desplegada la aplicación:

1. **Ingreso Administrativo**:
   - Entra a `https://tudominio.com/cuenta`.
   - Inicia sesión con el correo de `SEED_ADMIN_EMAIL` y la contraseña definida.
   - Haz clic en el enlace **Ir a la administración de la tienda** (o entra directo a `https://tudominio.com/admin`).

2. **Pestaña Configuración**:
   - **Identidad**: Ajusta el nombre de la marca si lo deseas y el correo oficial de atención al cliente.
   - **Tarifas de envío**: Establece el costo de envío a nivel nacional (por ejemplo, `$15.000` COP) y el umbral de envío gratis (por ejemplo, `$200.000` COP).
   - **Nequi y Daviplata**:
     - Activa las casillas correspondientes.
     - Ingresa el número de cuenta / celular real y el nombre completo del titular de la cuenta.
     - Escribe las instrucciones de transferencia (ej: *"Envía el valor exacto a nuestro Nequi e incluye tu número de pedido en el mensaje"*).
   - **Modo Demostración**:
     - Desmarca la casilla **Modo demostración**. Al guardar, los pedidos entrarán en modo de cobro real y no permitirán pagos simulados.

3. **Catálogo Real de Productos**:
   - En la pestaña **Productos**:
     - Edita o archiva los productos de ejemplo.
     - Crea tus productos con fotografías de alta calidad, nombres, descripciones, telas, cuidados, precio, tallas y stock real disponible.

4. **Configuración de Google OAuth (Opcional)**:
   - En [Google Cloud Console](https://console.cloud.google.com/):
     - Crea un proyecto y configura la pantalla de consentimiento OAuth.
     - Crea credenciales de **ID de cliente OAuth 2.0** (Tipo: Aplicación Web).
     - URI de redirección autorizada: `https://api.tudominio.com/api/v1/auth/google/callback`
     - Pega `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en las variables de entorno de tu API.

---

## Paso 8: Backups y Monitoreo

1. **Monitoreo de Salud**:
   - Puedes configurar un servicio gratuito como [UptimeRobot](https://uptimerobot.com) apuntando a:
     - `https://tudominio.com` (Frontend)
     - `https://api.tudominio.com/api/v1/health` (Backend y conexión a base de datos)
   - Te enviará alertas inmediatas por correo si el servidor llegara a fallar.

2. **Copia de Seguridad de la Base de Datos**:
   Si usas Neon o Supabase, las copias de seguridad continuas y automáticas vienen incluidas en la plataforma.
   Si usas tu propio servidor Postgres:
   ```bash
   # Script de respaldo diario
   pg_dump -h 127.0.0.1 -U luxe -d luxe_woman -F c -b -v -f "/backups/luxe_$(date +%Y%m%d_%H%M%S).dump"
   ```

3. **Respaldo de Comprobantes**:
   Asegúrate de incluir en tu política de copias de seguridad la carpeta de almacenamiento privado configurada en `PRIVATE_STORAGE_PATH`.
