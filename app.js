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
  const storageKey = 'vayntr-performance-profile-v2';
  let patchStatus = { status: 'reviewed', lastReviewed: '2026-10-14', detectedAt: null, message: 'Warzone baseline last reviewed October 14, 2026.' };
  const focusGuides = {
    'Consistency & control': ['Keep one setup for several sessions before judging it.', 'Change one setting at a time and note whether it actually helps.', 'Use the same short warm-up so your comparisons are fair.'],
    'Movement & responsiveness': ['Use a button layout and sensitivity you can control comfortably.', 'Turn off camera effects that make the picture harder for you to read.', 'Test changes in a low-pressure mode before keeping them.'],
    'Audio clarity': ['Start with a comfortable volume; louder is not automatically clearer.', 'Use stereo/headphone output when that matches your device.', 'Lower distracting music before raising overall volume.'],
    'Display smoothness': ['Enable 120 Hz only when your display and platform support it.', 'Turn off motion blur and set film grain to zero if those options are available.', 'Keep the same FOV while testing other visual settings.'],
    'Network stability': ['Pause large downloads and uploads while testing.', 'Prefer Ethernet when available; compare several tests rather than one result.', 'Look for packet loss and ping consistency, not just download speed.']
  };

  function settingsFor(profile) {
    const isPC = profile.platform === 'PC';
    const isMouse = profile.input === 'Mouse & Keyboard';
    const isMW4 = profile.game === 'Modern Warfare 4';
    const settings = [];
    if (isMW4) {
      settings.push(
        ['GAME STATUS', 'MW4 is scheduled for October 23, 2026. This is a pre-release checklist, not a claim that MW4 menu values have been verified.'],
        ['DISPLAY', 'Use your display’s highest supported refresh rate; enable 120 Hz only if your platform, display, and connection support it.'],
        ['VISUAL CLARITY', 'If the options exist, start with motion blur Off and film grain 0, then adjust for comfort.'],
        ['INPUT', isMouse ? 'Keep your current mouse DPI and in-game sensitivity for the first test; change one value at a time.' : 'Start with a comfortable controller sensitivity and adjust gradually; do not copy Warzone values blindly.'],
        ['UPDATE CHECK', 'After launch and each title update, check the official MW4 patch notes before treating these as game-specific recommendations.']
      );
      return settings;
    }

    settings.push(
      ['FIELD OF VIEW', isPC ? 'Start at 110; test within 100–120 based on readability and performance.' : 'Start at 110; test within 100–120 based on readability and comfort.'],
      ['WORLD / WEAPON MOTION BLUR', 'Off, if available.'],
      ['FILM GRAIN', '0, if available.'],
      ['REFRESH RATE', profile.platform === 'PC' ? 'Set Windows and the game to your monitor’s highest stable refresh rate.' : 'Enable 120 Hz only if your console, display, and HDMI connection support it.']
    );
    if (isMouse) {
      settings.push(
        ['MOUSE INPUT', 'Use Raw Input if the option exists. Keep one DPI value and tune in-game sensitivity gradually; there is no universal best number.'],
        ['AIM / INPUT FEEL', 'Disable mouse acceleration in the game if available; keep desktop settings consistent while testing.']
      );
    } else {
      settings.push(
        ['HORIZONTAL / VERTICAL SENSITIVITY', 'Starting point: 1.70 horizontal / 1.60 vertical. If your game version uses a different scale, use the closest equivalent and confirm in the menu.'],
        ['ADS SENSITIVITY MULTIPLIER', 'Starting point: 0.85. Adjust in small steps until tracking feels controlled.'],
        ['AIM RESPONSE CURVE', 'Try Dynamic as a starting point; Standard or Linear may suit you better. Choose one and practice before switching again.'],
        ['DEADZONES', 'Set each stick’s minimum deadzone just above unwanted drift, then use the highest maximum response your control feels comfortable with.']
      );
    }
    settings.push(
      ['AUDIO', 'Choose a headphone/stereo mix if using headphones; reduce music if it masks useful game audio. Keep volume at a comfortable level.'],
      ['NETWORK', 'Use Ethernet where possible. Pause large uploads/downloads during play and check for packet loss or ping spikes.'],
      ['PATCH STATUS', 'Warzone Season 06 official patch notes were updated October 14, 2026. Settings are a baseline, not an automatic claim that every patch changed them.']
    );
    return settings;
  }

  function readProfile() {
    try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); }
    catch { return null; }
  }
  function saveProfile(profile) {
    try { localStorage.setItem(storageKey, JSON.stringify(profile)); return true; }
    catch { return false; }
  }
  function addText(parent, tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    parent.appendChild(node);
    return node;
  }
  function renderProfile(profile) {
    if (!result) return;
    result.replaceChildren();
    addText(result, 'h4', profile.game === 'Modern Warfare 4' ? 'YOUR MW4 STARTING PROFILE' : 'YOUR WARZONE SETTINGS');
    addText(result, 'p', profile.platform + ' · ' + profile.input + ' · ' + profile.focus, 'result-summary');
    const stamp = document.createElement('p');
    stamp.className = 'settings-stamp';
    stamp.textContent = profile.game === 'Modern Warfare 4' ? 'PRE-RELEASE BASELINE · VERIFY AFTER LAUNCH' : (patchStatus.status === 'review-required' ? 'PATCH NOTES CHANGED · SETTINGS REVIEW REQUIRED' : 'BASELINE REVIEWED · ' + (patchStatus.lastReviewed || 'DATE NOT SET'));
    result.appendChild(stamp);

    const settingList = document.createElement('div');
    settingList.className = 'settings-list';
    settingsFor(profile).forEach(([label, value]) => {
      const row = document.createElement('div');
      row.className = 'setting-row';
      addText(row, 'span', label, 'setting-label');
      addText(row, 'p', value, 'setting-value');
      settingList.appendChild(row);
    });
    result.appendChild(settingList);

    addText(result, 'h4', 'YOUR NEXT SESSION');
    const list = document.createElement('ul');
    (focusGuides[profile.focus] || focusGuides['Consistency & control']).forEach(item => addText(list, 'li', item));
    result.appendChild(list);
    if (profile.notes) addText(result, 'p', 'Your note: ' + profile.notes);
    addText(result, 'p', 'Apply the settings that exist in your current game version. If a value is missing or uses a different scale, do not force it—use the nearest supported option and test it.', 'settings-disclaimer');

    const sources = document.createElement('p');
    sources.className = 'settings-sources';
    const official = document.createElement('a');
    official.href = 'https://www.callofduty.com/patchnotes/2026/09/call-of-duty-bo7-warzone-season-06-patch-notes';
    official.target = '_blank';
    official.rel = 'noopener noreferrer';
    official.textContent = 'Official Warzone patch notes ↗';
    sources.appendChild(official);
    if (profile.game === 'Modern Warfare 4') {
      const sep = document.createTextNode(' · ');
      const mw4 = document.createElement('a');
      mw4.href = 'https://www.callofduty.com/blog/2026/05/modernwarfare4-fob';
      mw4.target = '_blank';
      mw4.rel = 'noopener noreferrer';
      mw4.textContent = 'Official MW4 updates ↗';
      sources.append(sep, mw4);
    }
    result.appendChild(sources);

    const actions = document.createElement('div');
    actions.className = 'result-actions';
    const copy = document.createElement('button');
    copy.className = 'small-button';
    copy.type = 'button';
    copy.textContent = 'COPY SETTINGS';
    copy.addEventListener('click', async () => {
      const text = [profile.game, profile.platform, profile.input, ...settingsFor(profile).map(([a,b]) => a + ': ' + b), ...(focusGuides[profile.focus] || [])].join('\n');
      try { await navigator.clipboard.writeText(text); copy.textContent = 'COPIED'; }
      catch {
        copy.textContent = 'SELECT TEXT BELOW';
        addText(result, 'textarea', text, 'copy-fallback');
        const fallback = result.querySelector('.copy-fallback');
        fallback.setAttribute('aria-label', 'Settings text to copy');
        fallback.focus(); fallback.select();
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
    result.appendChild(actions);
    result.hidden = false;
  }

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const profile = {
      game: String(data.get('game') || 'Warzone'),
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
    const game = form.querySelector('[name="game"]');
    if (game) game.value = saved.game || 'Warzone';
    const platform = form.querySelector('input[name="platform"][value="' + CSS.escape(saved.platform) + '"]');
    if (platform) platform.checked = true;
    form.elements.input.value = saved.input || 'Controller';
    form.elements.focus.value = saved.focus || 'Consistency & control';
    form.elements.notes.value = saved.notes || '';
    renderProfile(saved);
  }

  const gameSelect = document.getElementById('game-select');
  fetch('data/warzone-status.json', { cache: 'no-store' }).then(response => {
    if (!response.ok) throw new Error('Patch status unavailable');
    return response.json();
  }).then(status => {
    patchStatus = status;
    const help = document.getElementById('game-status-help');
    if (help && (!gameSelect || gameSelect.value === 'Warzone')) {
      help.textContent = status.status === 'review-required'
        ? 'Official patch notes changed on ' + (status.detectedAt || 'an unknown date') + '. The settings baseline is flagged for review; recommendations are not silently changed.'
        : (status.message || 'Warzone baseline status loaded.');
    }
    const savedProfile = readProfile();
    if (savedProfile && result && !result.hidden) renderProfile(savedProfile);
  }).catch(() => {});

  gameSelect?.addEventListener('change', () => {
    const isMW4 = gameSelect.value === 'Modern Warfare 4';
    const help = document.getElementById('game-status-help');
    if (help) help.textContent = isMW4
      ? 'MW4 launches October 23, 2026. Until launch, this profile is a clearly labelled general setup baseline—not verified MW4 menu values.'
      : 'Warzone settings baseline reviewed against official patch notes dated October 14, 2026.';
  });
})();