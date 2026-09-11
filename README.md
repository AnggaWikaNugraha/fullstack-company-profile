<div align="center">

# 🌴 Luxury Hospitality Platform

**A content-driven luxury villa, restaurant & lifestyle website built on a Headless CMS.**

Company profile · Villa booking · Restaurant reservations · Product catalog · Blog · Events · Guest guide · Landing pages

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

[Overview](#-overview) ·
[Features](#-features) ·
[Architecture](#-architecture) ·
[Flows](#-core-flows) ·
[Roadmap](#-roadmap) ·
[Docs](#-documentation)

</div>

---

## 📖 Overview

The platform combines a luxury villa **company profile**, **villa booking**, **restaurant** information and reservations, a **product catalog**, **blog**, **events**, a **guest guide**, and **dynamic landing pages** into one website.

It is built on two ideas:

- **Headless CMS**: all content lives in **Strapi** and is managed from the admin panel, so editors never need to touch frontend code.
- **Astro Islands**: pages ship as fast, SEO-friendly static HTML. **Vue.js** hydrates only the parts that need interaction, such as booking forms, date pickers, and filters.

> [!NOTE]
> 🚧 This project is under active development. This repository currently contains the **documentation and flow design**. Implementation follows the [roadmap](#-roadmap).

---

## ✨ Features

| Module | What it covers |
| --- | --- |
| 🏠 **Company Profile** | Home, about us, brand story, facilities, gallery, testimonials, contact |
| 🏡 **Luxury Villas** | Listing, detail, rooms, amenities, gallery, pricing, availability |
| 📅 **Booking System** | Date & guest selection, availability checker, booking form, confirmation, management |
| 🍽️ **Restaurant** | Profile, menu, opening hours, gallery, table reservation |
| 🛍️ **Product Catalog** | Listing, categories, detail, search & filtering |
| 📰 **Blog** | Articles, travel guides, culinary content, hospitality stories, categories & tags |
| 🎉 **Events** | Upcoming events, detail, weddings, private dining, corporate events |
| 📘 **Guest Guide** | Check-in / check-out guide, villa policies, guest information, FAQ |
| 🚀 **Landing Pages** | Promo campaigns, seasonal offers, honeymoon packages, villa & event promotions |

---

## 🧰 Tech Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Frontend | **Astro** | Routing, SSG/SSR, layouts, SEO |
| Interactivity | **Vue.js** (Astro Islands) | Booking, availability, reservations, filters |
| Language | **TypeScript** | Type safety across web and CMS |
| Styling | **Tailwind CSS** | Utility-first design system |
| Headless CMS | **Strapi** | Content types, admin panel, REST API, custom endpoints |
| Database | **PostgreSQL** on **Supabase** | Primary data store for Strapi |

**Planned integrations**

| Service | Purpose |
| --- | --- |
| Cloudinary | Media storage & image optimization |
| Midtrans | Payment gateway |
| SMTP / Nodemailer | Transactional email notifications |

---

## 🏗️ Architecture

```mermaid
flowchart TD
    Guest(["👤 Guest / Visitor"])
    Editor(["✍️ Content Editor"])

    subgraph WEB["apps/web · Astro"]
        Pages["📄 Content & SEO Pages<br/>Profile · Villas · Restaurant · Products<br/>Blog · Events · Guest Guide · Landing Pages"]
        Islands["🧩 Vue Islands<br/>Booking Form · Availability · Reservations<br/>Product Filter · Gallery"]
    end

    subgraph CMS["apps/cms · Strapi"]
        API["REST API<br/>Content types + custom endpoints"]
        Admin["Admin Panel"]
    end

    DB[("🗄️ Supabase<br/>PostgreSQL")]

    Cloudinary["☁️ Cloudinary"]
    Midtrans["💳 Midtrans"]
    SMTP["✉️ SMTP"]

    Guest --> Pages
    Guest --> Islands
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
| **Strapi** | Single source of truth for content, plus custom endpoints for bookings & reservations |
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

### Villa booking

```mermaid
sequenceDiagram
    autonumber
    actor G as Guest
    participant W as Astro + Vue Island
    participant S as Strapi API
    participant DB as PostgreSQL
    participant M as Midtrans
    participant E as Email

    G->>W: Select villa, dates & guests
    W->>S: GET /villas/:id/availability
    S->>DB: Check overlapping bookings
    DB-->>S: Available + price
    S-->>W: Availability & total price
    G->>W: Fill booking form
    W->>S: POST /bookings
    S->>DB: Create booking (pending_payment)
    S->>M: Create payment transaction
    M-->>W: Payment page / Snap token
    G->>M: Complete payment
    M->>S: Payment notification (webhook)
    S->>DB: Update booking → confirmed
    S->>E: Send confirmation email
    E-->>G: Booking confirmation
```

➡️ More flows (booking states, restaurant reservation, rendering, notifications) are in [docs/flows.md](docs/flows.md).

---

## ⚡ Rendering Strategy

| Page | Strategy |
| --- | --- |
| Home · About · Villa Detail · Restaurant | `SSG` |
| Blog · Blog Detail · Events · Guest Guide · Landing Pages | `SSG` |
| Villa Listing · Product Catalog | `SSG` / `SSR` |
| Booking · Availability · Reservations | `Vue Island` + Dynamic API |

---

## 📁 Project Structure

<details>
<summary><b>Planned monorepo layout</b></summary>

```text
luxury-hospitality-platform/
├── apps/
│   ├── web/                    # Astro frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── astro/      # Static components
│   │   │   │   └── vue/        # Interactive islands
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── services/       # Strapi API clients
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
├── docs/                       # Project documentation
├── .env.example
├── package.json
└── README.md
```

</details>

---

## 🗺️ Roadmap

- [ ] **Phase 1: Foundation.** Astro, Vue integration, TypeScript, Tailwind CSS, Strapi, PostgreSQL, environment variables
- [ ] **Phase 2: CMS.** Content models for villas, facilities, restaurants, menus, products, blog posts, events, testimonials, landing pages, guest guides
- [ ] **Phase 3: Core Website.** Home, company profile, villas, restaurant, product catalog, blog, events, guest guide
- [ ] **Phase 4: Interactive Features.** Booking, availability checker, date picker, product filtering, restaurant reservation, gallery
- [ ] **Phase 5: Integrations.** Cloudinary, email notifications, payment gateway, analytics
- [ ] **Phase 6: Optimization.** Technical SEO, sitemap, structured data, Open Graph, image optimization, accessibility, Lighthouse audit

<details>
<summary><b>Future improvements</b></summary>

- User authentication & customer dashboard
- Booking history & cancellation
- Online payment & promo codes
- Multi-language & multi-currency support
- Wishlist
- Admin booking & restaurant reservation dashboard
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
| [Flows](docs/flows.md) | Content publishing, booking, payment, reservation & notification flows |
| [Content Model](docs/content-model.md) | Strapi content types and their relationships |

---

## 📄 License

This project is intended for **learning, portfolio, and development purposes**.

## 👤 Author

**Angga Wika Nugraha**, Frontend / Full-Stack Developer
