# Mae (ម៉ែ) — Redesign Brief for the Agent

Repo: `i-eat-tea/mae-app` (public; 1 commit, "Initial commit", 2026-10-14). Live: https://mae-app-byflowers.vercel.app/
Stack today: Vite 8 + React 19 + Tailwind 4 + Supabase (auth/DB/edge functions) + a Telegram bot.

> Note for the user: the link you sent (`mae-apphelp`) does not exist. The real repo is `mae-app`. This brief is based on reading that repo (about 12k lines of TS/TSX, 68 files). I did not run the app, so anything about how the live site behaves is marked as unverified.

## 0. TL;DR

Turn Mae from a **pregnancy companion with accounts, plans, reminders and a paywall** into a **free, open, Khmer-first health information center** that any woman in Cambodia can use on a cheap phone with no signup. Keep the curated **content** (it is the valuable part). Throw away almost all of the **app code** around it. Content lives in validated files, not in a database. Anything medical is written or approved by humans, never by the agent.

---

## 1. What exists today (evidence)

| Area | What the code does | Verdict |
|---|---|---|
| Content: `src/data/resources.ts` | 11 curated articles. Each has Khmer and English title/summary, a source organisation (NMCHC/MoH, WHO, UNICEF, RHAC, PSI), a source URL, weeks, category, plan suggestions. One is flagged `is_safety_critical` (`res-nmchc-warning-signs`). | **Keep (core asset)** |
| `src/data/monthlyMessages.ts` | 9 monthly "Mom's voice" scripts in Khmer and English, 1:45–2:30 each, all pointing to `/audio/month-N.mp3`. | Keep the scripts |
| `src/data/weeklyGuidance.ts` | Weekly guidance for **only weeks 8, 9, 10 and 12**; 3 focus-topic groups of 3 topics. | Keep, but it is thin |
| `src/data/babySizes.ts` | Baby size by week (37 rows, fruit comparison). | Optional |
| Audio files | `public/audio/` holds only a README. **No mp3 files are in the repo.** Unverified: whether they exist on the live deployment. | Needs checking |
| Screens | Landing, Home, Journey (flower/baby growth), Plan (personal to-do list), Explore (the library), Profile. | Keep only Explore's idea |
| Accounts | Supabase email+password auth, onboarding wizard, due-date calculator, profile. | Remove |
| Paywall | `FREE_LIMITS.dailySummaries = 2` (`src/lib/entitlements.ts`). Free users can open only 2 summaries a day; the rest need "Premium", unlocked by linking Telegram. | **Remove** (contradicts the goal) |
| Telegram | Link-code flow, webhook and daily-reminder edge functions in `supabase/functions/`. | Out of scope for the web app |
| Analytics and consent | Event logging (including search text), a research dashboard modal, a consent banner. | Replace |
| UI | 8 modals/sheets plus a banner; most flows happen in popups. | Replace |

### Problems found while reading (verify before relying on any of them)

1. **A category filter shows nothing.** Two articles are tagged "Wellbeing", but the "Wellbeing" filter button returns **0 of 2** (tested by running the filter logic against the data). Categories are long free-text Khmer+English strings that don't match (`ការថែទាំកាយនិងចិត្ត` vs `ការថែទាំរាងកាយនិងសុខភាពផ្លូវចិត្ត`) and matching is a fragile `includes`.
2. **Public visitors see admin buttons.** On Explore, "Add Resource" and "Reset default catalog" show to everyone (`ResourcesScreen.tsx` ~L103–116 and ~L229–235). Edits live in the visitor's own `localStorage`, so there is no real way for the team to update content except by editing code.
3. **Mock auth stores plaintext passwords.** When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are missing, `src/lib/supabase.ts` falls back to a fake client that saves `{email, password}` in `localStorage` (L14, L95, L113). Unverified: whether the live Vercel build has the Supabase env vars set. The user should check this now.
4. **Premium is a browser flag.** `UpgradeModal.tsx` (~L215/266/276) sets `is_premium: true` in the saved user object in the browser, so anyone can flip it. Moot once the paywall is deleted.
5. **Telegram webhook looks unauthenticated.** `supabase/functions/telegram-webhook/index.ts` uses the service-role key and I found no check of Telegram's secret-token header (my search for "secret" matched only env-var names). If the bot is kept, add the check.
6. **Repo hygiene.** `supabase/.temp/` is committed (project ref `vihpflruinfvfmvckrxy` and a pooler URL, no password). Three SQL files (`r0_schema.sql`, `premium_schema.sql`, `entitlements_schema.sql`) each define `daily_usage`/`entitlements` differently. `package.json` is still named `react-example` and carries AI Studio leftovers (`@google/genai`, `express`, `dotenv`, `metadata.json` declaring a Gemini capability). The README is out of date (it says "no environment variables, fully offline").
7. **Two different bot names.** Mae's code defaults to `MaeFlowErsBot`; the FlowErs app links to `t.me/FlowErs168bot`.
8. **Source language.** At least one source link is an English-only PDF (`…Protocols-for-Health-Centers-2016-EN.pdf`) behind a Khmer summary. Readers who only read Khmer can't verify it.
9. **Search is naive.** Plain `includes()` on lowercased strings. Khmer has no spaces between words, and the same visible text can be typed in different Unicode sequences, so real queries will miss.
10. **Latin-style typography on Khmer.** `uppercase` + letter-spacing classes and a Latin serif heading font (Playfair Display) are used across screens; they do nothing for Khmer script.

