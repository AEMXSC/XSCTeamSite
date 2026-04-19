/*
 * Summit Header — sticky status bar with Summit 2026 branding.
 *
 * Optional doc config row 1 (dates):
 *   | summit-header |
 *   | 2026-04-20, 2026-04-21, 2026-04-22 |
 *
 * Optional doc config row 2 (booth guide nav — two cells):
 *   | [St1 label](/summit/station-1) [St2](/summit/station-2) ... | [Sites](/summit/aem-sites) [Assets](/summit/aem-assets) ... |
 *   Left cell = Quest links, Right cell = Product links
 *
 * Test: ?simtime=2026-04-21T14:30
 * All times: America/Los_Angeles (PDT).
 */

const TZ = 'America/Los_Angeles';
const DAY_COLORS = { Monday: '#4CAF50', Tuesday: '#FF9800', Wednesday: '#2196F3' };
const DEFAULT_SUMMIT = {
  Monday:    { date: '2026-04-20', start: '09:00', end: '19:30' },
  Tuesday:   { date: '2026-04-21', start: '10:30', end: '18:00' },
  Wednesday: { date: '2026-04-22', start: '10:00', end: '15:00' },
};

// Summit 2026 wordmark SVG — black fills inverted to white for dark mode
const SUMMIT_LOGO_SVG = `<svg class="sh-logo-svg" width="177" height="22" viewBox="0 0 177 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Adobe Summit 2026" role="img">
<path d="M7.74096 2.92605H13.1674L20.8268 20.6551H15.0957L10.2475 8.87974L7.05223 16.6058H10.8548L12.3701 20.6551H0L7.74096 2.92605ZM27.2174 6.60464C27.7683 6.60464 28.3738 6.65691 28.9811 6.7892V2.39688H33.7748V19.8614C32.6731 20.3385 30.3041 20.9197 27.9354 20.9197C23.6381 20.9197 19.9461 18.5643 19.9461 13.8813C19.9461 9.19822 23.5003 6.60437 27.2196 6.60437L27.2174 6.60464ZM27.8246 17.1352C28.265 17.1352 28.6242 17.0552 28.9811 16.9507V10.5198C28.6222 10.3875 28.265 10.3352 27.7956 10.3352C26.2262 10.3352 24.7653 11.4458 24.7653 13.8012C24.7653 16.1566 26.2532 17.1349 27.823 17.1349L27.8246 17.1352ZM42.3153 6.60464C46.3098 6.60464 49.6991 9.1985 49.6991 13.7492C49.6991 18.3 46.3098 20.8938 42.3153 20.8938C38.3208 20.8938 34.9042 18.3 34.9042 13.7492C34.9042 9.1985 38.2644 6.60464 42.3153 6.60464ZM42.3153 17.0568C43.6928 17.0568 44.9594 15.9985 44.9594 13.7492C44.9594 11.5 43.6928 10.4417 42.3153 10.4417C40.9379 10.4417 39.698 11.5003 39.698 13.7492C39.698 15.9982 40.8834 17.0568 42.3153 17.0568ZM50.8555 2.39688H55.6766V6.7892C56.2548 6.68304 56.8621 6.60464 57.4674 6.60464C61.2135 6.60464 64.6845 8.96004 64.6845 13.5647C64.6845 18.4339 60.9925 20.8938 56.6118 20.8938C54.7376 20.8938 52.3415 20.5231 50.8536 19.8614V2.39688H50.8555ZM56.7223 17.1091C58.3752 17.1091 59.8905 15.9704 59.8905 13.6169C59.8905 11.42 58.4025 10.3894 56.8057 10.3894C56.3654 10.3894 56.0065 10.4417 55.6766 10.574V16.9248C55.9521 17.031 56.3109 17.1094 56.7242 17.1094L56.7223 17.1091ZM72.8659 6.60464C76.4744 6.60464 79.7802 8.82775 79.7802 13.3001C79.7802 13.9096 79.7532 14.4907 79.6697 15.0722H70.6889C71.1856 16.6338 72.6175 17.3737 74.4082 17.3737C75.8689 17.3737 77.2173 17.0288 78.7326 16.3954V19.9155C77.3278 20.6031 75.6478 20.8938 73.9115 20.8938C69.3388 20.8938 65.7843 18.2477 65.7843 13.7492C65.7843 9.25076 69.007 6.60464 72.8639 6.60464H72.8659ZM75.2909 12.1876C75.0426 10.6801 73.9969 10.0706 72.922 10.0706C71.847 10.0706 70.9663 10.706 70.6074 12.1876H75.2909Z" fill="#EB1000"/>
<path d="M99.3979 3.77206L99.3705 8.40284C98.3229 7.63521 96.2297 6.7892 93.6687 6.7892C92.1534 6.7892 91.5481 7.2661 91.5481 7.92784C91.5481 8.58957 92.0158 8.85388 94.0276 9.40918C99.3164 10.8905 100.666 12.6367 100.666 15.3109C100.666 18.8311 97.6361 21 92.8985 21C90.0601 21 87.9124 20.3385 86.2595 19.4122L86.2866 14.5969C87.9939 15.8678 90.5024 16.7939 92.8714 16.7939C94.3864 16.7939 95.0752 16.397 95.0752 15.6291C95.0752 14.8612 94.3594 14.4905 92.4037 13.9893C88.6575 12.983 86.0131 11.7401 86.0131 8.27408C86.0131 4.80808 88.8515 2.58497 93.6726 2.58497C95.9037 2.58497 98.1075 2.98185 99.4035 3.7756L99.3979 3.77206Z" fill="#f0f0f0"/>
<path d="M101.767 15.337C101.767 19.146 103.833 20.9461 108.544 20.9461V20.9477C111.05 20.9477 113.035 20.3924 114.88 19.4922V6.84309H110.059V17.0326C109.645 17.191 109.149 17.2171 108.571 17.2171C107.331 17.2171 106.588 16.6077 106.588 15.1263V6.84309H101.767V15.337Z" fill="#f0f0f0"/>
<path d="M124.605 20.6551H129.399L129.397 20.6535L129.37 11.6307C129.37 11.2858 129.343 10.9412 129.316 10.6243C129.673 10.492 130.196 10.3075 130.858 10.3075C131.96 10.3075 132.703 10.9428 132.703 12.2399V20.6554H137.497V12.2137C137.497 8.19242 134.963 6.60464 131.382 6.60464C130.032 6.60464 128.71 6.89536 127.25 7.42453C126.204 6.84309 124.743 6.57851 122.952 6.57851C120.473 6.55047 118.104 7.15994 116.478 7.8214V20.6551H121.272V10.5476C121.769 10.3614 122.209 10.3091 122.76 10.3091C123.916 10.3091 124.605 10.8924 124.605 12.1353V20.6551Z" fill="#f0f0f0"/>
<path d="M147.22 20.6551H152.014L152.012 20.6535L151.985 11.6307C151.985 11.2858 151.958 10.9412 151.931 10.6243C152.288 10.492 152.812 10.3075 153.473 10.3075C154.575 10.3075 155.318 10.9428 155.318 12.2399V20.6554H160.112V12.2137C160.112 8.19242 157.578 6.60464 153.997 6.60464C152.647 6.60464 151.325 6.89536 149.864 7.42453C148.819 6.84309 147.358 6.57851 145.567 6.57851C143.088 6.55047 140.719 7.15994 139.093 7.8214V20.6551H143.887V10.5476C144.384 10.3614 144.824 10.3091 145.375 10.3091C146.532 10.3091 147.22 10.8924 147.22 12.1353V20.6551Z" fill="#f0f0f0"/>
<path d="M164.053 6.2339C165.623 6.2339 166.56 5.36175 166.56 4.09082C166.56 2.84602 165.568 2 164.053 2C162.538 2 161.519 2.79375 161.519 4.09082C161.519 5.38788 162.483 6.2339 164.053 6.2339Z" fill="#f0f0f0"/>
<path d="M166.478 6.84309H161.657V20.6551H166.478V6.84309Z" fill="#f0f0f0"/>
<path d="M176.973 16.9245C176.56 17.0568 176.119 17.1091 175.816 17.1091V17.1107C174.879 17.1107 174.329 16.6357 174.329 15.3648V10.654H176.973V6.97539H174.329V3.50938L169.507 3.53552V6.97729H167.441V10.6559H169.507V16.1065C169.507 19.4925 171.352 20.9219 174.493 20.9219C175.733 20.9219 176.395 20.7893 177 20.577L176.973 16.9245Z" fill="#f0f0f0"/>
</svg>`;

