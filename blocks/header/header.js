export default function decorate(block) {
  const headerEl = block.closest('header');

  headerEl.innerHTML = `
    <div class="nav-wrapper">
      <div class="nav-inner">
        <a href="#" class="nav-brand">
          <svg width="28" height="24" viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M11.5 0H0V26L11.5 0Z" fill="hsl(0 100% 46%)"/>
            <path d="M18.5 0H30V26L18.5 0Z" fill="hsl(0 100% 46%)"/>
            <path d="M15 9.5L21.5 26H17L14.5 19H10L15 9.5Z" fill="hsl(0 100% 46%)"/>
          </svg>
          <span class="nav-logo-text">
            AEM <span class="nav-logo-xsc">XSC</span>
          </span>
        </a>
        <button class="nav-hamburger" aria-label="Menu" aria-expanded="false">
          <span class="nav-hamburger-icon"></span>
        </button>
        <ul class="nav-links">
          <li class="nav-has-dropdown">
            <button class="nav-summit-btn" aria-expanded="false" aria-haspopup="true">
              <span class="nav-summit-adobe">Adobe</span> Summit 2026
              <svg class="nav-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <ul class="nav-dropdown" role="menu">
              <li><a href="/summit/schedule" role="menuitem">Schedule</a></li>
              <li><a href="/summit/" role="menuitem">Brand Visibility</a></li>
              <li><a href="/summit/aem-sites" role="menuitem">AEM Sites</a></li>
              <li><a href="/summit/aem-assets" role="menuitem">AEM Assets</a></li>
              <li><a href="/summit/aem-forms" role="menuitem">AEM Forms</a></li>
              <li><a href="/summit/sites-optimizer" role="menuitem">Sites Optimizer</a></li>
              <li><a href="/summit/llm-optimizer" role="menuitem">LLM Optimizer</a></li>
            </ul>
          </li>
          <li><a href="#what-we-do">What We Do</a></li>
          <li><a href="#the-three-revenue-motions">Motions</a></li>
          <li><a href="#vertical-coverage">Verticals</a></li>
          <li><a href="#the-team">Team</a></li>
          <li><a href="#demo-environments">Demos</a></li>
        </ul>
        <a href="#how-we-engage" class="nav-cta">Engage Us</a>
      </div>
    </div>
  `;

  const navWrapper = headerEl.querySelector('.nav-wrapper');
  const hamburger = headerEl.querySelector('.nav-hamburger');
  const navLinks = headerEl.querySelector('.nav-links');
  const summitItem = headerEl.querySelector('.nav-has-dropdown');
  const summitBtn = headerEl.querySelector('.nav-summit-btn');

  // Dropdown toggle
  summitBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = summitItem.classList.toggle('open');
    summitBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Escape closes dropdown, returns focus to trigger
  headerEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && summitItem.classList.contains('open')) {
      summitItem.classList.remove('open');
      summitBtn.setAttribute('aria-expanded', 'false');
      summitBtn.focus();
    }
  });

  // Click outside closes dropdown
  document.addEventListener('click', (e) => {
    if (!summitItem.contains(e.target)) {
      summitItem.classList.remove('open');
      summitBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Mobile hamburger
  hamburger.addEventListener('click', () => {
    const isOpen = navWrapper.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu on any link click (including dropdown links)
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navWrapper.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
      summitItem.classList.remove('open');
      summitBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Reduce gap between pill button and dropdown panel
  const navDropdown = headerEl.querySelector('.nav-dropdown');
  if (navDropdown) navDropdown.style.top = 'calc(100% + 4px)';

  // Scroll: white nav on scroll
  window.addEventListener('scroll', () => {
    navWrapper.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}
