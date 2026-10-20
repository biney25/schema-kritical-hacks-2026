# Kritical verification record

Checked 20 October 2026 against this copied source. The original AZINHACK repository was not edited.

| Check | Result | Practical limit |
|---|---|---|
| pnpm test | 85 passed, 0 failed | Local automated tests, not hosted acceptance |
| pnpm check | Passed | Type checking |
| pnpm customer:build | Passed | Customer identity-boundary build check |
| TinyFish provider extraction | Completed in 5 steps | Connected tool run, not the app's authenticated HTTP route |
| Reviewed facts -> save -> reopen | Passed in local journal integration test | Test database; live customer host still outstanding |
| Public new repository | Separate repository published | Imported AZINHACK history plus Kritical source and submission assets; hosted acceptance remains separate |
| Hosted login/provider/save/reopen | Not verified | Isolated host, database and server credentials required |
| Personal-memory AI live answers | Not verified | Separate provider configuration and source-quality checks required |

## Added in this copy

Provider calls now have explicit 12-step and 120-second caps. Retrieval time travels into reviewed drafts. Unselected facts stay out. Multi-day event dates remain text instead of becoming an invented personal-entry date. Branding no longer points the active UI to AZINHACK.

## Live evidence

`evidence/tinyfish-live-provider.json` records run 43e6a572-a11c-45c5-b8b5-a355b2abe946 against https://us.pycon.org/2026/. The public source independently confirms event dates and venue. The returned excerpt uses compressed wording, so it is not presented as a continuous verified quotation.

## Pending release actions

The separate public repository is https://github.com/biney25/schema-kritical-hacks-2026. Configure a separate customer host with `KRITICAL_SETUP.md` and run a real login -> URL -> research -> selected facts -> save -> reload acceptance flow. Never replace these gates with unit-test counts or claim the connected-tool run exercised the hosted app. The team roster remains provisional until confirmed by the owner.
