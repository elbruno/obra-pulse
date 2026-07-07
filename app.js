// === ObraPulse app.js ===

// ─────────────────────────────────────────────
// 1. THEME MANAGEMENT (runs immediately)
// ─────────────────────────────────────────────
const THEME_KEY = 'obra-pulse-theme';
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || 'dark';
  applyTheme(theme);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
  updateChartTheme();
});

initTheme();

// ─────────────────────────────────────────────
// APP STATE
// ─────────────────────────────────────────────
let allProyectos = [];
let sortColumn = null;
let sortDir = 0; // 0: original, 1: asc, -1: desc
let charts = {};

// ─────────────────────────────────────────────
// 2. MAIN INIT
// ─────────────────────────────────────────────
fetch('./data.json')
  .then(r => r.json())
  .then(data => {
    allProyectos = data.proyectos;
    renderKPIs();
    renderRecommendations(data.recomendaciones);
    renderAlerts(data.alertas);
    renderTable(allProyectos);
    initFilters(data.proyectos);
    initSearch();
    initSort();
    initCharts(data);
  })
  .catch(err => console.error('[ObraPulse] Error loading data.json:', err));

// ─────────────────────────────────────────────
// 3. KPI COUNT-UP ANIMATION
// ─────────────────────────────────────────────
function renderKPIs() {
  document.querySelectorAll('.kpi-value[data-target]').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 800;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

// ─────────────────────────────────────────────
// 4. AI RECOMMENDATIONS PANEL
// ─────────────────────────────────────────────
function renderRecommendations(recomendaciones) {
  const list = document.getElementById('recommendations-list');
  list.innerHTML = recomendaciones.map(r => {
    const badge = r.prioridad === 'alta' ? '🔴' : '🟡';
    return `
      <div class="recommendation-item recommendation-item--${r.prioridad}">
        <span class="priority-badge priority-badge--${r.prioridad}">${badge}</span>
        <div class="rec-body">
          <p class="recommendation-text">${r.texto}</p>
          <span class="recommendation-project">${r.proyecto}</span>
        </div>
      </div>`;
  }).join('');
}

// ─────────────────────────────────────────────
// 5. ALERTS PANEL
// ─────────────────────────────────────────────
function renderAlerts(alertas) {
  const iconMap = { rfi: '📋', hse: '⚠️', cronograma: '🕐', costo: '💰' };
  const list = document.getElementById('alerts-list');
  list.innerHTML = alertas.map(a => {
    const icon = iconMap[a.tipo] || '🔔';
    return `
      <div class="alert-item alert-item--${a.tipo}">
        <span class="alert-icon alert-icon--${a.tipo}">${icon}</span>
        <p class="alert-text">${a.texto}</p>
      </div>`;
  }).join('');
}

// ─────────────────────────────────────────────
// 6. PROJECTS TABLE
// ─────────────────────────────────────────────
function estadoEmoji(estado) {
  return estado === 'verde' ? '🟢' : estado === 'amarillo' ? '🟡' : '🔴';
}

function estadoLabel(estado) {
  return estado === 'verde' ? 'Verde' : estado === 'amarillo' ? 'Amarillo' : 'Rojo';
}

function progressBar(value) {
  return `<div class="progress-bar-container"><div class="progress-bar-track"><div class="progress-bar" style="width:${value}%"></div></div><span class="progress-label">${value}%</span></div>`;
}

function renderTable(proyectos) {
  const tbody = document.getElementById('projects-tbody');
  if (!proyectos.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="no-results">No se encontraron proyectos</td></tr>';
    return;
  }

  tbody.innerHTML = proyectos.map(p => {
    const atrasoCls = p.atrasoDias > 0 ? 'text-danger' : 'text-success';
    const atrasoTxt = p.atrasoDias > 0 ? `+${p.atrasoDias}` : `${p.atrasoDias}`;
    const rfiCls = p.rfis > 15 ? 'badge-danger' : '';
    const hseCls = p.incidentesHSE > 0 ? 'badge-danger' : '';

    return `
      <tr>
        <td>
          <span class="project-name">${p.proyecto}</span>
          <span class="status-chip ${p.estado}">${estadoEmoji(p.estado)}</span>
        </td>
        <td>${p.tipo}</td>
        <td>${p.ubicacion}</td>
        <td>${progressBar(p.avance)}</td>
        <td><span class="${rfiCls}">${p.rfis}</span></td>
        <td>${p.ordenesCambio}</td>
        <td><span class="${hseCls}">${p.incidentesHSE}</span></td>
        <td><span class="${atrasoCls}">${atrasoTxt}</span></td>
        <td>${progressBar(p.presupuesto)}</td>
        <td>${estadoEmoji(p.estado)} ${estadoLabel(p.estado)}</td>
      </tr>`;
  }).join('');
}

// ─────────────────────────────────────────────
// 7. SEARCH
// ─────────────────────────────────────────────
function initSearch() {
  document.getElementById('search-input').addEventListener('input', applyFilters);
}

// ─────────────────────────────────────────────
// 8. FILTERS
// ─────────────────────────────────────────────
function initFilters(proyectos) {
  // Populate tipo options dynamically
  const tipos = [...new Set(proyectos.map(p => p.tipo))].sort();
  const filterTipo = document.getElementById('filter-tipo');
  filterTipo.innerHTML = '<option value="">Todos los tipos</option>' +
    tipos.map(t => `<option value="${t}">${t}</option>`).join('');

  // Populate ubicacion options dynamically
  const ubicaciones = [...new Set(proyectos.map(p => p.ubicacion))].sort();
  const filterUbicacion = document.getElementById('filter-ubicacion');
  filterUbicacion.innerHTML = '<option value="">Todas las ubicaciones</option>' +
    ubicaciones.map(u => `<option value="${u}">${u}</option>`).join('');

  // Estado filter is already in HTML, just bind event
  ['filter-estado', 'filter-tipo', 'filter-ubicacion'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
}

// ─────────────────────────────────────────────
// 9. COLUMN SORTING
// ─────────────────────────────────────────────
function initSort() {
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-column');

      if (sortColumn === col) {
        sortDir = sortDir === 1 ? -1 : sortDir === -1 ? 0 : 1;
      } else {
        sortColumn = col;
        sortDir = 1;
      }

      if (sortDir === 0) sortColumn = null;

      // Update visual indicators
      document.querySelectorAll('th.sortable').forEach(t => {
        const base = t.textContent.replace(/ [▲▼]$/, '');
        t.textContent = base;
        t.classList.remove('sort-asc', 'sort-desc');
      });

      if (sortColumn && sortDir !== 0) {
        const indicator = sortDir === 1 ? ' ▲' : ' ▼';
        th.textContent = th.textContent.replace(/ [▲▼]$/, '') + indicator;
        th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
      }

      applyFilters();
    });
  });
}

