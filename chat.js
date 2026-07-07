// =============================================================
// ObraPulse — chat.js
// Scripted natural-language chat, live highlights, live alert, modal
// =============================================================

(function () {
  'use strict';

  const SCRIPTED = [
    {
      q: '¿Cuál es el proyecto con más riesgo?',
      a: 'Metro de Lima L3 — Estación Central: 26 RFIs abiertos y +19 días de atraso. Es tu mayor exposición esta semana.',
      highlight: 'row:P-008',
    },
    {
      q: '¿Dónde tengo problemas de seguridad?',
      a: 'Planta de Tratamiento Callao: 3 incidentes HSE este mes. Recomiendo revisar el plan de seguridad antes de continuar.',
      highlight: 'row:P-006',
    },
    {
      q: '¿Qué proyectos se están pasando de presupuesto?',
      a: 'Puente Rímac Norte: consumió 52% del presupuesto con 45% de avance. Desviación proyectada: +9%. Vigilar de cerca.',
      highlight: 'row:P-002',
    },
    {
      q: 'Resúmeme la semana en una frase.',
      a: 'Cartera estable salvo 3 proyectos en rojo. El foco: Metro L3 por atraso y Callao por seguridad. Presupuesto general bajo control.',
      highlight: 'kpi:enRiesgo',
    },
    {
      q: '¿Por dónde empiezo hoy?',
      a: '1) Metro L3 — desatascar RFIs. 2) Callao — revisar seguridad. 3) Rímac Norte — controlar costos. En ese orden.',
      highlight: 'panel:recomendaciones',
    },
  ];

  const DRAFT_TEXT =
    'Equipo: tenemos 26 RFIs abiertos y 19 días de atraso acumulado. Necesitamos desatascar los 5 RFIs más antiguos antes del viernes y reunirnos mañana 15 min para reasignar frentes. Adjunto el detalle.';

  const ACTION_CHIP = 'Redacta un aviso para el equipo del Metro L3.';

  const state = {
    aiEnabled: true,
    busy: false,
    liveAlertTimer: null,
    toastTimer: null,
  };

  let els = {};

  function q(selector) {
    return document.querySelector(selector);
  }

  function qAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function resolveRefs() {
    els = {
      toggle: document.getElementById('ia-toggle-btn'),
      panel: document.getElementById('chat-panel'),
      history: document.getElementById('chat-history'),
      suggestions: document.getElementById('chat-suggestions'),
      form: document.getElementById('chat-form'),
      input: document.getElementById('chat-input'),
      status: q('.chat-panel__status'),
      aiOffNote: document.getElementById('ai-off-note'),
      recList: document.getElementById('recommendations-list'),
      modal: document.getElementById('draft-modal'),
      modalText: document.getElementById('draft-modal-text'),
      draftBtn: document.getElementById('draft-action-btn'),
      toast: document.getElementById('live-toast'),
    };
  }

  function renderSuggestions() {
    if (!els.suggestions) return;
    const chips = [...SCRIPTED.map(s => s.q), ACTION_CHIP];
    els.suggestions.innerHTML = chips
      .map(
        chip =>
          `<button type="button" class="chat-chip" data-chip="${chip.replace(/"/g, '&quot;')}">${chip}</button>`
      )
      .join('');
  }

  function appendMessage(role, text, options = {}) {
    const wrap = document.createElement('div');
    wrap.className = `chat-message chat-message--${role}`;
    if (options.typing) wrap.classList.add('chat-message--typing');

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    avatar.textContent = role === 'user' ? 'Yo' : 'IA';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = options.typing ? '' : text;

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    els.history.appendChild(wrap);
    els.history.scrollTop = els.history.scrollHeight;

    return { wrap, bubble };
  }

  function setStatus(text) {
    if (els.status) els.status.textContent = text;
  }

  function showToast(text) {
    if (!els.toast) return;
    els.toast.textContent = text;
    els.toast.classList.add('visible');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => els.toast.classList.remove('visible'), 2500);
  }

  function findScriptedAnswer(question) {
    const cleaned = normalize(question);

    if (cleaned.includes('aviso') || cleaned.includes('metro l3') || cleaned.includes('mensaje')) {
      return { type: 'draft' };
    }

    if (cleaned.includes('riesgo') || cleaned.includes('peligro')) return SCRIPTED[0];
    if (cleaned.includes('seguridad') || cleaned.includes('hse')) return SCRIPTED[1];
    if (cleaned.includes('presupuesto') || cleaned.includes('costo') || cleaned.includes('costos')) return SCRIPTED[2];
    if (cleaned.includes('semana') || cleaned.includes('resum')) return SCRIPTED[3];
    if (cleaned.includes('empiezo') || cleaned.includes('prioridad') || cleaned.includes('por donde')) return SCRIPTED[4];

    return null;
  }

  function applyHighlight(target) {
    if (typeof window.highlightDashboardTarget === 'function') {
      window.highlightDashboardTarget(target);
      return;
    }

    qAll('.dashboard-target-highlight').forEach(el => el.classList.remove('dashboard-target-highlight'));
  }

  function typeAgentReply(answer, target) {
    setStatus('⏺ analizando…');
    state.busy = true;

    const { bubble, wrap } = appendMessage('agent', '', { typing: true });

    const startTyping = () => {
      setStatus('● en línea');
      bubble.textContent = '';
      wrap.classList.remove('chat-message--typing');

      let i = 0;
      const interval = setInterval(() => {
        i += 1;
        bubble.textContent = answer.slice(0, i);
        els.history.scrollTop = els.history.scrollHeight;
        if (i >= answer.length) {
          clearInterval(interval);
          state.busy = false;
          if (target) setTimeout(() => applyHighlight(target), 150);
        }
      }, 25);
    };

    setTimeout(startTyping, 800);
  }

  function openDraftModal() {
    if (!els.modal || !els.modalText) return;
    els.modalText.value = DRAFT_TEXT;
    els.modal.classList.add('visible');
    els.modal.setAttribute('aria-hidden', 'false');
    applyHighlight('panel:recomendaciones');
  }

  function closeDraftModal() {
    if (!els.modal) return;
    els.modal.classList.remove('visible');
    els.modal.setAttribute('aria-hidden', 'true');
  }

  function handleDraftAction(action) {
    switch (action) {
      case 'copy':
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(DRAFT_TEXT);
        showToast('Borrador copiado.');
        break;
      case 'send':
        showToast('Envío manual: decisión humana.');
        break;
      case 'edit':
        showToast('Abrí el borrador para editarlo.');
        break;
      case 'close':
        closeDraftModal();
        break;
    }
  }

  function send(question, opts = {}) {
    if (!question) return;
    if (!state.aiEnabled && !opts.force) return;

    appendMessage('user', question);

    const result = findScriptedAnswer(question);
    if (!result) {
      setTimeout(() => {
        appendMessage('agent', 'Con estos datos de demostración puedo responder sobre riesgo, seguridad, presupuesto y prioridades. Probá una de las sugerencias 👇');
        state.busy = false;
      }, 500);
      return;
    }

    if (result.type === 'draft') {
      appendMessage('agent', 'Produje el borrador. La decisión de enviarlo sigue siendo humana.');
      openDraftModal();
      return;
    }

    typeAgentReply(result.a, result.highlight);
  }

  function sendPreset(question) {
    send(question, { force: true });
  }

  function toggleAI(force) {
    state.aiEnabled = typeof force === 'boolean' ? force : !state.aiEnabled;
    document.body.classList.toggle('ai-off', !state.aiEnabled);
    if (els.toggle) {
      els.toggle.textContent = state.aiEnabled ? 'Con IA' : 'Sin IA';
      els.toggle.setAttribute('aria-pressed', String(state.aiEnabled));
    }
    if (els.panel) {
      els.panel.style.display = state.aiEnabled ? '' : 'none';
    }
    if (els.draftBtn) {
      els.draftBtn.style.display = state.aiEnabled ? '' : 'none';
    }
  }

  function initLiveAlert() {
    clearTimeout(state.liveAlertTimer);
    state.liveAlertTimer = setTimeout(() => {
      if (typeof window.triggerLiveAlert === 'function') window.triggerLiveAlert();
    }, 20000);
  }

  function wireRecommendationClicks() {
    if (!els.recList) return;
    els.recList.addEventListener('click', event => {
      const item = event.target.closest('.recommendation-item');
      if (!item || item.classList.contains('is-resolved')) return;
      const id = item.dataset.projectId;
      if (!id) return;

      item.classList.add('is-resolved');
      if (typeof window.setRecommendationResolved === 'function') {
        window.setRecommendationResolved(id);
      }
      applyHighlight(`row:${id}`);
      if (typeof window.adjustRfiKpi === 'function') {
        window.adjustRfiKpi(-1);
      }
      showToast('Recomendación marcada como resuelta.');
    });

    els.recList.addEventListener('keydown', event => {
      const item = event.target.closest('.recommendation-item');
      if (!item || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      item.click();
    });
  }

  function init() {
    resolveRefs();
    renderSuggestions();
    wireRecommendationClicks();
    initLiveAlert();

    if (els.toggle) {
      els.toggle.addEventListener('click', () => toggleAI());
    }

    if (els.form) {
      els.form.addEventListener('submit', event => {
        event.preventDefault();
        const value = els.input.value.trim();
        if (!value) return;
        els.input.value = '';
        send(value);
      });
    }

    if (els.suggestions) {
      els.suggestions.addEventListener('click', event => {
        const chip = event.target.closest('.chat-chip');
        if (!chip) return;
        const value = chip.dataset.chip || chip.textContent;
        if (value === ACTION_CHIP) {
          openDraftModal();
          return;
        }
        els.input.value = value;
        send(value);
      });
    }

    if (els.draftBtn) {
      els.draftBtn.addEventListener('click', openDraftModal);
    }

    if (els.modal) {
      els.modal.addEventListener('click', event => {
        if (event.target === els.modal) closeDraftModal();
      });
    }

    qAll('[data-draft-action]').forEach(btn => {
      btn.addEventListener('click', () => handleDraftAction(btn.dataset.draftAction));
    });

    window.obraPulseChat = {
      send: sendPreset,
      toggleAI,
      openDraft: openDraftModal,
      closeDraft: closeDraftModal,
      sendQuestion: send,
    };

    // Show the chat panel by default.
    toggleAI(true);

    // Seed the conversation with one helpful prompt when the panel loads.
    appendMessage('agent', 'Puedo responder sobre riesgo, seguridad, presupuesto y prioridades. Probá una sugerencia 👇');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
