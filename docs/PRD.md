# PRD — ObraPulse · AI Construction Command Center

**Repositorio sugerido:** `obra-pulse`
**Alternativas de nombre:** `obra-signal` · `torre-control-aec` · `buildboard-demo`
**URL destino (GitHub Pages):** `https://<tu-usuario>.github.io/obra-pulse/`
**Autor:** Bruno Capuano · Principal Cloud Advocate, Microsoft
**Uso:** Demo en vivo · Keynote "IA aplicada: caso Microsoft" · AI Construction Summit 2026 (Precongreso, 9 jul)
**Estado:** v1 para generación con GitHub Copilot

---

## 1. Contexto y objetivo

Necesito un **dashboard web, visual e interactivo**, que sea el gemelo AEC de mi dashboard personal de repos (`nuget-repo-dashboard`). En la keynote muestro primero mi día a día (mis 30+ proyectos open source vistos de un vistazo) y luego hago **alt-tab a este dashboard** para decir: *"imaginen esto, pero para SU industria: sus obras, sus RFIs, sus incidentes — todo de un vistazo, y un agente que los ayuda a decidir qué atender primero."*

**Objetivo del producto:** que un gerente de obra / director de proyectos vea la pantalla y **entienda todo en 5 segundos**, sin explicación técnica. La URL se comparte en vivo con la audiencia, así que tiene que verse impecable en **desktop y en móvil**.

**Este es un dashboard DEMO con datos ficticios.** No conecta a sistemas reales, no requiere backend ni autenticación.

---

## 2. Decisión de tecnología (leer antes de construir)

**Opción recomendada — Static Web App (HTML + CSS + JS):**
- **Por qué:** GitHub Pages solo sirve contenido estático. Una SPA estática con **Chart.js** para gráficos carga instantánea, es 100% compartible por URL, funciona en cualquier móvil y no necesita hosting extra. Es el mismo enfoque que mi dashboard de NuGet actual.
- **Stack:** HTML5 + CSS moderno (variables CSS, grid/flex) + JavaScript vanilla + **Chart.js** (CDN) para las gráficas. Sin frameworks pesados.
- **Datos:** archivo `data.json` (o `data.js`) con los datos mock de la sección 6, cargado en runtime. Fácil de editar antes del evento.

**Opción alternativa — App Python (solo si se prefiere):**
- **Streamlit** o **FastAPI + frontend**. Da más interactividad, PERO **GitHub Pages NO ejecuta Python**. Requeriría hosting aparte (Streamlit Community Cloud, Azure App Service o Azure Static Web Apps con backend). Si la prioridad es *una URL de GitHub Pages para compartir en vivo*, **usar la opción estática**. Si se prefiere Python, generar con Streamlit y desplegar en Streamlit Community Cloud, y documentar la URL pública en el README.

> **Instrucción para Copilot:** construir la **Opción recomendada (static web app + Chart.js sobre GitHub Pages)** salvo que el usuario indique lo contrario.

---

## 3. Principios de diseño

1. **Legible en 5 segundos.** Jerarquía visual clara: KPIs grandes arriba, detalle abajo.
2. **Semáforo universal.** Verde / Amarillo / Rojo por estado de proyecto — nadie necesita leer para entender.
3. **Interactivo y táctil.** Búsqueda, filtros y orden funcionando; hover con tooltips; tap-friendly en móvil.
4. **Movimiento con propósito.** Contadores KPI animados al cargar; transiciones suaves. Nada que distraiga.
5. **Responsive-first.** Debe verse bien en el proyector Y en el teléfono de cada asistente.
6. **Modo claro/oscuro** con toggle (default: oscuro, se ve mejor en proyección).
7. **Estética "command center":** limpia, tipo producto real, no un template genérico.

---

## 4. Estructura de la página (secciones, de arriba a abajo)

