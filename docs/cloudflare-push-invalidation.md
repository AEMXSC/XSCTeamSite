# Cloudflare Push Invalidation Setup

When content is published in DA, AEM automatically busts the Fastly cache on `.aem.live`
but does **not** automatically purge the Cloudflare cache on `aemxsc.com`.

Without this setup: schedule/data updates can take up to 2 days to appear on `aemxsc.com`.

With this setup: every DA publish instantly purges the affected URLs on `aemxsc.com`.

## Workaround (until setup is complete)

After publishing in DA, manually purge Cloudflare cache:

1. Cloudflare dashboard → `aemxsc.com` → **Caching → Configuration**
2. Click **Purge Everything**
3. Wait ~30 seconds, then reload

## Permanent Fix

### Step 1 — Cloudflare Zone ID

Cloudflare dashboard → `aemxsc.com` → **Overview** → right sidebar → copy **Zone ID**

### Step 2 — Cloudflare API Token

Cloudflare dashboard → **My Profile → API Tokens → Create Token**

- Use template: **Cache Purge**
- Zone: `aemxsc.com` (specific zone only)
- Copy the token

### Step 3 — AEM Auth Token

Get your IMS token for the `aemxsc` org (Sidekick → logged-in user token, or IMS).

### Step 4 — Register with AEM Admin

```bash
curl -X POST "https://admin.hlx.page/config/aemxsc/xscteamsite/cdn.json" \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_AEM_IMS_TOKEN" \
  -d '{
    "type": "cloudflare",
    "host": "aemxsc.com",
    "zoneId": "YOUR_CF_ZONE_ID",
    "apiToken": "YOUR_CF_CACHE_PURGE_TOKEN"
  }'
```

A `200 OK` response confirms registration. Test by publishing any page in DA and
verifying the change appears on `aemxsc.com` immediately.

## How It Works

```
DA publish
   ↓
AEM Admin (admin.hlx.page)
   ├── busts Fastly cache on .aem.live  ← always happens
   └── calls Cloudflare Cache API       ← only after this setup
          ↓
       aemxsc.com cache purged
```

The Cloudflare Worker adds `x-push-invalidation: enabled` to every request, signalling
AEM that this CDN supports push invalidation. AEM Admin then holds your credentials and
calls Cloudflare's purge API directly — the Worker is not involved in the purge.

## References

- [AEM BYO-CDN Cloudflare setup](https://www.aem.live/docs/byo-cdn-cloudflare-worker-setup)
- [Setup push invalidation for Cloudflare](https://www.aem.live/docs/setup-byo-cdn-push-invalidation-for-cloudflare)
- [adobe/aem-cloudflare-prod-worker](https://github.com/adobe/aem-cloudflare-prod-worker)
