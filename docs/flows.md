# 🔄 Flows

[← Back to README](../README.md)

This page describes the main user and system flows of the platform.

## Table of Contents

1. [Visitor Journey](#1-visitor-journey)
2. [Content Publishing](#2-content-publishing)
3. [Page Request & Rendering](#3-page-request--rendering)
4. [Villa Availability Check](#4-villa-availability-check)
5. [Villa Booking & Payment](#5-villa-booking--payment)
6. [Booking Status Lifecycle](#6-booking-status-lifecycle)
7. [Restaurant Table Reservation](#7-restaurant-table-reservation)
8. [Product Search & Filter](#8-product-search--filter)
9. [Email Notifications](#9-email-notifications)

---

## 1. Visitor Journey

How a guest moves through the website.

```mermaid
flowchart TD
    Start(["Visitor lands on site"]) --> Entry{"Entry point"}
    Entry -- "Search / social" --> Home["Home"]
    Entry -- "Campaign link" --> LP["Landing Page"]
    Entry -- "Article link" --> Blog["Blog Post"]

    Home --> Villas["Villa Listing"]
    Home --> Resto["Restaurant"]
    Home --> Events["Events"]
    Home --> Products["Product Catalog"]
    LP --> Villas
    Blog --> Villas

    Villas --> Detail["Villa Detail"]
    Detail --> Avail["Check Availability"]
    Avail --> Book["Booking Form"]
    Book --> Pay["Payment"]
    Pay --> Confirm(["Booking Confirmed"])
    Confirm --> Guide["Guest Guide<br/>Check-in info · Policies · FAQ"]

    Resto --> Reserve["Table Reservation"]
    Reserve --> RConfirm(["Reservation Received"])
```

---

## 2. Content Publishing

Editors manage content in Strapi. Publishing triggers a rebuild so the static pages stay up to date.

```mermaid
sequenceDiagram
    autonumber
    actor Ed as Editor
    participant S as Strapi Admin
    participant DB as PostgreSQL
    participant CL as Cloudinary
    participant H as Deploy Hook
    participant A as Astro Build

    Ed->>S: Create / edit content (draft)
    Ed->>S: Upload images
    S->>CL: Store media
    S->>DB: Save draft
    Ed->>S: Publish
    S->>DB: Set publishedAt
    S->>H: Webhook (entry.publish)
    H->>A: Start build
    A->>S: Fetch published content
    S-->>A: JSON content
    A->>A: Generate static pages
    A-->>Ed: New version live
```

> [!TIP]
> Content that must always be live, such as availability and prices at booking time, is **never** taken from the static build. It is always fetched at runtime.

---

## 3. Page Request & Rendering

How a request is served depending on the page type.

```mermaid
flowchart TD
    Req(["HTTP request"]) --> Type{"Page type?"}

    Type -- "SSG<br/>home, blog, villa detail…" --> Static["Serve pre-built HTML<br/>from CDN"]
    Type -- "SSR<br/>catalog with filters…" --> SSR["Astro server route"]
    SSR --> Fetch["Fetch from Strapi API"]
    Fetch --> Render["Render HTML"]

    Static --> Browser["Browser renders HTML"]
    Render --> Browser

    Browser --> Island{"Has Vue island?"}
    Island -- "No" --> Done(["Done · zero JS"])
    Island -- "Yes" --> Hydrate["Hydrate island<br/>client:load / idle / visible"]
    Hydrate --> Live["Island calls API at runtime"]
    Live --> Done2(["Interactive"])
```

---

## 4. Villa Availability Check

Runs inside the availability **Vue island** on the villa detail page.

```mermaid
flowchart TD
    A(["Guest selects dates & guests"]) --> V{"Valid input?<br/>check-out after check-in<br/>guests ≤ max guests"}
    V -- "No" --> Err["Show validation error"]
    V -- "Yes" --> Call["GET /api/villas/:id/availability"]
    Call --> Q["Find bookings that overlap the<br/>requested dates and are still<br/>pending_payment or confirmed"]
    Q --> Found{"Overlap found?"}
    Found -- "Yes" --> NA["❌ Not available<br/>suggest other dates / villas"]
    Found -- "No" --> Price["Calculate price<br/>nights × rate + season / promo"]
    Price --> OK["✅ Available<br/>show total & 'Book now'"]
```

**Overlap rule.** An existing booking blocks the requested range when:

```text
existing.check_in  <  requested.check_out
AND
existing.check_out >  requested.check_in
AND
existing.status IN ('pending_payment', 'confirmed')
```

---

## 5. Villa Booking & Payment

```mermaid
sequenceDiagram
    autonumber
    actor G as Guest
    participant W as Booking Island (Vue)
    participant S as Strapi API
    participant DB as PostgreSQL
    participant M as Midtrans
    participant E as Email (SMTP)

    G->>W: Submit booking form
    W->>S: POST /api/bookings
    S->>S: Validate input
    S->>DB: Re-check availability (transaction)
    alt Dates no longer available
        S-->>W: 409 Conflict
        W-->>G: Ask to choose other dates
    else Available
        S->>DB: Create booking (pending_payment, expires in N min)
        S->>M: Create Snap transaction
        M-->>S: Snap token
        S-->>W: Booking code + Snap token
        W->>M: Open Snap payment popup
        G->>M: Pay
        M->>S: POST /api/payments/notification
        S->>S: Verify signature
        alt Payment success
            S->>DB: status = confirmed
            S->>E: Send confirmation email
            E-->>G: Confirmation + guest guide link
        else Payment failed / expired
            S->>DB: status = cancelled / expired
            S->>E: Send payment failed email
        end
        W-->>G: Show result page
    end
```

**Key rules**

- Availability is checked **twice**: once for display, and again inside a DB transaction when the booking is created. This prevents double bookings.
- Pending bookings **expire** if they are not paid within the payment window, which frees up the dates.
- The price is always **calculated on the server**. The client never sends a price that is trusted.
- Payment webhooks are **signature-verified** before the booking status changes.

---

## 6. Booking Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending_payment: Booking created
    pending_payment --> confirmed: Payment success
    pending_payment --> expired: Payment window passed
    pending_payment --> cancelled: Guest cancels / payment failed
    confirmed --> checked_in: Guest arrives
    confirmed --> cancelled: Cancellation (policy applies)
    checked_in --> completed: Guest checks out
    expired --> [*]
    cancelled --> [*]
    completed --> [*]
```

| Status | Blocks dates? | Description |
| --- | --- | --- |
| `pending_payment` | ✅ | Waiting for payment within the payment window |
| `confirmed` | ✅ | Paid and confirmed |
| `checked_in` | ✅ | Guest is staying at the villa |
| `completed` | ❌ | Stay finished |
| `cancelled` | ❌ | Cancelled by guest, admin, or failed payment |
| `expired` | ❌ | Not paid in time |

---

## 7. Restaurant Table Reservation

Reservations don't need online payment. Staff confirm them from the Strapi admin.

```mermaid
sequenceDiagram
    autonumber
    actor G as Guest
    participant W as Reservation Island (Vue)
    participant S as Strapi API
    participant DB as PostgreSQL
    actor St as Restaurant Staff
    participant E as Email

    G->>W: Choose date, time, party size
    W->>W: Validate against opening hours
    W->>S: POST /api/table-reservations
    S->>DB: Save reservation (pending)
    S->>E: Notify restaurant staff
    S-->>W: Reservation received
    W-->>G: "We'll confirm shortly"
    St->>S: Confirm or decline in Admin
    S->>DB: Update status
    S->>E: Send result to guest
    E-->>G: Reservation confirmed / declined
```

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> confirmed: Staff confirms
    pending --> declined: Fully booked
    confirmed --> cancelled: Guest cancels
    confirmed --> completed: Guest attended
    confirmed --> no_show: Guest didn't come
    declined --> [*]
    cancelled --> [*]
    completed --> [*]
    no_show --> [*]
```

---

## 8. Product Search & Filter

```mermaid
flowchart LR
    A(["Guest types / picks filter"]) --> B["Debounce input<br/>(~300 ms)"]
    B --> C["Sync filters to URL<br/>?q=&category=&sort="]
    C --> D["GET /api/products<br/>with Strapi filters"]
    D --> E["Render results in island"]
    C -. "shareable / SSR on reload" .-> F["SSR catalog page<br/>reads query params"]
```

Filters are stored in the URL, so filtered results can be shared, bookmarked, and indexed.

---

## 9. Email Notifications

Sent from Strapi lifecycle hooks or controllers through SMTP / Nodemailer.

| Trigger | Recipient | Email |
| --- | --- | --- |
| Booking created | Guest | Booking received + payment instructions |
| Payment success | Guest | Booking confirmation + guest guide link |
| Payment success | Admin | New confirmed booking |
| Payment failed / expired | Guest | Payment failed / booking expired |
| Booking cancelled | Guest & Admin | Cancellation notice |
| Reservation created | Restaurant staff | New table reservation |
| Reservation confirmed / declined | Guest | Reservation result |
| H-1 before check-in | Guest | Check-in reminder + directions *(future)* |
