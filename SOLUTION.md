# Notas de solución (candidato)

Copia este fichero o edítalo in situ. Completa lo que hayas hecho durante la sesión.

## Candidato

- Nombre: Francisco
- Tiempo dedicado: ~2,5 h

## Tareas completadas

| ID | Estado (hecho / parcial / omitido) | Notas |
|----|-------------------------------------|-------|
| F1 | hecho | Corregidos dos bugs: el front descartaba el filtro `status` y el back devolvía como total el tamaño de página. |
| F2 | hecho | Tablero Kanban con drag-and-drop estilo Jira + botones "→ Estado"; solo permite transiciones válidas (comparte reglas con B2). Toggle Lista/Tablero. |
| F3 | hecho | UI de crear/editar oportunidad con validación en cliente (importe > 0, contacto obligatorio), errores en rojo por campo y toasts para errores de API. Lista + detalle + borrado. |
| F4 | omitido | Sin tiempo. (Hay debounce reutilizable `useDebounceFn`, usado en los filtros de oportunidades.) |
| F5 | hecho | Dashboard con KPIs + dos gráficos de barras (CSS puro), consumiendo B4. Landing por defecto. |
| B1 | hecho | Módulo Opportunities de punta a punta: migración SQL `002_opportunities.sql` + CRUD. Owner = usuario del JWT. |
| B2 | hecho | Máquina de estados de leads + tests unitarios (Jest, 11 tests). Endpoint `PATCH /leads/:id/status` y `GET /leads/transitions`. |
| B3 | hecho | Búsqueda de contactos por nombre/email/empresa, filtro `company` parcial, y 409 en email duplicado (antes 500). |
| B4 | hecho | `GET /stats/summary`: conteo de leads por estado + importes de oportunidades por etapa y abiertas/cerradas. |
| B5 | omitido | Sin tiempo. Propuesto como parte de la feature de historial en P1. |
| P1 | hecho | Tres propuestas: RBAC, i18n y registro de actividad (ver abajo). |

Extras no pedidos: corrección de una fuga de seguridad (el hash bcrypt salía en las
respuestas), y una batería de componentes reutilizables (tabla, tablero, selects,
formularios, toasts, gráficos) usados en varias vistas.

## Decisiones y trade-offs

- **Esquema de Opportunities (B1):** tabla propia (migración `002_opportunities.sql`),
  `amount` como `DECIMAL(12,2)` (precisión monetaria; se transforma a `number` en la
  entidad), `stage` como `VARCHAR(50)` validado a nivel de app con `@IsIn` (evita
  bloquear el esquema si el pipeline cambia). FKs a `contacts` y `users` con
  `ON DELETE RESTRICT`, misma convención que `leads`. El `owner` es el usuario del JWT.
- **Máquina de estados de leads (B2):** `new → contacted → qualified`; `lost` desde
  cualquier estado activo; `lost` es terminal. Se define en un único sitio
  (`lead-status.ts`) y se valida en el servicio (`changeStatus` y también en `update`
  cuando cambia el estado). Se expone en `GET /leads/transitions` para que el frontend
  **no duplique** las reglas: el tablero y el drag-and-drop solo ofrecen movimientos
  válidos, y la API es la autoridad final.
- **Forma de respuesta de stats (B4):** objeto estable con `leads.byStatus` (todos los
  estados, con 0 si no hay) y `opportunities` con `byStage`, `open`, `won`, `lost` y
  `totalAmount`. "Abiertas" = etapas distintas de `won`/`lost`. `COALESCE(SUM,0)` para
  no devolver `null`.
- **Componentes reutilizables:** `DataTable` (con prop `selectable` para multi-selección
  y borrado masivo, activada solo en Opportunities), `KanbanBoard` (genérico, con
  drag-and-drop delegando la regla al padre vía `canDrop`), `SearchableSelect` (combobox
  con filtrado por texto, usado en formularios y filtros), `FormField`/`BaseInput`/
  `BaseSelect`, `ViewModeToggle`, sistema de `toasts`, `StatCard` y `BarChart`.
