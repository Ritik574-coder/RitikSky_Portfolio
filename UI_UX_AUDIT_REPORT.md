# UI/UX Audit Report — RitikSky Portfolio

**Scope:** Full application (Home single-page experience, project modal/page routes, chat terminal, modals, global chrome).  
**Method:** Code and asset inspection of every page, section, component, token, and responsive path. No code was modified.  
**Date:** 2026-09-28  

**Overall verdict:** The portfolio has a strong dark/neon engineering aesthetic, deliberate motion, and solid section craft. Trust and polish are undermined by identity/meta contradictions, a navbar contrast bug on major dark sections, oversized hero/contact imagery, and several accessibility gaps. Fix foundation issues first (identity → tokens → critical chrome), then interaction/a11y, then polish.

---

## Recommended implementation order

Issues are ordered so each fix builds on the previous. Implement `ISSUE-001` first.

---

### ISSUE-001 — Conflicting personal identity (location, role, brand aliases)

**Status: FIXED (2026-09-28)**

Canonical identity applied across SEO, UI, portfolio data, AI context, and chat chrome:
- Name: Ritik Kumar · Role: Data Engineer · Location: India
- Positioning: data engineering + analytics engineering primary; AI/ML as additional skills
- GitHub: Ritik574-coder

**Files modified:**
- `index.html` — meta description/keywords, OG/Twitter descriptions, JSON-LD `knowsAbout` (Data Engineer / India). Domain URLs left unchanged (see flag below).
- `src/components/HeroSection.jsx` — supporting line no longer co-titles “Full-Stack Developer”.
- `src/components/AboutSection.jsx` — bio aligned to Data Engineer + analytics engineering positioning.
- `src/data/portfolioData.js` — profile bio updated to the same positioning (`role`/`location` already correct).
- `src/services/aiContext.js` — prompt examples no longer claim AI Engineer/Full-Stack from Indonesia; lead with Data Engineer / India.
- `src/components/ChatWidget.jsx` — `zickrian@portfolio` → `ritik@portfolio`; `zickrian_bot` → `ritik_assistant`.

**Flagged (not changed — no verified canonical domain in project):**
- `https://zickrian.dev/` (`link rel="canonical"` in `index.html`)
- `https://zickrian.com/` (`og:url`, `twitter:url`, JSON-LD `url` in `index.html`)

Confirm which domain is official, then align all three URL fields in a follow-up.

**Original finding**  
The site presents contradictory identity signals:

- UI says **Based in India** (`HeroSection.jsx`, `AboutSection.jsx`, `portfolioData.js` → `location: "India"`).
- `index.html` meta description says **“Based in Indonesia.”**
- AI system examples in `src/services/aiContext.js` describe Ritik as an **AI Engineer & Full-Stack Developer from Indonesia**.
- Live UI role is **Data Engineer**; meta/AI copy still lean AI Engineer / Full-Stack.
- Chat terminal brands itself **`zickrian_bot`** / `zickrian@portfolio` while page title/hero brand **RITIK KUMAR**.
- Domains conflict: canonical `https://zickrian.dev/` vs Open Graph / Twitter / JSON-LD `https://zickrian.com/`.

**Where**  
`index.html`; `src/components/HeroSection.jsx`; `src/components/AboutSection.jsx`; `src/data/portfolioData.js`; `src/services/aiContext.js`; `src/components/ChatWidget.jsx` (neofetch / header).

**Why it matters**  
Recruiters and visitors lose trust within seconds when location, role, and domain disagree. The AI assistant can then reinforce the wrong story.

**Recommended improvement**  
Pick one canonical identity pack (name, role, location, primary domain, email, socials) and propagate it through meta, UI, `PORTFOLIO_DATA`, and AI prompts. Align chat branding with the public name or clearly subtitle the alias.

**Expected result**  
Every surface tells the same story: who you are, where you are, what you do, and which URL is official.

**Priority:** Critical  

**Dependencies:** None (do this before copy/SEO work).

---

### ISSUE-002 — Broken / inconsistent social and PWA metadata assets

**What is wrong**  

- `og:image` and `twitter:image` point to `/og-icon.png`, but **no `og-icon.png` exists** under `public/`.
- `public/manifest.json` references `favicon.svg` (lowercase); the file on disk is `Favicon.svg` (case-sensitive hosts will 404).
- Manifest `name` / `short_name` are generic **“Portfolio”**, `theme_color` `#000000`, `background_color` `#ffffff` — disconnected from the lime-on-ink brand.
- Twitter card is `summary` (small) rather than a large image card once a real OG image exists.

**Where**  
`index.html`; `public/manifest.json`; `public/` asset inventory.

**Why it matters**  
Shared links show broken/blank previews. Installed PWA chrome looks generic. This is first-impression damage outside the site itself.

