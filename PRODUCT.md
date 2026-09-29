# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: recruiters and hiring managers** in Madrid and remote European teams, deciding within seconds whether Elkin fits a Full Stack or Automation Engineer role. Many are not design-literate. They scan for role, location, availability, stack and proof of impact, then download the CV or get in touch.
- **Secondary: CTOs and engineering leads** who read deeper: they judge engineering credibility from the projects, the stack and how the site itself is built.
- **Owner: Elkin**, who adds and edits projects over time through `/admin` without touching code.

## Product Purpose

The personal portfolio of Elkin Leonardo Moreno Mojica, Full Stack Developer & Automation Engineer based in Madrid. It exists to get him hired (full-time) or contracted (freelance); he wants both. Success is a recruiter or CTO understanding in about ten seconds who he is, what he does and that he is available, then reaching him or downloading his CV.

## Positioning

He sits where product meets operations. He automates manual work in real operations (n8n, internal AI chatbots), builds the internal ERP-style tools behind it (Symfony/PHP, React) and integrates systems through async messaging (RabbitMQ, Google Pub/Sub, Redis). He came to engineering through functional analysis (UML/BPMN), so he models the process before choosing the architecture. That mix of analysis, full stack and automation in last-mile logistics is the claim a generic web developer cannot truthfully make.

## Operating Context

- Current role (Jul 2025 to present): Data & Automation team at Closer Logistics SL, Madrid (last-mile logistics).
- Earlier: Si Señor SAS (Bogotá, 20+ client sites in WordPress, Shopify and React); Infinivirt (Medellín, frontend lead); Carvajal Laboratorios IPS (Tunja, functional analyst); TVO Seguridad Electrónica and Tecnovision CCTV (San José, Costa Rica).
- Visitors arrive from LinkedIn, a CV link or a direct share, on desktop and on phones.

## Capabilities and Constraints

- React 19 + Vite 7 + TypeScript SPA, deployed statically to Vercel. No SSR.
- Bilingual ES/EN with a visible switch. All strings live in `src/i18n/strings.ts` and `src/data/profile.ts`.
- Projects are dynamic from Supabase (`projects` table), editable in `/admin`, with fallback seed data in `src/data/seedProjects.ts`. The contact form writes to `contact_messages`.
- The CV PDF is at `/CV_Elkin_Moreno.pdf`.
- Must work on phones and respect `prefers-reduced-motion`.
- **Availability (confirmed 2026-09-28):** he is looking for BOTH full-time employment and freelance projects. The copy must address both audiences (hiring managers and potential clients).

## Brand Commitments

- He asked for a site that is **dynamic but reads as serious, professional, modern and technological**.
- He rejected (1) the generic AI look (violet/cyan aurora, glass, serif display) and (2) themed "concept" treatments such as a delivery note, a split-flap board or a poster, which read as unprofessional.
- He chose the premium tech-product direction, in the class of Linear and Vercel, and asked to keep three ideas done professionally: a live automation flow, the list of manual tasks turned automated, and large screenshots of his client sites.
- Personal principle he agreed to feature: "Si se hace dos veces, lo automatizo."

## Evidence on Hand

- CV content in `src/data/profile.ts`: roles, dated achievements with percentages he wrote himself (20+ sites; up to 40% faster load; 30% shorter delivery; 50% less operational time on internal tools; 10+ frontend projects led).
- Real screenshots of three client sites built at Si Señor SAS: `public/projects/aviatur-colombia.webp`, `mindhack.webp`, `yes-sir-agency.webp`.
- **Absent, must not be fabricated:** screenshots of internal Closer Logistics tools; hours or minutes saved by his automations; testimonials; a portrait photo (optional slot at `public/portrait.jpg`); exact tech and year for the three client sites (currently a first draft marked for his review).

## Product Principles

1. Credibility first, personality second. Every flourish must also read as competence.
2. Show the work instead of describing it: demonstrations of real mechanisms beat adjectives.
3. Measurable or it does not count. Every number comes from him, never from us.
4. A recruiter in a hurry is never blocked by an effect.

## Accessibility & Inclusion

WCAG 2.1 AA: text contrast, full keyboard use, visible focus, and screen-reader-safe animated text. Reduced motion gets a designed static state, not a broken page.
