// =============================================================
// ObraPulse — presenter.js
// Presenter Mode / Guided Tour engine
// =============================================================

(function () {
  'use strict';

  // ──────────────────────────────────────────
  // TOUR STEPS DEFINITION
  // ──────────────────────────────────────────
  const STEPS = [
    {
      id: 1,
      sectionId: 'main-header',
      spotlightClass: '',
      caption: '🏗️ Un centro de mando para todos sus proyectos.',
      notes: 'Esto es lo primero que veo a la mañana: todos los proyectos, en un solo lugar. Antes esto vivía en diez planillas distintas.',
    },
    {
      id: 2,
      sectionId: 'kpis',
      spotlightClass: '',
      caption: '📊 Todo el portafolio, de un vistazo.',
      notes: 'Proyectos activos, RFIs abiertos, órdenes de cambio, incidentes, proyectos en riesgo. Cinco números y ya sé cómo viene la semana.',
    },
    {
      id: 3,
      sectionId: 'agent-recommendations',
      spotlightClass: 'spotlight--ai',
      caption: '🤖 No solo muestra datos: ayuda a decidir.',
      notes: 'Este es el punto. El agente ya me dice por dónde empezar: el proyecto con más RFIs y más atraso. Produce la lectura; yo tomo la decisión.',
      specialEffect: 'ai-live',
    },
    {
      id: 4,
      sectionId: 'charts',
      spotlightClass: '',
      caption: '📈 Dónde está el riesgo esta semana.',
      notes: 'Acá veo la tendencia. El atraso no aparece de golpe: se ve venir. La IA me deja mirar esto todos los días, no una vez por mes.',
    },
    {
      id: 5,
      sectionId: 'projects-section',
      spotlightClass: '',
      rowHighlight: 'Metro de Lima L3',
      caption: '🔍 Del número al proyecto concreto.',
      notes: 'Bajo al proyecto crítico. 26 RFIs, casi 20 días de atraso. En un click paso del panorama al detalle accionable.',
    },
    {
      id: 6,
      sectionId: 'alerts',
      spotlightClass: '',
      caption: '⚠️ Lo que no puede esperar.',
      notes: 'Y esto es lo urgente: RFIs vencidos, un incidente de seguridad, una desviación de costo. La lista de hoy.',
    },
    {
      id: 7,
      sectionId: 'main-content',
      spotlightClass: 'spotlight--wide',
      caption: '💡 Imaginen esto para sus procesos.',
      notes: 'Esto es para construcción, pero la idea es suya: sus proyectos, sus decisiones, un agente que ayuda a priorizar. Y esta URL la comparto ahora.',
    },
  ];

  // ──────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────
  const state = {
    active: false,
    step: 1,           // 1-based
    notesVisible: false,
    timerActive: false,
    timerStartTime: null,
    timerInterval: null,
    prevSpotlightEl: null,
    prevRowEl: null,
  };

  // ──────────────────────────────────────────
  // DOM REFS (resolved after DOMContentLoaded)
  // ──────────────────────────────────────────
  let overlay, captionBar, captionText, progressContainer, stepCounter,
      controls, prevBtn, nextBtn, exitBtn, speakerNotes, notesText, timerEl,
      startBtn, refreshBtn;

  function resolveRefs() {
    overlay            = document.getElementById('tour-overlay');
    captionBar         = document.getElementById('tour-caption-bar');
    captionText        = document.getElementById('tour-caption-text');
    progressContainer  = document.getElementById('tour-progress');
    stepCounter        = document.getElementById('tour-step-counter');
    controls           = document.getElementById('tour-controls');
    prevBtn            = document.getElementById('tour-prev-btn');
    nextBtn            = document.getElementById('tour-next-btn');
    exitBtn            = document.getElementById('tour-exit-btn');
    speakerNotes       = document.getElementById('tour-speaker-notes');
    notesText          = document.getElementById('tour-notes-text');
    timerEl            = document.getElementById('tour-timer');
    startBtn           = document.getElementById('tour-start-btn');
    refreshBtn         = document.getElementById('refresh-data-btn');
  }

  // ──────────────────────────────────────────
  // PROGRESS BAR SETUP (dots)
  // ──────────────────────────────────────────
  function buildProgressDots() {
    if (!progressContainer) return;
    progressContainer.innerHTML = '';
    STEPS.forEach(step => {
      const dot = document.createElement('button');
      dot.className = 'tour-dot';
      dot.setAttribute('aria-label', `Ir al paso ${step.id}`);
      dot.dataset.step = step.id;
      dot.addEventListener('click', () => goToStep(step.id));
      progressContainer.appendChild(dot);
    });

    const counter = document.createElement('span');
    counter.id = 'tour-step-counter';
    progressContainer.appendChild(counter);
  }

  function updateProgressDots(stepNum) {
    if (!progressContainer) return;
    const dots = progressContainer.querySelectorAll('.tour-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i + 1 === stepNum);
    });
    const counter = document.getElementById('tour-step-counter');
    if (counter) counter.textContent = `${stepNum} / ${STEPS.length}`;
  }

  // ──────────────────────────────────────────
  // SPOTLIGHT helpers
  // ──────────────────────────────────────────
  function applySpotlight(step) {
    // Remove previous spotlight
    clearSpotlight();

    const el = document.getElementById(step.sectionId);
    if (!el) return;

    el.classList.add('tour-spotlight');
    if (step.spotlightClass) el.classList.add(step.spotlightClass);
    state.prevSpotlightEl = el;

    // Row highlight for step 5
    if (step.rowHighlight) {
      const rows = document.querySelectorAll('#projects-tbody tr');
      rows.forEach(row => {
        if (row.textContent.includes(step.rowHighlight)) {
          row.classList.add('tour-row-highlight');
          state.prevRowEl = row;
        }
      });
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearSpotlight() {
    if (state.prevSpotlightEl) {
      state.prevSpotlightEl.classList.remove('tour-spotlight', 'spotlight--ai', 'spotlight--wide');
      state.prevSpotlightEl = null;
    }
    if (state.prevRowEl) {
      state.prevRowEl.classList.remove('tour-row-highlight');
      state.prevRowEl = null;
    }
  }

  // ──────────────────────────────────────────
  // CAPTION & NOTES
  // ──────────────────────────────────────────
  function showCaption(step) {
    if (!captionText) return;
    captionText.textContent = step.caption;
    captionBar.classList.add('visible');
  }

  function showNotes(step) {
    if (!notesText || !speakerNotes) return;
    notesText.textContent = step.notes;
    if (state.notesVisible) {
      speakerNotes.classList.add('visible');
    }
  }

  // ──────────────────────────────────────────
  // HASH (deep-links)
  // ──────────────────────────────────────────
  function updateHash(stepNum) {
    history.replaceState(null, '', `#step-${stepNum}`);
  }

  function clearHash() {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  // ──────────────────────────────────────────
  // CORE NAVIGATION
  // ──────────────────────────────────────────
  function goToStep(stepNum) {
    const idx = stepNum - 1;
    if (idx < 0 || idx >= STEPS.length) return;

    state.step = stepNum;
    const step = STEPS[idx];

    applySpotlight(step);
    showCaption(step);
    showNotes(step);
    updateProgressDots(stepNum);
    updateHash(stepNum);

    // Trigger special effects
    if (step.specialEffect === 'ai-live' && typeof window.triggerAILiveEffect === 'function') {
      window.triggerAILiveEffect();
    }
  }

  function nextStep() {
    if (state.step < STEPS.length) goToStep(state.step + 1);
  }

  function prevStep() {
    if (state.step > 1) goToStep(state.step - 1);
  }

  // ──────────────────────────────────────────
  // START / EXIT
  // ──────────────────────────────────────────
  function startTour(stepNum) {
    if (state.active) { goToStep(stepNum || 1); return; }
    state.active = true;

    document.body.classList.add('tour-active');
    buildProgressDots();

    overlay.classList.add('active');

    // Show caption bar and controls
    captionBar.classList.add('visible');

    // Update button label
    if (startBtn) {
      startBtn.textContent = '⏹ Salir';
      startBtn.setAttribute('aria-label', 'Salir del modo presentación');
      startBtn.onclick = exitTour;
    }

    goToStep(stepNum || 1);
  }

  function exitTour() {
    if (!state.active) return;
    state.active = false;
    state.notesVisible = false;

    document.body.classList.remove('tour-active');
    clearSpotlight();

    overlay.classList.remove('active');
    captionBar.classList.remove('visible');
    speakerNotes.classList.remove('visible');

    clearHash();

    if (startBtn) {
      startBtn.textContent = '▶ Modo presentación';
      startBtn.setAttribute('aria-label', 'Iniciar modo presentación');
      startBtn.onclick = () => startTour(1);
    }

    // Return focus to main content
    document.getElementById('main-header')?.focus?.();
  }

  // ──────────────────────────────────────────
  // TOGGLE SPEAKER NOTES
  // ──────────────────────────────────────────
  function toggleNotes() {
    if (!state.active) return;
    state.notesVisible = !state.notesVisible;
    speakerNotes.classList.toggle('visible', state.notesVisible);
  }

  // ──────────────────────────────────────────
  // FULLSCREEN
  // ──────────────────────────────────────────
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ──────────────────────────────────────────
  // TIMER
  // ──────────────────────────────────────────
  function toggleTimer() {
    if (!timerEl) return;
    state.timerActive = !state.timerActive;
    timerEl.classList.toggle('visible', state.timerActive);

    if (state.timerActive) {
      state.timerStartTime = Date.now();
      state.timerInterval = setInterval(updateTimerDisplay, 500);
      updateTimerDisplay();
    } else {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    if (!timerEl || !state.timerStartTime) return;
    const elapsed = Math.floor((Date.now() - state.timerStartTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    timerEl.textContent = `⏱ ${mm}:${ss}`;
  }

  // ──────────────────────────────────────────
  // REFRESH DATA
  // ──────────────────────────────────────────
  function handleRefresh() {
    if (typeof window.randomizeData !== 'function') return;
    const fresh = window.randomizeData();
    if (fresh && typeof window.rerenderDashboard === 'function') {
      window.rerenderDashboard(fresh);
    }
    if (typeof window.resetUpdatedStamp === 'function') {
      window.resetUpdatedStamp();
    }

    // Visual feedback on the button
    const btn = document.getElementById('refresh-data-btn');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = '✅ Actualizado';
      setTimeout(() => { btn.textContent = original; }, 1200);
    }
  }

  // ──────────────────────────────────────────
  // KEYBOARD HANDLER
  // ──────────────────────────────────────────
  function handleKeydown(e) {
    // Don't intercept when typing in inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    switch (e.key) {
      case 'T':
      case 't':
        if (!state.active) startTour(1);
        break;

      case 'ArrowRight':
      case ' ':
        if (state.active) { e.preventDefault(); nextStep(); }
        break;

      case 'ArrowLeft':
        if (state.active) { e.preventDefault(); prevStep(); }
        break;

      case 'Escape':
        if (state.active) exitTour();
        break;

      case 'N':
      case 'n':
        if (state.active) toggleNotes();
        break;

      case 'F':
      case 'f':
        toggleFullscreen();
        break;

      case 'C':
      case 'c':
        toggleTimer();
        break;
    }
  }

  // ──────────────────────────────────────────
  // HASH ON LOAD (deep-links)
  // ──────────────────────────────────────────
  function handleHashOnLoad() {
    const hash = window.location.hash;
    const match = hash.match(/^#step-([1-7])$/);
    if (match) {
      const stepNum = parseInt(match[1], 10);
      // Defer until app.js has rendered
      setTimeout(() => startTour(stepNum), 300);
    }
  }

  // ──────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────
  function init() {
    resolveRefs();

    // Wire up start button
    if (startBtn) {
      startBtn.addEventListener('click', () => startTour(1));
    }

    // Wire up refresh button
    if (refreshBtn) {
      refreshBtn.addEventListener('click', handleRefresh);
    }

    // Wire up in-caption controls
    if (prevBtn) prevBtn.addEventListener('click', prevStep);
    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (exitBtn) exitBtn.addEventListener('click', exitTour);

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    // Deep-link
    handleHashOnLoad();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
