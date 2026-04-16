/*
 * Summit Admin — AI schedule assistant block.
 * Matches the summit-schedule / summit-header design system.
 *
 * Page setup (DA): add summit-header block above, then this block.
 * Worker: https://summit-admin.compass-xsc.workers.dev
 */

const WORKER = 'https://summit-admin.compass-xsc.workers.dev';
const SESSION_KEY = 'summit_admin_pass';

// Summit wordmark SVG — same as summit-header
const LOGO_SVG = `<svg class="sa-auth-logo" height="18" viewBox="0 0 177 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Adobe Summit" role="img">
<path d="M7.74 2.93h5.43L20.83 20.66H15.1L10.25 8.88 7.05 16.61h3.8l1.52 4.05H0L7.74 2.93zM27.22 6.6c.55 0 1.16.05 1.76.19V2.4h4.79v17.46c-1.1.48-3.47 1.06-5.84 1.06-4.3 0-7.99-2.36-7.99-7.04 0-4.68 3.55-7.27 7.28-7.27zm.6 10.53c.44 0 .8-.08 1.16-.19V10.52c-.36-.13-.72-.19-1.19-.19-1.57 0-3.03 1.11-3.03 3.47 0 2.35 1.49 3.33 3.06 3.33zm14.49-10.53c4 0 7.39 2.59 7.39 7.15 0 4.55-3.39 7.15-7.39 7.15-4 0-7.41-2.6-7.41-7.15 0-4.56 3.36-7.15 7.41-7.15zm0 10.46c1.38 0 2.64-1.06 2.64-3.31 0-2.25-1.26-3.31-2.64-3.31-1.38 0-2.62 1.06-2.62 3.31 0 2.25 1.19 3.31 2.62 3.31zm8.54-14.66h4.82v4.39c.58-.11 1.19-.19 1.79-.19 3.75 0 7.22 2.36 7.22 6.96 0 4.87-3.69 7.33-8.07 7.33-1.87 0-4.27-.37-5.76-1.04V2.4zm5.87 14.71c1.65 0 3.17-1.14 3.17-3.49 0-2.2-1.49-3.23-3.08-3.23-.44 0-.8.05-1.13.19v6.35c.28.11.63.18 1.04.18zm16.14-10.53c3.61 0 6.92 2.22 6.92 6.7 0 .61-.03 1.19-.11 1.77H69.77c.5 1.56 1.93 2.3 3.72 2.3 1.46 0 2.81-.34 4.32-1.01v3.52c-1.4.69-3.08.98-4.82.98-4.57 0-8.12-2.65-8.12-7.15 0-4.49 3.22-7.11 7.08-7.11zm2.43 5.59c-.25-1.51-1.3-2.12-2.37-2.12-1.08 0-1.96.64-2.32 2.12h4.69z" fill="#EB1000"/>
<path d="M99.4 3.77l-.03 4.63c-1.05-.77-3.14-1.62-5.7-1.62-1.52 0-2.12.48-2.12 1.14 0 .66.47.93 2.48 1.48 5.29 1.48 6.64 3.23 6.64 5.9 0 3.52-3.03 5.69-7.77 5.69-2.84 0-4.98-.66-6.63-1.59l.03-4.81c1.71 1.27 4.22 2.2 6.59 2.2 1.51 0 2.2-.4 2.2-1.17 0-.77-.72-1.14-2.67-1.64-3.75-1.01-6.4-2.25-6.4-5.72 0-3.47 2.84-5.69 7.66-5.69 2.23 0 4.43.4 5.73 1.19zM101.77 15.34c0 3.81 2.07 5.61 6.77 5.61 2.51 0 4.49-.56 6.34-1.46V6.84h-4.82v10.19c-.41.16-.91.18-1.49.18-1.24 0-1.98-.61-1.98-2.09V6.84h-4.82v8.5zM124.6 20.66h4.8V11.63c0-.34-.03-.69-.06-1.01.36-.13.88-.31 1.55-.31 1.1 0 1.84.64 1.84 1.94v8.42h4.79v-8.44c0-4.02-2.53-5.61-6.12-5.61-1.35 0-2.67.29-4.13.82-1.05-.58-2.51-.84-4.3-.84-2.48-.03-4.85.57-6.48 1.23v13.84h4.79V10.55c.5-.19.94-.25 1.49-.25 1.16 0 1.84.58 1.84 1.84l-.01 8.52zM147.22 20.66h4.79V11.63c0-.34-.03-.69-.06-1.01.36-.13.88-.31 1.55-.31 1.1 0 1.84.64 1.84 1.94v8.42h4.79v-8.44c0-4.02-2.53-5.61-6.12-5.61-1.35 0-2.67.29-4.13.82-1.05-.58-2.51-.84-4.3-.84-2.48-.03-4.85.57-6.48 1.23v13.84h4.79V10.55c.5-.19.94-.25 1.49-.25 1.16 0 1.84.58 1.84 1.84l-.01 8.52zM164.05 6.23c1.57 0 2.51-.87 2.51-2.14 0-1.24-.99-2.09-2.51-2.09-1.52 0-2.53.8-2.53 2.09 0 1.3.96 2.14 2.53 2.14zM166.48 6.84h-4.82v13.82h4.82V6.84zM176.97 16.92c-.41.13-.85.19-1.15.19-1.94 0-2.49-.47-2.49-2.95v-4.99h2.64V6.98h-2.64V3.51l-4.82.03v3.44h-2.07v3.68h2.07v5.45c0 3.39 1.85 4.81 4.99 4.81 1.24 0 1.9-.13 2.5-.34l-.03-3.65z" fill="#f0f0f0"/>
</svg>`;

