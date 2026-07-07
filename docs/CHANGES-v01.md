# ObraPulse v2 — Modo Presentador e Interactividad (Change Request)

**Proyecto:** ObraPulse — AI Construction Command Center
**Repo / URL en vivo:** https://elbruno.github.io/obra-pulse/
**Autor:** Bruno Capuano · Microsoft
**Uso:** Demo 1 en vivo · Keynote "IA aplicada: caso Microsoft" · AI Construction Summit 2026 (9 jul)
**Objetivo de esta versión:** que el dashboard **me ayude a dar la charla** — un recorrido guiado paso a paso, con marcadores, que resalta cada sección mientras hablo, y que la audiencia pueda seguir desde la URL compartida.

> **Cómo usar este archivo:** pásalo a GitHub Copilot como especificación de cambios sobre el repo actual. El prompt final está al pie. **No rehace el dashboard**: le agrega una capa de "modo presentador" encima de lo que ya existe.

---

## 0. Qué mantener (no romper)
- Toda la estructura actual: KPIs, panel del agente, gráficos, tabla de proyectos y alertas.
- Los datos mock actuales (proyectos en Perú/LATAM), la paleta y el modo claro/oscuro.
- Que siga siendo **100% estático** (GitHub Pages, sin backend) y **responsive**.

---

## 1. Feature principal — Recorrido Guiado del Presentador ("Guided Tour")

Un modo que convierte el dashboard en el guion visual de la demo: avanzo con el teclado y el dashboard **resalta la sección** de la que estoy hablando, con un cartel de apoyo.

### 1.1 Activación
- Botón discreto arriba a la derecha: **"▶ Modo presentación"**.
- También arranca con la tecla **`T`** o si la URL trae `#tour` o `#step-1`.
- Al activarse: el resto de la página se **atenúa** (overlay oscuro semitransparente) y la sección del paso actual queda **iluminada** (spotlight: z-index alto + borde de acento + leve zoom/box-shadow).

### 1.2 Controles
- **→ / Barra espaciadora / click:** siguiente paso.
- **← :** paso anter.
- **Esc:** salir del recorrido (vuelve al dashboard normal).
- **N:** mostrar/ocultar la **nota del orador** (texto largo con lo que digo; oculto por defecto para no saturar a la audiencia).
- **F:** pantalla completa.
- Botones en pantalla equivalentes (← ▶/⏸ →) para hacerlo con el mouse.

### 1.3 Elementos en pantalla durante el recorrido
- **Spotlight** sobre la sección activa (resaltado + scroll automático a esa sección).
- **Barra de progreso** de pasos (p. ej. "3 / 7") con puntos clicables (marcadores) para saltar a cualquier paso.
- **Caja de apoyo (caption)** abajo: 1 frase corta, **visible para la audiencia**, que refuerza el mensaje del paso.
- **Nota del orador (coach)** opcional con `N`: texto más largo, lo que voy a decir. Que sea sutil (esquina) por si la audiencia también abre la URL.

### 1.4 Los pasos del recorrido (marcadores)
Definir estos 7 pasos. Cada uno: sección a resaltar + caption (audiencia) + nota del orador (yo).

| # | Resalta | Caption (audiencia) | Nota del orador (tecla N) |
|---|---|---|---|
| 1 | Header / vista general | **"Un centro de mando para todos sus proyectos."** | "Esto es lo primero que veo a la mañana: todos los proyectos, en un solo lugar. Antes esto vivía en diez planillas distintas." |
| 2 | Fila de KPIs | **"Todo el portafolio, de un vistazo."** | "Proyectos activos, RFIs abiertos, órdenes de cambio, incidentes, proyectos en riesgo. Cinco números y ya sé cómo viene la semana." |
| 3 | Panel 🤖 Recomendaciones del agente | **"No solo muestra datos: ayuda a decidir."** | "Este es el punto. El agente ya me dice por dónde empezar: el proyecto con más RFIs y más atraso. Produce la lectura; yo tomo la decisión." |
| 4 | Gráfico de RFIs / top movers | **"Dónde está el riesgo esta semana."** | "Acá veo la tendencia. El atraso no aparece de golpe: se ve venir. La IA me deja mirar esto todos los días, no una vez por mes." |
| 5 | Fila del peor proyecto en la tabla (Metro L3) | **"Del número al proyecto concreto."** | "Bajo al proyecto crítico. 26 RFIs, casi 20 días de atraso. En un click paso del panorama al detalle accionable." |
| 6 | Panel ⚠️ Alertas | **"Lo que no puede esperar."** | "Y esto es lo urgente: RFIs vencidos, un incidente de seguridad, una desviación de costo. La lista de hoy." |
| 7 | Vista general (zoom out) | **"Imaginen esto para sus procesos."** | "Esto es para construcción, pero la idea es suya: sus proyectos, sus decisiones, un agente que ayuda a priorizar. Y esta URL la comparto ahora." |