---

## 2. Goal and non-goals

**Goal:** a free, anonymous, Khmer-first information center on women's health that a woman with a low-end Android phone, limited data and limited reading time can use in under a minute.

**Non-goals (remove, do not rebuild):** accounts or login, personal profile and due-date tracking, My Plan and reminders, premium or any limit on reading, Telegram account linking, research dashboards in the app, AI chat or any AI-written health content.

---

## 3. Assumptions to confirm with the user (default shown)

| # | Question | Default if no answer |
|---|---|---|
| A1 | Stay **pregnancy-focused**, or widen to women's health generally (family planning, postpartum, newborn, nutrition, mental health)? The user said "Cambodian women". | Build the structure so more topics can be added, but **publish only the existing pregnancy content**. |
| A2 | "Data center" means an **information/knowledge hub**, not a dashboard of statistics. | Information hub. |
| A3 | What exactly is disliked in the current look (colors, layout, tone, fonts)? | Redesign from scratch, but align with the FlowErs app palette (see §8). |
| A4 | Is the Telegram reminder bot still used? Which username is real: `MaeFlowErsBot` or `FlowErs168bot`? | Do not delete the bot code; archive it (§10). |
| A5 | Is research data collection a **requirement** (university, ethics approval)? | Anonymous, aggregate-only analytics; no user ids, no stored search text. |
| A6 | Who in Cambodia reviews health content before publishing (doctor or midwife)? | Add a publish gate that needs a named reviewer (§6). |

---

## 4. Rules for the agent

1. **Never write, translate, summarise or "improve" medical content.** Move and structure what exists. New or changed health text must come from the team and be reviewed by a qualified person. If a page needs content that doesn't exist (e.g. emergency numbers), build the slot and show a clearly marked placeholder in dev only; never invent a phone number, dose, or threshold.
2. **Do not delete the old app.** First create a git tag `legacy-v1` on the current commit, then delete on a new branch (`redesign`). Open a PR; do not push to `main` directly.
3. One commit per phase step. Run `npm run lint` and `npm run build` before each commit.
4. Test the way the users browse: mobile viewport, throttled network, a low-end Android profile. Take screenshots at 360×640.
5. Keep the live URL working during the work (Vercel preview deploy for the branch).
6. No secrets in the repo. Add `supabase/.temp/` to `.gitignore` if the folder is kept at all.
7. Use only `npm` and a single lockfile (the FlowErs repo broke on an empty `bun.lock`).

---

## 5. Target product

### Pages

| Route | Purpose |
|---|---|
| `/` | Big search box, 5–6 icon tiles for categories, a red/very visible **"Warning signs: when to go to the health center now"** button, a "Listen" shortcut, links to the Telegram bot and the FlowErs app. |
| `/c/:category` | List of articles in a category (title, one-line summary, audio icon if available). |
| `/a/:slug` | Article: Khmer summary, key takeaway, important note, **Listen** (audio) if available, source card (organisation, link, "source is in English"), last reviewed, Share, Print. |
| `/warning-signs` | The safety-critical article, always one tap from everywhere (header or fixed button). |
| `/search?q=` | Results, tolerant of Khmer typing variants. |
| `/about` | Who makes this, how content is chosen and reviewed, medical disclaimer, contact. |

