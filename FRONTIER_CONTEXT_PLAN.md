# FRONTIER CONTEXT PLAN

**Single Source of Truth (SSOT) · Design Context Layer · May 2026**

This document is the authoritative reference for all Frontier Biomed frontend code generation within the Peptde project. Every UI decision, token value, typographic assignment, spacing rule, and page blueprint defined here must be treated as binding. When implementation conflicts with this file, this file wins.

**Scope (Immediate):** Landing Page · Login Page · Email Verification Page  
**Source:** Frontier Brand Manual v1 (Fin.05.26)  
**Stack:** Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript

---

## 1. BRAND FOUNDATION & PRINCIPLES

### 1.1 The Narrative

Peptide medicine is not new. What is new is its moment.

For decades, peptides existed at the edge of clinical science — compounds of extraordinary precision and biological intelligence, understood by researchers, used by the rare forward-thinking clinician, and largely invisible to the infrastructure of modern healthcare. No supply chain built for them. No manufacturer who took them seriously enough to build a brand worthy of what they actually are.

That gap is the reason Frontier Biomed exists.

The category will grow. The regulatory environment will tighten. The buyers who chose their supply chain carefully will be the ones standing when it does. Frontier Biomed was built for those buyers.

**Core editorial line (use verbatim on hero surfaces):**

> The science is not a differentiator — it is the baseline. The differentiator is that we treat it that way.

---

### 1.2 Positioning Statement

For pharmacies, medical practitioners, telemedicine platforms, and B2B distribution networks who need a domestic peptide manufacturer they can trust unconditionally, **Frontier Biomed is the foundational manufacturing layer of the peptide economy.**

Unlike commodity peptide suppliers who treat purity as a marketing claim, we treat it as a chain of custody, verified at every bond, documented at every lot, and built to outlast every regulatory shift the category will face.

---

### 1.3 Mission

To be the foundational supply layer of the peptide economy, manufacturing with a precision, transparency, and design standard that the category has never seen, and the industry has never been able to ignore.

---

### 1.4 Vision

A world where the infrastructure of peptide medicine is as advanced as the science itself. Where every vial in every clinic has a verified origin, a documented chain of custody, and a manufacturer who stakes their name on what's inside it.

---

### 1.5 The Four Core Pillars

These pillars are the operational and philosophical commitments the entire brand is built to prove. All three target pages must reinforce at least one pillar visually or verbally. The Landing Page maps all four explicitly.

| Pillar | Headline | Proof Standard |
|--------|----------|----------------|
| **Verified at every bond** | Purity is a document | >99% purity verified by HPLC and MS, third-party tested per lot, with full chain-of-custody documentation available to every buyer. We do not claim quality. We demonstrate it. |
| **Domestic by design** | Produced in the United States | Not a compliance convenience — a strategic commitment to supply chain security. Shorter lead times, no customs exposure, consistent regulatory standing, and a facility that can be audited, visited, and held accountable. |
| **Infrastructure, not inventory** | The supply layer | Frontier Biomed does not sell to end users. We are the supply layer that pharmacies, platforms, and practitioners build their businesses on. The rigour of documentation, catalogue architecture, and brand presentation. |
| **Design as proof** | Visible expression of an invisible standard | In a category where every competitor looks the same, Frontier Biomed's design standard is itself a statement about quality. A manufacturer who cares this much about how their brand looks cares this much about what's inside the vial. |

**Code-generation alignment rule:** UI must feel precise, confident, technically fluent, and visually exceptional — never breathless, never defensive, never visually forgettable.

---

### 1.6 Brand Personality (UI Translation)

| Trait | UI Expression |
|-------|---------------|
| Precise | Deliberate copy, no filler labels, tight spacing discipline |
| Confident without noise | Minimal decoration, strong hierarchy, no over-explanation |
| Technically fluent | Mono register for data; accurate scientific terminology |
| Visually exceptional | Premium dark surfaces, editorial serif moments, duotone icon logic |
| Warm in the right moment | Coral Blush as accent warmth — never as primary background |

---

## 2. THE SYSTEM TOKENS (EXACT HEX CODES)

All tokens below are extracted from **Section 4.1 — Primary Colour Palette** of the Frontier Brand Manual. These four colors constitute the primary system. Secondary accent colors exist but must not overpower this palette in the entry funnel.

### 2.1 Primary Token Table