- **Dashboard sin librería de gráficos (F5):** barras en CSS puro para no añadir peso al
  bundle; suficiente para "un gráfico mínimo".
- **Tests (B2):** Jest + ts-jest. Se testea la máquina de estados pura y el servicio con
  un repositorio mockeado (sin depender de la BD).
- **A medias / omitido:** B5 (notas) y F4 (debounce en contactos) por tiempo; el debounce
  sí quedó implementado como composable reutilizable y se usa en los filtros de
  oportunidades.

## Bugs encontrados en el proyecto base

- **F1 (backend):** `LeadsService.findAll` hacía `const [data] = getManyAndCount()` y
  `totalCount = data.length`, devolviendo el tamaño de página en vez del total real.
  → Arreglado usando el `count` real. 
- **F1 (frontend):** `fetchLeads` reconstruía los params descartando `status`, así que el
  filtro de estado no llegaba a la API. → Arreglado pasando los params completos.
- **B3:** crear/actualizar un contacto con email duplicado devolvía **500** (violación de
  `UNIQUE` sin capturar). → Ahora se traduce a **409 Conflict**.
- **B3:** la búsqueda de contactos solo miraba `name` y `company` exigía igualdad exacta.
  → Ampliado a nombre/email/empresa con coincidencia parcial.
- **Seguridad (fuera de alcance, detectado de paso):** las respuestas de `leads` y
  `opportunities` con la relación `owner` incluían `passwordHash` (hash bcrypt) visible
  para cualquier usuario autenticado. → Columna marcada `select: false` y el login la
  pide explícitamente con `addSelect`.

## P1 — Tres siguientes features (solo propuesta)

### 1. Roles y permisos (RBAC)

- **Por qué:** Hoy cualquier usuario autenticado puede ver y modificar todo. Un CRM
  real necesita separar responsabilidades: un comercial debería gestionar solo lo
  suyo, un manager verlo todo, y acciones sensibles (borrar, reasignar) quedar
  restringidas. Es la base sobre la que se apoyan casi todas las features siguientes.
- **Cómo (alto nivel):**
  - *Modelo de datos:* añadir `role` a `users` (p. ej. `admin` | `manager` | `sales`)
    vía nueva migración SQL. Aprovechar el `owner_id` que ya existe en `leads` y
    `opportunities` para las reglas de propiedad.
  - *API:* incluir el `role` en el payload del JWT; crear un `RolesGuard` +
    decorador `@Roles(...)` en NestJS que se combine con el `JwtAuthGuard` actual.
    Reglas de propiedad en el servicio (un `sales` solo lista/edita registros con
    su `owner_id`; `admin`/`manager` sin filtro).
  - *UI:* exponer el rol en el store de Pinia (`auth`) y ocultar/inhabilitar
    acciones según permisos (p. ej. el botón "Delete selected" o el borrado por
    fila solo para `manager`/`admin`).
- **Riesgos / preguntas abiertas:** definir la matriz exacta de permisos con negocio;
  evitar duplicar la lógica entre front y back (el backend debe ser la autoridad, el
  front solo cosmético); migración de datos para asignar rol a los usuarios ya
  existentes; decidir si la propiedad es por registro o por equipo.

### 2. Internacionalización (i18n)

- **Por qué:** La UI está hoy en inglés y con textos incrustados. Para vender el
  producto fuera de un único mercado hace falta traducir la interfaz (y a futuro
  formatos de fecha/número/moneda) sin tocar cada componente.
- **Cómo (alto nivel):**
  - *UI:* integrar `vue-i18n`, extraer todos los literales a ficheros de recursos
    (`es.json`, `en.json`), y un selector de idioma persistido en `localStorage`
    (mismo patrón que ya uso para el modo de vista de Leads). Reutilizar `Intl`
    para fechas/moneda (ya lo uso para € en oportunidades y dashboard).
  - *API:* los mensajes de error de negocio (transiciones inválidas, 409 de email…)
    podrían devolver una *clave* estable además del texto, para que el front decida
    la traducción; alternativamente mantenerlos en inglés y traducir solo la UI.
  - *Datos:* decidir si el contenido de negocio (nombres de etapa/estado) se traduce
    en el front por mapa de claves (recomendado) o se guarda traducido en BD.
