/*
 * Summit Schedule — two-mode block.
 *
 * Mode A "My Schedule": staff self-service, filtered by name.
 * Mode B "Who's On Now": manager view, all booths for current slot.
 *
 * Doc config:
 *   | summit-schedule |
 *   | /summit/schedule-data.json |   ← optional, defaults to this path
 *
 * Test: ?simtime=2026-04-21T14:30
 */

const TZ = 'America/Los_Angeles';
const SUMMIT_DATES = {
  Monday:    { date: '2026-04-20', start: '09:00', end: '19:30' },
  Tuesday:   { date: '2026-04-21', start: '10:30', end: '18:00' },
  Wednesday: { date: '2026-04-22', start: '10:00', end: '15:00' },
};
const DAY_COLORS = { Monday: '#4CAF50', Tuesday: '#FF9800', Wednesday: '#2196F3' };
const BOOTH_ORDER = [
  'AEM Sites',
  'AEM Sites Optimizer',
  'AEM Forms',
  'AEM Assets / Dynamic Media',
  'Adobe LLM Optimizer',
  'Learn Fast and Optimize Faster',
];
const LS_NAME = 'summit-name';
const SS_MODE = 'summit-mode';
const PUB_ID = '2PACX-1vT6auv_d3_FUXyhFhOnpUQB6ODvtrQbUH_lJEcDpass9I8iTBaX-JesmYAQQuX9Ar8lzDaAtWzPoAev';
const DEFAULT_URL = `https://docs.google.com/spreadsheets/d/e/${PUB_ID}/pub?output=csv&sheet=shared-schedule`;

// Parse Google Sheets published CSV → flat array of objects
function parseCsv(text) {
  const rows = [];
  let col = '';
  let inQuotes = false;
  let row = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { col += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { col += ch; }
    } else if (ch === '"') { inQuotes = true;
    } else if (ch === ',') { row.push(col); col = '';
    } else if (ch === '\n') { row.push(col); col = ''; rows.push(row); row = [];
    } else if (ch !== '\r') { col += ch; }
  }
  if (col || row.length) { row.push(col); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).filter((r) => r.some((c) => c)).map((r) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i] ?? ''; });
    return obj;
  });
}

// ---- Time utils ----

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

function getDaySlots(data, dayName) {
  const map = new Map();
  data.filter((r) => r.day === dayName).forEach((r) => {
    if (!map.has(r.time_slot)) {
      map.set(r.time_slot, {
        time_slot: r.time_slot,
        shift: r.shift,
        start: r.start_time,
        end: r.end_time,
        is_soft_close: r.is_soft_close === 'TRUE' || r.is_soft_close === true,
      });
    }
  });
  return [...map.values()].sort((a, b) => toMins(a.start) - toMins(b.start));
}

function findSlotIdx(slots, totalMins) {
  const idx = slots.findIndex((s) => totalMins >= toMins(s.start) && totalMins < toMins(s.end));
  if (idx >= 0) return idx;
  // Before first slot → 0; after last → last index
  return totalMins < toMins(slots[0]?.start || '00:00') ? 0 : slots.length - 1;
}

// ---- Mode A: My Schedule ----

function renderMySchedule(container, data, selectedName) {
  if (!selectedName) {
    container.innerHTML = '<p class="ss-hint">Select your name above to see your schedule.</p>';
    return;
  }

  const mySlots = data.filter((r) => r.staff_name === selectedName);
  if (!mySlots.length) {
    container.innerHTML = `<p class="ss-hint">No schedule found for "${selectedName}".</p>`;
    return;
  }

  const pdt = getPDT(getSimtime() || new Date());
  const currentDay = getCurrentDay();

  const dayCards = Object.keys(SUMMIT_DATES).map((day) => {
    const slots = mySlots
      .filter((r) => r.day === day)
      .sort((a, b) => toMins(a.start_time) - toMins(b.start_time));
    if (!slots.length) return '';

    const isToday = day === currentDay;
    const color = DAY_COLORS[day];

    const slotItems = slots.map((slot) => {
      const isActive = isToday
        && pdt.totalMins >= toMins(slot.start_time)
        && pdt.totalMins < toMins(slot.end_time);
      const isSoft = slot.is_soft_close === 'TRUE' || slot.is_soft_close === true;
      const hasConflict = slot.session_conflict && String(slot.session_conflict).trim();

      const classes = ['ss-slot'];
      if (isActive) classes.push('ss-slot-active');
      if (isSoft) classes.push('ss-slot-soft');

      return `<div class="${classes.join(' ')}">
        <div class="ss-slot-top">
          <span class="ss-slot-shift">${slot.shift}</span>
          <span class="ss-slot-time">${fmt12(slot.start_time)}–${fmt12(slot.end_time)}</span>
          ${isActive ? '<span class="ss-now-badge" aria-label="Current slot">NOW</span>' : ''}
        </div>
        <div class="ss-slot-location">${slot.booth} · ${slot.screen}</div>
        ${isSoft ? '<div class="ss-soft-label">Soft close — keynote in progress</div>' : ''}
        ${hasConflict ? `<div class="ss-conflict" role="alert">⚠ ${slot.conflict_note || slot.session_conflict}</div>` : ''}
      </div>`;
    }).join('');

    return `<div class="ss-day-card${isToday ? ' ss-day-today' : ''}">
      <div class="ss-day-heading" style="border-left-color:${color}">
        <span class="ss-day-name">${day}</span>
        ${isToday ? '<span class="ss-today-pill">Today</span>' : ''}
      </div>
      <div class="ss-slots">${slotItems}</div>
    </div>`;
  }).filter(Boolean).join('');

  container.innerHTML = dayCards || '<p class="ss-hint">No slots across any summit day.</p>';
}

