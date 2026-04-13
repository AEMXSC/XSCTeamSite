/*
 * Summit Coverage — floating action button (FAB) for requesting coverage.
 *
 * Reads selected staff name from localStorage (set by summit-schedule).
 * Looks up their current slot from schedule JSON to pre-fill the message.
 * Opens Slack with a pre-formatted coverage request.
 *
 * Doc config:
 *   | summit-coverage |
 *   | /summit/schedule-data.json |   ← row 0: schedule JSON URL (optional)
 *   | C1234567890 |                  ← row 1: Slack channel ID
 */

const TZ = 'America/Los_Angeles';
const SUMMIT_DATES = {
  Monday:    { date: '2026-04-20', start: '09:00', end: '19:30' },
  Tuesday:   { date: '2026-04-21', start: '10:30', end: '18:00' },
  Wednesday: { date: '2026-04-22', start: '10:00', end: '15:00' },
};
const LS_NAME = 'summit-name';
const DEFAULT_SCHEDULE_URL = '/summit/schedule-data.json?sheet=schedule';

function getSimtime() {
  const p = new URLSearchParams(window.location.search).get('simtime');
  return p ? new Date(p) : null;
}

function getPDT(date) {
  const d = date || new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(d).map((p) => [p.type, p.value]),
  );
  return {
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
    totalMins: parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10),
  };
}

function toMins(hhmm) {
  const [h, m] = (hhmm || '00:00').split(':').map(Number);
  return h * 60 + m;
}

function fmt12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`;
}

function getCurrentDay() {
  const pdt = getPDT(getSimtime() || new Date());
  return Object.keys(SUMMIT_DATES).find((d) => SUMMIT_DATES[d].date === pdt.dateStr) || null;
}

function findCurrentAssignment(data, name) {
  const pdt = getPDT(getSimtime() || new Date());
  const dayName = getCurrentDay();
  if (!dayName || !name) return null;

  return data.find((r) => r.staff_name === name
    && r.day === dayName
    && pdt.totalMins >= toMins(r.start_time)
    && pdt.totalMins < toMins(r.end_time)) || null;
}

function buildCoverageMessage(name, assignment) {
  if (!assignment) {
    return `🔴 COVERAGE NEEDED: ${name || 'Someone'} needs coverage. Can anyone help?`;
  }
  const time = `${fmt12(assignment.start_time)}–${fmt12(assignment.end_time)}`;
  return `🔴 COVERAGE NEEDED: ${name} at ${assignment.booth} · ${assignment.screen} — ${time}. Can anyone cover?`;
}

function openSlack(channelId, message) {
  const encoded = encodeURIComponent(message);
  // Try native deeplink first, fall back to web
  const deeplink = channelId
    ? `slack://channel?team=&id=${channelId}&message=${encoded}`
    : null;
  const weblink = channelId
    ? `https://app.slack.com/client/${channelId}`
    : 'https://slack.com';

  if (deeplink) {
    // Attempt native; fall back to web after 1.5s if not handled
    const start = Date.now();
    window.location.href = deeplink;
    setTimeout(() => {
      if (Date.now() - start < 2000) window.open(weblink, '_blank');
    }, 1500);
  } else {
    window.open(weblink, '_blank');
  }
}

export default async function decorate(block) {
  const rows = [...block.children];
  const scheduleUrl = rows[0]?.querySelector('a')?.href
    || rows[0]?.textContent.trim()
    || DEFAULT_SCHEDULE_URL;
  const channelId = rows[1]?.textContent.trim() || '';

  // Hide the in-page block element — FAB lives on document.body
  block.style.display = 'none';

  // Load schedule data (non-blocking; FAB still renders without it)
  let scheduleData = [];
  try {
    const resp = await fetch(scheduleUrl);
    if (resp.ok) scheduleData = (await resp.json()).data || [];
  } catch { /* graceful degradation */ }

  // ---- FAB button ----
  const fab = document.createElement('button');
  fab.className = 'scv-fab';
  fab.setAttribute('aria-label', 'Request coverage');
  fab.innerHTML = `<span class="scv-fab-icon" aria-hidden="true">🔴</span>`;
  document.body.append(fab);

  // ---- Modal ----
  const modal = document.createElement('div');
  modal.className = 'scv-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'scv-modal-title');
  modal.hidden = true;
  modal.innerHTML = `
    <div class="scv-sheet">
      <div class="scv-sheet-handle" aria-hidden="true"></div>
      <h2 class="scv-title" id="scv-modal-title">Need Coverage?</h2>
      <div class="scv-context" id="scv-context"></div>
      <div class="scv-msg-wrap">
        <label class="scv-msg-label" for="scv-msg">Message</label>
        <textarea class="scv-msg" id="scv-msg" rows="3"></textarea>
      </div>
      <button class="scv-send" id="scv-send">Send to Slack Channel</button>
      <button class="scv-copy" id="scv-copy">Copy message instead</button>
      <button class="scv-close" aria-label="Close">✕</button>
    </div>
    <div class="scv-backdrop"></div>`;
  document.body.append(modal);

  const contextEl = modal.querySelector('#scv-context');
  const msgEl = modal.querySelector('#scv-msg');
  const sendBtn = modal.querySelector('#scv-send');
  const copyBtn = modal.querySelector('#scv-copy');
  const closeBtn = modal.querySelector('.scv-close');
  const backdrop = modal.querySelector('.scv-backdrop');

  function openModal() {
    let name = '';
    try { name = localStorage.getItem(LS_NAME) || ''; } catch { /* noop */ }

    const assignment = findCurrentAssignment(scheduleData, name);
    const message = buildCoverageMessage(name, assignment);

    if (assignment) {
      contextEl.innerHTML = `
        <div class="scv-context-line"><strong>${name}</strong></div>
        <div class="scv-context-line">${assignment.booth} · ${assignment.screen}</div>
        <div class="scv-context-line">${fmt12(assignment.start_time)}–${fmt12(assignment.end_time)}</div>`;
    } else if (name) {
      contextEl.innerHTML = `<div class="scv-context-line"><strong>${name}</strong> — no active slot right now</div>`;
    } else {
      contextEl.innerHTML = `<div class="scv-context-line scv-no-name">Select your name in My Schedule first</div>`;
    }

    msgEl.value = message;
    modal.hidden = false;
    document.body.classList.add('scv-modal-open');
    msgEl.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('scv-modal-open');
    fab.focus();
  }

  fab.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  sendBtn.addEventListener('click', () => {
    openSlack(channelId, msgEl.value);
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(msgEl.value);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy message instead'; }, 2000);
    } catch {
      // Fallback: select the textarea text
      msgEl.select();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}