| Token Name | Role | HEX | RGB | CMYK | HSB |
|------------|------|-----|-----|------|-----|
| **Deep Teal** | Primary dark anchor. Reads as near-black in many contexts — intentional. Carries weight without aggression. | `#011A24` | `1, 26, 36` | `88, 70, 59, 73` | `197°, 97%, 14%` |
| **Pacific Teal** | Core active/accent hue. Mark, active states, primary typographic accents. | `#0D717B` | `13, 113, 123` | `88, 40, 45, 13` | `184°, 89%, 48%` |
| **Pure White** | Documentation base. Default field for technical documentation, labels, B2B materials. | `#FFFFFF` | `255, 255, 255` | `0, 0, 0, 0` | `0°, 0%, 100%` |
| **Coral Blush** | Warm highlight / editorial filter. Never a primary background — accent warmth in editorial and campaign contexts. | `#F7E1D9` | `247, 225, 217` | `2, 12, 11, 0` | `16°, 12%, 97%` |

### 2.2 Semantic Token Mapping (CSS Custom Properties)

Implement these in `app/globals.css` under `@theme inline`:

```css
--color-deep-teal: #011A24;
--color-pacific-teal: #0D717B;
--color-pure-white: #FFFFFF;
--color-coral-blush: #F7E1D9;

/* Semantic aliases */
--color-background-dark: var(--color-deep-teal);
--color-background-light: var(--color-pure-white);
--color-accent: var(--color-pacific-teal);
--color-accent-warm: var(--color-coral-blush);
--color-foreground-on-dark: var(--color-pure-white);
--color-foreground-on-light: var(--color-deep-teal);
```

### 2.3 Color Usage Rules

| Context | Rule |
|---------|------|
| Dark campaign / app shell | Deep Teal (`#011A24`) as base. White or Coral Blush typography accents. |
| Light documentation surfaces | Pure White (`#FFFFFF`) as base. Deep Teal typography. Pacific Teal for active states. |
| Active / focus / primary CTA | Pacific Teal (`#0D717B`) only. No gradient substitution in auth flows. |
| Editorial warmth | Coral Blush (`#F7E1D9`) as filter, highlight band, or subtle section wash — never full-page background in funnel pages. |
| Mark on dark | White wordmark. If mark is Blush Rose treatment, wordmark remains White — never Blush on Blush. |

### 2.4 Approved Logo Color Treatments (Reference)

1. **Deep Teal on White / Light** — Primary digital default
2. **White / Blush on Deep Teal or Dark** — Dark surfaces (entry funnel default)
3. **Black on White** — Legal / single-color only
4. **Reversed White on Any Dark Field** — Photography overlays

---

## 3. THE THREE-VOICE TYPOGRAPHY ENGINE (SECTION 5.5)

Frontier Biomed typography operates as a **three-voice system**. Each voice has a defined role. **They do not substitute for each other.**

```
┌─────────────────────────────────────────────────────────────────┐
│  ASPEKTA          │  FRAUNCES           │  JETBRAINS MONO      │
│  THE ARGUMENT     │  THE EMOTION        │  THE PROOF           │
│  Primary/default  │  Display/editorial  │  Technical/data      │
└─────────────────────────────────────────────────────────────────┘
```

### 3.1 Voice 1 — Aspekta (Sans) · *The Argument*

| Property | Value |
|----------|-------|
| **Role** | Primary. Everything. Always the default. |
| **CSS class** | `font-sans` |
| **Font family** | `Aspekta, system-ui, sans-serif` |
| **Use in** | Product labels, partner documentation, UI, navigation text, form labels, buttons, body copy, page titles (H1–H4), social and campaign utility text, presentations |
| **Wordmark note** | "Frontier" = Aspekta 400, tracking −50 · "BIOMED" = Aspekta 300, tracking −50 |

**When in doubt, it is always Aspekta.**

### 3.2 Voice 2 — Fraunces (Serif) · *The Emotion*

| Property | Value |
|----------|-------|
| **Role** | Display only. Editorial. A guest voice — never the default. |
| **CSS class** | `font-display` (custom) or `font-serif` mapped to Fraunces |
| **Font family** | `Fraunces, Georgia, serif` |
| **Minimum size** | **28px** (ceiling weight tier in type scale) |
| **Permitted weights** | Thin–Regular only (100–400) |
| **Prohibited** | Italic · Body copy · Navigation · Form fields · Sub-28px sizes |
| **Use in** | Campaign hero statements, editorial headlines, long-form editorial moments, partner presentation display |

**Example display copy:**

> The molecule arrives verified.  
> Purity is not a claim. It's a chain of custody.