const REFRESH_INTERVAL_MS = 30_000;

function getSimtime() {
  const p = new URLSearchParams(window.location.search).get('simtime');
  if (!p) return null;
  const d = new Date(p);
  return Number.isNaN(d.getTime()) ? null : d;
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

function fmtDuration(mins) {
  if (mins <= 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  return h > 0 ? `${h}h` : `${m} min`;
}

function fmt12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`;
}

function getStatus(schedule, scheduleData) {
  const now = getSimtime() || new Date();
  const pdt = getPDT(now);
  const days = Object.keys(schedule);
  const firstDate = schedule[days[0]].date;
  const lastDate = schedule[days[days.length - 1]].date;

  if (pdt.dateStr < firstDate) return { state: 'before' };
  if (pdt.dateStr > lastDate) return { state: 'after' };

  const dayName = days.find((d) => schedule[d].date === pdt.dateStr);
  if (!dayName) return { state: 'before' };

  const info = schedule[dayName];
  const startMins = toMins(info.start);
  const endMins = toMins(info.end);

  if (pdt.totalMins < startMins) {
    return {
      state: 'before-open',
      day: dayName,
      color: DAY_COLORS[dayName],
      opensAt: fmt12(info.start),
      opensIn: startMins - pdt.totalMins,
    };
  }

  if (pdt.totalMins >= endMins) {
    return { state: 'closed', day: dayName, color: DAY_COLORS[dayName] };
  }

  let slotLabel = null;
  let minsRemaining = endMins - pdt.totalMins;
  let hasNextShift = false;

  if (scheduleData && scheduleData.length) {
    const dayRows = scheduleData.filter((r) => r.day === dayName);
    const slots = [...new Map(dayRows.map((r) => [r.time_slot, {
      time_slot: r.time_slot, shift: r.shift,
      start: r.start_time, end: r.end_time,
    }])).values()].sort((a, b) => toMins(a.start) - toMins(b.start));

    const idx = slots.findIndex(
      (s) => pdt.totalMins >= toMins(s.start) && pdt.totalMins < toMins(s.end),
    );
    if (idx >= 0) {
      const s = slots[idx];
      slotLabel = `${s.shift} · ${fmt12(s.start)}–${fmt12(s.end)}`;
      minsRemaining = toMins(s.end) - pdt.totalMins;
      hasNextShift = idx < slots.length - 1;
    }
  }

  return {
    state: 'open',
    day: dayName,
    color: DAY_COLORS[dayName],
    slotLabel,
    minsRemaining,
    hasNextShift,
    closesAt: fmt12(info.end),
  };
}

function renderBar(bar, schedule, scheduleData) {
  const s = getStatus(schedule, scheduleData);
  bar.dataset.state = s.state;

  if (s.state === 'before') {
    bar.innerHTML = `
      <div class="sh-left">
        <a href="/" class="sh-logo-link" aria-label="Site Home">${SUMMIT_LOGO_SVG}</a>
      </div>
      <div class="sh-right sh-muted">April 20–22 · Las Vegas · Booth opens Monday 9am PDT</div>`;
    return;
  }

  if (s.state === 'after') {
    bar.innerHTML = `
      <div class="sh-left">
        <a href="/" class="sh-logo-link" aria-label="Site Home">${SUMMIT_LOGO_SVG}</a>
      </div>
      <div class="sh-right sh-muted">Summit complete — great work everyone!</div>`;
    return;
  }

  const dot = `<span class="sh-dot${s.state === 'open' ? ' sh-dot-pulse' : ''}" style="background:${s.color}" aria-hidden="true"></span>`;

  if (s.state === 'before-open') {
    bar.innerHTML = `
      <div class="sh-left">
        <a href="/" class="sh-logo-link" aria-label="Site Home">${SUMMIT_LOGO_SVG}</a>
        <span class="sh-sep" aria-hidden="true"></span>
        ${dot}<span class="sh-day">${s.day}</span>
      </div>
      <div class="sh-right sh-muted">Opens at ${s.opensAt} (${fmtDuration(s.opensIn)})</div>`;
    return;
  }

  if (s.state === 'closed') {
    bar.innerHTML = `
      <div class="sh-left">
        <a href="/" class="sh-logo-link" aria-label="Site Home">${SUMMIT_LOGO_SVG}</a>
        <span class="sh-sep" aria-hidden="true"></span>
        ${dot}<span class="sh-day">${s.day}</span>
        <span class="sh-divider" aria-hidden="true">·</span>
        <span class="sh-muted">Booth closed</span>
      </div>`;
    return;
  }

  // open
  const slotDisplay = s.slotLabel || 'Booth Open';
  const countdown = s.hasNextShift
    ? `Next shift in ${fmtDuration(s.minsRemaining)}`
    : `Closes ${s.closesAt} (${fmtDuration(s.minsRemaining)})`;

  bar.innerHTML = `
    <div class="sh-left">
      <a href="/" class="sh-logo-link" aria-label="Site Home">${SUMMIT_LOGO_SVG}</a>
      <span class="sh-sep" aria-hidden="true"></span>
      ${dot}<span class="sh-day">${s.day}</span>
      <span class="sh-divider" aria-hidden="true">·</span>
      <span class="sh-slot">${slotDisplay}</span>
    </div>
    <div class="sh-right sh-countdown" aria-live="polite">${countdown}</div>`;
}

function renderNav(block, rows) {
  const navRow = rows[1];
  if (!navRow) return;

  const leftCell = navRow.children[0];
  const rightCell = navRow.children[1];
  const leftLinks = leftCell ? [...leftCell.querySelectorAll('a')] : [];
  const rightLinks = rightCell ? [...rightCell.querySelectorAll('a')] : [];

  if (!leftLinks.length && !rightLinks.length) return;

  const currentPath = window.location.pathname.replace(/\/$/, '');
  const isOverview = currentPath === '/summit' || currentPath === '/summit/index';

  const linkHtml = (links, shorten) => links.map((a) => {
    const href = new URL(a.href, window.location.href).pathname.replace(/\/$/, '');
    const active = currentPath === href;
    const raw = a.textContent.trim();
    const label = shorten ? raw.replace(/^Station\s*\d+\s*[—–-]\s*/i, '') : raw;
    const rawHref = a.getAttribute('href') || '';
    const safeHref = /^javascript:/i.test(rawHref) ? '#' : rawHref;
    return `<a href="${safeHref}" class="sh-nav-link${active ? ' sh-nav-active' : ''}">${label}</a>`;
  }).join('');

  const nav = document.createElement('div');
  nav.className = 'sh-nav';
  nav.innerHTML = `
    ${leftLinks.length ? `
      <div class="sh-nav-group">
        <span class="sh-nav-label">Quest</span>
        <a href="/summit/" class="sh-nav-link${isOverview ? ' sh-nav-active' : ''}">Overview</a>
        ${linkHtml(leftLinks, true)}
      </div>` : ''}
    ${leftLinks.length && rightLinks.length ? `<span class="sh-nav-sep" aria-hidden="true"></span>` : ''}
    ${rightLinks.length ? `
      <div class="sh-nav-group">
        <span class="sh-nav-label">Products</span>
        ${linkHtml(rightLinks, false)}
      </div>` : ''}
  `;
  block.append(nav);
}

export default function decorate(block) {
  const rows = [...block.children];
  const schedule = structuredClone(DEFAULT_SUMMIT);

  if (rows[0]) {
    const text = rows[0].textContent.trim();
    if (/\d{4}-\d{2}-\d{2}/.test(text)) {
      const dates = text.split(',').map((d) => d.trim()).filter(Boolean);
      Object.keys(schedule).forEach((day, i) => {
        if (dates[i]) schedule[day].date = dates[i];
      });
    }
  }

  block.innerHTML = '';

  const bar = document.createElement('div');
  bar.className = 'sh-bar';
  let scheduleData = null;

  // Render immediately (sync) — EDS can mark block loaded without waiting for fetch
  renderBar(bar, schedule, scheduleData);
  block.append(bar);

  // Optional nav row (row 2) for booth guide pages
  // rows[] is a pre-spread array — still valid after block.innerHTML = ''
  renderNav(block, rows);

  // Enhance bar with schedule slot data once available — non-blocking
  fetch('/summit/schedule-data.json')
    .then((r) => r.ok ? r.json() : null)
    .then((json) => {
      if (!json) return;
      scheduleData = json.data || [];
      renderBar(bar, schedule, scheduleData);
    })
    .catch(() => { /* graceful degradation — bar works without slot data */ });

  // Refresh every 30s; observe closest ancestor to avoid site-wide subtree cost
  const timer = setInterval(() => renderBar(bar, schedule, scheduleData), REFRESH_INTERVAL_MS);
  new MutationObserver((_, obs) => {
    if (!document.contains(block)) { clearInterval(timer); obs.disconnect(); }
  }).observe(block.closest('main') || document.body, { childList: true, subtree: false });
}
