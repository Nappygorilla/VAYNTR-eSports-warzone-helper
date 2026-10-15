# VAYNTR Gemini support assistant setup

The public website is static GitHub Pages, so it must **not** call Gemini with a secret key in browser JavaScript. This repository includes a Cloudflare Worker proxy that stores the key as a server-side secret.

## 1. Create the Worker
1. Sign in to Cloudflare and open **Workers & Pages**.
2. Create a Worker (for example, `vayntr-support-ai`).
3. Copy the full contents of `support-ai-worker.js` into the Worker editor and deploy it.
4. Open the Worker settings and add a **secret** named `GEMINI_API_KEY`. Paste your Gemini API key into that secret field only. Do not commit it to GitHub or paste it into the website files.
5. Optional: add a text variable named `GEMINI_MODEL` with value `gemini-2.5-flash` if you need to choose a different model supported by your Gemini project.
6. Copy the deployed Worker URL, such as `https://vayntr-support-ai.<your-subdomain>.workers.dev`.

Cloudflare and Gemini quotas/terms apply. This does not create unlimited usage.

## 2. Connect the website
1. In `support.js`, find the `AI_API_ENDPOINT` constant near the top.
2. Replace the empty string with your deployed Worker URL.
3. Commit the change and wait for GitHub Pages to publish.

The browser sends only the user's message to the Worker. The Gemini key stays on the Worker. The current department classifier and GitHub issue routing remain in place. If the AI endpoint is unset or unavailable, the chatbot falls back to its built-in FAQ replies.

## 3. Test
Try:
- "How do I join the esports team?" → AI answer plus **Esports Team Recruitment** route.
- "My profile settings aren't showing" → **Website & Profile Support**.
- "Warzone patch update?" → **Game Settings & Updates**.
- "The website is a blank page" → **Technical Support**.
- "How can I contact you?" → **General Support**.

## Security and limitations
- Never place the API key in `index.html`, `support.js`, a public GitHub Actions variable, or any other client-side file.
- The Worker allows requests only from the VAYNTR GitHub Pages origin. This is a browser-origin check, not strong authentication; public websites can still be abused. Set Cloudflare rate limiting/usage controls and monitor provider quotas.
- Do not send passwords, tokens, or sensitive personal information in chat.
- The Worker does not automatically create a private helpdesk or send tickets to a real team inbox. The department card still opens a prefilled GitHub issue.