**Recommended improvement**  
Add a real 1200×630 OG image, use absolute HTTPS URLs for OG/Twitter images, fix favicon casing consistently, and brand the manifest (name, colors, icons).

**Expected result**  
Link previews and “Add to Home Screen” reflect Ritik Kumar’s brand correctly on all platforms.

**Priority:** Critical  

**Dependencies:** ISSUE-001 (canonical domain/name for absolute OG URLs).

---

### ISSUE-003 — Accent color system is split three ways

**What is wrong**  
Three competing “lime” accents coexist:

| Token / class | Approx. value | Used in |
|---|---|---|
| CSS `--lime-rgb` | `#A3E635` (Tailwind `lime-400`) | Hero scene glow, selection, outline text |
| Hex `#A3FF12` | Brighter neon | About, Experience, Tech, GitHub, Capabilities, Footer |
| Tailwind `lime-400` / `lime-500` | `#A3E635` / `#84CC16` | Hero CTAs, Marquee, Navbar accents, Hackathon modal |

Comments in `src/index.css` claim tokens prevent drift, but most sections hardcode `#A3FF12` and Hero still uses `lime-400`.

**Where**  
`src/index.css` (`:root`); `src/components/HeroSection.jsx`; `src/components/AboutSection.jsx`; `src/components/Footer.jsx`; `src/components/TechStack.jsx`; `src/components/GitHubStats.jsx`; `src/components/TechnicalCapabilities.jsx`; `src/components/ProfessionalExperience.jsx`; `src/components/MarqueeBanner.jsx`; `src/components/Navbar.jsx`.

**Why it matters**  
Adjacent sections feel slightly “off brand” — especially Hero → Marquee → About. Glow/selection vs UI chrome don’t match.

**Recommended improvement**  
Choose one primary accent. Expose it as CSS variables (solid + rgb). Replace hard-coded hex and mixed `lime-*` utilities with those tokens (or a single Tailwind theme color).

**Expected result**  
One consistent neon accent from preloader through footer and project case themes.

**Priority:** High  

**Dependencies:** None (but do before large visual polish passes).

---

### ISSUE-004 — Typography stack is misconfigured and self-contradictory

**What is wrong**  

- `index.html` loads **Space Grotesk** (+ unused **Pacifico**).
- `src/index.css` sets `--font-sans`, `--font-display`, and even `--font-mono` to **Space Grotesk**.
- `tailwind.config.js` declares `fontFamily.sans` as **Inter**, `mono` as **JetBrains Mono**, and `display` as Space Grotesk — but **Inter and JetBrains Mono are never loaded**.
- Result: `font-mono` UI (nav, labels, form, terminal chrome) is not truly monospace; Pacifico bandwidth is wasted.

**Where**  
`index.html`; `src/index.css`; `tailwind.config.js`.

**Why it matters**  
“Engineering / terminal” language depends on real mono. Current setup softens hierarchy and wastes a font request.

**Recommended improvement**  
Decide: (A) Space Grotesk + a real mono (e.g. JetBrains Mono / IBM Plex Mono), or (B) keep Space Grotesk only and stop labeling UI as mono. Remove Pacifico if unused. Align Tailwind `theme.fontFamily` with CSS variables and loaded faces.

**Expected result**  
Predictable type hierarchy; terminal/nav labels actually read as mono; no unused font downloads.

**Priority:** High  

**Dependencies:** None.

---

### ISSUE-005 — Navbar contrast fails on About, Experience, and Capabilities

**What is wrong**  
`DARK_SECTION_IDS` in `Navbar.jsx` is:

`hero-section`, `project-section`, `tech-stack-section`, `github-stats-section`, `contact-section`

It **omits** `about-section`, `experience-section`, and `capabilities-section`, all of which use dark backgrounds (`#171817`). On those sections the logo/menu use **black text / light-mode chrome** over dark content → low or failing contrast. Mobile menu backdrop logic can also pick the light theme while the page behind is dark.

**Where**  
`src/components/Navbar.jsx` (`DARK_SECTION_IDS`, `isOnDarkSection` probe).

**Why it matters**  
Primary navigation becomes hard to read on three major sections — a Critical usability/accessibility defect.

**Recommended improvement**  
Add the missing dark section IDs (or invert the model: treat listed *light* sections as exceptions). Re-test at the 44px probe line across every section boundary, including sticky overlaps.

**Expected result**  
Logo, desktop capsule, and mobile toggle remain clearly legible on every section.

**Priority:** Critical  

**Dependencies:** ISSUE-003 helpful but not required.

---

### ISSUE-006 — Oversized full-bleed images hurt first load and scroll performance

**What is wrong**  