// ---- Mode B: Who's On Now ----

function renderWhosOnNow(container, data, dayName, slotIdx) {
  const displayDay = dayName || Object.keys(SUMMIT_DATES)[0];
  const daySlots = getDaySlots(data, displayDay);

  if (!daySlots.length) {
    container.innerHTML = '<p class="ss-hint">No schedule data for this day.</p>';
    return;
  }

  const pdt = getPDT(getSimtime() || new Date());
  const currentDay = getCurrentDay();

  const effectiveIdx = Math.max(0, Math.min(slotIdx, daySlots.length - 1));
  const slot = daySlots[effectiveIdx];
  const isLiveSlot = currentDay === displayDay
    && pdt.totalMins >= toMins(slot.start)
    && pdt.totalMins < toMins(slot.end);

  const slotRows = data.filter((r) => r.day === displayDay && r.time_slot === slot.time_slot);

  // Determine booths and their screens from full data (stable columns)
  const activeBooths = BOOTH_ORDER.filter((b) => data.some((r) => r.booth === b));
  const boothScreens = {};
  activeBooths.forEach((booth) => {
    boothScreens[booth] = [...new Set(
      data.filter((r) => r.booth === booth).map((r) => r.screen),
    )].sort();
  });

  // Nav buttons
  const canPrev = effectiveIdx > 0;
  const canNext = effectiveIdx < daySlots.length - 1;

  const badge = isLiveSlot
    ? '<span class="ss-live-badge">● Live</span>'
    : (currentDay === displayDay ? '<span class="ss-next-badge">Next up</span>' : '');

  // Table header — collect all unique screens across all booths
  const allScreens = [...new Set(activeBooths.flatMap((b) => boothScreens[b]))].sort();

  const tableHead = `<tr><th class="ss-th-booth">Booth</th>${allScreens.map((s) => `<th>${s}</th>`).join('')}</tr>`;

  const tableBody = activeBooths.map((booth) => {
    const cells = allScreens.map((screen) => {
      if (!boothScreens[booth].includes(screen)) {
        return '<td class="ss-cell-na" aria-label="Not applicable">—</td>';
      }
      const assignment = slotRows.find((r) => r.booth === booth && r.screen === screen);
      if (assignment) {
        const isSoft = assignment.is_soft_close === 'TRUE' || assignment.is_soft_close === true;
        const hasConflict = assignment.session_conflict && String(assignment.session_conflict).trim();
        return `<td class="ss-cell-filled${isSoft ? ' ss-cell-soft' : ''}">
          <span class="ss-cell-name">${assignment.staff_name}</span>
          ${hasConflict ? '<span class="ss-cell-conflict" title="Session conflict">⚠</span>' : ''}
        </td>`;
      }
      return '<td class="ss-cell-gap" aria-label="Coverage gap">GAP</td>';
    }).join('');
    return `<tr><td class="ss-booth-label">${booth}</td>${cells}</tr>`;
  }).join('');

  container.innerHTML = `
    <div class="ss-slot-nav" role="navigation" aria-label="Time slot navigation">
      <button class="ss-nav-btn" data-dir="-1" aria-label="Previous slot" ${canPrev ? '' : 'disabled'}>‹</button>
      <div class="ss-slot-label">${badge}<span>${slot.shift} · ${fmt12(slot.start)}–${fmt12(slot.end)}</span></div>
      <button class="ss-nav-btn" data-dir="1" aria-label="Next slot" ${canNext ? '' : 'disabled'}>›</button>
    </div>
    <div class="ss-grid-wrap" role="region" aria-label="Booth staffing grid">
      <table class="ss-grid">
        <thead>${tableHead}</thead>
        <tbody>${tableBody}</tbody>
      </table>
    </div>`;

  container.querySelectorAll('.ss-nav-btn:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', () => {
      renderWhosOnNow(container, data, displayDay, effectiveIdx + parseInt(btn.dataset.dir, 10));
    });
  });
}