Navigation: at most 3–4 items (Home, Search, Warning signs, Language). No modal-driven flows; articles are real pages with real URLs so they can be shared in Telegram or Messenger and work with the browser Back button.

### Features
- **Search first.** Placeholder in Khmer (keep the existing «តើមានអ្វីដែលអ្នកចង់ស្វែងយល់ដែរឬទេ?»).
- **Audio** for key articles (reuse the idea of the existing monthly voice messages). Plain `<audio>` with large play/pause and speed control; `preload="none"`.
- **Browse by stage** (trimester or week) as a filter on existing `pregnancyWeeks` data. No account; the choice is remembered in `localStorage` only.
- **Share:** native share sheet with a copy-link fallback, plus a QR code for each article (used on posters at health centers).
- **Print/PDF-friendly layout** for each article (village health volunteers and clinics often hand out paper).
- **"Was this helpful?"** anonymous thumbs up/down. The old `FeedbackCard` posts a star rating to a `feature_feedback` table; keep only the idea.
- **Language:** Khmer by default, English toggle that remembers the choice; both languages available at the same URL (`?lang=en`).

---

## 6. Content model and governance

Move content out of `.ts` files with long Khmer category strings into **one JSON file per article**, validated at build time.

```
src/content/
  site.json              # app name, links (telegram bot, FlowErs app), disclaimer text km/en
  categories.json        # [{ slug, icon, label: {km,en}, order }]
  articles/
    nmchc-warning-signs.json
    ...
scripts/
  validate-content.ts    # zod validation; fails the build on error
  check-links.ts         # HEAD/GET every sources[].url; report non-200 (run in CI, weekly)
```

Suggested schema (zod):

```ts
const Lang = z.object({ km: z.string().min(1), en: z.string().optional() });

const Source = z.object({
  organization: Lang,
  url: z.string().url(),
  language: z.enum(['km', 'en']),        // language of the linked document
  checkedAt: z.string(),                 // ISO date the link was last opened by a human
});

export const Article = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),          // stable id used in URLs
  status: z.enum(['draft', 'published', 'archived']),
  category: z.string(),                            // must match a categories.json slug
  title: Lang,
  summary: Lang,
  keyTakeaway: Lang.optional(),
  importantNote: Lang.optional(),
  stage: z.union([z.literal('all'), z.object({ fromWeek: z.number(), toWeek: z.number() })]),
  safetyCritical: z.boolean().default(false),
  sources: z.array(Source).min(1),
  audio: z.object({ km: z.object({ src: z.string(), durationSec: z.number(), transcript: z.string() }) }).optional(),
  reviewed: z.object({ by: z.string(), role: z.string(), date: z.string() }).nullable(),
  updatedAt: z.string(),
});
```

