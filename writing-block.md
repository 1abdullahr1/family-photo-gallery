Build a simple, private family photo gallery using Next.js and Cloudinary.

The website should feel like a personal digital family album, not a SaaS dashboard. Use a clean, understated interface with soft colors, neutral tones, good typography, subtle borders/shadows, generous spacing, and a strong focus on the photographs. Do not use gradients, emojis, glassmorphism, excessive animations, or other visual patterns that make the site look AI-generated or over-designed.

Use Next.js with TypeScript and the App Router.

Photos should be stored and managed in Cloudinary. The gallery should retrieve the available photos from Cloudinary dynamically rather than hardcoding individual images into the frontend.

The gallery must be private.

Use a single shared access code for the family. The access code must be verified on the backend/server, never in frontend JavaScript. The browser must never receive the secret authentication code.

Authentication should work roughly as follows:

User enters the access code → request is sent to the server → server verifies the code → server creates a secure authenticated session → session is stored in an HTTP-only cookie → authenticated requests can access the gallery.

Implement logout and session expiration. Use secure cookie settings appropriate for production. Add reasonable protection against brute-force login attempts.

Do not expose Cloudinary API secrets or authentication secrets to the client. Keep all sensitive credentials in environment variables/Cloudflare secrets.

Do not merely protect the gallery page while leaving the underlying private photographs publicly accessible through predictable Cloudinary URLs. Configure Cloudinary and the application so that unauthorized users cannot simply bypass the website and access the original/private images directly.

The gallery should include:

- Responsive photo grid
- Mobile, tablet, and desktop support
- Lazy-loaded images
- Full-screen/larger photo viewer
- Previous/next navigation
- Close viewer
- Logout
- Loading states
- Proper error states
- Clean empty-gallery state

Keep the application intentionally simple. Do not add user registration, profiles, comments, likes, social features, CMS functionality, AI features, or unnecessary databases.

The application must be suitable for deployment to Cloudflare Workers. Avoid unnecessary Node-specific APIs or dependencies that are incompatible with the Cloudflare Workers runtime.

Provide the complete source code, configuration, and deployment setup.

Also create:

- `.env.example`
- A clear README
- Cloudflare deployment configuration
- Documentation explaining the required Cloudinary configuration
- Documentation explaining required environment variables/secrets
- Instructions for deploying the project to Cloudflare Workers
- Instructions for managing the family photos in Cloudinary

After completing the project, initialize Git, create a new GitHub repository, and push the complete project to it.

The result should look and feel like a carefully hand-built personal website: simple, functional, restrained, accessible, responsive, and photo-focused. Avoid unnecessary abstraction and overengineering.