### 4.1 Header / barra superior
- Logo/emoji + título **"🏗️ ObraPulse"** y subtítulo *"AI Construction Command Center"*.
- Sello discreto: **"Datos de demostración · AI Construction Summit 2026"**.
- "Última actualización: hace 4 min" (texto mock, que dé sensación de "en vivo").
- Toggle claro/oscuro. Buscador global (filtra la tabla de proyectos).

### 4.2 Fila de KPIs (tarjetas grandes, contador animado)
Cinco tarjetas horizontales:
1. **Proyectos activos** — `8`
2. **RFIs abiertos** — `111` (↑ +9 esta semana)
3. **Órdenes de cambio pendientes** — `23`
4. **Incidentes HSE (mes)** — `9`
5. **Proyectos en riesgo** — `3` (en rojo)

Cada tarjeta: número grande con **count-up animado**, etiqueta, mini-indicador de tendencia (▲/▼ y color).

### 4.3 Panel "🤖 Recomendaciones del agente" (destacado — es el corazón del mensaje)
Caja diferenciada (borde/acento de color IA) con 3–4 acciones priorizadas generadas "por IA". Cada ítem: icono de prioridad, texto y proyecto asociado. Contenido exacto en la sección 6.3.
> Este panel es lo que conecta el dashboard con mi tesis: *el agente no solo muestra datos, ayuda a **decidir**.*

### 4.4 Gráficos (fila de 2–3, con Chart.js)
- **Actividad de RFIs (últimos 7 días):** líneas Abiertos vs. Cerrados.
- **Top movers — atraso de cronograma esta semana:** barras horizontales (días de atraso por proyecto, top 5).
- **Avance de cartera:** dona o barras apiladas por estado (Verde/Amarillo/Rojo).

### 4.5 Tabla de proyectos (el núcleo interactivo)
Tabla con **orden por columna, búsqueda y filtros** (por Estado, Tipo, Ubicación). Columnas:

| Columna | Descripción |
|---|---|
| Proyecto | Nombre (con chip de estado semáforo) |
| Tipo | Residencial / Vial / Salud / Retail / Sanitario / Transporte / Aeroportuario |
| Ubicación | Ciudad |
| Avance % | Barra de progreso visual |
| RFIs abiertos | Número (badge rojo si >15) |
| Órd. cambio | Número |
| Incidentes HSE | Número (badge rojo si >0) |
| Atraso (días) | +/- días vs. plan (rojo si +, verde si ≤0) |
| Presupuesto % | % usado (barra) |
| Estado | 🟢/🟡/🔴 |

Fila clickeable → abre un panel/modal con detalle del proyecto (opcional, "nice to have").

### 4.6 Panel de alertas (⚠️)
Lista de alertas tipo feed: RFIs vencidos, incidentes recientes, sobrecostos. Contenido en 6.4.

### 4.7 Footer
Crédito discreto: *"Demo construida con GitHub Copilot · Bruno Capuano · @elbruno"* + nota "Datos ficticios con fines ilustrativos".

---

## 5. Requisitos de interacción

- **Buscador** filtra la tabla en tiempo real por nombre/tipo/ubicación.
- **Filtros por Estado / Tipo / Ubicación** (chips o dropdowns) que actualizan tabla y gráficos.
- **Orden** ascendente/descendente al click en encabezado de columna.
- **Contadores KPI** con animación count-up al cargar (~800 ms).
- **Tooltips** en todos los gráficos y barras de progreso.
- **Toggle tema** claro/oscuro persistido en `localStorage`.
- **Responsive:** en móvil las KPIs se apilan, la tabla hace scroll horizontal o se colapsa a tarjetas.
- **Sin dependencias de red** salvo el CDN de Chart.js (o incluirlo local para robustez offline en la demo).

---

## 6. Datos mock (usar EXACTAMENTE estos)

> Todos los nombres de proyecto y empresa son **ficticios**. Ubicaciones en Perú/LATAM para conectar con la audiencia del Summit (Lima).

### 6.1 Proyectos (tabla principal)