// ─────────────────────────────────────────────
// APPLY FILTERS (called on any change)
// ─────────────────────────────────────────────
const fieldMap = {
  proyecto:      p => p.proyecto,
  tipo:          p => p.tipo,
  ubicacion:     p => p.ubicacion,
  avance:        p => p.avance,
  rfis:          p => p.rfis,
  ordenesCambio: p => p.ordenesCambio,
  incidentesHSE: p => p.incidentesHSE,
  atrasoDias:    p => p.atrasoDias,
  presupuesto:   p => p.presupuesto,
  estado:        p => p.estado,
};

function applyFilters() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const estado = document.getElementById('filter-estado').value;
  const tipo = document.getElementById('filter-tipo').value;
  const ubicacion = document.getElementById('filter-ubicacion').value;

  let result = allProyectos.filter(p => {
    const matchSearch = !search ||
      p.proyecto.toLowerCase().includes(search) ||
      p.tipo.toLowerCase().includes(search) ||
      p.ubicacion.toLowerCase().includes(search);
    const matchEstado = !estado || p.estado === estado;
    const matchTipo = !tipo || p.tipo === tipo;
    const matchUbicacion = !ubicacion || p.ubicacion === ubicacion;
    return matchSearch && matchEstado && matchTipo && matchUbicacion;
  });

  if (sortColumn && sortDir !== 0) {
    const getter = fieldMap[sortColumn] || (p => p[sortColumn]);
    result = [...result].sort((a, b) => {
      const va = getter(a);
      const vb = getter(b);
      if (va < vb) return -1 * sortDir;
      if (va > vb) return 1 * sortDir;
      return 0;
    });
  }

  renderTable(result);
  updatePortfolioChart(result);
}

