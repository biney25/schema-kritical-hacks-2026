# Tests and reproducibility

Run `pnpm test`, `pnpm check` and `pnpm customer:build`. GitHub Actions repeats these checks on each push.

## Automated coverage

The tests exercise public URL validation, provider request limits, structured result parsing, signed run ownership, approved-field draft creation, date ranges, journal save/reopen, account isolation, account controls and storage boundaries.

`tests/tinyfish-demo.test.mjs` starts the recorded CLI workflow as a separate process, checks the saved file and confirms that unapproved facts stay out of its draft. It makes no provider request.

## Provider evidence

`evidence/tinyfish-live-provider.json` records a completed TinyFish run against https://us.pycon.org/2026/. It completed in five steps and returned event dates, venue and program sections. This capture used the connected TinyFish tool and does not claim to be an authenticated request from the hosted web app.

## Live reproduction

Set `TINYFISH_API_KEY` and run `pnpm demo:tinyfish --url https://us.pycon.org/2026/ --fields title,venue`. The command uses the same provider and draft modules as the web interface. The saved file identifies whether the research was live or recorded.

For the web app, configure the services in `KRITICAL_SETUP.md`, then sign in, research a public event, approve fields, save and reopen the page. Test another account's inability to read the page or use its research token. Automated tests and a standalone provider run cover different boundaries from that hosted account flow.
