(() => {
  const launcher = document.getElementById('support-launcher');
  const panel = document.getElementById('support-panel');
  const closeButton = document.getElementById('support-close');
  const form = document.getElementById('support-form');
  const input = document.getElementById('support-input');
  const messages = document.getElementById('support-messages');
  if (!launcher || !panel || !form || !input || !messages) return;

  const departments = [
    {id:'website-profile', name:'Website & Profile Support', keywords:['profile not showing','settings not showing','only checklist','checklist only','no settings','settings missing','profile broken','generate settings','not generating','profile builder','save','saved profile','saving profile','local storage','remember my profile','where is my profile'], description:'Profile builder, saved settings, and website features.'},
    {id:'game-settings', name:'Game Settings & Updates', keywords:['warzone','mw4','modern warfare','patch notes','game update','updates','season','controller','mouse','keyboard','audio','sound','display','monitor','120hz','refresh rate','network','ping','internet','fov','field of view','settings'], description:'Game setup guidance, display/audio advice, and patch-status questions.'},
    {id:'esports-recruitment', name:'Esports Team Recruitment', keywords:['esports team','join the team','join team','join esports','join your team','tryout','tryouts','roster','recruitment','recruit','team member','competitive team','play for vayntr','represent vayntr','team application','esports player'], description:'Joining VAYNTR’s esports team, roster interest, tryouts, and player applications.'},
    {id:'technical-support', name:'Technical Support', keywords:['site broken','not working','broken','white screen','blank','page error','bug','error','crash','loading','does not load','doesnt load','issue','problem'], description:'Website errors, broken features, and troubleshooting.'},
    {id:'general-support', name:'General Support', keywords:['contact','support person','developer','human','talk to someone','feedback','paid api','api key','free','how do you work','is this real ai','real ai','ai model','artificial intelligence','question','help'], description:'General questions, feedback, and requests that do not fit another department.'}
  ];

  const answers = [
    {keys:['profile not showing','settings not showing','only checklist','checklist only','no settings','settings missing','profile broken','generate settings','not generating','profile builder'], answer:'<strong>Try this first:</strong>\n1. Open <a href="#performance">Build your settings profile</a>, choose your game/platform/input, then press <b>GENERATE MY SETTINGS</b>.\n2. Scroll down inside the form area—the settings sheet appears beneath the button.\n3. Hard-refresh the page (Ctrl + Shift + R on Chromebook/Windows) and try again.\n\nIf it still only shows a checklist, route this conversation to Website &amp; Profile Support using the department button below.'},
    {keys:['warzone update','updates','patch notes','auto update','automatically update','patch status','new season','season update'], answer:'The site can monitor the official Call of Duty patch-notes page and flag the profile for review. It does <b>not</b> silently rewrite settings: recommendations need verification after a patch. Check the status message above the game selector and the official patch notes from your generated profile. If the status looks old, the GitHub Actions workflow may need to be checked.'},
    {keys:['save','saved profile','saving profile','local storage','remember my profile','where is my profile'], answer:'Your profile is saved in this browser using local storage—there is no account or cloud sync. It should be available again on the same browser and device. Private/incognito sessions, clearing site data, or switching devices can remove or hide the saved profile.'},
    {keys:['mw4','modern warfare 4','launch'], answer:'The MW4 option is intended as a general pre-release checklist until its actual menus and updates can be verified. Don’t treat general display or comfort suggestions as confirmed MW4-specific settings. Check official game updates after launch.'},
    {keys:['paid api','api key','free','how do you work','is this real ai','real ai','ai model','artificial intelligence'], answer:'This support assistant is a <b>free, browser-based help bot</b>. It matches questions to built-in VAYNTR guidance and does not need a paid API key or send your messages to an AI provider. It is a guided support bot, not a full generative AI model.'},
    {keys:['site broken','not working','broken','white screen','blank','page error','bug'], answer:'First try a hard refresh with <b>Ctrl + Shift + R</b>. If the issue remains, choose Technical Support below to open a prefilled issue with the steps and browser/device details you provide. Please do not include passwords or private information.'},
    {keys:['controller','mouse','keyboard','audio','sound','display','monitor','120hz','refresh rate','network','ping','internet','fov','field of view'], answer:'For setup questions, use the <a href="#performance">Performance Lab</a> to generate a platform-specific starting sheet. Confirm each option exists in your current game version and change one setting at a time. 120 Hz only works when your platform, display, and connection all support it.'},
    {keys:['esports team','join the team','join team','join esports','join your team','tryout','tryouts','roster','recruitment','recruit','team member','competitive team','play for vayntr','represent vayntr','team application','esports player'], answer:'Want to compete with VAYNTR? Choose <b>Esports Team Recruitment</b> below to submit your interest. Include your main game, platform, region/time zone, role, and competitive experience if you have any. Never include your password or other private account information. This opens a recruitment request on GitHub; it is not an automatic tryout or confirmation of a roster spot.'},
    {keys:['contact','support person','developer','human','talk to someone','feedback'], answer:'Choose General Support below to send a question or feedback to the project’s support issue queue. This site does not currently have a live-agent inbox.'}
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
  function isEsportsRecruitmentIntent(query) {
    const esportsMention = /\b(esports|e sports|vayntr|roster|tryouts?|recruitment|competitive team)\b/.test(query);
    const joinIntent = /\b(join|apply|application|tryouts?|recruit|recruitment|play for|become|team|roster|sign up)\b/.test(query);
    return (esportsMention && joinIntent) || /\b(join|apply|tryouts?|recruitment)\b.*\b(team|roster|vayntr)\b/.test(query);
  }

  function replyTo(message) {
    const query = normalize(message);
    if (isEsportsRecruitmentIntent(query)) return 'Want to compete with VAYNTR? Choose <b>Esports Team Recruitment</b> below to submit your interest. Include your main game, platform, region/time zone, role, and competitive experience if you have any. Never include your password or other private account information. This opens a recruitment request on GitHub; it is not an automatic tryout or confirmation of a roster spot.';
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
    return 'I can answer common VAYNTR questions, or help route your request to the right department below. Try asking about settings profiles, game updates, saving a profile, or a website problem.';
  }

  function detectDepartment(message) {
    const query = normalize(message);
    if (isEsportsRecruitmentIntent(query)) return departments.find(department => department.id === 'esports-recruitment');
    let best = departments[3];
    let bestScore = 0;
    for (const department of departments) {
      let score = 0;
      for (const keyword of department.keywords) {
        const key = normalize(keyword);
        if (query.includes(key)) score += key.includes(' ') ? 3 : 1;
      }
      if (score > bestScore) { best = department; bestScore = score; }
    }
    return best;
  }

  function addDepartmentRoute(message) {
    const department = detectDepartment(message);
    const card = document.createElement('div');
    card.className = 'support-route';
    const label = document.createElement('span');
    label.className = 'support-route-kicker';
    label.textContent = 'SUGGESTED DEPARTMENT';
    const title = document.createElement('strong');
    title.textContent = department.name;
    const description = document.createElement('p');
    description.textContent = department.description;
    const route = document.createElement('a');
    route.className = 'support-route-link';
    route.textContent = 'CONTINUE TO ' + department.name.toUpperCase() + ' ↗';
    const issueTitle = '[VAYNTR Support] ' + department.name;
    const issueBody = 'Department: ' + department.name + '\\n\\nQuestion / issue:\\n' + message + '\\n\\nBrowser/device (optional):\\n\\nSteps tried (optional):\\n';
    route.href = 'https://github.com/Nappygorilla/VAYNTR-eSports/issues/new?title=' + encodeURIComponent(issueTitle) + '&body=' + encodeURIComponent(issueBody);
    route.target = '_blank';
    route.rel = 'noopener noreferrer';
    card.append(label, title, description, route);
    messages.appendChild(card);
    messages.scrollTop = messages.scrollHeight;
  }

  function send(message) {
    const trimmed = message.trim();
    if (!trimmed) return;
    addMessage(trimmed, 'user');
    addMessage(replyTo(trimmed), 'bot', true);
    addDepartmentRoute(trimmed);
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