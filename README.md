# Schema · Kritical Hacks 2026

A private scrapbook for the story behind your photos. Schema combines your own notes and media with optional **public event context researched by TinyFish**, reviewed one fact at a time before it enters an editable journal draft.

**Provisional team details:** LineOfCode · Delhi Technological University · AI/ML Student Track. The names below come from the supplied earlier deck. The Kritical roster is awaiting the owner's confirmation and must match the final Unstop registration.

## Review the submission

- [Eight-slide pitch PDF](submission/Schema_Kritical_Round1.pdf)
- [Fixed-layout submission PowerPoint](submission/Schema_Kritical_Submit.pptx)
- [Editable PowerPoint](submission/Schema_Kritical_Round1.pptx)
- [Economics and market workbook](submission/Schema_Kritical_Economics.xlsx)
- [Verification record](docs/KRITICAL_VERIFICATION.md)
- [Live TinyFish provider evidence](evidence/tinyfish-live-provider.json)
- [Setup and acceptance steps](docs/KRITICAL_SETUP.md)

The demo video is prepared separately by the team and is not included in this source checkpoint. A public post link will be added after the owner publishes it.

## One memory loop

1. Add a photo and your own note.
2. Supply a public HTTPS event page and consent to research.
3. TinyFish browses event information and returns structured title/date/venue/program candidates.
4. Inspect the source and select only the facts you want.
5. Open an editable draft, add personal context, save, then revisit it in the archive.

Public facts are not evidence that the user attended the event or experienced anything described on its website. Date ranges remain public context text; users select the date of their own memory.

## TinyFish implementation

The app uses the Web Agent API, not a decorative sponsor badge:

- `POST /api/tinyfish`: authenticated account, same-origin write check, explicit demo-email allowlist and atomic account quota before the provider call.
- `lib/tinyfish/provider.mjs`: `POST https://agent.tinyfish.ai/v1/automation/run-async`, then `GET /v1/runs/{run_id}`. Each start has a **12-step, 120-second limit**. There are no automatic paid retries.
- `lib/tinyfish/context.mjs`: fixed goal, public-URL restrictions, bounded field parsing, owner-bound signed run tokens and selected-fact draft construction.
- `app/tinyfish-context.tsx`: consent, progress/error states, source link, retrieval timestamp and per-field approval.
- New provider and save/reopen tests exercise the same helpers used by the route and UI.

Only a public URL and fixed research instructions reach TinyFish. Private notes, photos, account credentials and personal history are not included. A blocked/failed page does not change a journal draft. The provider key remains on the server. No authenticated social scraping or automated whole-life reconstruction is part of this workflow.

## Current verification

On 20 October 2026 this copy passed **85 automated tests**, `pnpm check` and the customer production build. Local tests cover provider boundaries, selected-fact draft creation, journal save/reopen and cross-account rejection. These results are not a production certification.

A connected TinyFish live run extracted PyCon US 2026 facts in five steps. See the evidence JSON for the capture method and source. It was a provider-only test through the connected tool, **not an authenticated request from a hosted Schema instance**.

Still requiring live acceptance: isolated host/database setup, confirmed account login, server key configuration, real `/api/tinyfish` execution and saved-page reopen on that host. Personal-memory AI also needs separate provider configuration and citation testing. Its current adapter uses bounded keyword matching, not semantic/pgvector retrieval.

## Run a separate customer host

Requirements: Node 24, pnpm 11.25, an isolated customer Supabase project and server environment configuration. Never use the founder's private Sites database or credentials.

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm customer:build
pnpm customer:dev
```

Start from `.env.example`, then follow [KRITICAL_SETUP.md](docs/KRITICAL_SETUP.md). Real credentials are not committed. The app deliberately fails closed if auth/provider setup is absent. The private Sites mode is retained for source provenance and is not an independently public backend.

## Commercial hypothesis

Proposed web plans: Free with 250 MB media and five AI answers/month; Plus at **₹149/month**, 5 GB, fifty AI answers and one bounded research start/month. These are pricing research proposals, not current billing entitlements. The restricted hackathon demo has separate five-starts/day account quotas.

The workbook models tax/fee assumptions, storage, transfer, TinyFish steps, AI budgets, support and free-user subsidy. Typical proposed paid usage costs about ₹27/month before shared infrastructure. Full usage is materially higher and the small-cohort stress case can be negative. No unlimited usage or annual discount is promised before measuring costs. Existing diary pages should remain readable/exportable after cancellation.

## Product scope

Implemented source includes the page editor, archive, privacy controls, account/database adapters and TinyFish review workflow. Future work includes better memory retrieval, native mobile pages, selected imports, voice improvements and scoped shared albums. No achieved retention, paid traction, user interview result, end-to-end encryption or large-scale readiness is claimed.

## Provenance

This is a separate Kritical copy derived from `biney25/schema-azinhack-2026`, starting at commit `1be8ee5687d7b619cf0afd8cbd0fc84e9de71c57`. Imported history records earlier development. The original AZINHACK repository and private Schema deployment remain unchanged. Historic competition notes sit under `docs/history` and are not current submission instructions. Check the organiser's policy on reusing prior work; this repository does not claim all code originated during Kritical.

## Team

Provisional carryover from the earlier deck; final Kritical membership and roles are not yet confirmed.

- Tushar Aggarwal: product, integration and testing
- Rajat Maan: backend and source-based answers
- Shrivats Goel: TinyFish workflow and failure handling
- Vanshika Pasi: design, editor and review experience

## Source safety and licensing

Keep `.env`, keys, private journals and database exports out of commits. The repository contains no customer data. The project remains subject to its owner's licensing decisions; public review access alone does not grant commercial relicensing rights. Bundled dependencies retain their upstream licenses.