Build rules (fail the build if broken):
- `category` exists in `categories.json`; slugs are unique.
- `status: 'published'` requires `reviewed !== null` (**recommended gate; the user's team should decide**).
- Every `km` text is present; `en` optional but reported as a warning.
- Every `audio.src` file exists in `public/audio/`.
- Exactly one article is the `/warning-signs` page (`safetyCritical: true`).

Migration mapping from `PregnancyResource`: `id` → `slug` (drop the `res-` prefix), `titleKh/En` → `title`, `summaryKh/En` → `summary`, `keyTakeawayKh/En`, `importantNoteKh` → `keyTakeaway`/`importantNote`, `sourceName` + `sourceUrl` → `sources[0]`, `pregnancyWeeks` → `stage` (min and max), `is_safety_critical` → `safetyCritical`, free-text `category` → a new slug (map the 6 existing variants to 5 slugs, see below), `planSuggestions` → drop (My Plan is removed). Set `reviewed: null` for every migrated article until a reviewer is named.

Suggested category slugs from the existing data: `nutrition`, `checkups`, `wellbeing`, `pregnancy-basics`, `birth-preparation` (merge the two "Preparation" variants); plus the safety-critical article is exposed at `/warning-signs`.

Monthly voice messages become articles of a second kind (`type: 'voice-message'`) or a separate `voice/` collection; keep the Khmer and English scripts as the audio transcripts.

---

## 7. Accessibility for Cambodian women: requirements checklist

**Language and script**
- `<html lang="km">`; English fragments wrapped in `lang="en"`.
- Self-host a Khmer-capable font as WOFF2 (e.g. Kantumruy Pro or Noto Sans Khmer, subsetted), `font-display: swap`, with a system Khmer fallback. Today the fonts come from Google Fonts (a blocking third-party request).
- Body text at least 16–18px; Khmer line-height about 1.7+ (stacked subscript and vowel marks get clipped at tight line heights); no `uppercase`/`tracking-*` on Khmer.
- Use Khmer numerals or Arabic numerals consistently. Pick one and follow the existing content.

**Reading ability**
- Short sentences, one idea per paragraph; icons and pictograms beside headings; a glossary or tap-to-explain for medical terms (content supplied by the team).
- Every key article gets **audio** (the monthly scripts show the team already does this). Do not rely on text-to-speech for health content unless the team approves the voice.

**Low-end phones and data**
- Initial page ≤ about 100 KB of JavaScript (gzipped) and no images required to read an article; this is a target to measure, not a promise.
- Lighthouse mobile (throttled) targets: Performance ≥ 90, Accessibility ≥ 95.
- PWA with `vite-plugin-pwa`: cache the shell and all article text so it works **offline** after the first visit; audio cached only when the user taps "Download".
- Lazy-load audio; no autoplay; no animation libraries (drop `motion`).

**Usability and inclusion**
- Touch targets ≥ 44×44px, WCAG AA contrast (check the final palette with a tool, not by eye), visible focus rings, full keyboard and screen-reader support, text resizable to 200%.
- Do not use color alone to mean "danger"; pair the warning button with an icon and the words.
- **No login, no paywall, no consent wall** before reading.
- Privacy: no accounts, no personal data. Analytics is anonymous and aggregate only: page views, search **counts** (do not store the typed text with an identity), audio plays, "helpful" votes. Prefer a cookie-less tool or a tiny self-built counter. Decide with the team whether any research requirement (A5) changes this.

**Channels people already use**
- Link to the Telegram bot and the FlowErs app; ask the team which other channels their users rely on (e.g. Messenger) and add share links for those. Pages need per-article Open Graph tags so shared links preview correctly (see §9).

---

## 8. Design direction

The user dislikes most of the current look (olive green `#88A04D`, cream `#FAF9F5`, serif headings, many popups). Do not restyle it; start over.

- **Align with the FlowErs app** so the two feel like one product: teal `#2F6F8F`, mint `#AEE3D8`, pink accent `#FA6B90`, soft blush `#FDDEEC` on a warm white `#FEFAFB` (taken from the FlowErs repo). Verify contrast of text on each color before using it.
- Calm, large, uncluttered: one accent color, big type, generous spacing, icon-led category tiles, rounded cards.
- Warning-signs button is the only strongly saturated element.
- Before building everything, produce **two quick mockups** of the home page and one article page (HTML or screenshots at 360px wide) and let the user choose. Ask what they dislike (A3) first.

---

## 9. Technical plan

**Stack:** keep Vite + React 19 + Tailwind 4 (the team already knows it, same as FlowErs). Add `react-router`, `zod` (build-time only), `minisearch` (or Fuse.js), `vite-plugin-pwa`.

**Structure**
```
src/
  app/ (router, layout)   pages/ (Home, Category, Article, Search, WarningSigns, About)
  components/ (ArticleCard, CategoryTile, AudioPlayer, SourceCard, ShareButton, LangToggle)
  content/ (see §6)       lib/ (search.ts, i18n.ts, content.ts)
```
State: a tiny language context and `localStorage` for language and stage filter. No global store, no Supabase.

**Search (Khmer-aware)**
1. Normalise both the index text and the query: Unicode NFC, strip zero-width characters (U+200B, U+200C, U+200D), collapse whitespace, lowercase Latin.
2. Tokenise Khmer with `Intl.Segmenter('km', { granularity: 'word' })` when available. **Verify support** on the oldest Android WebView you target; fall back to character trigrams if missing.
3. Build the index **at build time** into a JSON file, load it lazily on first search. Fuzzy matching on, prefix matching on.
4. Test with real queries typed on a phone keyboard (e.g. «អាហារ», «ពិនិត្យ», «សម្រាល») and with typing variants.

**Per-article link previews:** Telegram and Messenger read Open Graph tags from the raw HTML, which a client-rendered SPA cannot provide. Add a small build step that writes `/a/<slug>/index.html` (copy of `index.html` with that article's title, description and `og:url`), or use a prerender plugin. Add `vercel.json` rewrites for the SPA fallback.

**Hosting:** keep Vercel. No environment variables needed (content is static). Add a CI job (GitHub Action) that runs `validate-content` and `check-links` on every PR and weekly.

**Dependencies to remove:** `@supabase/supabase-js`, `@google/genai`, `express`, `dotenv`, `motion`, `tsx` (unless a script needs it), `esbuild` pin, and the leftover AI Studio items in `vite.config.ts` and `metadata.json`. Rename the package to `mae-info-center`. Rewrite the README.

---

## 10. Cleanup: keep, rewrite, delete

| Action | Files |
|---|---|
| **Keep as data** | `src/data/resources.ts`, `monthlyMessages.ts`, `weeklyGuidance.ts`, `babySizes.ts` (convert per §6, then delete the originals) |
| **Rewrite (new UI)** | `App.tsx`, all screens, `ResourceCard`, `ResourceModal` (becomes the Article page), `AudioPlayer` (replace with a small accessible player), `index.css`, `index.html` |
| **Delete** | `AuthModal`, `OnboardingModal`, `PreLoginWizard`, `UpgradeModal`, `AddToPlanSheet`, `PlanScreen`, `PlanContext`, `PlanItemCard`, `ProfileScreen`, `JourneyScreen`, `ContentEntryModal`, `AnalyticsDashboardModal`, `ConsentBanner`, `DueDate`, `BabyGrowthCard`, `FruitSize`, `FlowerVisual`, `LittleReminder`, `TelegramLink`, `FeedbackCard`, `TopicCard/TopicModal`, `src/context/AppContext.tsx`, `src/lib/entitlements.ts`, `supabase.ts`, `dueDate.ts` |
| **Archive then remove from `main`** | `supabase/` (SQL and edge functions). They stay reachable through the `legacy-v1` tag. Ask the user (A4) before deleting the bot code. |

---

## 11. Phased plan and acceptance criteria

**Phase 0 — Prepare (0.5 day)**
- Tag `legacy-v1`; branch `redesign`; get answers to §3; the user checks Vercel env vars (risk 3) and whether `/audio/month-N.mp3` files exist on the live site.
- Done when: tag exists and the questions are answered or defaults are accepted in writing.

**Phase 1 — Content foundation**
- Create the schema, validation script, `categories.json`; migrate the 11 articles and 9 voice scripts; set `reviewed: null`.
- Done when: `npm run validate-content` passes; the Wellbeing category now contains its 2 articles; build fails if a category or audio file is missing.

**Phase 2 — New app shell and pages**
- Delete the §10 list; build the six routes, language toggle, search, article page, share/print, warning-signs shortcut.
- Done when: all pages work with no login and no network except content/audio; Khmer search finds «អាហារ» and «ពិនិត្យ» articles; every page has a unique URL and title.

**Phase 3 — Accessibility, performance, offline**
- Self-hosted Khmer font, PWA offline cache, Lighthouse and axe checks, 360px screenshots, per-article OG pages.
- Done when: Lighthouse mobile Performance ≥ 90 and Accessibility ≥ 95 on Slow 4G; article readable offline after one visit; shared links preview correctly in Telegram.

**Phase 4 — Connect to FlowErs and ship**
- Point the FlowErs "Information Access" page at the new URL (see §12); update README; deploy; configure a custom domain if the team has one.
- Done when: the QR and links in the FlowErs app open the new site; `main` deploys to Vercel from the PR.

**Phase 5 — Content operations (team decision, not agent work)**
- Name reviewers; add content for the missing weeks and topics; replace English-only source links with Khmer versions where they exist; supply real emergency contact information if the team wants it shown.

---

## 12. Connection to the FlowErs app

- The FlowErs app already shows the portal link and a QR picture on its Info tab (`InfoAccessView.tsx`, constant `INFO_PORTAL_URL`). If the domain changes, update that constant and the QR image.
- Keep the same palette (§8) and the same bot link so the two products feel like one.
- Optional later: a deep link from FlowErs article references to `/a/<slug>`.

---

## 13. Open questions for the user (answer before Phase 2)

1. A1 — pregnancy only, or women's health more broadly?
2. A3 — what specifically do you dislike (colors, layout, tone, fonts, number of popups)?
3. A4 — is the Telegram reminder bot in use, and which username is real?
4. A5 — is research telemetry required by your university or an ethics approval?
5. A6 — who can review health content, and is a "reviewed" gate before publishing acceptable?
6. Do the mp3 files exist, and who recorded them (rights and consent to publish)?
7. Do you want a custom domain instead of `mae-app-byflowers.vercel.app`?
