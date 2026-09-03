# Private Family Photo Gallery

A simple, private, personal digital family photo album built with **Next.js (App Router)**, **TypeScript**, and **Cloudinary**, architected for deployment to **Cloudflare Workers**.

Designed to feel like a carefully hand-bound photographic album rather than a software dashboard: quiet typography, warm archival neutrals, generous whitespace, subtle borders, and an exclusive focus on family photographs.

---

## Highlights & Features

- **Personal Digital Album Aesthetic**: Restrained, warm cream/stone palette, editorial serif titles, delicate metadata, zero SaaS gradients, zero emojis, zero glassmorphism.
- **Single Shared Family Access Code**: A single password for family members. Verified strictly on the server using constant-time comparisons to prevent timing attacks.
- **Secure Session Management**: Signed HMAC-SHA256 session tokens stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies with automatic expiration.
- **Brute-Force Protection**: IP-based rate limiting on the login route with automatic lockout cooldown after repeated invalid attempts.
- **Direct Asset URL Protection**: Photos are retrieved dynamically from Cloudinary. Rather than exposing guessable public image links, assets can be set to `authenticated` delivery in Cloudinary and served via an internal session-authenticated streaming proxy (`/api/photos/[...id]`). Unauthorized requests without a valid session cookie receive `401 Unauthorized`.
- **Dynamic Cloudinary Integration**: No hardcoded images. Upload new pictures to Cloudinary and they instantly appear in the gallery.
- **Responsive Photographic Grid**: Clean print-style cards adapting smoothly across mobile, tablet, and desktop screens.
- **Archival Lightbox Viewer**:
  - Fullscreen photo modal preserving true aspect ratios.
  - Previous / Next navigation buttons.
  - Keyboard navigation: `ArrowLeft` (previous), `ArrowRight` (next), `Escape` (close).
  - Mobile touch swipe gestures (swipe left/right to navigate).
  - Photo counter and date/caption display.
- **Clean States**:
  - Loading skeleton shimmers.
  - Gentle empty-gallery state.
  - Informative error handling with reload options.
- **Cloudflare Workers Ready**: Built strictly on standard Web APIs (`fetch`, `crypto.subtle`, `Response`, `Request`) and fully configured for OpenNext deployment on Cloudflare Workers.

---

## Project Structure

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts       # Access code verification & session cookie
│   │   │   │   └── logout/route.ts      # Session cookie invalidation
│   │   │   └── photos/
│   │   │       ├── route.ts             # Dynamic photo list fetcher (auth required)
│   │   │       └── [...publicId]/
│   │   │           └── route.ts         # Secure photo streaming proxy
│   │   ├── login/
│   │   │   └── page.tsx                 # Family album login entrance
│   │   ├── globals.css                  # Archival warm neutrals and typography
│   │   ├── layout.tsx                   # HTML head & root metadata
│   │   └── page.tsx                     # Main protected photo gallery
│   ├── components/
│   │   ├── EmptyState.tsx               # Empty album placeholder
│   │   ├── GalleryHeader.tsx            # Header with title & lock/logout action
│   │   ├── LoadingGrid.tsx              # Skeleton placeholders
│   │   ├── LoginForm.tsx                # Clean single-input access form
│   │   ├── PhotoCard.tsx                # Archival print card with lazy loading
│   │   ├── PhotoGrid.tsx                # Responsive multi-column layout
│   │   └── PhotoLightbox.tsx            # Fullscreen viewer (keyboard/swipe)
│   ├── lib/
│   │   ├── auth.ts                      # Web Crypto HMAC-SHA256 & cookie helpers
│   │   ├── cloudinary.ts                # Cloudinary API client & URL signing
│   │   ├── rate-limit.ts                # Brute-force protection & IP tracking
│   │   └── types.ts                     # TypeScript interfaces
│   └── middleware.ts                    # Edge-level route protection
├── .env.example                         # Template for required environment variables
├── CLOUDINARY_GUIDE.md                  # Cloudinary setup and photo management
├── CLOUDFLARE_DEPLOYMENT.md             # Cloudflare Workers deployment steps
├── open-next.config.ts                  # OpenNext build configuration
├── wrangler.jsonc                       # Cloudflare Workers configuration
├── tailwind.config.ts                   # Warm color palette & typography
├── tsconfig.json                        # TypeScript configuration
└── package.json                         # Scripts and dependencies
```

---

## Quickstart (Local Development)

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure your credentials:

```env
# Shared access code family enters to unlock the album
FAMILY_ACCESS_CODE="our-secret-family-code-2025"

# Cryptographically strong secret key (min 32 characters)
SESSION_SECRET="change-this-to-a-very-long-random-secret-key-32-chars-minimum"

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_FOLDER="family-album"
CLOUDINARY_DELIVERY_TYPE="upload" # or "authenticated" for private assets
```

### 2. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Enter your `FAMILY_ACCESS_CODE` to unlock the album.

---

## Environment Variables & Secrets Reference

| Variable | Required | Description |
| :--- | :--- | :--- |
| `FAMILY_ACCESS_CODE` | **Yes** | Shared access code for family authentication. |
| `SESSION_SECRET` | **Yes** | 32+ character random string for HMAC-SHA256 session cookie signing. |
| `SESSION_MAX_AGE_SECONDS`| No | Session duration in seconds (defaults to `604800` = 7 days). |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Your Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | **Yes** | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | **Yes** | Cloudinary API secret (server-side only). |
| `CLOUDINARY_FOLDER` | No | Subfolder containing gallery photos (e.g. `family-album`). |
| `CLOUDINARY_DELIVERY_TYPE`| No | Delivery type: `upload` or `authenticated`. |
| `NEXT_PUBLIC_GALLERY_TITLE`| No | Title displayed in the gallery header. |
| `NEXT_PUBLIC_GALLERY_SUBTITLE`| No | Subtitle displayed in header. |

---

## Cloudinary Configuration & Photo Management

For full details on securing your photos and managing uploads, see [CLOUDINARY_GUIDE.md](CLOUDINARY_GUIDE.md).

Quick summary:
1. Create a folder named `family-album` in Cloudinary Media Library.
2. Upload family photos into that folder.
3. Add captions and titles in the Context metadata tab if desired.
4. For maximum privacy, set asset delivery type to `authenticated` in Cloudinary.

---

## Cloudflare Workers Deployment

For detailed deployment instructions, see [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md).

Quick summary:
```bash
# Set secrets in Cloudflare
npx wrangler secret put FAMILY_ACCESS_CODE
npx wrangler secret put SESSION_SECRET
npx wrangler secret put CLOUDINARY_CLOUD_NAME
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET

# Build and deploy
npm run deploy
```

---

## License

Personal and family use.