### 3.3 Voice 3 — JetBrains Mono (Monospace) · *The Proof*

| Property | Value |
|----------|-------|
| **Role** | Technical only. Data, COA, lot numbers. Signals precision and documentation. |
| **CSS class** | `font-mono` |
| **Font family** | `JetBrains Mono, ui-monospace, monospace` |
| **Maximum size** | **14px** (per type system; scale tier uses 11–13px for data) |
| **Permitted weights** | Regular (400), Bold (700 for field labels at 12px) |
| **Prohibited** | Brand-forward headlines · Marketing hero copy · Navigation |
| **Use in** | COA documents, vial labels, data telemetry, validation codes, lot numbers, legal compliance footers, NPI references, purity readouts, expiry stamps |

**Example technical copy:**

```
PURITY (HPLC) · MOLECULAR WEIGHT · LOT NUMBER
≥99.7% · 711.87 Da · LOT-220415-B · EXP 2027-04
```

### 3.4 Type Scale (Digital — Locked Tiers)

#### Aspekta Scale

| Tier | Size | Weight | Leading | Use |
|------|------|--------|---------|-----|
| Display | 72px | 800 | locked | Hero (Aspekta display only — not Fraunces) |
| H1 | 48px | 800 | locked | Page titles |
| H2 | 36px | 600 | locked | Section headers |
| H3 | 24px | 500 | locked | Sub-headers |
| H4 | 18px | 500 | locked | Callout labels |
| Body L | 16px | 400 | locked | Primary body |
| Body S | 12px | 300 | locked | Footnotes |
| Micro | 10px | 400 | locked | Compliance microcopy |

#### Fraunces Scale (Editorial Display Only)

| Tier | Size | Weight | Use |
|------|------|--------|-----|
| Light | 60px | 300 | Largest display |
| Light | 40px | 300 | Primary editorial |
| Regular | 28px | 400 | Ceiling weight (minimum display threshold) |

#### JetBrains Mono Scale (Technical Register)

| Tier | Size | Weight | Use |
|------|------|--------|-----|
| Bold | 12px | 700 | Field labels |
| Regular | 13px | 400 | Data values |
| Regular | 11px | 400 | Compliance footer |

### 3.5 Font Loading (Next.js Implementation Target)

Replace current Geist fonts in `app/layout.tsx` with:

- **Aspekta** — self-hosted variable font or licensed CDN (primary `--font-sans`)
- **Fraunces** — `next/font/google` variable, weights 300–400 (`--font-display`)
- **JetBrains Mono** — `next/font/google`, weights 400 and 700 (`--font-mono`)

---

## 4. THE 1F CLEAR SPACE GRID CONSTRAINT (SECTION 3.4)

### 4.1 Definition

**1F** = the height of the capital **"F"** in the "Frontier" wordmark.

Minimum clear space on **all sides** of the logo = **1F**. Nothing — text, imagery, rules, other logos — may enter the 1F zone.

On packaging with embossed/debossed marks, clear space doubles to **2F** (not applicable to digital funnel, but documented for completeness).

### 4.2 Digital Translation

For UI layout, 1F translates to a **strict minimum padding/margin unit** applied to:

- Page outer containers
- Card and panel interiors
- Logo placement zones
- Section gutters
- Form container insets

**Implementation constant:**

```css
--spacing-1f: 32px; /* Calibrate to rendered 'F' cap-height at default logo scale; adjust once logo asset is integrated */
```

All layout items and containers in the entry funnel **must respect a 1F boundary line** to prevent visual crowding. No element may bleed edge-to-edge without an explicit 1F inset.

### 4.3 Minimum Logo Sizes (Digital)

| Lockup | Minimum Width |
|--------|---------------|
| A — Horizontal (default) | 80px |
| B — Stacked | 56px |
| C — Isotype | 64px |
| D — Isocon | 28px |

Below minimum size, drop to the next simpler lockup. Never scale past the point of legibility.

### 4.4 Grid Application by Page

| Page | 1F Application |
|------|----------------|
| Landing | Outer page padding = 1F minimum. Pillar grid gutters = 1F. Hero content inset = 2F from viewport edges on desktop. |
| Login | Auth card centered with 1F internal padding on all sides. Card margin from viewport edge = 1F (mobile) / 2F (desktop). |
| Email Verification | Code input cluster inset = 1F within card. Slot gap = 0.5F. Card follows same rules as Login. |

---

## 5. TARGET PAGES ARCHITECTURE & UI BLUEPRINT

