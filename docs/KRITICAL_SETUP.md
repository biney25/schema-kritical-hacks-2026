# Isolated Kritical host setup

The source is prepared. Live acceptance needs owner-controlled service configuration.

1. Create or select an isolated customer Supabase project containing demo data only. Apply the existing migrations in order and follow `docs/CUSTOMER_SETUP.md` for storage and upload/worker functions.
2. Set server-only `SCHEMA_CUSTOMER_HOST=true`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `APP_ORIGIN` for that host. Configure confirmed-email signup and callback URLs.
3. Set `TINYFISH_ENABLED=true`, a server-only `TINYFISH_API_KEY`, and `TINYFISH_ALLOWED_EMAILS` with the confirmed demo account email. Keys belong in host secrets, never in a repo, slide, screenshot or chat message.
4. Apply the account quota migration. Keep provider-side spending limits enabled. Each request is capped at 12 steps and 120 seconds; failed starts consume a demo allowance.
5. Run `pnpm customer:build`, start the host, sign in and open My life. Research https://us.pycon.org/2026/ or another suitable public event page. Select only title and venue. Create the draft, add a clearly illustrative note, save, reload, reopen. Confirm unselected program details did not enter the page.
6. Verify an inaccessible page returns a recoverable error. A second account must not read the saved page or another account's research token.
7. If demonstrating Ask, separately configure the server AI provider/model and allowlist, opt in to AI and allow the relevant page. Test the actual answer/source relationship and abstention on missing evidence.

The connected-tool provider test does not satisfy steps 1–7. Demo data must not imply anyone attended an event they did not attend. The existing private Sites deployment is outside this copy's release scope.