> El paso 3 y el paso 7 son los importantes (la tesis y el cierre). Que el resalte sea claro ahí.

### 1.5 Marcadores como deep-links
- Cada paso actualiza el hash de la URL (`#step-3`) para poder **entrar directo** a un paso (útil si algo falla y quiero saltar).
- Si comparto `.../obra-pulse/#step-7` la gente entra directo al cierre.

---

## 2. Feature — Sensación de "IA en vivo"
Para que el panel del agente se sienta vivo (no un texto fijo):
- Cuando el recorrido llega al **paso 3**, las recomendaciones del agente aparecen con un **efecto de tipeo** (typewriter) o un fade-in escalonado, como si el agente las estuviera generando en el momento.
- Un pequeño indicador **"⏺ analizando…"** que corre ~1 segundo antes de mostrar la primera recomendación.
- Sutil, rápido (no más de 1.5 s en total) — es un toque, no un show.

---

## 3. Feature — Utilidades de presentador
- **Reloj/timer** opcional arriba (para no pasarme de los ~4 min de la demo). Toggle con tecla `C`.
- **Botón "Refrescar datos"** que re-randomiza levemente los KPIs/actividad (±) para que nunca se vea "stale" y para poder repetir la demo en otra sesión. (Solo mueve los mock, no toca la estructura.)
- **Sello de estado "Actualizado: hace un momento"** que se resetee al cargar (evita el "very stale" de mi otro dashboard).
- Que el modo presentación se vea bien en **proyector 16:9** (fuentes grandes, buen contraste) y siga usable en **móvil** para la audiencia.

---

## 4. Notas técnicas (para Copilot)
- Todo en **JavaScript vanilla**, sin frameworks nuevos ni backend. Compatible con GitHub Pages.
- El overlay/spotlight: un `div` de overlay a pantalla completa + resaltado de la sección activa subiéndole `z-index` y `position: relative`. Usar `scrollIntoView({behavior:'smooth', block:'center'})`.
- Estado del recorrido en memoria + hash de URL; opcional recordar preferencia de tema en `localStorage` (si ya existe, mantener).
- Accesibilidad: navegable por teclado, `aria-live` en la caja de caption, foco visible.
- No debe romper la vista normal: si el recorrido está apagado, el dashboard se ve y funciona exactamente igual que hoy.

---

## 5. Criterios de aceptación (Definition of Done)
- [ ] Botón "Modo presentación" + tecla `T` inician el recorrido.
- [ ] Flechas / barra espaciadora avanzan y retroceden entre los 7 pasos.
- [ ] Cada paso atenúa el fondo y resalta (spotlight) la sección correcta, con scroll automático.
- [ ] Caja de caption visible por paso; nota del orador toggleable con `N`.
- [ ] Barra de progreso "n / 7" con marcadores clicables.
- [ ] Deep-links `#step-1..#step-7` funcionan al cargar.
- [ ] En el paso 3, las recomendaciones del agente aparecen con efecto "en vivo".
- [ ] `Esc` sale limpio y el dashboard queda igual que antes.
- [ ] Funciona en desktop (proyector) y móvil, en modo claro y oscuro.
- [ ] Sin backend, sin errores en consola, publicable en GitHub Pages.

---

## 6. Prompt sugerido para GitHub Copilot
> "Tomá el repo actual de **ObraPulse** (dashboard estático en GitHub Pages) y agregale un **Modo Presentador / Recorrido Guiado**, siguiendo el archivo `obra-pulse-presenter-mode-CHANGES-v01.md`. No rehagas el dashboard: sumá una capa encima que **no rompa** la vista actual. Implementá: (1) un recorrido de 7 pasos con spotlight sobre cada sección, controlado por teclado (→ ← barra espaciadora, Esc para salir, N para notas del orador, F pantalla completa) y por botones en pantalla; (2) una barra de progreso con marcadores clicables; (3) una caja de caption por paso más una nota del orador oculta por defecto; (4) deep-links `#step-1..#step-7`; (5) efecto de aparición 'en vivo' en el panel del agente al llegar al paso 3; (6) utilidades de presentador: timer opcional, botón de refrescar datos mock y sello de 'actualizado recién'. Todo en JavaScript vanilla, sin backend, compatible con GitHub Pages, responsive y con soporte de modo claro/oscuro. Usá exactamente los 7 pasos, captions y notas del orador definidos en el documento."

---

*Los datos siguen siendo ficticios y con fines de demostración.*
