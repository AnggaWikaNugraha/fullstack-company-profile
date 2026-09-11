# 🏗️ Architecture

[← Back to README](../README.md)

The platform combines **Headless CMS Architecture** with **Astro Islands Architecture**. Content, rendering, and transactional logic are separated into clear layers.

## Table of Contents

- [System Overview](#system-overview)
- [Components](#components)
- [Rendering Strategy](#rendering-strategy)
- [Data Fetching](#data-fetching)
- [API Surface](#api-surface)
- [Environment Variables](#environment-variables)

---

## System Overview

```mermaid
flowchart TB
    subgraph Client["Browser"]
        HTML["Static HTML + CSS"]
        Vue["Hydrated Vue Islands"]
    end

    subgraph Hosting["Frontend Hosting"]
        Astro["Astro<br/>SSG output + SSR routes"]
    end

    subgraph Backend["Strapi Server"]
        REST["REST API"]
        Custom["Custom Controllers<br/>availability · bookings · reservations"]
        Admin["Admin Panel"]
        Hooks["Webhooks & Lifecycle Hooks"]
    end

    DB[("Supabase PostgreSQL")]
    Media["Cloudinary"]
    Pay["Midtrans"]
    Mail["SMTP / Nodemailer"]

    HTML --- Astro
    Vue -- "fetch" --> REST
    Vue -- "fetch" --> Custom
    Astro -- "build / request time" --> REST
    Admin --> REST
    REST --> DB
    Custom --> DB
    REST -.-> Media
    Custom -.-> Pay
    Pay -.-> Custom
    Hooks -.-> Mail
    Hooks -.-> Astro
```

---

## Components

### Astro: `apps/web`

The main frontend framework. It handles:

- Routing
- Static site generation (SSG)
- Server-side rendering (SSR) when required
- SEO: meta tags, Open Graph, sitemap, structured data
- Layouts and content-driven pages
- Performance optimization: image optimization, zero-JS by default

### Vue.js: Astro Islands

Vue components are hydrated only where client-side interaction is required:

| Island | Hydration directive | Why |
| --- | --- | --- |
| Booking form | `client:load` | Needed immediately on booking pages |
| Date picker / availability checker | `client:load` | Core interaction on villa detail |
| Product filter | `client:idle` | Can wait until the main thread is free |
| Restaurant reservation | `client:visible` | Usually below the fold |
| Interactive gallery | `client:visible` | Only hydrate when scrolled into view |

The rest of the website ships **static HTML with little or no JavaScript**.

### Strapi: `apps/cms`

The headless CMS and backend API. It provides:

- **Content types** for villas, restaurants, menus, products, blog posts, categories, events, landing pages, testimonials, facilities, FAQs, guest guides
- **Admin panel** so editors can manage content without changing frontend code
- **Custom endpoints** for transactional logic such as availability, bookings, and reservations
- **Webhooks** that trigger frontend rebuilds when content is published
- **Lifecycle hooks** that send email notifications

See [content-model.md](content-model.md) for the full data model.

### Supabase PostgreSQL

The primary database for Strapi content and application data such as bookings and reservations.

---

## Rendering Strategy

| Page | Strategy | Notes |
| --- | --- | --- |
| Home | SSG | Rebuilt on content publish |
| About | SSG | |
| Villa Listing | SSG / SSR | SSR if listing depends on live filters |
| Villa Detail | SSG | Availability loaded by a Vue island |
| Blog / Blog Detail | SSG | `getStaticPaths` from Strapi slugs |
| Restaurant | SSG | Reservation form is a Vue island |
| Product Catalog | SSG / SSR | SSR for search & filter query params |
| Events | SSG | |
| Guest Guide | SSG | |
| Landing Pages | SSG | Built from Strapi dynamic zones |
| Booking | Vue Island | Dynamic API |
| Availability | Vue Island | Dynamic API, never cached |

---

## Data Fetching

```mermaid
flowchart LR
    subgraph Build["Build time · SSG"]
        B1["Astro page"] --> B2["services/strapi.ts"] --> B3["Strapi REST API"]
    end

    subgraph Request["Request time · SSR"]
        R1["Astro SSR route"] --> R2["services/strapi.ts"] --> R3["Strapi REST API"]
    end

    subgraph Runtime["Runtime · Island"]
        I1["Vue component"] --> I2["API client"] --> I3["Strapi custom endpoint"]
    end
```

Guidelines:

- All Strapi calls go through a typed service layer in `apps/web/src/services/`.
- Shared response types live in `packages/shared/` so the web app and the CMS use the same types.
- Public content is read with a **read-only API token**. Write operations such as bookings and reservations go through **custom endpoints** that validate input on the server.

---

## API Surface

> Planned. Endpoints may change during implementation.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/villas` | List villas |
| `GET` | `/api/villas/:slug` | Villa detail |
| `GET` | `/api/villas/:id/availability?checkIn=&checkOut=&guests=` | Check availability & price |
| `POST` | `/api/bookings` | Create a booking (`pending_payment`) |
| `GET` | `/api/bookings/:code` | Look up a booking by booking code |
| `POST` | `/api/payments/notification` | Midtrans payment webhook |
| `GET` | `/api/restaurants/:slug` | Restaurant profile & menu |
| `POST` | `/api/table-reservations` | Create a table reservation |
| `GET` | `/api/products` | Products with filters |
| `GET` | `/api/posts` | Blog posts |
| `GET` | `/api/events` | Events |
| `GET` | `/api/landing-pages/:slug` | Landing page with dynamic zone blocks |

---

## Environment Variables

> Planned. The final list will be in `.env.example`.

**`apps/web`**

| Variable | Description |
| --- | --- |
| `PUBLIC_STRAPI_URL` | Public Strapi base URL |
| `STRAPI_API_TOKEN` | Read-only token used at build time |
| `PUBLIC_MIDTRANS_CLIENT_KEY` | Midtrans client key for Snap |

**`apps/cms`**

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `APP_KEYS` / `API_TOKEN_SALT` / `ADMIN_JWT_SECRET` / `JWT_SECRET` | Strapi secrets |
| `CLOUDINARY_NAME` / `CLOUDINARY_KEY` / `CLOUDINARY_SECRET` | Media upload provider |
| `MIDTRANS_SERVER_KEY` / `MIDTRANS_IS_PRODUCTION` | Payment gateway |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email notifications |
| `DEPLOY_HOOK_URL` | Frontend rebuild hook triggered on publish |
