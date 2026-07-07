# Work Routing

How to decide who handles what for ObraPulse.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Architecture, file structure, project setup | Danny | Organización de `index.html`, `styles.css`, `app.js`, `data.json`; decisiones de módulos JS |
| Code review, PR review | Danny | Revisar todo PR antes del merge; asegurar calidad y coherencia |
| HTML structure & semantics | Rusty | Marcar secciones (header, KPIs, tabla, alertas), estructura del DOM |
| JavaScript logic & interactivity | Rusty | Animación count-up de KPIs, búsqueda en tabla, filtros, orden de columnas, cargar `data.json` |
| Chart.js implementation | Rusty | Gráfico de líneas (RFIs), barras horizontales (top movers), dona (avance cartera) |
| CSS styling, themes, design tokens | Basher | Variables CSS, paleta de colores, dark/light mode, bordes, sombras, tipografía |
| Responsive layout | Basher | Grid/flex para proyector y móvil; KPIs que se apilan en mobile; tabla con scroll horizontal |
| Visual aesthetics, "command center" look | Basher | Estética impecable, chips de semáforo, badges, panel 🤖 con acento violeta |
| Acceptance criteria verification | Livingston | Verificar los 9 criterios del PRD sección 8, sin errores en consola |
| Cross-device QA | Livingston | Testing en móvil (iPhone/Android) y pantalla de proyección 16:9 |
| Bug reports, edge cases | Livingston | Datos que no renderizan, interacciones rotas, Chart.js que no carga |
| Session logging | Scribe | Automático — no necesita routing |
| Work queue monitoring | Ralph | Automático — no necesita routing |
| RAI review | Rai | Content safety, chequeo de datos sensibles, revisión ética |
| Fact verification | Fact Checker | Verificar datos mock, devil's advocate antes de deploy |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analizar issue, asignar label `squad:{member}` | Danny |
| `squad:danny` | Arquitectura, revisión, decisiones técnicas | Danny |
| `squad:rusty` | Implementación HTML/JS/Chart.js | Rusty |
| `squad:basher` | CSS, estilos, dark mode, responsive | Basher |
| `squad:livingston` | QA, testing, criterios de aceptación | Livingston |

### How Issue Assignment Works

1. Cuando un issue recibe el label `squad`, **Danny** lo triagea — analiza el contenido, asigna el label `squad:{member}` correcto, y comenta con notas.
2. Cuando se aplica un label `squad:{member}`, ese miembro toma el issue en su próxima sesión.
3. Los miembros pueden reasignar cambiando el label.

## Rules

1. **Eager by default** — hacer spawn de todos los agentes que puedan trabajar en paralelo, incluyendo trabajo anticipatorio.
2. **Scribe siempre corre** después de trabajo sustancial, siempre como `mode: "background"`. Nunca bloquea.
3. **Hechos rápidos → el coordinator responde directamente.** No hacer spawn para "¿qué valor tiene el KPI de RFIs?"
4. **Cuando dos agentes podrían manejarlo**, elegir el cuyo dominio sea la preocupación primaria.
5. **"Team, ..." → fan-out.** Spawn de todos los agentes relevantes en paralelo como `mode: "background"`.
6. **Anticipar trabajo downstream.** Si Rusty está implementando la tabla, Livingston puede escribir los casos de prueba en paralelo.
7. **Issue-labeled work** — cuando se aplica `squad:{member}` a un issue, routear a ese miembro. Danny maneja todo triage de `squad` (label base).
