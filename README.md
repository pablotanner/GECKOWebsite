# GECKOWebsite

The single-page website for **GECKOGuard**, an MSc thesis project (ETH Zürich,
Network Security Group). It explains why WiFi impostors (evil twins) are a real
problem, that GECKOGuard stops them, and roughly how.

The content brief lives in the GECKOGuard app repository at
`evidence/demo/website-brief.md`.

## Stack

- [Astro](https://astro.build) for a static site: plain HTML out, almost no JavaScript.
- React only for interactive islands (the "Spot the fake" quiz, later the map).
- One design kit: tokens in `design/tokens/*.json` → `src/styles/tokens.css`
  (generated) + `src/styles/kit.css`. See [design/README.md](design/README.md).
- No backend, no tracking, no cookies. Google Fonts is the only third party.

## Run locally

```sh
npm install
npm run dev        # http://localhost:4321 (rebuilds tokens first)
npm run build      # type-check + static build into dist/
npm run preview    # serve dist/
```

Node 20 or newer.

## Fill in the placeholders

Everything the author still needs to provide is in **`src/config.ts`**:

| Field | What |
|---|---|
| `author`, `thesisTitle` | Shown in the footer |
| `githubUrl` | Nav tab and footer link |
| `thesisPdfUrl` | Footer link. Put the PDF in `public/assets/` and use `'assets/thesis.pdf'` |
| `lookupRadiusMeters`, `lookupAnswerConfirmed` | FAQ answer on location. Set `lookupAnswerConfirmed: true` once checked to remove the "to be confirmed" note |
| `videos.*.steps` | Caption timelines under each video |

Paths under `assets/` are relative to `public/`; the deploy base path is added
automatically.

The logo placeholder is `public/assets/logo.svg` (and `public/favicon.svg`);
the inline version is in `src/components/Logo.astro`.

## Add the videos

Drop the files into `public/assets/video/` with these names:

| Slot | Video | Poster | Captions |
|---|---|---|---|
| Demo, left | `attack-without.mp4` | `attack-without.jpg` | `attack-without.vtt` |
| Demo, right | `attack-with.mp4` | `attack-with.jpg` | `attack-with.vtt` |
| Enterprise | `eduroam-ios.mp4` | `eduroam-ios.jpg` | `eduroam-ios.vtt` |

The check runs at build time: a slot shows "Video coming soon" until its `.mp4`
exists, then becomes a player (poster and captions are used when present).
Videos are portrait (9:16), muted, never autoplay with sound, start muted when
scrolled into view (not under reduced motion), and keep visible controls.

## Deploy (GitHub Pages)

1. Push this repository to GitHub.
2. Settings → Pages → Source: **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds with
   the right base path (`https://<user>.github.io/<repo>/`) and publishes `dist/`.

To build for a sub-path locally: `BASE_PATH=/<repo>/ npm run build`.

## Status

| Section | State |
|---|---|
| Nav (sticky, scroll-spy, mobile menu), hero, footer | done |
| Problem: Spot the fake + facts | done |
| Demo: video slots with placeholders | done |
| How it works: flow + where the attacker fails | done |
| **Try it: interactive map** | **placeholder, next step** |
| Enterprise, Who it's for, FAQ | done |
| `technical.html` ("For the curious") | optional, not started |

## Decisions where the brief left a choice

- **Astro + React islands** rather than plain Vite: static HTML for the reading
  sections, React only where state lives, and a second page (`technical`) is free.
- **Verdict icons are SVG** (lucide check, triangle-alert, question mark), not
  the Unicode check, warning and question glyphs, which some platforms render as emoji.
- **Single accent.** Green and red are reserved for verdicts. The primary button
  is ink; cobalt marks links, focus, the reader's phone and registered areas.
- **Who it's for** uses one lead card and a quieter list instead of three equal
  cards, so the eye has a first place to land (the primary reader).
- **Spot the fake** shows the real domains from the start (they differ by one
  letter, `wlfi` vs `wifi`), so the quiz is honest and still hard.
- **Location FAQ** describes what the prototype's lookup sends: map cells covering
  an area around the device (about 50 m by default) plus an altitude range, to the
  GECKO map server only. Marked "to be confirmed by the author" until confirmed.
