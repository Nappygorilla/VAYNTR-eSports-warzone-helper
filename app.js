(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  menuButton?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
  }));

  const form = document.getElementById('setup-form');
  const result = document.getElementById('checklist-result');
  const storageKey = 'vayntr-performance-profile-v1';
  const focusGuides = {
    'Consistency & control': [
      'Keep your current settings for a few sessions before making another change.',
      'Change one variable at a time and write down what felt different.',
      'Use a short, repeatable warm-up instead of switching routines every session.'
    ],
    'Movement & responsiveness': [
      'Check that your input method feels predictable at both slow and fast movements.',
      'Review button layout and accessibility options for comfortable, repeatable inputs.',
      'Practice controlled movement first, then gradually add speed.'
    ],
    'Audio clarity': [
      'Use a comfortable volume and avoid turning everything up just to hear more.',
      'Check left/right balance, headset fit, and the game’s available audio presets.',
      'Compare one audio change at a time in a quiet, low-pressure session.'
    ],
    'Display smoothness': [
      'Confirm your display and console/PC are set to a refresh rate they both support.',
      'Check the display’s game mode and verify the correct input/HDMI port is in use.',
      'Use a consistent visual setup while testing; avoid changing several options together.'
    ],
    'Network stability': [
      'Pause large downloads and uploads while testing your connection.',
      'If possible, compare a wired connection with Wi-Fi at the same time of day.',
      'Record latency and packet-loss results across several tests before drawing conclusions.'
    ]
  };

  function readProfile() {
    try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); }
    catch { return null; }
  }
  function saveProfile(profile) {
    try { localStorage.setItem(storageKey, JSON.stringify(profile)); return true; }
    catch { return false; }
  }
  function renderProfile(profile) {
    result.replaceChildren();
    const heading = document.createElement('h4');
    heading.textContent = 'YOUR SESSION CHECKLIST';
    const summary = document.createElement('p');
    summary.textContent = profile.platform + ' · ' + profile.input + ' · ' + profile.focus;
    const list = document.createElement('ul');
    (focusGuides[profile.focus] || focusGuides['Consistency & control']).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
    const notes = document.createElement('p');
    notes.textContent = profile.notes ? 'Your note: ' + profile.notes : 'Next step: test these suggestions and keep the changes that genuinely help.';
    const actions = document.createElement('div');
    actions.className = 'result-actions';
    const copy = document.createElement('button');
    copy.className = 'small-button';
    copy.type = 'button';
    copy.textContent = 'COPY CHECKLIST';
    copy.addEventListener('click', async () => {
      const text = [heading.textContent, summary.textContent, ...(focusGuides[profile.focus] || []), notes.textContent].join('\n');
      try {
        await navigator.clipboard.writeText(text);
        copy.textContent = 'COPIED';
      } catch {
        copy.textContent = 'SELECT TEXT TO COPY';
        const fallback = document.createElement('textarea');
        fallback.value = text;
        fallback.setAttribute('aria-label', 'Checklist text to copy');
        fallback.style.width = '100%';
        fallback.style.marginTop = '10px';
        result.appendChild(fallback);
        fallback.focus();
        fallback.select();
      }
    });
    const clear = document.createElement('button');
    clear.className = 'small-button';
    clear.type = 'button';
    clear.textContent = 'CLEAR SAVED PROFILE';
    clear.addEventListener('click', () => {
      try { localStorage.removeItem(storageKey); } catch {}
      result.hidden = true;
      result.replaceChildren();
    });
    actions.append(copy, clear);
    result.append(heading, summary, list, notes, actions);
    result.hidden = false;
  }

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const profile = {
      platform: String(data.get('platform') || 'PlayStation 5'),
      input: String(data.get('input') || 'Controller'),
      focus: String(data.get('focus') || 'Consistency & control'),
      notes: String(data.get('notes') || '').trim().slice(0, 500)
    };
    saveProfile(profile);
    renderProfile(profile);
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  });

  const saved = readProfile();
  if (saved && result && form) {
    const platform = form.querySelector('input[name="platform"][value="' + CSS.escape(saved.platform) + '"]');
    if (platform) platform.checked = true;
    form.elements.input.value = saved.input || 'Controller';
    form.elements.focus.value = saved.focus || 'Consistency & control';
    form.elements.notes.value = saved.notes || '';
    renderProfile(saved);
  }
})();