// ─────────────────────────────────────────────
// 10. CHART.JS CHARTS
// ─────────────────────────────────────────────
function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: isDark ? '#e2e8f0' : '#1e293b',
    grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  };
}

function initCharts(data) {
  const { text, grid } = getChartColors();
  Chart.defaults.color = text;

  // Chart 1: RFI Activity Line Chart
  charts.rfi = new Chart(document.getElementById('chart-rfi-activity'), {
    type: 'line',
    data: {
      labels: data.rfiActividad.labels,
      datasets: [
        {
          label: 'RFIs Abiertos',
          data: data.rfiActividad.abiertos,
          borderColor: '#DC2626',
          backgroundColor: 'rgba(220,38,38,0.1)',
          tension: 0.4,
          fill: false,
          pointRadius: 4,
        },
        {
          label: 'RFIs Cerrados',
          data: data.rfiActividad.cerrados,
          borderColor: '#16A34A',
          backgroundColor: 'rgba(22,163,74,0.1)',
          tension: 0.4,
          fill: false,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        x: { grid: { color: grid } },
        y: { grid: { color: grid }, beginAtZero: true },
      },
    },
  });

  // Chart 2: Top Movers Horizontal Bar Chart
  const movers = [...data.topMovers].reverse();
  charts.movers = new Chart(document.getElementById('chart-top-movers'), {
    type: 'bar',
    data: {
      labels: movers.map(m => m.proyecto),
      datasets: [
        {
          label: 'Atraso (días)',
          data: movers.map(m => m.atrasoDias),
          backgroundColor: '#F59E0B',
          borderColor: '#D97706',
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: grid }, beginAtZero: true },
        y: { grid: { color: grid } },
      },
    },
  });

  // Chart 3: Portfolio Donut
  charts.portfolio = new Chart(document.getElementById('chart-portfolio'), {
    type: 'doughnut',
    data: buildPortfolioData(data.proyectos),
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: { display: true, position: 'bottom' },
      },
    },
  });
}

function buildPortfolioData(proyectos) {
  const verde = proyectos.filter(p => p.estado === 'verde').length;
  const amarillo = proyectos.filter(p => p.estado === 'amarillo').length;
  const rojo = proyectos.filter(p => p.estado === 'rojo').length;
  return {
    labels: ['En tiempo', 'En riesgo leve', 'En riesgo crítico'],
    datasets: [{
      data: [verde, amarillo, rojo],
      backgroundColor: ['#16A34A', '#F59E0B', '#DC2626'],
      borderWidth: 2,
    }],
  };
}

function updatePortfolioChart(filteredProyectos) {
  if (!charts.portfolio) return;
  const newData = buildPortfolioData(filteredProyectos);
  charts.portfolio.data = newData;
  charts.portfolio.update();
}

function updateChartTheme() {
  if (!charts.rfi) return;
  const { text, grid } = getChartColors();
  Chart.defaults.color = text;

  [charts.rfi, charts.movers, charts.portfolio].forEach(chart => {
    if (!chart) return;
    if (chart.options.scales) {
      Object.values(chart.options.scales).forEach(scale => {
        if (scale.grid) scale.grid.color = grid;
      });
    }
    chart.update();
  });
}