- `public/overview.webp` ≈ **1.36 MB** (Hero full-bleed).
- `public/contect.webp` ≈ **1.37 MB** (Contact full-bleed; filename typo “contect”).
- Hero also stacks animated grid, orbs, vignette, and parallax on top of that photo.
- `Home.jsx` preloads `dbt-analytics-engineering-overview.webp` while `index.html` preloads `overview.webp` — competing LCP candidates.

**Where**  
`public/overview.webp`; `public/contect.webp`; `src/components/HeroSection.jsx`; `src/components/Footer.jsx`; `index.html`; `src/pages/Home.jsx`.

**Why it matters**  
Multi-megabyte decorative photos dominate LCP/bandwidth, especially on mobile. Motion + large decode cost makes the first viewport feel heavy.

**Recommended improvement**  
Compress/resize to sensible max widths (e.g. 1600–2000px), serve responsive `image-set`/`srcset` or CSS `image-set`, fix the filename typo when convenient, and align a single LCP preload with the true hero asset. Consider a lighter mobile crop.

**Expected result**  
Faster first paint, less jank on hero/contact, clearer LCP story.

**Priority:** High  

**Dependencies:** None.

---

### ISSUE-007 — Preloader always gates the site behind a long fake boot sequence

**What is wrong**  
`Preloader.jsx` animates progress with random increments every 120ms to 100%, then waits ~800ms + 800ms exit — typically **several seconds** before scroll unlock — independent of real asset readiness. It also re-renders ASCII noise via `tick` every 60ms with `Math.random()` inside render. `Home.jsx` locks body overflow until `onComplete`.

**Where**  
`src/components/Preloader.jsx`; `src/pages/Home.jsx` (`isLoading`, `isScrollLocked`).

**Why it matters**  
Repeat visitors and recruiters on slow connections wait on theater, not content. Heavy re-renders during boot compete with hero image decode.

**Recommended improvement**  
Cap duration (e.g. ≤1.2s), skip/short-circuit when `prefers-reduced-motion` or `sessionStorage` “seen”, tie completion to critical hero image `decode()`/`load`, and stop random work in the render path.

**Expected result**  
Brand moment without blocking real content; calmer CPU during boot.

**Priority:** High  

**Dependencies:** ISSUE-006 (real load timing improves if images are lighter).

---

### ISSUE-008 — Hero entrance is not coordinated with the preloader

**What is wrong**  
`Home.jsx` always passes `isRevealed={true}` to `HeroSection`. Iris/clip/blur entrance logic exists but effectively runs (or is already “on”) under the preloader rather than as a reveal when loading ends.

**Where**  
`src/pages/Home.jsx`; `src/components/HeroSection.jsx` (`isRevealed` animations).

**Why it matters**  
Either wasted animation work during boot, or a missed premium “reveal” after the preloader — the interaction design is half-wired.

**Recommended improvement**  
Drive `isRevealed` from preloader completion (or remove unused reveal props and simplify). One intentional entrance sequence.

**Expected result**  
A single clear hero reveal after boot (or a simpler static hero with no dead code paths).

**Priority:** Medium  

**Dependencies:** ISSUE-007.

---

### ISSUE-009 — Navigation labels and section naming are inconsistent / unclear

**What is wrong**  

- Nav label **“Logs”** maps to Projects (`project-section`); section title is **“Past Explorations”**; chat/registry says **“Past Explorations / Projects”**; Footer sitemap says **“Projects”**.
- Nav **“Work”** → Experience; **“Skills”** → Capabilities; **“Stack”** → Tech — recoverable but jargon-heavy.
- Section eyebrows use mixed formats: `01 — About`, `02. Past_Explorations`, `03 - Experience`, `04. Technical_Arsenal`, `05. Source_Metrics`, `06. Capabilities_Matrix`, Footer `// INITIALIZE_CONTACT` (no number).

**Where**  
`src/components/Navbar.jsx`; `src/components/ProjectGallery.jsx`; `src/components/Footer.jsx` (`SITEMAP`); `src/data/sectionRegistry.js`; section headers across About / Experience / Tech / GitHub / Capabilities / Footer.

**Why it matters**  
Visitors hesitate on “Logs.” Inconsistent numbering weakens the deliberate “system” aesthetic.

**Recommended improvement**  
Unify labels (prefer plain “Projects”). Standardize eyebrow pattern (`0N — Label`) and align Footer sitemap with Navbar.

**Expected result**  
Nav, in-section titles, chat intents, and footer all use the same vocabulary.

**Priority:** High  

**Dependencies:** ISSUE-001 (wording for role/sections).

---

### ISSUE-010 — Hero primary CTA bypasses Lenis smooth scroll