### 5.0 Shared Funnel Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  app/layout.tsx                                              │
│  ├── Font variables (Aspekta / Fraunces / JetBrains Mono)    │
│  ├── Deep Teal default background for dark funnel            │
│  └── Metadata: Frontier Biomed                               │
├──────────────────────────────────────────────────────────────┤
│  ENTRY FUNNEL                                                │
│  ├── app/page.tsx          → Landing (awareness)             │
│  ├── app/login/page.tsx    → Login (authentication)          │
│  └── app/verify/page.tsx   → Email Verification (integrity)  │
└──────────────────────────────────────────────────────────────┘
```

**Shared constraints across all three pages:**

- Background: Deep Teal (`#011A24`) for dark-themed funnel OR Pure White for light auth card surfaces
- Typography voices strictly separated per Section 3
- Spacing: 1F grid constraint enforced
- No stock Next.js / Vercel template remnants
- Voice: precise, confident, technically fluent — per Section 1.6
- Motion: subtle, purposeful transitions only (focus rings, border state changes) — no decorative animation

---

### 5.1 Landing Page — `app/page.tsx`

**Purpose:** Premium first impression. Establish Frontier Biomed as the foundational manufacturing layer. Communicate all four pillars with editorial authority.

#### Visual Direction

| Property | Specification |
|----------|---------------|
| Theme | Premium, minimalist, **dark-themed** |
| Base color | Deep Teal (`#011A24`) full viewport |
| Text primary | Pure White (`#FFFFFF`) |
| Text accent | Pacific Teal (`#0D717B`) for links, active nav, pillar markers |
| Warm accent | Coral Blush (`#F7E1D9`) for editorial highlight bands or pillar card hover wash — sparingly |

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo — Lockup A Horizontal]          [Login →]          │  ← 1F padding
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     Fraunces 40–60px Light                                  │
│     "The science is not a differentiator                    │
│      — it is the baseline."                                 │
│                                                             │
│     Aspekta Body L                                          │
│     "The differentiator is that we treat it that way."      │
│                                                             │
│     [ Primary CTA — Pacific Teal ]                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  PILLAR GRID (2×2 desktop · 1×4 mobile)                    │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Verified at  │  │ Domestic by  │                        │
│  │ every bond   │  │ design       │                        │
│  └──────────────┘  └──────────────┘                        │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Infrastruc-  │  │ Design as    │                        │
│  │ ture, not    │  │ proof        │                        │
│  │ inventory    │  │              │                        │
│  └──────────────┘  └──────────────┘                        │
├─────────────────────────────────────────────────────────────┤
│  JetBrains Mono Micro — compliance strip                    │
│  FOR USE BY LICENSED PRACTITIONERS ONLY                     │
└─────────────────────────────────────────────────────────────┘
```

#### Component Requirements

| Component | Specification |
|-----------|---------------|
| **Hero headline** | Fraunces, 40–60px, weight 300 (Light), white, no italic |
| **Hero subline** | Aspekta Body L (16px/400), white at 80% opacity |
| **Primary CTA** | Aspekta H4 (18px/500), Pacific Teal background, white label, 1F horizontal padding inside button |
| **Pillar cards** | Aspekta H3 headline (24px/500) + Body S description (12px/300). 1F internal padding. Subtle 1px border `rgba(255,255,255,0.08)` or Pacific Teal left-edge marker |
| **Pillar grid gap** | 1F between cards |
| **Navigation** | Aspekta Body L, "Login" link to `/login`, Pacific Teal on hover |
| **Compliance footer** | JetBrains Mono Micro (10px/400), uppercase, muted white |

#### Content Blocks (Approved Copy)

- **Hero line 1:** The science is not a differentiator — it is the baseline.
- **Hero line 2:** The differentiator is that we treat it that way.
- **Pillar 1:** Verified at every bond. / Purity is a document — not a claim.
- **Pillar 2:** Domestic by design. / Every compound produced in the United States.
- **Pillar 3:** Infrastructure, not inventory. / The supply layer pharmacies and platforms build on.
- **Pillar 4:** Design as proof. / The visible expression of an invisible standard.

#### Prohibited on Landing

- Fraunces below 28px
- Coral Blush as full-page background
- Geist or system default fonts
- Light/white page background (dark theme is mandatory)
- Stock Next.js template content

---

### 5.2 Login Page — `app/login/page.tsx`

**Purpose:** Hyper-clean, structurally sound authentication entry. Convey regulatory composure and infrastructure-grade reliability.

#### Visual Direction

| Property | Specification |
|----------|---------------|
| Page background | Deep Teal (`#011A24`) |
| Auth card | Pure White (`#FFFFFF`) surface, centered, max-width 420px |
| Card shadow | None or minimal `0 1px 0 rgba(1, 26, 36, 0.06)` — no heavy drop shadows |
| Card border | Optional `1px solid rgba(13, 113, 123, 0.12)` |

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Deep Teal full viewport                   │
│                                                             │
│         ┌─────────────────────────────────┐                 │
│         │  1F padding                     │                 │
│         │  [Logo — compact horizontal]    │                 │
│         │                                 │                 │
│         │  Aspekta H2 — "Sign in"         │                 │
│         │  Aspekta Body S — subtitle      │                 │
│         │                                 │                 │
│         │  ┌─────────────────────────┐    │                 │
│         │  │ Email                   │    │                 │
│         │  └─────────────────────────┘    │                 │
│         │  ┌─────────────────────────┐    │                 │
│         │  │ Password                │    │                 │
│         │  └─────────────────────────┘    │                 │
│         │                                 │                 │
│         │  [ Continue — Pacific Teal ]    │                 │
│         │                                 │                 │
│         │  1F padding                     │                 │
│         └─────────────────────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Form Field Specification