```json
[
  { "id": "P-001", "proyecto": "Torre Miraflores", "tipo": "Residencial", "ubicacion": "Lima", "avance": 68, "rfis": 12, "ordenesCambio": 3, "incidentesHSE": 1, "atrasoDias": 8, "presupuesto": 71, "estado": "amarillo" },
  { "id": "P-002", "proyecto": "Puente Rímac Norte", "tipo": "Vial", "ubicacion": "Lima", "avance": 45, "rfis": 21, "ordenesCambio": 5, "incidentesHSE": 2, "atrasoDias": 15, "presupuesto": 52, "estado": "rojo" },
  { "id": "P-003", "proyecto": "Hospital Regional Arequipa", "tipo": "Salud", "ubicacion": "Arequipa", "avance": 82, "rfis": 7, "ordenesCambio": 1, "incidentesHSE": 0, "atrasoDias": -2, "presupuesto": 79, "estado": "verde" },
  { "id": "P-004", "proyecto": "Ampliación Aeropuerto Cusco", "tipo": "Aeroportuario", "ubicacion": "Cusco", "avance": 33, "rfis": 18, "ordenesCambio": 4, "incidentesHSE": 1, "atrasoDias": 6, "presupuesto": 38, "estado": "amarillo" },
  { "id": "P-005", "proyecto": "Centro Comercial San Isidro", "tipo": "Retail", "ubicacion": "Lima", "avance": 91, "rfis": 4, "ordenesCambio": 0, "incidentesHSE": 0, "atrasoDias": 0, "presupuesto": 88, "estado": "verde" },
  { "id": "P-006", "proyecto": "Planta de Tratamiento Callao", "tipo": "Sanitario", "ubicacion": "Callao", "avance": 57, "rfis": 14, "ordenesCambio": 2, "incidentesHSE": 3, "atrasoDias": 11, "presupuesto": 61, "estado": "rojo" },
  { "id": "P-007", "proyecto": "Autopista Sur — Tramo 4", "tipo": "Vial", "ubicacion": "Ica", "avance": 24, "rfis": 9, "ordenesCambio": 2, "incidentesHSE": 0, "atrasoDias": 3, "presupuesto": 27, "estado": "amarillo" },
  { "id": "P-008", "proyecto": "Metro de Lima L3 — Est. Central", "tipo": "Transporte", "ubicacion": "Lima", "avance": 12, "rfis": 26, "ordenesCambio": 6, "incidentesHSE": 2, "atrasoDias": 19, "presupuesto": 15, "estado": "rojo" }
]
```

### 6.2 KPIs (calculados desde los proyectos; hardcodear si es más simple)
- Proyectos activos: **8**
- RFIs abiertos: **111** (tendencia semanal: **+9**)
- Órdenes de cambio pendientes: **23**
- Incidentes HSE (mes): **9**
- Proyectos en riesgo (rojo): **3**

### 6.3 Recomendaciones del agente (panel 🤖)
```json
[
  { "prioridad": "alta",  "texto": "Priorizá Metro de Lima L3: 26 RFIs abiertos y +19 días de atraso — es el mayor riesgo de la cartera.", "proyecto": "Metro de Lima L3 — Est. Central" },
  { "prioridad": "alta",  "texto": "Planta de Tratamiento Callao: 3 incidentes HSE este mes — revisar plan de seguridad antes de continuar.", "proyecto": "Planta de Tratamiento Callao" },
  { "prioridad": "media", "texto": "5 RFIs en Torre Miraflores llevan >14 días sin respuesta — riesgo de bloqueo de frente de obra.", "proyecto": "Torre Miraflores" },
  { "prioridad": "media", "texto": "Puente Rímac Norte consumió 52% del presupuesto con 45% de avance — vigilar desviación de costos.", "proyecto": "Puente Rímac Norte" }
]
```

