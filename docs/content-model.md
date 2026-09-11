# 🗂️ Content Model

[← Back to README](../README.md)

These are the proposed **Strapi content types** and how they relate to each other.

> [!NOTE]
> This is a design draft. Field names and relations may change during Phase 2 (CMS).

## Table of Contents

- [Overview](#overview)
- [Villas & Booking](#villas--booking)
- [Restaurant](#restaurant)
- [Products](#products)
- [Blog](#blog)
- [Events](#events)
- [Landing Pages](#landing-pages)
- [Global & Single Types](#global--single-types)

---

## Overview

| Group | Collection Types | Single Types |
| --- | --- | --- |
| Villas & Booking | `Villa`, `Facility`, `Booking` | — |
| Restaurant | `Restaurant`, `MenuCategory`, `MenuItem`, `TableReservation` | — |
| Products | `Product`, `ProductCategory` | — |
| Blog | `Post`, `Category`, `Tag` | — |
| Events | `Event` | — |
| Marketing | `LandingPage`, `Testimonial` | — |
| Guest Guide | `GuestGuide`, `Faq` | — |
| Global | — | `Homepage`, `About`, `SiteSetting` |

---

## Villas & Booking

```mermaid
erDiagram
    VILLA ||--o{ BOOKING : "has"
    VILLA }o--o{ FACILITY : "offers"
    VILLA ||--o{ TESTIMONIAL : "receives"

    VILLA {
        string name
        uid slug
        richtext description
        decimal price_per_night
        int max_guests
        int bedrooms
        int bathrooms
        media gallery
        component seo
    }
    FACILITY {
        string name
        media icon
        text description
    }
    BOOKING {
        uid booking_code
        date check_in
        date check_out
        int guests
        string guest_name
        email guest_email
        string guest_phone
        decimal total_price
        enum status
        string payment_ref
        datetime expires_at
    }
    TESTIMONIAL {
        string name
        text quote
        int rating
        media avatar
    }
```

`Booking.status` is one of `pending_payment`, `confirmed`, `checked_in`, `completed`, `cancelled`, or `expired`. See [Booking Status Lifecycle](flows.md#6-booking-status-lifecycle).

---

## Restaurant

```mermaid
erDiagram
    RESTAURANT ||--o{ MENU_CATEGORY : "has"
    MENU_CATEGORY ||--o{ MENU_ITEM : "contains"
    RESTAURANT ||--o{ TABLE_RESERVATION : "receives"

    RESTAURANT {
        string name
        uid slug
        richtext description
        json opening_hours
        media gallery
        component seo
    }
    MENU_CATEGORY {
        string name
        int order
    }
    MENU_ITEM {
        string name
        text description
        decimal price
        media image
        boolean is_available
    }
    TABLE_RESERVATION {
        date date
        time time
        int party_size
        string guest_name
        email guest_email
        string guest_phone
        text notes
        enum status
    }
```

`TableReservation.status` is one of `pending`, `confirmed`, `declined`, `cancelled`, `completed`, or `no_show`.

---

## Products

```mermaid
erDiagram
    PRODUCT_CATEGORY ||--o{ PRODUCT : "groups"

    PRODUCT_CATEGORY {
        string name
        uid slug
    }
    PRODUCT {
        string name
        uid slug
        richtext description
        decimal price
        media images
        boolean in_stock
        component seo
    }
```

---

## Blog

```mermaid
erDiagram
    CATEGORY ||--o{ POST : "categorizes"
    POST }o--o{ TAG : "tagged with"

    POST {
        string title
        uid slug
        text excerpt
        richtext content
        media cover
        string author
        datetime published_at
        component seo
    }
    CATEGORY {
        string name
        uid slug
    }
    TAG {
        string name
        uid slug
    }
```

Example categories are *Travel Guides*, *Culinary*, and *Hospitality Stories*.

---

## Events

```mermaid
erDiagram
    EVENT {
        string title
        uid slug
        enum type
        datetime start_at
        datetime end_at
        string location
        richtext description
        media gallery
        component seo
    }
```

`Event.type` is one of `wedding`, `private_dining`, `corporate`, or `public`.

---

## Landing Pages

Landing pages are built from **dynamic zones**, so editors can compose campaign pages from reusable blocks without writing code.

```mermaid
flowchart LR
    LP["LandingPage<br/>title · slug · seo"] --> DZ{{"Dynamic Zone: blocks"}}
    DZ --> H["blocks.hero"]
    DZ --> F["blocks.feature-grid"]
    DZ --> V["blocks.villa-highlight"]
    DZ --> P["blocks.promo-banner"]
    DZ --> T["blocks.testimonials"]
    DZ --> G["blocks.gallery"]
    DZ --> C["blocks.cta"]
    DZ --> Q["blocks.faq"]
```

Each block maps 1:1 to an Astro component in `apps/web/src/components/astro/blocks/`.

Use cases include promotional campaigns, seasonal offers, honeymoon packages, villa promotions, and event campaigns.

---

## Global & Single Types

| Type | Fields |
| --- | --- |
| `Homepage` | Hero, featured villas, highlights, testimonials, SEO |
| `About` | Brand story, facilities, gallery, SEO |
| `SiteSetting` | Site name, logo, contact info, social links, default SEO |
| `GuestGuide` | Title, slug, category (`check-in`, `check-out`, `policy`, `info`), content |
| `Faq` | Question, answer, category, order |

**Shared components**

| Component | Fields |
| --- | --- |
| `shared.seo` | `meta_title`, `meta_description`, `og_image`, `canonical_url`, `no_index` |
| `shared.contact` | `phone`, `whatsapp`, `email`, `address`, `map_url` |