**What is wrong**  
“View Projects” uses `document.getElementById('project-section')?.scrollIntoView({ behavior: 'smooth' })`, while Navbar / Footer / Chat use `window.lenisInstance.scrollTo(...)`. With Lenis active, native `scrollIntoView` can feel abrupt, desync ScrollTrigger, or fight the smooth scroller.

**Where**  
`src/components/HeroSection.jsx` (CTA button); compare `src/components/Navbar.jsx` `scrollTo`.

**Why it matters**  
Primary conversion action has a different (worse) scroll feel than the rest of the site.

**Recommended improvement**  
Reuse the same Lenis-aware scroll helper as the Navbar (with the same offset).

**Expected result**  
Consistent smooth scroll from hero CTA into the projects gallery.

**Priority:** High  

**Dependencies:** None.

---

### ISSUE-011 — Two `<h1>` elements in the hero

**What is wrong**  
“RITIK” and “KUMAR” are separate `Gsap.h1` nodes. The document therefore has **multiple h1s** on the home page.

**Where**  
`src/components/HeroSection.jsx`.

**Why it matters**  
Hurts document outline / SEO / screen-reader “main heading” semantics.

**Recommended improvement**  
One `<h1>` wrapping both lines (styled with two spans), demote the slogan to `<p>` or `<h2>` as appropriate.

**Expected result**  
A single clear page title: “Ritik Kumar”.

**Priority:** Medium  

**Dependencies:** None.

---

### ISSUE-012 — About copy typo and weak “stats” that look like metrics

**What is wrong**  

- Bio text: `data:building` missing space → should be `data: building` (`AboutSection.jsx`).
- “Quick stats” show **BUILD / DATA+AI / OPEN** — words typeset like numeric KPIs (`text-[22px] font-black`), which reads as empty or decorative filler next to a professional photo.

**Where**  
`src/components/AboutSection.jsx` (`STATS`, bio paragraph).

**Why it matters**  
Typos look careless. Fake metric tiles dilute credibility beside real achievements (hackathon finalist).

**Recommended improvement**  
Fix the typo. Replace word-tiles with real metrics (years, projects shipped, students mentored) or remove the strip.

**Expected result**  
Cleaner About hierarchy; stats earn their visual weight.

**Priority:** Medium  

**Dependencies:** ISSUE-001 for which metrics are truthful.

---

### ISSUE-013 — Achievement card is a clickable `div`, not a proper control

**What is wrong**  
`AchievementCard` uses `Gsap.div` with `onClick` and `cursor-pointer`, but no `role="button"`, no `tabIndex`, no Enter/Space handler, no `aria-haspopup`/`aria-expanded` for the hackathon modal. Footer CTA text says “Click to view details” (mouse-centric).

**Where**  
`src/components/AboutSection.jsx` (`AchievementCard`); opens `HackathonDetailModal`.

**Why it matters**  
Keyboard and many AT users cannot open a featured achievement.

**Recommended improvement**  
Use `<button>` (or add full keyboard/ARIA support) and label it clearly (“Open Base Realms case study”).

**Expected result**  
Achievement detail is reachable by keyboard and announced correctly.

**Priority:** High  

**Dependencies:** ISSUE-017 (modal a11y patterns).

---

### ISSUE-014 — Experience accordion missing expanded/collapsed semantics

**What is wrong**  
Role rows toggle via `<button>` but lack `aria-expanded`, `aria-controls`, and a stable panel `id`. The Plus icon rotation is the only expanded cue.

**Where**  
`src/components/ProfessionalExperience.jsx` (`ExperienceItem`).

**Why it matters**  
Screen-reader users don’t get expand/collapse state; keyboard users get less certainty after activation.

**Recommended improvement**  
Add `aria-expanded={isExpanded}`, `aria-controls`, matching panel id; optionally one-open accordion announcement.

**Expected result**  
Accessible, predictable timeline disclosure pattern.

**Priority:** Medium  

**Dependencies:** None.

---

### ISSUE-015 — Projects gallery: discoverability and control affordances

**What is wrong**  

1. **Desktop:** Progress dots are non-interactive `<div>`s — cannot jump to a project. No copy explaining “scroll to scrub horizontally,” so the pinned GSAP section can feel like a stuck page.
2. **Mobile:** Horizontal snap strip uses `scrollbar-hide`, but **that utility is not defined** in CSS/Tailwind config (dead class). Native scrollbar behavior is inconsistent; there is little hint to swipe.
3. Cards support Enter but not **Space** (`onKeyDown` only checks Enter).
4. Project index display `0{project.id}` is fine for ids 1–8 but is a fragile pattern.
5. Desktop hover reveals title lift; keyboard focus styles are not equivalently strong.

**Where**  
`src/components/ProjectGallery.jsx`.