| State | Border | Background | Text |
|-------|--------|------------|------|
| **Default** | `1px solid rgba(1, 26, 36, 0.16)` or Pure White with subtle border | Pure White (`#FFFFFF`) | Deep Teal (`#011A24`) |
| **Focus / Active** | `2px solid #0D717B` (Pacific Teal) — sharp, no glow blur | Pure White | Deep Teal |
| **Error** | `2px solid` error red (secondary palette only) | Pure White | Deep Teal |
| **Label** | Aspekta H4 (18px/500) | — | Deep Teal |
| **Placeholder** | — | — | `rgba(1, 26, 36, 0.4)` |
| **Input text** | Aspekta Body L (16px/400) | — | Deep Teal |

**Focus transition:** Border color transitions from default to Pacific Teal on `:focus-visible`. No box-shadow halos. Sharp border layout only.

#### Component Requirements

| Component | Specification |
|-----------|---------------|
| **Card container** | Centered via flex/grid, 1F internal padding all sides, `border-radius: 0` or max `2px` (precision, not softness) |
| **Page title** | Aspekta H2 (36px/600), Deep Teal |
| **Subtitle** | Aspekta Body S (12px/300), muted Deep Teal |
| **Submit button** | Full-width, Pacific Teal background, white Aspekta H4 label, height 48px |
| **Links** | "Forgot password" / "Create account" — Aspekta Body S, Pacific Teal, no underline default, underline on hover |
| **Compliance note** | JetBrains Mono 11px below form — NPI / practitioner notice |

#### Route

- Path: `/login`
- File: `app/login/page.tsx`
- Post-auth redirect target: `/verify` (email verification step)

---

### 5.3 Email Verification Page — `app/verify/page.tsx`

**Purpose:** High-integrity validation screen. Laboratory documentation atmosphere. The user is confirming identity before entering the partner portal.

#### Visual Direction

| Property | Specification |
|----------|---------------|
| Page background | Deep Teal (`#011A24`) |
| Verification card | Pure White (`#FFFFFF`), centered, max-width 480px |
| Atmosphere | Clinical, documentation-first — evokes COA verification and lot confirmation |

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Deep Teal full viewport                   │
│                                                             │
│         ┌─────────────────────────────────┐                 │
│         │  1F padding                     │                 │
│         │  [Logo]                         │                 │
│         │                                 │                 │
│         │  Aspekta H2 — "Verify email"    │                 │
│         │  Aspekta Body L — instructions  │                 │
│         │                                 │                 │
│         │  JetBrains Mono 12px Bold       │                 │
│         │  VERIFICATION CODE              │                 │
│         │                                 │                 │
│         │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │                 │
│         │  │  │ │  │ │  │ │  │ │  │ │  │ │  ← font-mono    │
│         │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ │                 │
│         │                                 │                 │
│         │  [ Verify — Pacific Teal ]      │                 │
│         │                                 │                 │
│         │  Mono: "Code expires in 10:00"  │                 │
│         │  1F padding                     │                 │
│         └─────────────────────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Verification Code Input — CRITICAL SPECIFICATION

