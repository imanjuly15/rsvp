# Admin page

`your-site/admin` (locally `http://localhost:3000/admin.html`). Log in with the admin key, then:
- see the summary;
- open or close RSVP and change the deadline;
- add or edit guests (the ID is always made by the script);
- copy each personal link or open WhatsApp with the message ready;
- read every reply.

It is a separate page (`admin.html`, built as its own bundle), so guests never download admin code, and the guest page's opening animation never runs here.

## Layers

Same direction as the RSVP feature (see `src/features/rsvp/README.md`):

```
components/ ─▶ hooks/ ─▶ services/admin.service ─▶ api/adminApi ─▶ rsvp/shared.js (httpClient: the only fetch)
                                                        └─▶ mocks/adminMock (when VITE_RSVP_USE_MOCK=true)
constants/  strings/  utils/   ← importable by any layer
```

| File | Job |
|---|---|
| `api/adminApi.js` | `login`, `getOverview`, `addGuest`, `updateGuest`, `setConfig`. All POST `{ action: "admin", op, ... }` |
| `services/admin.service.js` | Session kept in `sessionStorage` (this tab only), guest form checks, list filter, **the one error mapping** (`mapAdminError`) |
| `hooks/useAdminSession.js` | Logged in or not; log in / log out |
| `hooks/useAdminData.js` | Overview data plus actions; reloads after every change; logs out on "Session expired" |
| `hooks/useGuestForm.js` | The add/edit form |
| `components/` | Rendering only |
| `admin.css` | The admin page's own look (system font, neutral colours, status badges). It does not load the guest site's `style.css` |
| `mocks/adminMock.js` | Offline stand-in. Demo key: `demo-admin-key-for-testing-only` |

## Layout decisions (keep them when changing the page)

- **Its own look, not the memorial's:** system font, 16px text, neutral greys, white cards, and every text colour at least 4.5:1 contrast. Built to be read fast, not to be pretty.
- **Order follows the host's job:** overview → guests (daily work) → shared link → settings (rare, folded at the bottom).
- **The top bar stays on screen:** event name, RSVP state badge, last update, Refresh, Log out.
- **Overview = totals for everyone, then by source.** "People coming" (pax, both links) leads, with replies and can't come; a small table splits the same numbers into **Invited guests** (personal links) and **Public link**, so the two are never mixed up. Computed on the page from the loaded replies (`responseTotals` in the service).
- **Guests and the public link are separate.** The Guests table only holds people from the Guests tab; public-link replies have their own table (Name · Answer · Pax · Phone · Replied, 15 per page, opens and closes).
- **The Guests section opens and closes** from its heading, which also shows the guest count, so the total stays visible when closed.
- **Status tabs with counts** filter the list. "Not opened 502" is the reminder workflow in one tap.
- **Guests are a table from 860px wide** (Guest · Status · Allowed · Coming · Phone · Opened · Actions; `TABLE_MEDIA_QUERY`). Status is only the state (Coming / Not coming / Opened, no reply / Not opened); the confirmed pax has its own Coming column. On phones each guest is a compact row of about 70px: name, status and "2 pax" (or "3 of 4 pax" after a yes), plus a one-tap green **Send** until they reply. Tapping the name opens phone, opened time, note, Copy link and Edit. A page of 15 guests is under 1,300px tall on a phone.
- **WhatsApp buttons carry the WhatsApp logo** (inline SVG, no download) so they are recognised at a glance.
- **WhatsApp buttons are `<button>`s, not links, on purpose.** Ad blockers (EasyList social filters) hide links to `wa.me/?text=…` as "share buttons", which removed the button for guests without a phone and the shared-link button.
- **15 guests per page.** A new search or tab goes back to page 1; turning a page scrolls to the top of the list; a just-saved guest's page is shown. Change the page size with `GUESTS_PER_PAGE` in constants.
- **Status is a word in a coloured badge:** green coming, amber opened but no reply, grey not opened or not coming, red RSVP closed. Colour never carries meaning alone.
- **The main button follows the state:** a green "Send on WhatsApp" until the guest replies, then an outlined "WhatsApp".
- **Closing RSVP asks first, inline** (no browser pop-up). Reopening is one tap.
- **Add guest and Edit open a pop-up** (native modal `<dialog>`, `GuestDialog.jsx`): focus goes to Name, the page behind is blocked, Esc closes it, focus returns to the button. Clicking the dimmed background does not close it, so typing is never lost by a stray tap. **Add guest** stays visible even when the Guests section is closed.
- **Feedback appears where the action happened**, and new or edited rows are briefly highlighted.
- **On phones every button, tab and field is at least 44px tall** (the desktop table uses 36px buttons for mouse use). No icons or emoji.
- **Try paging locally** with `admin.html?mock=many` (mock mode adds 1,000 fake guests).

## Security model (read before changing)

- The key lives **only** in the Sheet's Config tab (`admin_key`) and is checked inside `apps-script/Code.gs`. Never put it in `.env`, `rsvp.config.js` or any front-end file: everything there is public.
- Logging in returns a random 64-character session token, kept by Google for 2 hours (CacheService). The page sends that token, never the key again. The token is in `sessionStorage`, so closing the tab logs out.
- Generating a new key logs out every session.
- 10 wrong keys within 10 minutes lock admin login for 15 minutes. Guests are not affected.
- Every request is a POST, so the key and token never appear in a URL or browser history.
- The script checks every value again (name length, guests allowed 1 to 10, phone digits) and neutralises formula-looking names.
- Admin data (names, phones, notes) only goes out with a valid session. The overview never includes `admin_key`.

## How to change…

- **Wording:** `strings/admin.strings.js`.
- **Add an admin action:** add a branch in `handleAdmin_` in `Code.gs` (with a test in `tests/apps-script.test.cjs`). Then add the op to `OP`, a function in `api/adminApi.js`, the same op in the mock, a service function returning an Outcome, and expose it from `useAdminData`.
- **Session length / lockout:** the `ADMIN_*` constants at the top of `Code.gs`.
