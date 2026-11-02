# Memorial RSVP

React front-end for the memorial ceremony of Dr Jayaraman a/l Munusamy, built with Vite. There is no server or database.

## Run it

```bash
npm install
npm run dev
```

The site opens at http://localhost:3000/.

## Build for hosting

```bash
npm run build
```

Upload the `dist` folder to any static host, such as Netlify, Cloudflare Pages or GitHub Pages. To check the build locally, run `npm run preview`. Opening `dist/index.html` by double-clicking will not work, because browsers block this kind of script on local files.

## Where things are

| Path | What it holds |
| --- | --- |
| `src/event.js` | Ceremony date, time, venue and attire. This is the file to edit. |
| `src/components/` | React components: page sections, RSVP form, countdown, bottom bar |
| `src/lib/` | Canvas and SVG drawing, the opening animation, the scrolling sky, the mantra player |
| `public/assets/` | Portrait and mantra audio |

## RSVP answers

**The form does not save answers yet.** A guest sees the thank-you message, but the answer goes nowhere until `rsvp_endpoint` in `src/event.js` is set to an address that accepts a JSON POST with these fields:

`attending`, `name`, `phone`, `pax`, `relationship`, `message`

## Opening sound

The opening plays `public/assets/moksha-mantras.mp3` after a guest touches the lamp, and the Mantra button plays or pauses it. Browsers block sound until a guest touches the page, so a lamp that lights by itself stays silent. Replace that file to change the music.