**Why it matters**  
Projects are the portfolio’s core proof. If users don’t understand the horizontal scrub or can’t operate cards fully via keyboard, conversions drop.

**Recommended improvement**  
Add a short desktop hint (“Scroll to explore”), make dots buttons that scroll/scrub to index, define or remove `scrollbar-hide`, handle Space, and add visible `:focus-visible` rings on cards.

**Expected result**  
Projects are obviously browsable on desktop and mobile; fully operable via keyboard.

**Priority:** High  

**Dependencies:** ISSUE-010 for scroll helper consistency.

---

### ISSUE-016 — Tech Stack skill names are hover-only tooltips

**What is wrong**  
Icons use `title={skill.name}` plus a CSS tooltip that appears on `group-hover/icon`. No visible labels on touch devices; keyboard focus does not show the custom tooltip. Azure uses a generic Lucide `Cloud` icon (weaker recognition).

**Where**  
`src/components/TechStack.jsx`.

**Why it matters**  
On mobile/tablet, visitors see unlabeled icons. Hover tooltips fail accessibility and touch UX.

**Recommended improvement**  
Show names under icons (or in a text list beside icons), keep icons decorative with `aria-hidden`, and expose names in accessible text.

**Expected result**  
Every skill is identifiable without hovering.

**Priority:** High  

**Dependencies:** ISSUE-004 (mono labels will look better once fonts are fixed).

---

### ISSUE-017 — Capabilities matrix hides descriptions behind hover on desktop

**What is wrong**  
Desktop descriptions live in a hover-expanded block (`hidden md:block` + height/opacity on hover). Keyboard users don’t get the same reveal. The “ghost” cell runs a continuous spin animation (`animate-[spin_10s_...]`) with no information beyond “Continuously Evolving.” Cascade highlight ignores `prefers-reduced-motion` beyond the global nuclear CSS override (interval still schedules work).

**Where**  
`src/components/TechnicalCapabilities.jsx`.

**Why it matters**  
Capability copy is the substance of the section; hover-only content fails inclusive design. Endless spin adds noise.

**Recommended improvement**  
Always show short descriptions (or toggle on focus/click). Respect reduced motion in the cascade `useEffect`. Soften or remove decorative infinite spin.

**Expected result**  
Capabilities remain readable without a mouse; calmer motion profile.

**Priority:** Medium  

**Dependencies:** None.

---

### ISSUE-018 — Modals lack dialog semantics and focus management

**What is wrong**  
`ProjectDetailModal` and `HackathonDetailModal`:

- Lock body scroll and support Escape (good).
- Do **not** set `role="dialog"`, `aria-modal="true"`, labelled-by title.
- Do **not** trap focus or restore focus to the opener on close.
- Backdrop click closes, but focus can move to content behind while the overlay is open (especially with Lenis/`pointer-events` quirks).

Project route fallback: `ProjectDetailRouter` returns **`null`** for unknown slugs (blank screen) and the Suspense fallback is visually unstyled relative to case themes.

**Where**  
`src/components/projects/ProjectDetailModal.jsx`; `src/components/HackathonDetailModal.jsx`; `src/components/projects/ProjectDetailRouter.jsx`.

**Why it matters**  
Modals are high-risk a11y surfaces. Blank unknown-slug routes look broken.

**Recommended improvement**  
Implement a shared dialog pattern: roles, initial focus, focus trap, return focus, and a styled not-found state for bad slugs.

**Expected result**  
Modals behave like proper dialogs; bad URLs fail gracefully.

**Priority:** High  

**Dependencies:** ISSUE-013 (achievement opens hackathon modal).

---

### ISSUE-019 — Contact form UX friction and incomplete status lifecycle

**What is wrong**  

- **Phone is `required`** — unusual for portfolio contact; increases abandonment.
- Status messages stay forever (success/error never reset to `idle`).
- Inputs use `outline-none` with custom focus border (ok) but there is no global `:focus-visible` system for buttons/links elsewhere.
- Chat FAB + Footer copyright already compete; Footer adds `md:pr-12` as a workaround — still tight on small tablets when chat is open.
- Form sits on a tall `min-h-[100svh]` contact scene; on mobile the photo + form + networks stack is long with heavy backdrop image cost (see ISSUE-006).

**Where**  
`src/components/Footer.jsx`; interaction with `src/components/ChatLauncher.jsx` / `ChatWidget.jsx`.

**Why it matters**  
Contact is the hire path. Extra required fields and sticky error/success states hurt completion and clarity.

**Recommended improvement**  
Make phone optional; auto-clear status after a timeout or on edit; ensure success/error are announced (already `role="status"` — keep); give the open chat panel safe clearance from the form submit button on all breakpoints.

