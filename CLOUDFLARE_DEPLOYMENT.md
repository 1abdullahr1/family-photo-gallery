# Cloudflare Workers Deployment Guide

This project is fully architected for deployment to **Cloudflare Workers** using **OpenNext for Cloudflare** (`@opennextjs/cloudflare`). It uses standard Web APIs (`crypto.subtle`, `fetch`, `Request`, `Response`) and contains zero Node-only native dependencies.

---

## 1. Prerequisites

- A [Cloudflare Account](https://dash.cloudflare.com/)
- [Node.js](https://nodejs.org/) (v18.17.0 or newer)
- Cloudflare Wrangler CLI (included in devDependencies)

---

## 2. Configuration Files

The project contains two key configuration files for Cloudflare Workers:

### `wrangler.jsonc`
Defines worker metadata, assets directory, nodejs compatibility flag, and bindings:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "family-photo-gallery",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-12-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

### `open-next.config.ts`
Configures the OpenNext build pipeline for Cloudflare edge isolates.

---

## 3. Configuring Secrets on Cloudflare Workers

Sensitive secrets must **never** be checked into version control. Use Wrangler to set them in Cloudflare:

```bash
# Authenticate wrangler with Cloudflare
npx wrangler login

# Set the shared access code
npx wrangler secret put FAMILY_ACCESS_CODE
# Prompt: Enter the family access code (e.g. your-strong-secret-code)

# Set the session signing secret (minimum 32 characters)
npx wrangler secret put SESSION_SECRET
# Prompt: Enter a secure random string (e.g. generated via `openssl rand -base64 32`)

# Set Cloudinary credentials
npx wrangler secret put CLOUDINARY_CLOUD_NAME
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET
```

### Non-Sensitive Variables
You can specify non-sensitive environment variables in your Cloudflare dashboard or under the `vars` block in `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "CLOUDINARY_FOLDER": "family-album",
    "CLOUDINARY_DELIVERY_TYPE": "upload",
    "NEXT_PUBLIC_GALLERY_TITLE": "The Family Album",
    "NEXT_PUBLIC_GALLERY_SUBTITLE": "Private archive of our moments and memories"
  }
}
```

---

## 4. Building and Deploying

Run the following commands:

```bash
# 1. Install dependencies (on your local or CI environment)
npm install

# 2. Build the Next.js application and worker bundle
npm run build:worker

# 3. Test locally in Cloudflare Workers simulation
npm run preview

# 4. Deploy to your Cloudflare account
npm run deploy
```

Upon successful deployment, Wrangler will output your worker's live URL (e.g., `https://family-photo-gallery.<your-subdomain>.workers.dev`).

---

## 5. Adding a Custom Domain (Optional)

1. In the Cloudflare Dashboard, go to **Workers & Pages**.
2. Select `family-photo-gallery`.
3. Go to **Settings > Domains & Routes**.
4. Click **Add Custom Domain** and enter your personal domain (e.g., `photos.ourfamily.com`).
5. Cloudflare will automatically provision an SSL certificate and route requests to your worker.
