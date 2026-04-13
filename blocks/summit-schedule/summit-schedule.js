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
const DEFAULT_URL = '/summit/schedule-data.json';

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
    data = (await resp.json()).data || [];
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
  const displayDay = currentDay || Object.keys(SUMMIT_DATES)[0];
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
      <input type="search"
        class="ss-name-input"
        id="ss-name-input"
        list="ss-name-list"
        placeholder="Search your name…"
        value="${selectedName}"
        autocomplete="off"
        aria-label="Select your name from the schedule">
      <datalist id="ss-name-list">${names.map((n) => `<option value="${n}">`).join('')}</datalist>
    </div>`;

  const mySlotsEl = document.createElement('div');
  mySlotsEl.className = 'ss-my-slots';
  myPanel.append(mySlotsEl);

  // Who's On Now panel
  const nowPanel = document.createElement('div');
  nowPanel.className = 'ss-panel ss-panel-now';

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

    if (mode === 'now') renderWhosOnNow(nowPanel, data, displayDay, slotIdx);
  }

  toggle.querySelectorAll('.ss-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => showMode(btn.dataset.mode));
  });

  // ---- Name picker ----

  const nameInput = myPanel.querySelector('.ss-name-input');

  function applyName(val) {
    const name = val.trim();
    if (!name || names.includes(name)) {
      selectedName = name;
      try { localStorage.setItem(LS_NAME, name); } catch { /* noop */ }
      renderMySchedule(mySlotsEl, data, selectedName);
    }
  }

  nameInput.addEventListener('change', () => applyName(nameInput.value));
  nameInput.addEventListener('input', () => {
    clearTimeout(nameInput._t);
    nameInput._t = setTimeout(() => {
      if (names.includes(nameInput.value.trim())) applyName(nameInput.value);
    }, 300);
  });

  // ---- Initial render ----
  renderMySchedule(mySlotsEl, data, selectedName);
  showMode(mode);

  // Refresh active slot highlight every minute
  setInterval(() => {
    if (mode === 'my') renderMySchedule(mySlotsEl, data, selectedName);
    if (mode === 'now') {
      const newPdt = getPDT(getSimtime() || new Date());
      const newDay = getCurrentDay() || displayDay;
      const newSlots = getDaySlots(data, newDay);
      slotIdx = newSlots.length ? findSlotIdx(newSlots, newPdt.totalMins) : 0;
      renderWhosOnNow(nowPanel, data, newDay, slotIdx);
    }
  }, 60_000);
}