**Expected result**  
Higher completion rate; clear, temporary feedback; no control collisions.

**Priority:** High  

**Dependencies:** None for form fields; chat clearance pairs with ISSUE-020.

---

### ISSUE-020 — Chat terminal: branding, motion classes, and mobile collision

**What is wrong**  

- Brands as `zickrian_bot` while the site brands Ritik Kumar (see ISSUE-001).
- Uses `animate-in slide-in-from-bottom-5` classes (**tailwindcss-animate is not installed** — animation is effectively a no-op).
- Quick-action row uses `no-scrollbar` (also undefined).
- Panel is `min(95vw, 480px)` × `52vh` on mobile — can cover the contact form and nav CTA; no focus trap when open.
- Input `placeholder=""` — empty field with only a `>` prompt may confuse non-terminal users despite quick actions.

**Where**  
`src/components/ChatWidget.jsx`; `src/components/ChatLauncher.jsx`; `package.json` (no animate plugin).

**Why it matters**  
Chat is a differentiator but feels unfinished (dead animation classes) and can obstruct primary contact UI.

**Recommended improvement**  
Align naming; implement a real open/close animation via GSAP/CSS you already use; add a short placeholder (“Ask about projects…”); trap focus; ensure the widget doesn’t cover Footer submit on small screens (bottom sheet full-width is an option).

**Expected result**  
Chat feels intentional, on-brand, and non-blocking.

**Priority:** Medium  

**Dependencies:** ISSUE-001; ISSUE-019 for Footer collision.

---

### ISSUE-021 — Custom cursor composites without hiding the system cursor

**What is wrong**  
`Cursor.jsx` renders a fixed white dot (`mix-blend-difference`) on fine-pointer desktops but **never sets `cursor: none`** on `body`/interactive elements. Users see **system cursor + custom cursor**. Hover scaling listens for `a, button, .project-card` only — many clickable `div`s and Magnetic-wrapped controls won’t inflate the cursor.

**Where**  
`src/components/Cursor.jsx`; usage in `src/pages/Home.jsx`.

**Why it matters**  
Dual cursors look unfinished and can reduce click precision perception.

**Recommended improvement**  
Either hide the system cursor while the custom cursor is active (and add reduced-motion / touch guards you already partly have), or remove the custom cursor for a cleaner native feel. Expand hover targets to `[role="button"]` etc.

**Expected result**  
One clear pointer affordance, consistent with interactive elements.

**Priority:** Medium  

**Dependencies:** None.

---

### ISSUE-022 — No skip link; weak global keyboard focus visibility

**What is wrong**  
There is no “Skip to content” link. Many controls rely on hover color changes without a shared `:focus-visible` ring. Navbar logo scroll-to-top is a **`div` with `onClick`**, not a focusable button/link. Global CSS sets `-webkit-tap-highlight-color: transparent` and hides scrollbars on `html/body`, which removes positional feedback for keyboard/scroll users.

**Where**  
`src/pages/Home.jsx` / `index.html` (missing skip link); `src/components/Navbar.jsx` (logo); `src/index.css` (scrollbar hiding, tap highlight).

**Why it matters**  
Keyboard and AT users need a fast path past recurring chrome and a visible focus location.

**Recommended improvement**  
Add a skip link to `#hero-section` or main content wrapper; make the logo a `<button>`; add a global focus-visible outline using the accent token; consider not fully hiding scrollbars on desktop.

**Expected result**  
Navigable without a mouse; visible focus at all times.

**Priority:** High  

**Dependencies:** ISSUE-005 (navbar) so focus styles remain visible on dark/light sections.

---

### ISSUE-023 — Horizontal marquee is pure decoration with duplicated content

**What is wrong**  
`MarqueeBanner` repeats the same 12 skills in two opposite-scrolling rows. It sits between Hero and About with no landmark/`aria-hidden` strategy documented for AT (animated text may be announced noisily depending on browser). Content largely duplicates About capabilities / Tech stack.

**Where**  
`src/components/MarqueeBanner.jsx`; placement in `src/pages/Home.jsx`.

**Why it matters**  
Motion + duplication adds little information after the hero slogan. For reduced-motion users the global CSS nukes animation (good) but leaves a static double list.

**Recommended improvement**  
Mark decorative (`aria-hidden="true"`), shorten to one row, or replace with a single purposeful divider. Ensure reduced-motion still looks intentional.

**Expected result**  
Transition between Hero and About feels purposeful, not noisy.

**Priority:** Low  

**Dependencies:** ISSUE-003 for accent consistency on the lime row.

---

### ISSUE-024 — Home shell background `#FAF9F6` no longer matches an all-dark page

