# LostLink AI — Find What Matters

A responsive, frontend-only lost-property platform prototype. React 19, TypeScript, Vite, React Router, Framer Motion, Lucide, TanStack Query, React Hook Form and Zod are used to keep the UI ready for separately deployed services.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` if an API URL is available; `VITE_API_BASE_URL` is intentionally optional.
4. Run `npm run dev` and open the local URL Vite prints.
5. Run `npm run build` to type-check and create the production bundle.

## Architecture

- `src/app` contains providers and route setup.
- `src/components` contains reusable layout, cards, and the persistent floating radial navigation.
- `src/pages` contains the routed product surfaces.
- `src/services` isolates demo item, match, and conversation-access behavior from presentation.
- `src/types` defines API-ready data contracts.
- `src/data` contains clearly simulated demo records.

Items, reports, and non-sensitive preferences are stored in localStorage for this demo. Do not enter real personal data. Passwords, authentication tokens, and private contact details are never persisted by the app. AI match scores are illustrative only and do not establish ownership.

The `/login` and `/signup` screens provide a clearly labeled, in-memory demo account flow. Signup details (name, email, and optional phone) appear on `/profile` and remain available while navigating in the same open tab. Demo accounts and contact details reset on reload; the demo sign-in accepts a previously registered email but deliberately does not verify the password. Passwords and tokens are never stored. Google sign-in, phone/email verification, and password recovery remain unavailable until a trusted identity provider is connected. These demo flows are not real authentication and must not be used with real personal data.

Reports without photographs display initials derived from the item name. Demo conversations are shown only when the current demo profile is one of the reporters in a related lost/found match. This client-side check is a UI behavior, not an authorization boundary; a production API must enforce conversation membership on every request.

## Future integrations

Replace the mock service implementations with API-backed adapters, using `VITE_API_BASE_URL` only for a public endpoint. Keep authorization and all secret-dependent AI operations on the server. Add server-side validation, access control, secure messaging, image upload processing, and database persistence before production use.

## Production deployment

Deploy the output of `npm run build` from `dist/`, not the Vite development server. Production source maps are disabled and assets are minified, but browser-delivered frontend code can still be inspected or downloaded. Never include secrets or privileged authorization logic in frontend code; enforce those on a backend.
