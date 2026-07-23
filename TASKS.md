# LeadFlow — Tareas de la prueba técnica

Buscamos perfil **full-stack**: puedes (y se espera que) toques frontend y backend. Elige qué tareas abordar y en qué orden; **no** hace falta completarlas todas.

Duración orientativa de la sesión: **2–2,5 horas**. El conjunto completo está pensado para unas **4,5–5 horas** a propósito.

Documenta lo que hayas hecho (y lo que hayas dejado) en [`SOLUTION.md`](SOLUTION.md).

Las secciones siguientes agrupan por capa (UI vs API/BD) para orientar, no para que elijas “solo frontend” o “solo backend”.

---

## Frontend

### F1 — Corregir filtrado y paginación de leads

La lista de leads tiene un filtrado y/o una paginación rotos.

**Criterios de aceptación**

- Filtrar por estado afecta realmente a los resultados mostrados.
- Los controles de paginación reflejan el total real y permiten cambiar de página correctamente.
- El tamaño de página sigue siendo usable.

### F2 — Kanban de leads (o “mover a estado”)

Añade una vista tipo tablero de leads agrupados por estado.

**Criterios de aceptación**

- Los leads están agrupados por columnas de estado (o un UX de tablero equivalente y claro).
- El usuario puede cambiar el estado de un lead desde esa vista (drag-and-drop **o** acciones explícitas “mover a…”).
- Los cambios de estado se persisten a través de la API.

### F3 — Formulario de oportunidad (UI)

Construye la UI de crear/editar oportunidades. Necesita que exista la API de opportunities (B1); puedes hacer B1 primero o trabajar ambas en paralelo.

**Criterios de aceptación**

- El formulario valida en cliente: el importe debe ser mayor que 0; el contacto es obligatorio.
- Los errores de validación/respuesta de la API se muestran de forma usable.
- Tras crear/editar con éxito, se navega a un sitio razonable (lista o detalle).

### F4 — Búsqueda de contactos con debounce

Mejora la experiencia de búsqueda en la lista de contactos.

**Criterios de aceptación**

- El input de búsqueda tiene debounce (no lanza una petición en cada tecla sin retardo).
- Los estados de carga, vacío y error son visibles y claros.

### F5 — Dashboard simple

Añade un dashboard que resuma la actividad del CRM. Encaja bien con B4 si quieres datos agregados reales desde la API.

**Criterios de aceptación**

- Muestra conteos de leads por estado.
- Muestra el importe total de oportunidades abiertas (o una alternativa clara si aún no hay opportunities).
- La presentación puede ser cards + un gráfico mínimo **o** una lista agrupada clara (no hace falta un diseño elaborado).

---

## Backend

### B1 — Módulo de Opportunities (incluyendo base de datos)

Las opportunities **no** forman parte del esquema base. Impléméntalas de punta a punta (migración SQL + API). La UI correspondiente es F3.

**Criterios de aceptación**

- Una oportunidad pertenece a un contacto y a un owner (el usuario autenticado, salvo que justifiques otra regla).
- Tiene al menos título, importe y etapa de pipeline.
- Hay CRUD disponible vía API (listar, crear, actualizar, borrar o desactivar).
- La persistencia usa un **fichero de migración SQL** del proyecto, siguiendo las mismas convenciones que las migraciones existentes.
- **No** uses TypeORM `synchronize: true` (ni equivalente) para que te cree la tabla.
- La integridad referencial y el tipado deben ser coherentes con el resto del esquema.

Diseña tú la tabla y las claves a partir de los requisitos anteriores.

### B2 — Transiciones de estado de Lead + tests

Los cambios de estado de un lead deben seguir reglas de negocio.

**Criterios de aceptación**

- Las transiciones inválidas se rechazan con un error HTTP claro.
- Las transiciones válidas se permiten (define una máquina de estados razonable; documéntala brevemente en `SOLUTION.md`).
- Hay tests unitarios que cubren las reglas del servicio para transiciones permitidas/prohibidas.

### B3 — Búsqueda/filtros de contactos y email duplicado

Mejora el listado/búsqueda de contactos y el manejo de errores.

**Criterios de aceptación**

- Soporta query params de búsqueda/filtro como `q` y `company` de forma útil (nombre/email/empresa según veas — documenta tus decisiones).
- Los totales de paginación son correctos.
- Crear/actualizar un contacto con email duplicado devuelve **409 Conflict** (no un 500 genérico).

### B4 — Endpoint de estadísticas para dashboard

Proporciona datos agregados para un dashboard (encaja con F5).

**Criterios de aceptación**

- `GET /stats/summary` (o equivalente) devuelve conteos de leads por estado.
- Devuelve totales de importe de opportunities por etapa (o abiertas vs cerradas — documenta la regla).
- La forma de la respuesta es estable y queda documentada en `SOLUTION.md`.

### B5 — Notas en leads

Añade notas como recurso anidado de leads.

**Criterios de aceptación**

- `POST /leads/:id/notes` crea una nota cuyo autor es el usuario del JWT.
- `GET /leads/:id/notes` devuelve las notas de ese lead, las más recientes primero.
- Si el lead no existe, responde con un 404 adecuado.

---

## Tarea final

### P1 — Siguientes desarrollos (solo propuesta)

En [`SOLUTION.md`](SOLUTION.md), propone **3 features** que desarrollarías a continuación.

Para cada una, indica brevemente:

- Por qué la priorizarías
- Enfoque a alto nivel (modelo de datos / API / UI según corresponda)
- Principales riesgos o preguntas abiertas

**No** implementes estas tres features: solo propuesta (~15–20 minutos).

---

## Checklist de entrega

- [ ] Cambios de código en este repo (los commits son bienvenidos)
- [ ] [`SOLUTION.md`](SOLUTION.md) completado (tareas hechas, decisiones, uso de IA, propuestas P1)
- [ ] Puedes explicar cualquier código que entregues