**What is wrong**  
`Home.jsx` root uses `bg-[#FAF9F6] text-black`, but nearly every section is dark ink (`#0A0A0A` / `#171817` / `neutral-900`). Cream only flashes if lazy sections gap or overscroll. Navbar light-mode styles still assume cream sections that barely exist (compounded by ISSUE-005).

**Where**  
`src/pages/Home.jsx`; contrast with section backgrounds across components.

**Why it matters**  
Dead light theme path increases navbar complexity and risk of contrast bugs.

**Recommended improvement**  
Either commit to an all-dark home shell (`bg` ink + light text defaults) and simplify navbar themes, or intentionally reintroduce a true light section.

**Expected result**  
Shell background matches the product; fewer theme edge cases.

**Priority:** Medium  

**Dependencies:** ISSUE-005.

---

### ISSUE-025 — Content positioning: Data Engineer page vs AI-heavy stack/capabilities

**What is wrong**  
Hero/About position **Data Engineer** (pipelines, SQL, dbt, warehousing). Immediately after, Tech Stack leads with **AI & Machine Learning** (TensorFlow, PyTorch, Keras…) and Capabilities opens with ML/DL/CV/NLP. Data engineering tools (dbt, Snowflake, PySpark, Airflow-like) appear in the marquee more than in Tech Stack categories.

**Where**  
`src/components/HeroSection.jsx`; `src/components/AboutSection.jsx`; `src/components/TechStack.jsx`; `src/components/TechnicalCapabilities.jsx`; `src/components/MarqueeBanner.jsx`.

**Why it matters**  
Visual hierarchy fights the stated positioning. A hiring manager for Data Engineering may bounce before seeing relevant proof; an AI role may doubt depth.

**Recommended improvement**  
Reorder Tech/Capabilities to lead with data engineering, or explicitly frame “Data Engineer with AI/ML depth” in section intros and icon groups.

**Expected result**  
First scroll minutes reinforce the same positioning as the hero.

**Priority:** Medium  

**Dependencies:** ISSUE-001 (canonical role).

---

### ISSUE-026 — Project case studies: keyboard/modal UX is stronger than empty states

**What is wrong**  
`ProjectCaseLayout` is generally well structured (sticky header, clear CTAs). Gaps:

- Unknown slug → blank (`null`).
- Loading fallback is generic and not theme-aware.
- Outlined last-word title technique (`WebkitTextStroke`) can fail/illegible in some browsers (you already have a fallback for `.text-outline-lime` in CSS, but case studies use inline stroke).
- Direct `/projects/:slug` page destroys Lenis (by design in `App.jsx`) — returning via “Back to Home” with `scrollTo=project-N` is good, but users opening projects in a new tab miss the modal chrome context.

**Where**  
`src/components/projects/ProjectCaseLayout.jsx`; `ProjectDetailRouter.jsx`; `App.jsx` ScrollToTop.

**Why it matters**  
Edge cases feel less polished than the gallery.

**Recommended improvement**  
Not-found page, themed loader, stroke fallback class shared with hero.

**Expected result**  
Every project URL resolves to a clear UI state.

**Priority:** Low  

**Dependencies:** ISSUE-018.

---

### ISSUE-027 — GitHub stats empty/error UI is silent

**What is wrong**  
On fetch failure, `loading` becomes `false` with empty contribution data and possibly incomplete `userData`. UI still shows zeros/`----` and an empty heatmap without an error or retry message. Heatmap forces `min-w-[620px]` horizontal scroll inside a panel — workable but easy to miss on mobile (legend moves below only on `sm:hidden` duplicate).

**Where**  
`src/components/GitHubStats.jsx`.

**Why it matters**  
Failed third-party APIs look like “no activity,” which harms credibility.

**Recommended improvement**  
Explicit error/retry state; keep skeleton while loading; ensure mobile scroll affordance (“swipe to see year”).

**Expected result**  
Honest status when GitHub data is unavailable; readable chart on small screens.

**Priority:** Medium  

**Dependencies:** None.

---

### ISSUE-028 — Inconsistent interactive language (Magnetic, rounded-full chrome vs sharp sections)

**What is wrong**  
Dark sections favor sharp corners (`rounded-[2px]`–`[4px]`). Navbar/Chat/Hero secondary patterns use **pill / rounded-full** controls. `Magnetic.jsx` wraps nav items (desktop only) — fine — but logo Magnetic + non-button div is an odd pairing. Hackathon modal uses cream `#FAF9F6` while project modals use near-black themes — intentional contrast, but the two “detail overlay” systems feel like different products.

**Where**  
`src/components/Navbar.jsx`; `src/components/Magnetic.jsx`; `src/components/HackathonDetailModal.jsx` vs `ProjectDetailModal.jsx` / `ProjectCaseLayout.jsx`.

**Why it matters**  
Slight design-system fragmentation; overlays don’t share one interaction language.