// ---- Main ----

export default async function decorate(block) {
  const rows = [...block.children];
  const configUrl = rows[0]?.querySelector('a')?.href
    || rows[0]?.textContent.trim()
    || DEFAULT_URL;

  block.innerHTML = '';
  block.className = 'summit-schedule';

  const loader = document.createElement('p');
  loader.className = 'ss-loading';
  loader.textContent = 'Loading schedule…';
  block.append(loader);

  let data = [];
  try {
    const resp = await fetch(configUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    data = text.trimStart().startsWith('{') ? (JSON.parse(text).data || []) : parseCsv(text);
  } catch {
    loader.className = 'ss-error';
    loader.textContent = 'Could not load schedule. Check your connection and refresh.';
    return;
  }

  if (!data.length) {
    loader.className = 'ss-error';
    loader.textContent = 'Schedule sheet is empty — add data to the spreadsheet and refresh.';
    return;
  }

  loader.remove();

  // Build name list
  const names = [...new Set(data.map((r) => r.staff_name).filter(Boolean))].sort();

  // Restore persisted state
  let selectedName = '';
  let mode = 'my';
  try { selectedName = localStorage.getItem(LS_NAME) || ''; } catch { /* noop */ }
  try { mode = sessionStorage.getItem(SS_MODE) || 'my'; } catch { /* noop */ }

  // Initial slot index for Mode B
  const pdt = getPDT(getSimtime() || new Date());
  const currentDay = getCurrentDay();
  let displayDay = currentDay || Object.keys(SUMMIT_DATES)[0];
  const daySlots = getDaySlots(data, displayDay);
  let slotIdx = daySlots.length ? findSlotIdx(daySlots, pdt.totalMins) : 0;

  // ---- Build DOM ----

  // Mode toggle
  const toggle = document.createElement('div');
  toggle.className = 'ss-toggle';
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Schedule view');
  toggle.innerHTML = `
    <button class="ss-toggle-btn" data-mode="my" aria-pressed="${mode === 'my'}">My Schedule</button>
    <button class="ss-toggle-btn" data-mode="now" aria-pressed="${mode === 'now'}">Who's On Now</button>`;
  block.append(toggle);

  // My Schedule panel
  const myPanel = document.createElement('div');
  myPanel.className = 'ss-panel ss-panel-my';
  myPanel.innerHTML = `
    <div class="ss-name-picker">
      <label class="ss-name-label" for="ss-name-input">Your name</label>
      <div class="ss-name-input-wrap">
        <input type="text"
          class="ss-name-input"
          id="ss-name-input"
          placeholder="Search your name…"
          value="${selectedName}"
          autocomplete="off"
          aria-autocomplete="list"
          aria-controls="ss-name-suggestions"
          aria-label="Select your name from the schedule">
        <button class="ss-name-clear" aria-label="Clear name" ${selectedName ? '' : 'hidden'}>✕</button>
        <ul class="ss-name-suggestions" id="ss-name-suggestions" role="listbox" hidden></ul>
      </div>
    </div>`;

  const mySlotsEl = document.createElement('div');
  mySlotsEl.className = 'ss-my-slots';
  myPanel.append(mySlotsEl);

  // Who's On Now panel
  const nowPanel = document.createElement('div');
  nowPanel.className = 'ss-panel ss-panel-now';

  // Day picker — persistent, sits above slot nav, not re-rendered by renderWhosOnNow
  const dayPicker = document.createElement('div');
  dayPicker.className = 'ss-day-picker';
  dayPicker.setAttribute('role', 'group');
  dayPicker.setAttribute('aria-label', 'Select day');
  dayPicker.innerHTML = Object.keys(SUMMIT_DATES).map((day) => `<button class="ss-day-btn${day === displayDay ? ' ss-day-btn-active' : ''}" data-day="${day}" aria-pressed="${day === displayDay}">${day.slice(0, 3)}</button>`).join('');

  // Slot content area — renderWhosOnNow targets this, not nowPanel
  const nowContentEl = document.createElement('div');

  nowPanel.append(dayPicker, nowContentEl);

  dayPicker.querySelectorAll('.ss-day-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      displayDay = btn.dataset.day;
      dayPicker.querySelectorAll('.ss-day-btn').forEach((b) => {
        b.classList.toggle('ss-day-btn-active', b.dataset.day === displayDay);
        b.setAttribute('aria-pressed', b.dataset.day === displayDay);
      });
      const newSlots = getDaySlots(data, displayDay);
      const newCurrentDay = getCurrentDay();
      slotIdx = newSlots.length
        ? (displayDay === newCurrentDay ? findSlotIdx(newSlots, getPDT(getSimtime() || new Date()).totalMins) : 0)
        : 0;
      renderWhosOnNow(nowContentEl, data, displayDay, slotIdx);
    });
  });

  block.append(myPanel, nowPanel);

  // ---- Panel switching ----

  function showMode(m) {
    mode = m;
    try { sessionStorage.setItem(SS_MODE, mode); } catch { /* noop */ }

    toggle.querySelectorAll('.ss-toggle-btn').forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle('ss-toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    myPanel.classList.toggle('ss-panel-hidden', mode !== 'my');
    nowPanel.classList.toggle('ss-panel-hidden', mode !== 'now');

    if (mode === 'now') renderWhosOnNow(nowContentEl, data, displayDay, slotIdx);
  }

  toggle.querySelectorAll('.ss-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => showMode(btn.dataset.mode));
  });

  // ---- Name picker ----

  const nameInput = myPanel.querySelector('.ss-name-input');
  const clearBtn = myPanel.querySelector('.ss-name-clear');
  const suggestionsEl = myPanel.querySelector('.ss-name-suggestions');
  let focusedIdx = -1;

  function applyName(val) {
    const name = val.trim();
    selectedName = name;
    try { if (name) localStorage.setItem(LS_NAME, name); else localStorage.removeItem(LS_NAME); } catch { /* noop */ }
    clearBtn.hidden = !name;
    renderMySchedule(mySlotsEl, data, selectedName);
  }

  function buildSuggestions(filtered) {
    if (!filtered.length) { suggestionsEl.hidden = true; return; }
    suggestionsEl.innerHTML = filtered
      .map((n) => `<li class="ss-name-option" role="option" data-name="${n}">${n}</li>`)
      .join('');
    suggestionsEl.hidden = false;
    focusedIdx = -1;
  }

  function hideSuggestions() {
    suggestionsEl.hidden = true;
    focusedIdx = -1;
  }

  function moveFocus(delta) {
    const opts = [...suggestionsEl.querySelectorAll('.ss-name-option')];
    opts.forEach((o) => o.classList.remove('ss-name-focused'));
    focusedIdx = Math.max(-1, Math.min(focusedIdx + delta, opts.length - 1));
    if (focusedIdx >= 0) {
      opts[focusedIdx].classList.add('ss-name-focused');
      opts[focusedIdx].scrollIntoView({ block: 'nearest' });
    }
  }

  function selectSuggestion(name) {
    nameInput.value = name;
    applyName(name);
    hideSuggestions();
  }

  nameInput.addEventListener('focus', () => {
    const q = nameInput.value.trim().toLowerCase();
    buildSuggestions(q ? names.filter((n) => n.toLowerCase().includes(q)) : names);
  });

  nameInput.addEventListener('input', () => {
    clearBtn.hidden = !nameInput.value.trim();
    const q = nameInput.value.trim().toLowerCase();
    buildSuggestions(q ? names.filter((n) => n.toLowerCase().includes(q)) : names);
  });

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1); }
    else if (e.key === 'Enter') {
      const focused = suggestionsEl.querySelector('.ss-name-focused');
      if (focused) { e.preventDefault(); selectSuggestion(focused.dataset.name); }
      else if (nameInput.value.trim()) { applyName(nameInput.value); hideSuggestions(); }
    } else if (e.key === 'Escape') { hideSuggestions(); }
  });

  nameInput.addEventListener('blur', () => setTimeout(hideSuggestions, 150));

  suggestionsEl.addEventListener('mousedown', (e) => {
    const opt = e.target.closest('.ss-name-option');
    if (opt) selectSuggestion(opt.dataset.name);
  });

  clearBtn.addEventListener('click', () => {
    nameInput.value = '';
    applyName('');
    hideSuggestions();
    nameInput.focus();
  });

  // ---- Initial render ----
  renderMySchedule(mySlotsEl, data, selectedName);
  showMode(mode);

  // Refresh active slot highlight every minute
  setInterval(() => {
    if (mode === 'my') renderMySchedule(mySlotsEl, data, selectedName);
    if (mode === 'now') {
      const newPdt = getPDT(getSimtime() || new Date());
      const newSlots = getDaySlots(data, displayDay);
      slotIdx = newSlots.length ? findSlotIdx(newSlots, newPdt.totalMins) : 0;
      renderWhosOnNow(nowContentEl, data, displayDay, slotIdx);
    }
  }, 60_000);
}