| Property | Requirement |
|----------|-------------|
| **Font** | `font-mono` class **mandatory** — JetBrains Mono |
| **Slot size** | 48×56px per digit (desktop), 40×48px (mobile) |
| **Font size** | 20px Regular (exception: display-sized mono for input legibility; stays within technical register) |
| **Text align** | Center per slot |
| **Border default** | `1px solid rgba(1, 26, 36, 0.16)` |
| **Border focus** | `2px solid #0D717B` (Pacific Teal) on active slot |
| **Background** | Pure White per slot |
| **Character set** | Numeric 0–9 or alphanumeric per backend spec |
| **Slot gap** | 8px (0.25F) between slots |
| **Auto-advance** | Focus advances to next slot on input |
| **Paste support** | Full code paste distributes across slots |

**The multi-digit verification code input slots MUST use the `font-mono` class (JetBrains Mono) to preserve the laboratory documentation atmosphere mandated by the technical register.**

#### Component Requirements

| Component | Specification |
|-----------|---------------|
| **Section label** | JetBrains Mono Bold 12px — `VERIFICATION CODE` |
| **Instruction body** | Aspekta Body L (16px/400), Deep Teal |
| **Timer / expiry** | JetBrains Mono Regular 13px — `Code expires in MM:SS` |
| **Resend link** | Aspekta Body S, Pacific Teal |
| **Submit button** | Identical spec to Login page |
| **Reference code** | JetBrains Mono 11px footer — `REF: VRF-{session-id}` optional |

#### Route

- Path: `/verify`
- File: `app/verify/page.tsx`
- Entry: Post-login redirect or direct link from verification email

---

## 6. VOICE & COPY GOVERNANCE (REFERENCE)

For all generated UI copy in the entry funnel, apply these voice principles:

| Principle | Rule |
|-----------|------|
| Precision over volume | Every sentence earns its place |
| Confidence without announcement | No bragging, no qualifying |
| Technical fluency | Technical language when it adds precision; plain language when faster |
| Warmth in the right register | Through purpose and consequence — not casual friendliness |
| Regulatory composure | Acknowledge regulatory context with built-for-it posture |

### Approved Lexicon (Partial — Use in UI Copy)

**Manufacturing & Quality:** verified · documented · traceable · lot-tested · per-lot · chain of custody · HPLC-confirmed · third-party validated

**Infrastructure:** foundational · supply layer · infrastructure · domestic · US-manufactured · audit-ready · documentation-first

**Partner:** pharmacy partner · prescribing clinician · distribution network · telemedicine platform · procurement

---

## 7. ICONOGRAPHY RULES (REFERENCE)

For future nav/icon work beyond the immediate three pages:

| Rule | Value |
|------|-------|
| Style | Duotone fill-based. No outlines, no strokes, no line icons. |
| Grid | 24×24px |
| Corners | Rounded, aligned with mark curvature |
| Structure | Opaque base + 30% opacity overlay with background blur |
| Base fill | Pacific Teal family `#1C6384` (opaque) |
| Overlay fill | `#0D717B` at 30% opacity |
| Contrast | Dark icons on light backgrounds; reversed on dark |

---

## 8. IMPLEMENTATION CHECKLIST

Before any funnel page is considered complete, verify:

- [ ] All four primary HEX tokens match Section 2 exactly
- [ ] Aspekta is the default `font-sans`; Fraunces only at ≥28px display; JetBrains Mono only for technical surfaces
- [ ] No italics in Fraunces
- [ ] 1F spacing constraint applied to all containers
- [ ] Landing page uses Deep Teal dark theme with Fraunces hero
- [ ] Landing page maps all four pillars in a clean grid
- [ ] Login form fields use White backgrounds with Pacific Teal focus borders
- [ ] Verification code slots use `font-mono` (JetBrains Mono)
- [ ] No placeholder/template content from Next.js starter remains
- [ ] Logo clear space (1F) respected around all mark placements
- [ ] Copy follows voice principles — precise, confident, never breathless

---

## 9. DOCUMENT AUTHORITY

| Field | Value |
|-------|-------|
| Document | `FRONTIER_CONTEXT_PLAN.md` |
| Version | 1.0 |
| Brand Manual Ref | Frontier Biomed Brand Manual — Fin.05.26 V1 |
| Created | June 2026 |
| Maintained by | Peptde Engineering |
| Conflict resolution | This file > ad-hoc implementation decisions > framework defaults |

---

*© 2026 Frontier Biomed. For internal and partner use only. All brand assets, tokens, and typographic rules are proprietary.*