**Recommended improvement**  
Document two intentional themes (light case vs dark case) or converge modal chrome (shared header, focus trap, radius). Align CTA radius with section language.

**Expected result**  
Overlays and nav feel like one system with deliberate exceptions only.

**Priority:** Low  

**Dependencies:** ISSUE-018.

---

### ISSUE-029 — Reduced-motion support is broad but incomplete at the JS layer

**What is wrong**  
`index.css` globally crushes CSS animation/transition durations for `prefers-reduced-motion` (good). Lenis disables itself (good). Noise overlay disables (good). Remaining JS intervals still run:

- Preloader timers / ASCII tick  
- TechnicalCapabilities cascade `setInterval`  
- Hero time badge / Footer clock (harmless)  
- Marquee relies on CSS (crushed to near-zero — may flash oddly)

**Where**  
`src/index.css`; `src/components/Preloader.jsx`; `src/components/TechnicalCapabilities.jsx`; `src/hooks/useLenis.js`.

**Why it matters**  
Accessibility preference should mean less motion *and* less timer work, not only CSS duration hacks.

**Recommended improvement**  
Gate intervals/GSAP entrances on `useGsapReducedMotion` / matchMedia in each motion feature.

**Expected result**  
True reduced-motion path: instant UI, no cascade light shows, short or skipped preloader.

**Priority:** Medium  

**Dependencies:** ISSUE-007, ISSUE-017.

---

### ISSUE-030 — Accessibility & semantics checklist (remaining clustered items)

**What is wrong** (verified leftovers not already covered above):

1. No `<main>` landmark wrapping page content in `Home.jsx`.
2. `Cursor` and `NoiseOverlay` both use `z-[50]` with Navbar — stacking is mostly ok due to `pointer-events-none`, but the cursor sits at the same tier as noise.
3. Project cards omit `aria-label` (title is inside but often visually over image contrast).
4. Contact bot honeypot checkbox is `className="hidden"` — prefer `sr-only` / off-screen so it isn’t display:hidden in ways some bots ignore differently (minor).
5. `index.html` still keywords/description oriented to Indonesia AI Engineer while UI is India Data Engineer (covered in ISSUE-001/002 but reaffirm here as a11y+SEO string consistency).

**Where**  
`src/pages/Home.jsx`; `src/components/ProjectGallery.jsx`; `src/components/Footer.jsx`; `index.html`.

**Why it matters**  
Landmarks and labels make the long single page traversable.

**Recommended improvement**  
Wrap content in `<main id="main">`, skip-link target, label project cards, finish meta alignment from ISSUE-001/002.

**Expected result**  
Cleaner accessibility tree; fewer “unlabeled button” issues.

**Priority:** Medium  

**Dependencies:** ISSUE-001, ISSUE-002, ISSUE-022.

---

## Suggested fix waves

| Wave | Issues | Goal |
|---|---|---|
| **Wave 1 — Trust & chrome** | 001–005 | Same identity, working social previews, readable nav, coherent color/type |
| **Wave 2 — Performance & first paint** | 006–008 | Fast hero, shorter boot, intentional reveal |
| **Wave 3 — Navigation & projects** | 009–011, 015 | Clear labels, reliable scroll, usable gallery |
| **Wave 4 — Content & forms** | 012, 016–017, 019, 025, 027 | Honest content hierarchy, readable skills, better contact |
| **Wave 5 — A11y & overlays** | 013–014, 018, 020–022, 029–030 | Keyboard-safe modals/chat/nav |
| **Wave 6 — Polish** | 023–024, 026, 028 | Cursor, shell theme, case-study edges |

---

## What is already working well (do not “fix” away)

- Dark ink + neon engineering direction is distinctive and mostly cohesive once tokens unify.
- Lenis + ScrollTrigger project gallery (desktop) is an intentional, high-craft interaction; mobile correctly falls back to native horizontal scroll.
- Footer contact fields have visible `sr-only` labels and status regions.
- Chat intent → section scrolling via `sectionRegistry` is a strong UX differentiator when branding is aligned.
- `prefers-reduced-motion` is at least acknowledged globally; NoiseOverlay / Lenis / parallax already gate on pointer and motion preferences in several places.
- Project case layout structure (tagline, links, features, impact, stack) is clear and scannable.

---

## Out of scope / not filed as issues

- Backend/API security of Web3Forms or Cerebras keys (not UI/UX).
- Whether specific career claims (accuracy %, student counts) are factually true — only UI presentation was evaluated.
- Renaming `contect.webp` alone was not raised as a user-facing bug because the asset loads; it is noted under ISSUE-006 as cleanup during image optimization.

---

*End of report. No project source files were modified except the creation of this document.*
