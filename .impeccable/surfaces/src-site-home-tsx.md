---
version: 1
slug: "src-site-home-tsx"
primary_target: "src/site/Home.tsx"
related_targets: ["src/site/hero/Hero.tsx"]
---

# Home (/) — surface brief

Scope: the public one-page portfolio (Hero → #proyectos → #experiencia → #stack → #sobre-mi → #contacto → Footer) and the project detail it links to. Visitor mode: Persuade (recruiter or CTO deciding in seconds, then CV or contact). Product truth lives in PRODUCT.md; tokens in src/index.css.

## Direction contract

THESIS: Show the work instead of describing it. The page owns one idea: manual work being retired by a system, demonstrated live inside a laptop that opens with the scroll. It refuses the category default of a centred headline over a gradient, a skills grid and same-size project cards.

OWN-WORLD: Near-black #0a0a0b ground, graphite surfaces and 1px hairlines, one accent #ff6b2c that only ever means live / automated / current. Host Grotesk for all language, Fragment Mono only for data (dates, ids, statuses, counts, identifiers). Flow-editor grammar everywhere a mechanism is shown: dotted canvas, graphite nodes, thin edges, the accent trail.

STORY: The visitor reads who Elkin is and that he is available, scrolls, watches the laptop open and four real manual tasks flip to "Automatizado", then sees the same flow language in each project, the dated CV, and reaches contact or the CV.

FIRST VIEWPORT: Headline top-left at display size; sub with name, role and city; "Escríbeme" primary plus "Descargar CV"; availability, location and current employer as a small list at right. Below, the closed laptop seen from above, whole, peeking above the fold.

FORM: Premium tech product, Linear / Vercel class. Authority: the user's confirmed answer "Producto tech premium (Linear / Vercel)" after rounds 1 and 2 were rejected. Seed key: none; no concept roll ran, the user's pick is the direction and is not re-rolled. Signature interaction: scroll-scrubbed, reversible lid opening with a camera descent, then a desktop pin where each scroll step sends a packet and flips one task to Automatizado (4/4).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions

- Employment, freelance or both (copy currently says available for new opportunities).
- Master end date vs the "now" list (profile.ts) needs Elkin's confirmation.