export default function decorate(block) {
  block.innerHTML = '';

  // ── Auth overlay
  const auth = document.createElement('div');
  auth.className = 'sa-auth';
  auth.innerHTML = `
    ${LOGO_SVG}
    <div class="sa-auth-title">Schedule Admin</div>
    <div class="sa-auth-sub">AEM XSC · Summit 2026</div>
    <input class="sa-pass-input" type="password" placeholder="Passphrase" autocomplete="off" />
    <button class="sa-unlock-btn">Unlock</button>
  `;

  // ── Messages
  const messages = document.createElement('div');
  messages.className = 'sa-messages';
  messages.innerHTML = `
    <div class="sa-intro">
      <div class="sa-intro-title">Schedule Assistant</div>
      <div class="sa-intro-sub">Speak or type a change — I'll verify coverage,<br>check breaks, and update the sheet.</div>
      <div class="sa-chips">
        <span class="sa-chip">Who covers Sites S2 Tuesday?</span>
        <span class="sa-chip">Yuji has a conflict Tue 2pm</span>
        <span class="sa-chip">Show Monday gaps</span>
        <span class="sa-chip">Suzy's full Tuesday schedule</span>
      </div>
    </div>
  `;

  // ── Input bar
  const bar = document.createElement('div');
  bar.className = 'sa-input-bar';
  bar.innerHTML = `
    <button class="sa-icon-btn sa-mic-btn" title="Speak" aria-label="Voice input">
      <svg viewBox="0 0 24 24"><path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1.5 4v6a1.5 1.5 0 0 0 3 0V5a1.5 1.5 0 0 0-3 0zM7 11a5 5 0 0 0 10 0h1.5a6.5 6.5 0 0 1-6 6.45V20h2.5a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1 0-1.5H11.5v-2.55A6.5 6.5 0 0 1 5.5 11H7z"/></svg>
    </button>
    <textarea class="sa-textarea" placeholder="Type a change..." rows="1" aria-label="Message input"></textarea>
    <button class="sa-icon-btn sa-send-btn" disabled aria-label="Send">
      <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
    </button>
  `;

  block.appendChild(auth);
  block.appendChild(messages);
  block.appendChild(bar);

  // ── State
  let passphrase = sessionStorage.getItem(SESSION_KEY) || '';
  let isLoading = false;
  let recognition = null;
  let isListening = false;

  const passInput = auth.querySelector('.sa-pass-input');
  const unlockBtn = auth.querySelector('.sa-unlock-btn');
  const textarea = bar.querySelector('.sa-textarea');
  const sendBtn = bar.querySelector('.sa-send-btn');
  const micBtn = bar.querySelector('.sa-mic-btn');

  // ── Auth
  function unlock(p) {
    passphrase = p;
    sessionStorage.setItem(SESSION_KEY, p);
    auth.classList.add('sa-hidden');
  }

  if (passphrase) auth.classList.add('sa-hidden');

  unlockBtn.addEventListener('click', () => unlock(passInput.value.trim()));
  passInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') unlock(passInput.value.trim());
  });

  // ── Messages
  function clearIntro() {
    const intro = messages.querySelector('.sa-intro');
    if (intro) intro.remove();
  }

  function addMsg(role, text, updates = [], warnings = []) {
    clearIntro();
    const row = document.createElement('div');
    row.className = `sa-msg sa-${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'sa-avatar';
    avatar.textContent = role === 'ai' ? 'AI' : 'CR';

    const bubble = document.createElement('div');
    bubble.className = 'sa-bubble';
    bubble.textContent = text;

    if (role === 'ai' && updates.length) {
      const tag = document.createElement('div');
      tag.className = 'sa-update-tag';
      tag.textContent = `✓ ${updates.length} cell${updates.length > 1 ? 's' : ''} updated`;
      bubble.appendChild(tag);
    }

    warnings.forEach((w) => {
      const warn = document.createElement('div');
      warn.className = 'sa-warning';
      warn.textContent = `⚠ ${w}`;
      bubble.appendChild(warn);
    });

    row.appendChild(avatar);
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function addThinking() {
    clearIntro();
    const row = document.createElement('div');
    row.className = 'sa-msg sa-ai';
    row.id = 'sa-thinking';

    const avatar = document.createElement('div');
    avatar.className = 'sa-avatar';
    avatar.textContent = 'AI';

    const bubble = document.createElement('div');
    bubble.className = 'sa-thinking';
    [0, 1, 2].forEach(() => {
      const d = document.createElement('div');
      d.className = 'sa-dot';
      bubble.appendChild(d);
    });

    row.appendChild(avatar);
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  // ── Send
  async function send(msg) {
    if (!msg.trim() || isLoading) return;
    isLoading = true;
    addMsg('user', msg);
    textarea.value = '';
    textarea.style.height = 'auto';
    sendBtn.disabled = true;
    addThinking();

    try {
      const resp = await fetch(`${WORKER}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, passphrase }),
      });

      document.getElementById('sa-thinking')?.remove();
      const data = await resp.json();

      if (resp.status === 401) {
        sessionStorage.removeItem(SESSION_KEY);
        passphrase = '';
        auth.classList.remove('sa-hidden');
        passInput.classList.add('sa-err');
        setTimeout(() => passInput.classList.remove('sa-err'), 500);
        return;
      }

      addMsg('ai', data.message || 'Done.', data.updates || [], data.warnings || []);
    } catch {
      document.getElementById('sa-thinking')?.remove();
      addMsg('ai', 'Network error — check connection.', [], []);
    } finally {
      isLoading = false;
    }
  }

  // Chip clicks
  messages.addEventListener('click', (e) => {
    if (e.target.classList.contains('sa-chip')) send(e.target.textContent);
  });

  // ── Textarea
  textarea.addEventListener('input', () => {
    sendBtn.disabled = !textarea.value.trim();
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 110)}px`;
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(textarea.value.trim());
    }
  });

  sendBtn.addEventListener('click', () => send(textarea.value.trim()));

  // ── Voice
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join('');
      textarea.value = t;
      sendBtn.disabled = !t.trim();
      if (e.results[e.results.length - 1].isFinal) {
        stopListening();
        send(t.trim());
      }
    };

    recognition.onend = stopListening;
    recognition.onerror = stopListening;

    micBtn.addEventListener('click', () => {
      if (isListening) stopListening();
      else startListening();
    });
  } else {
    micBtn.style.display = 'none';
  }

  function startListening() {
    isListening = true;
    micBtn.classList.add('sa-listening');
    try { recognition.start(); } catch (_) {}
  }

  function stopListening() {
    isListening = false;
    micBtn.classList.remove('sa-listening');
    try { recognition.stop(); } catch (_) {}
  }
}
