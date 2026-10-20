# Web app setup

See [KRITICAL_SETUP.md](KRITICAL_SETUP.md) for the account database, server configuration and TinyFish setup used by this repository.

The standalone web app uses Supabase accounts. The inherited Sites adapter is retained in the source, with a separate trusted identity path. Never use the Sites identity adapter on a standalone host.
