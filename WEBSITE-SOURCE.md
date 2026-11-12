# Tradebook website source

Latest website source branch: `tradebook-sites-migration`.

- `tradebook/`: deployed Vercel journal, with multi-instrument support and the Perp-inspired theme. See its README for setup.
- `sites-source/`: complete source of the ChatGPT Sites landing page and MNQ journal, including assets, lockfile, worker routes and schema. Matches built Sites commit `b26d894e7b607af9abdabc101c6ed2810d11582a`.
- Root Next.js application: preserved separately.

## Download anywhere

```sh
git clone --branch tradebook-sites-migration https://github.com/mike000911/Trade-Journal.git
cd Trade-Journal
```

For an existing clone: `git fetch origin`, `git switch tradebook-sites-migration`, then `git pull --ff-only origin tradebook-sites-migration`.

## Live websites

- https://mnq-tradebook-michael.michaelekenyane.chatgpt.site
- https://mnq-tradebook.vercel.app

The Sites source depends on its configured Cloudflare/Sites runtime, ChatGPT authentication and D1/R2 bindings. Rehosting requires equivalent service configuration. Deployment secrets and private trading records are not included. Use the journal's backup/export feature for trading records.
