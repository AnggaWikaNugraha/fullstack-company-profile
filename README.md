<div align="center">

# 🧑‍💻 Service

**A content-driven web development service platform built on a Headless CMS.**

Agency profile · Service packages · Project ordering · Consultation booking · Digital products · Blog · Events · Client guide · Landing pages

**🇬🇧 English** · [🇮🇩 Bahasa Indonesia](README.id.md)

<br/>

![Status](https://img.shields.io/badge/status-in%20development-orange?style=flat-square)
![License](https://img.shields.io/badge/license-portfolio%20%2F%20learning-lightgrey?style=flat-square)

![Astro](https://img.shields.io/badge/Astro-BC52EE?style=flat-square&logo=astro&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Strapi](https://img.shields.io/badge/Strapi-4945FF?style=flat-square&logo=strapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)

[Overview](#-overview) ·
[Features](#-features) ·
[Architecture](#-architecture) ·
[Flows](#-core-flows) ·
[Getting Started](#-getting-started) ·
[Roadmap](#-roadmap) ·
[Docs](#-documentation)

</div>

---

## 📖 Overview

**Service** is the website for my web development business. It combines an **agency profile**, **service packages** that clients can **order and pay a deposit for online**, **consultation booking**, a **digital product catalog**, a **blog**, **events**, a **client guide**, and **dynamic landing pages** into one website.

It is built on two ideas:

- **Headless CMS**: all content lives in **Strapi** and is managed from the admin panel, so editors never need to touch frontend code.
- **Astro Islands**: pages ship as fast, SEO-friendly static HTML. **Vue.js** hydrates only the parts that need interaction, such as the order form, the start-date availability checker, and filters.

The site is a standalone project, linked from the **Services** menu of my [portfolio](https://port-tau-azure.vercel.app/).

> [!NOTE]
> 🚧 This project is under active development. The **monorepo setup** and the **home page UI** (with placeholder content) are in place. The CMS and integrations follow the [roadmap](#-roadmap).

---

## ✨ Features

| Module | What it covers |
| --- | --- |
| 🏠 **Agency Profile** | Home, about, team, work process, tech stack, portfolio, testimonials, contact |
| 📦 **Service Packages** | Listing, detail, tiers, included features, sample work, pricing, start-date availability |
| 🧾 **Project Ordering** | Tier, add-on & start-date selection, capacity checker, project brief form, deposit payment, confirmation, management |
| 💬 **Consultation** | Consultation types, add-on & maintenance plan list, consultation hours, call booking |
| 🛍️ **Digital Products** | Website templates, UI kits, starter kits: listing, categories, detail, search & filtering |
| 📰 **Blog** | Tutorials, case studies, business & digital tips, categories & tags |
| 🎉 **Events** | Upcoming webinars, workshops, bootcamps, corporate training |
| 📘 **Client Guide** | Onboarding guide, work process, revision & refund policies, SLA, FAQ |
| 🚀 **Landing Pages** | Promo campaigns, small-business packages, seasonal discounts, website + maintenance bundles |

---

## 🧰 Tech Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Frontend | **Astro** | Routing, SSG/SSR, layouts, SEO |
| Interactivity | **Vue.js** (Astro Islands) | Ordering, availability, consultation booking, filters |
| Language | **TypeScript** | Type safety across web and CMS |
| Styling | **Tailwind CSS** | Utility-first design system |
| Headless CMS | **Strapi** | Content types, admin panel, REST API, custom endpoints |
| Database | **PostgreSQL** on **Supabase** | Primary data store for Strapi |
| Monorepo | **Turborepo** + npm workspaces | Task runner, build caching, shared packages |

**Planned integrations**

| Service | Purpose |
| --- | --- |
| Cloudinary | Media storage & image optimization |
| Midtrans | Payment gateway (project deposits) |
| SMTP / Nodemailer | Transactional email notifications |

---

## 🏗️ Architecture

```mermaid
flowchart TD
    Client(["👤 Client / Visitor"])
    Editor(["✍️ Content Editor"])

    subgraph WEB["apps/web · Astro"]
        Pages["📄 Content & SEO Pages<br/>Profile · Packages · Portfolio · Consultation<br/>Products · Blog · Events · Client Guide · Landing Pages"]
        Islands["🧩 Vue Islands<br/>Order Form · Availability · Consultation Booking<br/>Product Filter · Gallery"]
    end

    subgraph CMS["apps/cms · Strapi"]
        API["REST API<br/>Content types + custom endpoints"]
        Admin["Admin Panel"]
    end

    DB[("🗄️ Supabase<br/>PostgreSQL")]

    Cloudinary["☁️ Cloudinary"]
    Midtrans["💳 Midtrans"]
    SMTP["✉️ SMTP"]

    Client --> Pages
    Client --> Islands
    Pages -- "fetch at build / request time" --> API
    Islands -- "fetch at runtime" --> API
    Editor --> Admin
    Admin --> API
    API --> DB
    API -.-> Cloudinary
    API -.-> Midtrans
    API -.-> SMTP
```

| Component | Responsibility |
| --- | --- |
| **Astro** | Main frontend: routing, static rendering, SSR where needed, SEO, layouts, performance |
| **Vue.js** | Client-side interactivity, loaded only where needed through islands, so most pages ship minimal JS |
| **Strapi** | Single source of truth for content, plus custom endpoints for orders & consultation bookings |
| **Supabase PostgreSQL** | Persistent storage for content and transactional data |

➡️ See [docs/architecture.md](docs/architecture.md) for the full breakdown.

---

## 🔄 Core Flows

### Content publishing

```mermaid
flowchart LR
    A["✍️ Editor updates content<br/>in Strapi Admin"] --> B["Publish"]
    B --> C["Strapi webhook"]
    C --> D["Trigger site rebuild<br/>(deploy hook)"]
    D --> E["Astro fetches content<br/>from Strapi API"]
    E --> F["Static pages generated<br/>& deployed"]
```

### Project ordering

```mermaid
sequenceDiagram
    autonumber
    actor C as Client
    participant W as Astro + Vue Island
    participant S as Strapi API
    participant DB as PostgreSQL
    participant M as Midtrans
    participant E as Email

    C->>W: Select package, tier, add-ons & start date
    W->>S: GET /packages/:id/availability
    S->>DB: Count overlapping active projects
    DB-->>S: Slot available + price
    S-->>W: Availability, total & deposit
    C->>W: Fill project brief form
    W->>S: POST /orders
    S->>DB: Create order (pending_payment)
    S->>M: Create deposit transaction
    M-->>W: Payment page / Snap token
    C->>M: Pay deposit
    M->>S: Payment notification (webhook)
    S->>DB: Update order → confirmed
    S->>E: Send confirmation email
    E-->>C: Order confirmation + onboarding guide
```

➡️ More flows (capacity check, order states, consultation booking, rendering, notifications) are in [docs/flows.md](docs/flows.md).

---

## ⚡ Rendering Strategy

| Page | Strategy |
| --- | --- |
| Home · About · Package Detail · Portfolio · Consultation | `SSG` |
| Blog · Blog Detail · Events · Client Guide · Landing Pages | `SSG` |
| Package Listing · Product Catalog | `SSG` / `SSR` |
| Ordering · Availability · Consultation Booking | `Vue Island` + Dynamic API |

---

## 📁 Project Structure

<details>
<summary><b>Planned monorepo layout</b></summary>

```text
service/
├── apps/
│   ├── web/                    # Astro frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── astro/      # Static components; shared ones (e.g. PackageCard) sit here
│   │   │   │   │   ├── ui/     # Base building blocks (Button, SectionHeading)
│   │   │   │   │   ├── layout/ # Site frame (Navbar, Footer)
│   │   │   │   │   ├── blocks/ # Landing page blocks (Strapi dynamic zone)
│   │   │   │   │   └── home/   # Sections used only on the home page
│   │   │   │   └── vue/        # Interactive islands
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── services/       # Strapi API clients
│   │   │   ├── styles/         # Global CSS & design tokens
│   │   │   ├── utils/
│   │   │   └── types/
│   │   └── astro.config.mjs
│   │
│   └── cms/                    # Strapi headless CMS
│       ├── config/
│       ├── src/
│       │   ├── api/            # Content types & custom endpoints
│       │   ├── components/     # Reusable Strapi components
│       │   └── extensions/
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared types & utilities
│
├── design-system/              # UI design rules (UI UX Pro Max)
├── docs/                       # Project documentation
├── .env.example
├── package.json
├── turbo.json                  # Turborepo task pipeline
└── README.md
```

</details>

---

## 🚀 Getting Started

**Requirements:** Node.js 22.12+ and npm. Python 3 is only needed for the UI UX Pro Max design scripts.

```bash
npm install        # install all workspaces from the repo root
npm run dev        # start the dev servers (web: http://localhost:4321)
npm run build      # build every app (cached by Turborepo)
npm run check      # type-check
npm run preview    # serve the production build of apps/web
```

The monorepo uses **npm workspaces** for dependencies and **Turborepo** to run tasks across `apps/*` and `packages/*`. Turborepo caches task results, so a build with no changes is replayed from the cache instead of running again.

### Deployment

| App | Target | Notes |
| --- | --- | --- |
| `apps/web` | Vercel | Root Directory `apps/web`. Vercel detects Turborepo and runs `turbo run build` |
| `apps/cms` | Node.js server (host to be decided) | Strapi is a long-running server (admin panel, webhooks), so it does not run on serverless platforms |

Build-time environment variables must be listed in `turbo.json` (`web#build.env`). Otherwise Turborepo can reuse a cached build made with different values. The Strapi publish webhook calls a Vercel Deploy Hook (`DEPLOY_HOOK_URL`) to rebuild the site.

---

## 🗺️ Roadmap

- [ ] **Phase 1: Foundation.** Astro, Vue integration, TypeScript, Tailwind CSS, Strapi, PostgreSQL, environment variables
- [ ] **Phase 2: CMS.** Content models for packages, features, portfolio projects, consultations, add-ons, digital products, blog posts, events, testimonials, landing pages, client guides
- [ ] **Phase 3: Core Website.** Home, agency profile, packages, portfolio, consultation, digital products, blog, events, client guide
- [ ] **Phase 4: Interactive Features.** Project ordering, capacity checker, start-date picker, product filtering, consultation booking, gallery
- [ ] **Phase 5: Integrations.** Cloudinary, email notifications, payment gateway, analytics
- [ ] **Phase 6: Optimization.** Technical SEO, sitemap, structured data, Open Graph, image optimization, accessibility, Lighthouse audit

<details>
<summary><b>Future improvements</b></summary>

- User authentication & client portal (project progress, deliverables, invoices)
- Order history, revision requests & cancellation
- Online payment for the final balance & promo codes
- Multi-language & multi-currency support
- Wishlist for digital products
- Admin dashboard for orders & consultation bookings
- Email & WhatsApp notifications
- Reviews and ratings

</details>

---

## 🎯 Architecture Goals

| Goal | How |
| --- | --- |
| ⚡ **Performance** | Astro ships static HTML first and keeps client-side JS to a minimum |
| 🔍 **SEO** | Content pages are pre-rendered or server-rendered |
| 🧩 **Interactivity** | Vue loads only where client-side interaction is required |
| ✍️ **Content Management** | Non-developers manage everything through the Strapi admin |
| 📈 **Scalability** | Content, rendering, and transactions are kept as separate concerns |
| 🛠️ **Maintainability** | TypeScript, reusable components, clear module boundaries, typed API access |

---

## 📚 Documentation

| Document | Description |
| --- | --- |
| [Architecture](docs/architecture.md) | System components, responsibilities, rendering & data fetching |
| [Flows](docs/flows.md) | Content publishing, ordering, payment, consultation booking & notification flows |
| [Content Model](docs/content-model.md) | Strapi content types and their relationships |

---

## 📄 License

This project is intended for **learning, portfolio, and development purposes**.

## 👤 Author

**Angga Wika Nugraha**, Frontend / Full-Stack Developer
