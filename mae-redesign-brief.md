# Mae (ម៉ែ) — Brief 2: Scope Lock, Data Decisions and Open Questions

**Continues:** `mae-redesign-brief.md` (Brief 1). Read Brief 1 first. This file does not repeat it. Where the two disagree, **this file wins**, and the "Supersedes" list below says exactly what changes.

Repo: `i-eat-tea/mae-app`. Agent branch: `redesign` (reported ready, `main` untouched).

> Verified by me: the public repo `mae-app` currently shows **only `main`**. The `redesign` branch is not on GitHub, so I have **not reviewed it**. Task P2-1 fixes that. Everything below about the branch's contents is therefore not checked.

---

## 0. What changed since Brief 1

Decisions from Aj:

1. **FlowErs already has reminders and an overview.** Mae must contain **nothing unrelated to the information center**.
2. **Features that were promised but never finished are dropped**, not rebuilt.
3. Mae has **no database**. FlowErs keeps its own MySQL.

### Supersedes (Brief 1 → this file)

| Brief 1 | Now |
|---|---|
| §2 Non-goals | Tightened by §1 below (a hard "forbidden" list that CI enforces) |
| §5 Features | Replaced by the keep / drop / later table in §1 |
| §5 "Was this helpful?" vote; §7 aggregate analytics | **Removed.** These need a backend, which contradicts "no database" |
| §6 "published requires `reviewed`" | Made **environment-based** (§4) |
| §14 Telegram policy | Kept, plus the CI check below is now mandatory |
| §15 Data and sync | **Final decisions** in §2 |
| §11 Phase 5 | Defaults for each item in §3 and §4 |

Everything else in Brief 1 (content schema, accessibility checklist, search, PWA, performance targets, design direction) stays as written.

---

## 1. Feature scope lock

Mae answers one question: **"Where can I read trustworthy health information, in Khmer, on my phone?"** Anything that needs an account, remembers a person, reminds, tracks, sells or collects is out.