- **Riesgos / preguntas abiertas:** coste de mantener las traducciones al día;
  pluralización y género; textos que llegan del backend; crecimiento del bundle;
  definir idioma por defecto y fallback.

### 3. Registro de actividad / historial (audit trail)

- **Por qué:** En un CRM es clave saber *quién hizo qué y cuándo* — especialmente los
  cambios de estado de un lead o de etapa de una oportunidad (que ya validamos con la
  máquina de estados). Da trazabilidad, ayuda en soporte y es la base de un futuro
  timeline por registro. Encaja con la feature de notas (B5) que quedó fuera de tiempo.
- **Cómo (alto nivel):**
  - *Modelo de datos:* tabla `activities` (migración SQL) con `entity_type`
    (lead/opportunity/contact), `entity_id`, `actor_id` (usuario del JWT), `action`
    (`status_changed`, `created`, `updated`…), `metadata` JSON (p. ej. `{from,to}`) y
    `created_at`.
  - *API:* registrar la actividad desde los servicios en los puntos ya existentes
    (p. ej. `LeadsService.changeStatus`), idealmente vía un `ActivityService`
    inyectado o un interceptor/eventos para no ensuciar la lógica; endpoint
    `GET /leads/:id/activities` que devuelva el histórico más reciente primero.
  - *UI:* un timeline en la vista de detalle de lead/oportunidad, reutilizando el
    patrón de lista/estados vacíos ya presente.
- **Riesgos / preguntas abiertas:** volumen de escritura y crecimiento de la tabla
  (índices y posible archivado); qué acciones merece la pena auditar sin generar
  ruido; consistencia transaccional entre la operación y su registro; privacidad de
  los datos registrados en `metadata`.

## Uso de IA (obligatorio)

Herramienta(s) usada(s): Claude (Claude Code, modelo Sonnet) como asistente de desarrollo y herramienta de apoyo en el editor.

Cómo las usé: Principalmente para acelerar tareas operativas y como apoyo en la refactorización de código. Le di mucho uso en el frontend para agilizar la creación de los componentes en Vue y para la escritura de los tests unitarios. El flujo de trabajo fue siempre liderado por mí de forma incremental: yo establecía la lógica y estructura, y utilizaba la IA para iterar o limpiar código, revisando y probando exhaustivamente cada entrega (type-check, build y pruebas reales de API con curl) antes de integrarla.

Qué generó/asistió la IA frente a lo mío: Yo desarrollé la gran mayoría de la lógica central, incluyendo el diseño de la máquina de estados, las reglas de negocio, la estructura de las APIs y las decisiones de UX (tablero, filtros). La IA actuó estrictamente como un copiloto que me asistió maquetando componentes visuales, generando la batería de pruebas y ayudando a refactorizar bloques específicos.

## Cómo ejecutar tus cambios

El flujo estándar de [`instructions.md`](instructions.md) funciona sin pasos extra:

```bash
docker compose up -d
cd backend && cp .env.example .env && npm install && npm run db:setup && npm run start:dev
# en otra terminal
cd frontend && npm install && npm run dev
```

Detalles a tener en cuenta:

- **Nuevas migraciones:** `002_opportunities.sql` (tabla `opportunities`). `npm run db:setup`
  aplica 001 + 002 y ejecuta el seed. El seed ahora crea también 15 oportunidades de
  demo, para que el dashboard tenga datos.
- **Variables de entorno:** ninguna nueva.
- **Tests (B2):** `cd backend && npm test` (Jest, 11 tests de la máquina de estados y del
  servicio de leads).
- **Nota sobre mi entorno local:** al no tener Docker en la máquina, levanté MariaDB de
  forma nativa en el puerto `3307` (el mismo que mapea `docker-compose.yml`), así que el
  `.env` no cambia y `docker-compose.yml` está intacto. Con Docker, el flujo de arriba
  funciona igual.
