# Nginx + Let's Encrypt — influencers.lumen.universalgravity.org

**Public URL:** https://influencers.lumen.universalgravity.org  
**Upstream:** `127.0.0.1:3000` (Docker Compose `web`)  
**Host:** DigitalOcean droplet `167.71.206.43` (`/opt/lumen-marketplace`)

## What runs

- `nginx` listens **80** (→ 301 HTTPS) and **443** (TLS)
- Proxies to marketplace Next.js on `:3000`
- Certbot certificate + `certbot.timer` auto-renew
- App `COOKIE_SECURE=true` (GH variable) so auth cookies work on HTTPS

## Recreate from scratch

```bash
ssh root@167.71.206.43
apt-get update && apt-get install -y nginx certbot python3-certbot-nginx

# HTTP-only site first (see deploy/nginx/*.conf — strip SSL if reinstalling)
# Then:
certbot --nginx -d influencers.lumen.universalgravity.org \
  --non-interactive --agree-tos -m YOUR_EMAIL --redirect

nginx -t && systemctl reload nginx
```

Config reference checked into repo: `deploy/nginx/influencers.lumen.universalgravity.org.conf`  
Live path on host: `/etc/nginx/sites-enabled/influencers.lumen.universalgravity.org`

## Smoke

```bash
curl -fsS https://influencers.lumen.universalgravity.org/api/health
# expect version 0.4.1+, status ok
```

Direct `:3000` remains open for ops; prefer the HTTPS hostname for demos.

## Google OAuth secrets (CI/CD)

Repo **Secrets** (Settings → Secrets and variables → Actions):

| Secret | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID` | GCP OAuth Web client ID |
| `GOOGLE_CLIENT_SECRET` | GCP OAuth Web client secret |

Deploy writes them into `/opt/lumen-marketplace/.env` together with `GOOGLE_CALLBACK_URL=${NEXT_PUBLIC_APP_URL}/api/auth/google/callback`.

Google Console redirect URI must match:
`https://influencers.lumen.universalgravity.org/api/auth/google/callback`
