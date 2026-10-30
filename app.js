/* ============================
   APP.JS — Portfolio Logic
   Kouru Rudra Teja Portfolio
   ============================ */

'use strict';

// ─── THEME TOGGLE ───────────────────────────────────────────────
(function initTheme() {
  const stored = localStorage.getItem('krt-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', stored);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('krt-theme', next);
}

document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

// ─── TOAST ──────────────────────────────────────────────────────
let toastTimer = null;

function showToast(message, icon = 'check') {
  const toast = document.getElementById('toast');
  const iconSvg = icon === 'check'
    ? `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`
    : `<svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─── COPY EMAIL ─────────────────────────────────────────────────
function copyEmail(email) {
  navigator.clipboard.writeText(email).then(() => {
    showToast('Email copied to clipboard!');
  }).catch(() => {
    // Fallback
    const el = document.createElement('textarea');
    el.value = email;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('Email copied to clipboard!');
  });
}

// Wire up all copy-email buttons
document.querySelectorAll('[data-email]').forEach(btn => {
  btn.addEventListener('click', () => copyEmail(btn.getAttribute('data-email')));
});

// ─── COMMAND PALETTE ────────────────────────────────────────────
const cmdOverlay = document.getElementById('cmd-overlay');
const cmdInput   = document.getElementById('cmd-input');
const cmdList    = document.getElementById('cmd-list');

function openCmd() {
  cmdOverlay.setAttribute('aria-hidden', 'false');
  cmdOverlay.classList.add('open');
  setTimeout(() => cmdInput.focus(), 50);
  filterCmdItems('');
}

function closeCmd() {
  cmdOverlay.setAttribute('aria-hidden', 'true');
  cmdOverlay.classList.remove('open');
  cmdInput.value = '';
}

document.getElementById('cmd-trigger-btn').addEventListener('click', openCmd);

cmdOverlay.addEventListener('click', e => {
  if (e.target === cmdOverlay) closeCmd();
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    cmdOverlay.classList.contains('open') ? closeCmd() : openCmd();
  }
  if (e.key === 'Escape' && cmdOverlay.classList.contains('open')) {
    closeCmd();
  }
  if (e.key === 'ArrowDown' && cmdOverlay.classList.contains('open')) {
    e.preventDefault();
    moveCmdSelection(1);
  }
  if (e.key === 'ArrowUp' && cmdOverlay.classList.contains('open')) {
    e.preventDefault();
    moveCmdSelection(-1);
  }
  if (e.key === 'Enter' && cmdOverlay.classList.contains('open')) {
    e.preventDefault();
    const selected = cmdList.querySelector('.cmd-item.selected');
    if (selected) triggerCmdItem(selected);
  }
});

cmdInput.addEventListener('input', () => filterCmdItems(cmdInput.value.trim().toLowerCase()));

function filterCmdItems(query) {
  const items = cmdList.querySelectorAll('.cmd-item');
  const groups = cmdList.querySelectorAll('.cmd-group-label');

  // Clear selection
  items.forEach(item => item.classList.remove('selected'));

  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? '' : 'none';
  });

  // Auto-select first visible
  const visible = cmdList.querySelector('.cmd-item:not([style*="none"])');
  if (visible) visible.classList.add('selected');

  // Hide group labels if no visible items below
  groups.forEach(group => {
    let next = group.nextElementSibling;
    let hasVisible = false;
    while (next && !next.classList.contains('cmd-group-label')) {
      if (next.style.display !== 'none') { hasVisible = true; break; }
      next = next.nextElementSibling;
    }
    group.style.display = hasVisible ? '' : 'none';
  });
}

function moveCmdSelection(dir) {
  const items = Array.from(cmdList.querySelectorAll('.cmd-item:not([style*="none"])'));
  const current = cmdList.querySelector('.cmd-item.selected');
  let idx = items.indexOf(current);
  idx = (idx + dir + items.length) % items.length;
  items.forEach(i => i.classList.remove('selected'));
  if (items[idx]) {
    items[idx].classList.add('selected');
    items[idx].scrollIntoView({ block: 'nearest' });
  }
}

function triggerCmdItem(item) {
  const action = item.getAttribute('data-action');
  const target = item.getAttribute('data-target');

  switch (action) {
    case 'scroll':
      closeCmd();
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      break;
    case 'copy-email':
      closeCmd();
      copyEmail('rudrateja012@gmail.com');
      break;
    case 'github':
      closeCmd();
      window.open('https://github.com/rudrateja012', '_blank', 'noopener,noreferrer');
      break;
    case 'linkedin':
      closeCmd();
      window.open('https://linkedin.com/in/rudra-teja-kouru', '_blank', 'noopener,noreferrer');
      break;
    case 'theme':
      closeCmd();
      toggleTheme();
      showToast('Theme toggled');
      break;
  }
}

cmdList.querySelectorAll('.cmd-item').forEach(item => {
  item.addEventListener('click', () => triggerCmdItem(item));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter') triggerCmdItem(item);
  });
});

// ─── PROJECT MODAL DATA ─────────────────────────────────────────
const PROJECT_DATA = {
  scholarcampt: {
    title: 'ScholarCamp PRIE',
    tagline: 'Full-Stack Exam Preparation & Performance Readiness Intelligence Engine',
    stack: ['Next.js', 'React', 'Python', 'XGBoost', 'SQLite', 'JWT Auth'],
    bullets: [
      'Engineered an end-to-end question practice engine with <strong>topic-level score breakdowns</strong> and session analytics.',
      'Integrated an <strong>XGBoost predictive model</strong> that evaluates and forecasts exam readiness from historical attempt data, accuracy deltas, and study time signals.',
      'Built <strong>role-based access control</strong> for students and administrators with secure JWT session handling.',
      'Implemented adaptive quiz flow: questions surface based on weak-topic detection from past attempt history.',
    ],
    demo: true,
  },
  gymmgmt: {
    title: 'Smart GymPro',
    tagline: 'Containerized Multi-Role Gym Management Platform',
    stack: ['React', 'Flask', 'Python', 'Docker', 'SQLite', 'REST APIs'],
    bullets: [
      'Developed a complete fitness center platform with <strong>three role views</strong>: Admin, Trainer, and Member — each with dedicated dashboards.',
      'Built <strong>RESTful API endpoints</strong> for workout scheduling, membership renewals, attendance tracking, and goal management.',
      'Packaged the entire client-server workflow using <strong>Docker</strong> for reproducible local and cloud deployment.',
      'Designed a normalized SQLite schema with <strong>relation integrity</strong> across members, sessions, and workout plans.',
    ],
    api: true,
  },
};

// ─── MODAL RENDER ───────────────────────────────────────────────
const modalOverlay = document.getElementById('project-modal');
const modalBody    = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close-btn');

function openModal(projectKey) {
  const data = PROJECT_DATA[projectKey];
  if (!data) return;

  const stackHTML = data.stack.map(s => `<span class="tag">${s}</span>`).join('');
  const bulletsHTML = data.bullets.map(b => `<li>${b}</li>`).join('');

  let interactiveBlock = '';

  if (data.demo) {
    interactiveBlock = `
      <p class="modal-section-title">XGBoost Model Demo</p>
      <div class="demo-widget">
        <div class="demo-widget-title">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          READINESS PREDICTION ENGINE — LIVE DEMO
        </div>
        <div class="demo-inputs">
          <div class="demo-input-group">
            <label>STUDY HOURS / WEEK</label>
            <input type="range" id="demo-hours" min="1" max="40" value="15" oninput="updateDemo()" />
            <span class="demo-input-val" id="demo-hours-val">15 hrs</span>
          </div>
          <div class="demo-input-group">
            <label>ACCURACY RATE (%)</label>
            <input type="range" id="demo-accuracy" min="10" max="100" value="70" oninput="updateDemo()" />
            <span class="demo-input-val" id="demo-accuracy-val">70%</span>
          </div>
        </div>
        <div class="demo-output">
          <span class="demo-output-label">Predicted Readiness Score</span>
          <span class="demo-output-score" id="demo-score">72.4%</span>
        </div>
      </div>`;
  }

  if (data.api) {
    interactiveBlock = `
      <p class="modal-section-title">API Response Inspector</p>
      <div class="api-widget">
        <div class="api-tabs">
          <button class="api-tab active" onclick="switchApiTab(this, 'members')" id="tab-members">GET /members</button>
          <button class="api-tab" onclick="switchApiTab(this, 'schedule')" id="tab-schedule">POST /schedule</button>
          <button class="api-tab" onclick="switchApiTab(this, 'goals')" id="tab-goals">GET /goals</button>
        </div>
        <div class="api-code" id="api-code-block">${getApiPayload('members')}</div>
      </div>`;
  }

  modalBody.innerHTML = `
    <h2 class="modal-project-title" id="modal-title">${data.title}</h2>
    <p class="modal-tagline">${data.tagline}</p>
    <p class="modal-section-title">Stack</p>
    <div class="modal-stack">${stackHTML}</div>
    <p class="modal-section-title">Architecture &amp; Highlights</p>
    <ul class="modal-bullets">${bulletsHTML}</ul>
    ${interactiveBlock}
  `;

  modalOverlay.setAttribute('aria-hidden', 'false');
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (data.demo) updateDemo();
}

function closeModal() {
  modalOverlay.setAttribute('aria-hidden', 'true');
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});

// ─── XGBoost DEMO CALCULATOR ────────────────────────────────────
function updateDemo() {
  const hours    = parseInt(document.getElementById('demo-hours').value);
  const accuracy = parseInt(document.getElementById('demo-accuracy').value);

  document.getElementById('demo-hours-val').textContent    = `${hours} hrs`;
  document.getElementById('demo-accuracy-val').textContent = `${accuracy}%`;

  // Simplified deterministic simulation of XGBoost-like scoring
  // Weights: accuracy (0.65), hours (0.35) with diminishing returns
  const hoursNorm    = Math.min(hours / 30, 1);
  const accuracyNorm = accuracy / 100;
  const hoursScore   = 1 - Math.exp(-2.5 * hoursNorm);
  const base         = (accuracyNorm * 0.65) + (hoursScore * 0.35);
  // Add slight non-linearity for realism
  const score        = Math.min(base * 100 + (accuracyNorm > 0.75 ? (accuracyNorm - 0.75) * 8 : 0), 99.8);

  const scoreEl = document.getElementById('demo-score');
  if (scoreEl) {
    scoreEl.textContent = score.toFixed(1) + '%';
    scoreEl.style.color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--accent)' : '#f87171';
  }
}

// ─── API INSPECTOR ───────────────────────────────────────────────
function getApiPayload(endpoint) {
  const payloads = {
    members: `<span class="api-comment">// GET /api/v1/members  200 OK</span>
{
  <span class="api-key">"status"</span>: <span class="api-str">"success"</span>,
  <span class="api-key">"data"</span>: [
    {
      <span class="api-key">"id"</span>: <span class="api-num">1</span>,
      <span class="api-key">"name"</span>: <span class="api-str">"Alex Johnson"</span>,
      <span class="api-key">"membership"</span>: <span class="api-str">"premium"</span>,
      <span class="api-key">"status"</span>: <span class="api-str">"active"</span>,
      <span class="api-key">"sessions_this_month"</span>: <span class="api-num">14</span>,
      <span class="api-key">"goal"</span>: <span class="api-str">"weight_loss"</span>
    }
  ],
  <span class="api-key">"total"</span>: <span class="api-num">142</span>,
  <span class="api-key">"page"</span>: <span class="api-num">1</span>
}`,
    schedule: `<span class="api-comment">// POST /api/v1/schedule  201 Created</span>
<span class="api-comment">// Request Body:</span>
{
  <span class="api-key">"member_id"</span>: <span class="api-num">1</span>,
  <span class="api-key">"trainer_id"</span>: <span class="api-num">3</span>,
  <span class="api-key">"slot"</span>: <span class="api-str">"2026-11-02T08:00:00Z"</span>,
  <span class="api-key">"type"</span>: <span class="api-str">"strength_training"</span>
}

<span class="api-comment">// Response:</span>
{
  <span class="api-key">"session_id"</span>: <span class="api-str">"ses_8f3c9d"</span>,
  <span class="api-key">"status"</span>: <span class="api-str">"scheduled"</span>,
  <span class="api-key">"confirmation"</span>: <span class="api-str">"Email sent to member."</span>
}`,
    goals: `<span class="api-comment">// GET /api/v1/goals?member_id=1  200 OK</span>
{
  <span class="api-key">"member_id"</span>: <span class="api-num">1</span>,
  <span class="api-key">"goals"</span>: [
    {
      <span class="api-key">"type"</span>: <span class="api-str">"weight_loss"</span>,
      <span class="api-key">"target_kg"</span>: <span class="api-num">75</span>,
      <span class="api-key">"current_kg"</span>: <span class="api-num">82.4</span>,
      <span class="api-key">"progress_pct"</span>: <span class="api-num">48.5</span>,
      <span class="api-key">"on_track"</span>: <span class="api-key">true</span>
    }
  ]
}`,
  };
  return payloads[endpoint] || '';
}

function switchApiTab(btn, endpoint) {
  document.querySelectorAll('.api-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const codeBlock = document.getElementById('api-code-block');
  if (codeBlock) codeBlock.innerHTML = getApiPayload(endpoint);
}

// ─── SCROLL FADE IN ─────────────────────────────────────────────
const fadeEls = document.querySelectorAll(
  '.section-header, .timeline-item, .project-card, .skill-group, .edu-item, .cert-item, .contact-inner'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => observer.observe(el));

// ─── NAV ACTIVE LINK HIGHLIGHT ──────────────────────────────────
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('nav-link-active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(section => sectionObserver.observe(section));

// ─── NAV SCROLL STATE ────────────────────────────────────────────
const navBar = document.getElementById('nav-bar');
window.addEventListener('scroll', () => {
  navBar.classList.toggle('nav-scrolled', window.scrollY > 12);
}, { passive: true });

// Add nav-link-active style dynamically
const style = document.createElement('style');
style.textContent = `
  .nav-link-active {
    color: var(--text-primary) !important;
  }
  .nav-scrolled {
    border-bottom-color: var(--border-hover);
  }
`;
document.head.appendChild(style);

// ─── KEYBOARD ACCESSIBILITY: project cards ───────────────────────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const btn = card.querySelector('.project-expand-btn');
      if (btn) btn.click();
    }
  });
});

console.log('%cKRT Portfolio — engineered without sparkle icons.', 'font-family: monospace; font-size: 13px; color: #3b82f6;');
