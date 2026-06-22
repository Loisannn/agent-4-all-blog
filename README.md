# Agent 4 All Blog CMS

Cloudflare Pages CMS for a small public blog. The static Astro app serves the home page and CMS shell. Cloudflare Pages Functions provide the admin API, public blog pages, D1 storage, and R2 media reads.

## Stack

- Astro static build
- Cloudflare Pages Functions
- D1-backed admin login with HttpOnly session cookies
- Cloudflare D1 for posts, audit data, admins, and sessions
- Cloudflare R2 for uploaded images
- Markdown articles rendered to sanitized HTML

## Local Setup

```sh
npm install
npm run build
npm run db:migrate:local
npm run pages:dev
```

Open the Pages dev URL that Wrangler prints. The first visit to `/admin` will ask you to create the first administrator if the local D1 database has no admin user.

## Cloudflare Resources

Create the database and bucket:

```sh
npx wrangler d1 create agent_4_all_blog_cms
npx wrangler r2 bucket create agent-4-all-blog-media
```

Update `wrangler.jsonc` with the real D1 `database_id`, then apply migrations:

```sh
npm run db:migrate:remote
```

In Cloudflare Pages project settings, bind:

- D1 database: `DB`
- R2 bucket: `MEDIA_BUCKET`
- Optional variable: `AUTH_SETUP_TOKEN`

If `AUTH_SETUP_TOKEN` is set, the first-admin setup form must include that token. If it is empty or omitted, setup only requires email and password and then closes automatically after the first admin is created.

## Deploy

```sh
npm run build
npm run pages:deploy
```

For an external DNS provider, use a subdomain such as `blog.example.com`:

1. Add the custom domain in the Cloudflare Pages dashboard.
2. Add a CNAME at your DNS provider from `blog.example.com` to `<project>.pages.dev`.

Do not use an apex/root domain for this setup unless the domain is added as a Cloudflare zone.

After deployment, open `/admin` and create the first administrator. Articles and media created in the deployed admin are stored directly in the Cloudflare D1 and R2 resources bound to the Pages project.

## Routes

- `/admin` static CMS shell
- `/api/auth/status`
- `/api/auth/setup`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/admin/session`
- `/api/admin/posts`
- `/api/admin/posts/:id`
- `/api/admin/media`
- `/api/public/posts`
- `/blog`
- `/blog/:slug`
- `/media/:key`

## Verification

```sh
npm test
npm run build
```