| Keep | Drop (delete code) | Later (not in this patch) |
|---|---|---|
| Article library, categories | My Plan, plan items, reminders | Read/unread ticks (local only) |
| Khmer-aware search | Calendar export | Audio, only when files **and** permission exist (§3.2) |
| Article page with source card (organisation, link, source language, last checked) | Accounts, login, onboarding wizard, profile | A real feedback channel (a contact link, not an in-app form) |
| `/warning-signs` page | Due-date calculator, journey screen, baby sizes, flower visuals | More articles (§3.4) |
| Khmer / English toggle | Weekly guidance (only weeks 8, 9, 10, 12 exist; it looks arbitrary) | |
| Browse by trimester (from each article's `stage`) | Premium, entitlements, the 2-per-day limit, every upgrade popup | |
| Share, print, QR for each article | Telegram account linking and every Telegram prompt | |
| One Telegram bot card (Brief 1 §14) | Research dashboard, consent banner, event logging | |
| "Open in FlowErs" link | "Helpful?" votes, star feedback, analytics events | |

Monthly "Mom's voice" scripts: keep the text in `src/content/voice/` as **drafts**, not published, until audio exists and permission is confirmed (§3.2).

### P2 scope check (mandatory CI step)

Add `scripts/check-scope.sh`, run in CI and in `npm run lint`. It fails if any of these appear in `src/` (case-insensitive unless noted):

- `supabase`, `@google/genai`, `express`, `entitlement`, `premium`, `upgrade`, `is_premium`, `daily_usage`, `analytics`, `logEvent`, `consent`
- `login`, `signup`, `password`, `onboarding`, `due_date`, `pregnancy_week`, `reminder`, `plan_item`
- `telegram` **outside** `src/components/BotCard.tsx` and `src/content/site.json`

Allowed use of `localStorage`: exactly two keys, `mae.lang` and `mae.stage`. Anything else fails the check.

**Done when:** `npm run lint` passes with the check, and `package.json` has none of `@supabase/supabase-js`, `@google/genai`, `express`, `dotenv`, `motion`.

---

## 2. Data decisions (final)

### 2.1 Runtime

- No database, no API, no server code in the Mae repo. All content is static JSON in `src/content/`. Publishing = commit, CI validates, Vercel deploys.
- **No environment variables are required to run the site.** Build-time only: `PUBLISH_REQUIRES_REVIEW` (§4).
- Nothing is shared between Mae and FlowErs except links (Brief 1 §12).

### 2.2 Existing Supabase project (`flowers-mvp`)

It still holds people's data. Its tables, from the old code: `users`, `plan_items`, `telegram_links`, `link_codes`, `user_read_resources`, `analytics_events`, `feature_feedback`, `entitlements`, `daily_usage`, `resources`. The login accounts themselves live in Supabase's separate auth system.

**Decision: do not migrate accounts or plans into FlowErs.** The data models differ, password hashes are not portable, and FlowErs already covers reminders and overview. Users simply sign up in FlowErs.

**This is a human cutover, not an agent task.** The agent must not connect to Supabase, run SQL against it or delete anything. Aj does the steps below.

**Cutover checklist (in order, do not skip):**

1. **Count real users** (exclude test accounts). In the Supabase SQL editor: `select count(*) from public.users;` Tell the team the number.
2. **Export everything privately.** Easiest: Dashboard → Table Editor → export each table as CSV. Alternatively, `pg_dump --data-only --no-owner "<connection string from the dashboard>" > mae-backup.sql`. Store the files encrypted (e.g. a password-protected archive) in a private place. **Never in a git repo, never in chat.**
3. **Open the files** and check they contain data. A backup nobody opened is not a backup.
4. **Post a notice on the old site** (draft below) at least one week before step 5. Pick the deletion date and put it in the notice.
5. **After the notice period and with Aj's explicit go-ahead,** delete personal data. In the SQL editor (destructive, run only once, only by Aj):
   ```sql
   truncate table public.plan_items, public.telegram_links, public.link_codes,
     public.user_read_resources, public.analytics_events, public.feature_feedback,
     public.daily_usage, public.entitlements restart identity cascade;
   delete from public.users;
   ```
   Then delete the login accounts: Dashboard → Authentication → Users (select all → delete).
6. **Shut down:** pause or delete the Supabase project, rotate or delete its API keys, and if the bot code is retired, revoke the bot token in Telegram's BotFather.
7. **Only now** point the domain at the new site.

**Notice text (English, then Khmer). The Khmer was drafted by me and must be checked by a native speaker before use:**

> Mae is changing into a free health information center that needs no account. Your Mae account and saved data will be deleted on **[DD/MM/YYYY]**. For reminders and pregnancy tracking, please use the FlowErs app.

> កម្មវិធី ម៉ែ កំពុងប្តូរទៅជាមជ្ឈមណ្ឌលព័ត៌មានសុខភាពឥតគិតថ្លៃ ដែលមិនត្រូវការគណនី។ គណនី និងទិន្នន័យដែលបានរក្សាទុករបស់អ្នកនឹងត្រូវលុបនៅថ្ងៃទី **[ថ្ងៃ/ខែ/ឆ្នាំ]**។ សម្រាប់ការរំលឹក និងការតាមដានផ្ទៃពោះ សូមប្រើកម្មវិធី FlowErs។

### 2.3 Who edits content

**Option A from Brief 1 §15** (edit the JSON on GitHub, CI validates, Vercel redeploys). Add a short `CONTRIBUTING.md` for non-developers: how to edit one article in the GitHub web editor, what each field means, and what a failed CI check looks like. Revisit a form-based editor only if the team asks.

### 2.4 Measurement

None built in. If the host offers cookie-less page-view counts, use them. Any research data collection (university, ethics) is a **separate project with its own consent design**, not a feature of Mae.

---

## 3. Defaults for the agent's open questions

Aj's answers override these. The agent implements the default now and does not wait.

### 3.1 Reviewer (A6 / Q5)

- Each article needs **one qualified person** (a midwife or doctor, not a member of the dev team) to compare the Khmer summary with its source and sign off: **name, role, date**. The source language must be one they can read.
- Priority order for review: (1) `/warning-signs`, (2) anything with numbers, schedules or "when to seek care", (3) the rest.
- Until a reviewer is named, every article keeps `reviewed: null`. See §4 for what that means for builds.
- Show "Reviewed by [name], [role], [date]" only when `reviewed` exists. Never show a reviewer who did not agree to be named; if they prefer, show their organisation instead.
- **Owner: Aj.** Ask the FlowErs doctor and hospital contacts first.

### 3.2 Audio (A: MP3 files, Q6)

- Default: **launch with no audio.** The `audio` field stays in the schema. If the file is missing, **hide the player**; never render a broken one.
- The repo's `public/audio/README.md` is titled "PSI Voice Audio Files", so some voices may belong to PSI. Until that is clarified in writing, **do not publish any of the existing recordings**.
- Permission checklist before any audio goes live: who is the speaker, did they give written consent to publish, does the recording match the **reviewed** Khmer text (a spoken version can change meaning, so it needs the same review), and are there any third-party logos or music.
- Export settings are in the README (mono, 64 kbps).
- **Owner: Aj**, to find out who recorded them.

### 3.3 Domain (Q7)

- Decide **before printing any QR code or poster.**
- Register the domain under a **team-owned email**, not a personal one.
- Implement now: `src/content/site.json` → `baseUrl`. Every QR code, canonical URL and Open Graph URL is built from it. Changing the domain later is then one edit.
- When final, change `INFO_PORTAL_URL` in the FlowErs app's `InfoAccessView.tsx` (a separate repo; Aj or I will provide the patch).
- I have not checked how `.kh` domains are registered. Ask before assuming.

### 3.4 Missing content (Phase 5)

- **Do not fill every week.** Organise by topic and trimester.
- Priority for new articles, each a **human-written Khmer summary of an official source, then reviewed**: (1) warning signs, complete; (2) antenatal visit schedule; (3) iron and folic acid, nutrition; (4) preparing for delivery and where to go; (5) newborn danger signs and breastfeeding; (6) postpartum care and family planning.
- Ask NMCHC, RHAC and PSI whether **Khmer-language originals** exist for the English-only PDFs now linked. Prefer them.
- **The agent must not write, translate or "improve" any health text.**

### 3.5 Emergency information

- Show a phone number **only if** it has a source and a verification date. FlowErs currently hardcodes `tel:119` as "Call Ambulance" (`EmergencyModal.tsx`); I **cannot verify** that number. Whoever reviews should confirm it against an official source.
- In `site.json`:
  ```json
  "emergency": [
    { "label": { "km": "...", "en": "..." }, "phone": "...", "source": "...", "verifiedAt": "YYYY-MM-DD" }
  ]
  ```
  Agent leaves the values empty with a `TODO`; Aj fills them from the verified source.
- `/warning-signs` always shows "go to your nearest health center" text from the **reviewed** article, whether or not a number is present.
- The same verified numbers should be used in FlowErs. Ideally the value is defined once and copied, not typed twice.
- Freshness: `npm run release-check` fails if any `verifiedAt` is older than 180 days. Normal CI only warns, so deploys do not break on a calendar date.

---

## 4. Review gate by environment

| Environment | `PUBLISH_REQUIRES_REVIEW` | Behaviour |
|---|---|---|
| Local, PR previews | `false` | All articles build and show. Every unreviewed article shows a visible **"Draft — not yet reviewed"** label, and the page has `<meta name="robots" content="noindex">`. |
| Production (`main`) | `true` | The build **fails** if any published article has `reviewed: null`. |

Consequence: **do not merge `redesign` into `main` until at least the reviewed set is decided.** The old site keeps running until then. If the team wants a partial launch, mark only the reviewed articles `published` and leave the rest `draft` (drafts are excluded from the production build).

---

## 5. Patch 2 tasks (agent)

One commit per task. Run `npm run lint` and `npm run build` before each commit.

| # | Task | Done when |
|---|---|---|
| **P2-1** | Push `redesign` to GitHub (`git push -u origin redesign`), open a PR to `main`, and confirm a Vercel preview deploy exists. **Do not merge.** | The branch is visible on GitHub; the preview URL loads |
| **P2-2** | Scope purge: remove everything in §1's Drop column; add `scripts/check-scope.sh` and wire it into `lint` and CI. | The check passes; the forbidden list is absent from `src/` |
| **P2-3** | Remove Supabase and template leftovers: dependencies, `src/lib/supabase.ts`, the `supabase/` folder (archived under tag `legacy-v1`), `.env*` references, `metadata.json`, `@google/genai`. Add `supabase/.temp/` to `.gitignore` if any trace remains. | `npm ls` shows none of them; the build needs no environment variables |
| **P2-4** | Review gate (§4): `PUBLISH_REQUIRES_REVIEW`, the "Draft — not yet reviewed" label, `noindex` on previews, "Reviewed by…" badge. | A production build fails with an unreviewed published article and passes with `draft` status; the preview shows the label |
| **P2-5** | Audio slot (§3.2): hide the player when the file is missing; the validation script checks that every referenced file exists. Existing voice scripts moved to `src/content/voice/` as `draft`. | No page ever shows a broken audio player |
| **P2-6** | `site.json` → `baseUrl` and `emergency` (§3.3 and §3.5); QR, canonical and Open Graph URLs built from `baseUrl`; `release-check` script for `verifiedAt`. | Changing `baseUrl` changes every QR and canonical URL |
| **P2-7** | Telegram rules (Brief 1 §14): `BotCard` only; copy line left as `TODO` for Aj. | The check-scope rule for `telegram` passes |
| **P2-8** | `CONTRIBUTING.md` (§2.3) and a rewritten `README.md` that matches reality (static site, no env vars, how to validate content). | A non-developer can follow it to edit one article |
| **P2-9** | Final report to Aj: list of files deleted, dependencies removed, bundle size, Lighthouse scores, and anything not done. | Report is in the PR description |

The cutover (§2.2) and the questions in §6 are **not agent tasks**.

---

## 6. Decisions only Aj can make

| # | Decision | Needed before |
|---|---|---|
| 1 | Named reviewer(s) and who is contacted first | Merging to `main` |
| 2 | Who recorded the MP3s, and written permission | Publishing any audio |
| 3 | Domain name and who owns the registration | Printing any QR or poster |
| 4 | The verified emergency number(s) and their source | Showing any number |
| 5 | One-line truth about what the Telegram bot does today (and the real bot name) | The bot card copy |
| 6 | Real user count and the deletion date | Cutover step 4 |
| 7 | Who edits articles after launch | Handover |

---

## 7. What I could not verify

- The contents of the `redesign` branch (not on GitHub).
- Whether `/audio/month-N.mp3` exists on the live site (open `/audio/month-1.mp3` on the live URL to check).
- Whether the live Vercel build has Supabase environment variables set (Brief 1, risk 3).
- Whether the bot's daily reminder function is scheduled in the Supabase dashboard.
- The accuracy of any Khmer medical text, and the Khmer notice above. A qualified Khmer-speaking reviewer must check both.
- That 119 is the correct ambulance number.