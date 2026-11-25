# GECKOGuard design kit: "The Register"

A land registry records who owns which parcel. GECKO records who may run which
network in which area. The kit borrows from survey maps and official records:
parcels, hatching, corner markers, monospaced entries. Calm, exact,
accountable; never a hacker aesthetic.

Open `design/kit.html` in a browser (after `npm run tokens`) to see every token
and component.

## Files

| File | Role |
|---|---|
| `design/tokens/colors.json` | Primitive → semantic → component colours (light only) |
| `design/tokens/typography.json` | Families, fluid sizes, leading, tracking, measures |
| `design/tokens/spacing.json` | 4px scale, layout, breakpoints (reference), z-index |
| `design/tokens/shape.json` | Radius, borders, shadows, focus, hatch, survey grid |
| `design/tokens/motion.json` | Durations, easing, reveal distance, stagger |
| `scripts/build-tokens.mjs` | JSON → `src/styles/tokens.css` (never edit that file by hand) |
| `src/styles/kit.css` | Base styles and every component, tokens only |
| `design/kit.html` | Living reference page |

## Rules

1. **Verdicts are the loudest thing.** Green (`verdict-verified-*`) and red
   (`verdict-conflict-*`) mean Verified and Conflict and nothing else. Always
   icon + word (`.chip`), never colour alone.
2. **One accent.** Cobalt (`accent-*`) is for links, focus, selection, the
   reader's phone and registered areas. The primary button is ink.
3. **Machines print in mono.** SSIDs, domains, coordinates, timestamps and
   certificate fields use JetBrains Mono (`.mono`, `.coord`). People read IBM Plex Sans.
4. **Registered means hatched.** A registered area is a cobalt dashed parcel
   with survey hatching (`.hatch`, `.map-area`).
5. **Flat by default.** Hairline borders separate; only floating things (phone,
   popovers, the open mobile menu) cast a shadow.
6. **One thing leads.** Each section has a first place for the eye: `.fact--lead`,
   `.audience__lead`. Display type is 2.5x body or more.
7. **Mobile is the base.** Styles assume a phone; `min-width` queries (in `em`)
   add the wider layouts.
8. **No native `<select>`, no one-sided accent borders, no emoji.** Use
   `.listbox`, full hairlines and lucide icons.

## Components

`.btn` (primary, secondary, ghost, sm, icon; hover, focus, active, disabled,
`aria-busy`, `aria-pressed`) · `.chip` (verified, conflict, unverified, checking;
lg) · `.nav` · `.phone` · `.network` · `.geocert` · `.portal` · `.flow`
(+ `--attack`) · `.facts` · `.audience` · `.accordion` · `.video` + `.timeline` ·
`.listbox` · `.input` / `.field` · `.map-*` SVG classes · `.note` · `.footer` ·
`.reveal` · `.survey-grid` · `.hatch`

## Checks

Run with the ux-ui-agent-skills kit: `validate_contrast.py design/tokens/colors.json`
(both themes), `lint_hardcodes.py --ext .astro,.tsx,.ts,.css src`, and the render
gates (`verify_states`, `verify_responsive`, `axe_audit`, ...) against `design/kit.html`
or a build.