### 6.4 Alertas (panel ⚠️)
```json
[
  { "tipo": "rfi",       "texto": "12 RFIs vencidos (>14 días) en 3 proyectos" },
  { "tipo": "hse",       "texto": "Planta Callao: 2 incidentes HSE en las últimas 72 h" },
  { "tipo": "cronograma","texto": "Metro L3 sumó +4 días de atraso esta semana" },
  { "tipo": "costo",     "texto": "Puente Rímac Norte: desviación de costo proyectada +9%" }
]
```

### 6.5 Actividad de RFIs — últimos 7 días (para el gráfico de líneas)
```json
{
  "labels": ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
  "abiertos": [6, 9, 4, 11, 7, 3, 5],
  "cerrados": [3, 5, 6, 4, 8, 2, 6]
}
```

### 6.6 Top movers — atraso de cronograma esta semana (gráfico de barras)
```json
[
  { "proyecto": "Metro de Lima L3", "atrasoDias": 19 },
  { "proyecto": "Puente Rímac Norte", "atrasoDias": 15 },
  { "proyecto": "Planta de Tratamiento Callao", "atrasoDias": 11 },
  { "proyecto": "Torre Miraflores", "atrasoDias": 8 },
  { "proyecto": "Ampliación Aeropuerto Cusco", "atrasoDias": 6 }
]
```

---

## 7. Paleta y estilo sugeridos
- **Acento primario:** azul/teal "ingeniería" (`#0E7C86` o `#2563EB`).
- **Semáforo:** verde `#16A34A`, amarillo `#F59E0B`, rojo `#DC2626`.
- **Acento IA (panel de recomendaciones):** violeta/índigo (`#7C3AED`) para diferenciarlo.
- **Fondo oscuro:** `#0F172A` con tarjetas `#1E293B`. **Fondo claro:** `#F8FAFC` con tarjetas blancas.
- Tipografía: system-ui / Segoe UI / Inter. Bordes redondeados (12–16px), sombras suaves.

---

## 8. Criterios de aceptación (Definition of Done)
- [ ] La página carga en GitHub Pages desde la URL y se ve completa en <2 s.
- [ ] Responsive verificado en móvil (iPhone/Android) y en pantalla de proyección 16:9.
- [ ] Las 5 KPIs muestran los valores de 6.2 con animación count-up.
- [ ] Tabla con los 8 proyectos, ordenable, con búsqueda y filtros funcionando.
- [ ] Los 3 gráficos renderizan con los datos de 6.5 / 6.6 y el avance de cartera.
- [ ] Panel 🤖 con las 4 recomendaciones y panel ⚠️ con las 4 alertas.
- [ ] Toggle claro/oscuro funcional y persistente.
- [ ] Sello visible "Datos de demostración · AI Construction Summit 2026".
- [ ] Sin errores en consola.

---

## 9. Estructura de archivos sugerida
```
obra-pulse/
├── index.html
├── styles.css
├── app.js
├── data.json          # datos de la sección 6
├── README.md          # cómo publicar en GitHub Pages + URL en vivo
└── (opcional) assets/ # íconos, favicon 🏗️
```
Habilitar **GitHub Pages** desde `main` / raíz. Documentar la URL final en el README.

---

## 10. Prompt sugerido para pasarle a GitHub Copilot
> "Usá el archivo `PRD-obra-pulse-dashboard.md` como especificación. Construí una **single-page static web app** (HTML + CSS + JavaScript vanilla + Chart.js vía CDN) llamada **ObraPulse — AI Construction Command Center**, lista para publicar en **GitHub Pages**. Implementá todas las secciones (KPIs animadas, panel de recomendaciones del agente, gráficos, tabla de proyectos con búsqueda/filtros/orden, panel de alertas), usá **exactamente** los datos mock del PRD, hacela **responsive y con modo claro/oscuro**, y seguí la paleta sugerida. Incluí un README con los pasos para habilitar GitHub Pages. No uses backend."

---

*Datos ficticios con fines de demostración. Empresas y proyectos inventados.*
