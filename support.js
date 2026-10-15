(() => {
  const launcher = document.getElementById('support-launcher');
  const panel = document.getElementById('support-panel');
  const closeButton = document.getElementById('support-close');
  const form = document.getElementById('support-form');
  const input = document.getElementById('support-input');
  const messages = document.getElementById('support-messages');
  if (!launcher || !panel || !form || !input || !messages) return;

  const answers = [
    {keys:['profile not showing','settings not showing','only checklist','checklist only','no settings','settings missing','profile broken','generate settings','not generating','profile builder'], answer:'<strong>Try this first:</strong>\n1. Open <a href="#performance">Build your settings profile</a>, choose your game/platform/input, then press <b>GENERATE MY SETTINGS</b>.\n2. Scroll down inside the form area—the settings sheet appears beneath the button.\n3. Hard-refresh the page (Ctrl + Shift + R on Chromebook/Windows) and try again.\n\nIf it still only shows a checklist, use <b>Report an issue</b> below and include your browser/device and what you clicked. I can’t see your screen from this chat.'},
    {keys:['warzone update','updates','patch notes','auto update','automatically update','patch status','new season','season update'], answer:'The site can monitor the official Call of Duty patch-notes page and flag the profile for review. It does <b>not</b> safely rewrite settings automatically: patch notes can change without every recommendation becoming wrong, so recommendations need verification before they are changed. Check the status message above the game selector and open the official patch notes from your generated profile. If the status looks old, the GitHub Actions workflow may need to be enabled or checked.'},
    {keys:['save','saved profile','saving profile','local storage','remember my profile','where is my profile'], answer:'Your settings profile is saved in this browser using local storage—there is no account or cloud sync. It should be available again on the same browser and device. Private/incognito sessions, clearing site data, or switching devices can remove or hide the saved profile.'},
    {keys:['mw4','modern warfare 4','launch'], answer:'The MW4 option is intended as a pre-release starting checklist until the game and its actual menus can be verified. Don’t treat general display or comfort suggestions as confirmed MW4-specific settings. Check official game updates after launch before relying on any game-specific values.'},
    {keys:['paid api','api key','free','how do you work','is this real ai','real ai','ai model','artificial intelligence'], answer:'This is a <b>no-paid-API support assistant</b>: it matches your message against VAYNTR help topics and responds from built-in guidance right in your browser. It does not send your messages to an AI provider, and it does not need an API key. To keep the site free and safe on GitHub Pages, it is a guided support bot rather than a full generative AI model.'},
    {keys:['site broken','not working','broken','white screen','blank','page error','bug','report issue'], answer:'For a site problem, first hard-refresh with <b>Ctrl + Shift + R</b>. If the issue remains, open <a href="https://github.com/Nappygorilla/VAYNTR-eSports/issues" target="_blank" rel="noopener noreferrer">VAYNTR GitHub Issues ↗</a> and describe the steps that caused it, what you expected, what appeared instead, and your browser/device. Please don’t post passwords or private information.'},
    {keys:['controller','mouse','keyboard','audio','sound','display','monitor','120hz','refresh rate','network','ping','internet','fov','field of view'], answer:'For setup questions, use the <a href="#performance">Performance Lab</a> to generate a platform-specific starting sheet. Confirm that each option exists in your current game version and change one setting at a time. For display smoothness, 120 Hz only works when the console/PC, display, and connection all support it; for network stability, Ethernet and pausing large downloads can help reduce local congestion.'},
    {keys:['contact','support person','developer','human','talk to someone','feedback'], answer:'You can contact the project through <a href="https://github.com/Nappygorilla/VAYNTR-eSports/issues" target="_blank" rel="noopener noreferrer">GitHub Issues ↗</a>. Include the page section and steps to reproduce the issue. There is no live human-agent service connected to this chat yet.'}
  ];

  function addMessage(text, who, allowHtml = false) {
    const bubble = document.createElement('div');
    bubble.className = 'support-message ' + (who === 'user' ? 'support-user' : 'support-bot');
    const label = document.createElement('span');
    label.className = 'support-message-label';
    label.textContent = who === 'user' ? 'YOU' : 'VAYNTR ASSISTANT';
    const body = document.createElement('p');
    if (allowHtml) body.innerHTML = text;
    else body.textContent = text;
    bubble.append(label, body);
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }
  function normalize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function replyTo(message) {
    const query = normalize(message);
    let best = null;
    let bestScore = 0;
    for (const item of answers) {
      let score = 0;
      for (const key of item.keys) {
        const normalizedKey = normalize(key);
        if (query.includes(normalizedKey)) score += normalizedKey.includes(' ') ? 3 : 1;
        else if (normalizedKey.split(' ').length > 1 && normalizedKey.split(' ').some(word => word.length > 3 && query.includes(word))) score += 0.4;
      }
      if (score > bestScore) { best = item; bestScore = score; }
    }
    if (best && bestScore >= 1) return best.answer;
    return 'I don’t have a specific answer for that yet. Try asking about <b>settings profiles</b>, <b>Warzone updates</b>, <b>saving a profile</b>, <b>MW4</b>, or a <b>website issue</b>. You can also <a href="https://github.com/Nappygorilla/VAYNTR-eSports/issues" target="_blank" rel="noopener noreferrer">report it on GitHub ↗</a>.';
  }
  function send(message) {
    const trimmed = message.trim();
    if (!trimmed) return;
    addMessage(trimmed, 'user');
    addMessage(replyTo(trimmed), 'bot', true);
  }
  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) window.setTimeout(() => input.focus(), 0);
    else launcher.focus();
  }
  launcher.addEventListener('click', () => setOpen(panel.hidden));
  closeButton?.addEventListener('click', () => setOpen(false));
  form.addEventListener('submit', event => {
    event.preventDefault();
    send(input.value);
    input.value = '';
    input.focus();
  });
  panel.querySelectorAll('[data-support-question]').forEach(button => {
    button.addEventListener('click', () => send(button.getAttribute('data-support-question') || ''));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
})();