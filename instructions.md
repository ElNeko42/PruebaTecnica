# LeadFlow — Instrucciones de configuración

Mini CRM usado como proyecto base para una **prueba técnica**.

Stack:

- **Frontend:** Vue 3 + Vite + TypeScript + Vue Router + Pinia
- **Backend:** NestJS + TypeORM + class-validator
- **Base de datos:** MariaDB 11 (Docker)

## Requisitos previos (qué debes tener instalado)

Antes de empezar, asegúrate de tener en el ordenador:

| Herramienta | Versión / notas | Cómo comprobarlo |
|-------------|-----------------|------------------|
| **Sistema operativo** | Windows 10/11, macOS o Linux | — |
| **Node.js** | **20 o superior** (incluye `npm`) | `node -v` → p. ej. `v20.x` / `v22.x` / `v24.x` |
| **npm** | Viene con Node.js | `npm -v` |
| **Docker** | Docker Desktop (Windows/macOS) **o** Docker Engine + plugin Compose (Linux) | `docker -v` y `docker compose version` |
| **Editor de código** | VS Code, Cursor u otro con el que te sientas cómodo | — |
| **Navegador** | Chrome, Firefox, Edge, etc. | Para usar la app en `http://localhost:5173` |
| **Terminal** | PowerShell, Terminal de macOS, bash/zsh, etc. | Para los comandos de este documento |
| **Git** (recomendado) | Para commits locales de tu entrega | `git --version` |

Opcional pero útil:

- Cliente HTTP (Postman, Insomnia, Thunder Client, curl…) para probar la API.
- Herramientas de IA (Cursor, Copilot, ChatGPT, Claude…): permitidas y recomendadas (ver más abajo).

**No** hace falta instalar MariaDB en el host: se levanta solo con Docker.

**Puertos** que deben estar libres (o que sepas cambiar):

| Puerto | Uso |
|--------|-----|
| `3307` | MariaDB (mapeo del contenedor; ver `docker-compose.yml`) |
| `3000` | API NestJS |
| `5173` | Frontend Vite |

Descargas orientativas:

- Node.js: [https://nodejs.org](https://nodejs.org) (LTS 20+)
- Docker Desktop: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

En Windows, Docker Desktop suele requerir WSL 2 habilitado. Si Docker no arranca, resuélvelo **antes** de la sesión de la prueba.

## 1. Levantar la base de datos

Desde la raíz del repositorio:

```bash
docker compose up -d
```

Espera a que MariaDB esté healthy (unos segundos). Credenciales por defecto:

| Parámetro | Valor |
|-----------|-------|
| Host      | localhost |
| Puerto    | 3307 (mapeado desde el 3306 del contenedor; ver `docker-compose.yml`) |
| Base de datos | leadflow |
| Usuario   | leadflow |
| Contraseña | leadflow |

Si prefieres el puerto `3306` en el host, cambia el mapeo en `docker-compose.yml` y ajusta `DB_PORT` en `backend/.env`.

## 2. Backend

```bash
cd backend
cp .env.example .env   # si aún no existe .env
npm install
npm run db:setup       # migraciones SQL + datos de seed
npm run start:dev
```

API: [http://localhost:3000](http://localhost:3000)

Usuarios demo (del seed):

- `admin@demo.com` / `demo1234`
- `sales@demo.com` / `demo1234`

Scripts útiles:

| Script                  | Descripción |
|-------------------------|-------------|
| `npm run migration:run` | Aplica los ficheros SQL de `src/database/migrations` |
| `npm run seed`          | Inserta usuarios, contactos y leads de demo |
| `npm run db:setup`      | Migraciones + seed |
| `npm run start:dev`     | NestJS en modo watch |

Las migraciones son ficheros `.sql` planos. `synchronize` está **desactivado**: los cambios de esquema deben ir en nuevos ficheros de migración (ver el existente `001_init.sql`).

## 3. Frontend

En una segunda terminal:

```bash
cd frontend
cp .env.example .env   # opcional; por defecto http://localhost:3000
npm install
npm run dev
```

Aplicación: [http://localhost:5173](http://localhost:5173)

## 4. Qué hacer a continuación

1. Entra con un usuario demo y explora **Leads** y **Contacts**.
2. Lee [`TASKS.md`](TASKS.md) y elige un conjunto de tareas (frontend y backend; el rol buscado es full-stack).
3. Documenta tu trabajo en [`SOLUTION.md`](SOLUTION.md) (completa la plantilla).

Tiempo orientativo de sesión: **2–2,5 horas**. **No** se espera que completes todas las tareas.

## Uso de herramientas de IA

**Puedes y debes** usar herramientas de IA para programar (Cursor, GitHub Copilot, ChatGPT, Claude, etc.).

Reglas:

- Debes poder **explicar todo el código** que entregues — incluido el generado por IA: por qué está ahí, cómo funciona y qué cambiarías.
- En la revisión técnica podemos pedir un walkthrough de cualquier fichero o función.
- En [`SOLUTION.md`](SOLUTION.md) debes indicar **qué herramienta(s)** usaste y **cómo** (autocompletado, agent, chat para diseño, debugging, tests, etc.).

Usar IA está bien visto. Entregar código que no sepas explicar, no.

## Estructura del proyecto

```
/
  docker-compose.yml
  instructions.md
  TASKS.md
  SOLUTION.md
  backend/
  frontend/
```

## Resolución de problemas

- **No conecta a la BD:** comprueba que `docker compose ps` muestra MariaDB healthy; revisa el `.env` de `backend/`.
- **Puerto 3307 / 3000 / 5173 ocupado:** para el proceso en conflicto o cambia el puerto en compose / `.env` / configuración de Vite.
- **Seed omitido:** el seed solo corre si la tabla `users` está vacía. Para resetear, elimina el volumen de Docker:

  ```bash
  docker compose down -v
  docker compose up -d
  cd backend && npm run db:setup
  ```
