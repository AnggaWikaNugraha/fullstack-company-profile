# 🔄 Flows

[← Back to README](../README.md) · [🇮🇩 Bahasa Indonesia](id/flows.md)

This page describes the main user and system flows of the platform.

## Table of Contents

1. [Visitor Journey](#1-visitor-journey)
2. [Content Publishing](#2-content-publishing)
3. [Page Request & Rendering](#3-page-request--rendering)
4. [Project Availability Check](#4-project-availability-check)
5. [Project Ordering & Payment](#5-project-ordering--payment)
6. [Order Status Lifecycle](#6-order-status-lifecycle)
7. [Consultation Booking](#7-consultation-booking)
8. [Product Search & Filter](#8-product-search--filter)
9. [Email Notifications](#9-email-notifications)

---

## 1. Visitor Journey

How a potential client moves through the website.

```mermaid
flowchart TD
    Start(["Visitor lands on site"]) --> Entry{"Entry point"}
    Entry -- "Portfolio navbar / search" --> Home["Home"]
    Entry -- "Campaign link" --> LP["Landing Page"]
    Entry -- "Article link" --> Blog["Blog Post / Case Study"]

    Home --> Packages["Package Listing"]
    Home --> Portfolio["Portfolio"]
    Home --> Consult["Consultation"]
    Home --> Events["Events"]
    Home --> Products["Digital Products"]
    LP --> Packages
    Blog --> Packages
    Portfolio --> Packages

    Packages --> Detail["Package Detail"]
    Detail --> Avail["Check Start-Date Availability"]
    Avail --> Order["Order Form + Project Brief"]
    Order --> Pay["Deposit Payment"]
    Pay --> Confirm(["Order Confirmed"])
    Confirm --> Guide["Client Guide<br/>Onboarding · Policies · FAQ"]

    Consult --> Book["Book a Consultation"]
    Book --> BConfirm(["Booking Received"])
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
> Content that must always be live, such as project slots and prices at order time, is **never** taken from the static build. It is always fetched at runtime.

---

## 3. Page Request & Rendering

How a request is served depending on the page type.

```mermaid
flowchart TD
    Req(["HTTP request"]) --> Type{"Page type?"}

    Type -- "SSG<br/>home, blog, package detail…" --> Static["Serve pre-built HTML<br/>from CDN"]
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

## 4. Project Availability Check

Runs inside the availability **Vue island** on the package detail page. The team can only run a limited number of projects at the same time, so a start date is available only while there is free capacity for the whole project timeline.

```mermaid
flowchart TD
    A(["Client selects tier, add-ons<br/>& start date"]) --> V{"Valid input?<br/>start date ≥ today + lead time<br/>tier belongs to package"}
    V -- "No" --> Err["Show validation error"]
    V -- "Yes" --> Call["GET /api/packages/:id/availability"]
    Call --> End["Calculate end date<br/>start + tier duration + add-on weeks"]
    End --> Q["Count orders that overlap the<br/>project timeline and are still<br/>pending_payment, confirmed or in_progress"]
    Q --> Full{"Count ≥ project capacity?"}
    Full -- "Yes" --> NA["❌ Fully booked<br/>suggest the next available start date"]
    Full -- "No" --> Price["Calculate price<br/>tier price + add-ons ± promo<br/>deposit = total × deposit %"]
    Price --> OK["✅ Available<br/>show end date, total, deposit & 'Order now'"]
```

**Capacity rule.** An existing order uses a slot in the requested timeline when:

```text
existing.start_date  <  requested.end_date
AND
existing.end_date    >  requested.start_date
AND
existing.status IN ('pending_payment', 'confirmed', 'in_progress')
```

The start date is available when `COUNT(overlapping orders) < SiteSetting.project_capacity`.

---

## 5. Project Ordering & Payment

```mermaid
sequenceDiagram
    autonumber
    actor C as Client
    participant W as Order Island (Vue)
    participant S as Strapi API
    participant DB as PostgreSQL
    participant M as Midtrans
    participant E as Email (SMTP)

    C->>W: Submit order form + project brief
    W->>S: POST /api/orders
    S->>S: Validate input
    S->>DB: Re-check capacity (transaction)
    alt Slot no longer available
        S-->>W: 409 Conflict
        W-->>C: Ask to choose another start date
    else Available
        S->>DB: Create order (pending_payment, expires in N min)
        S->>M: Create Snap transaction (deposit amount)
        M-->>S: Snap token
        S-->>W: Order code + Snap token
        W->>M: Open Snap payment popup
        C->>M: Pay deposit
        M->>S: POST /api/payments/notification
        S->>S: Verify signature
        alt Payment success
            S->>DB: status = confirmed
            S->>E: Send confirmation email
            E-->>C: Confirmation + client guide link
        else Payment failed / expired
            S->>DB: status = cancelled / expired
            S->>E: Send payment failed email
        end
        W-->>C: Show result page
    end
```

**Key rules**

- Capacity is checked **twice**: once for display, and again inside a DB transaction when the order is created. This prevents overbooking the team.
- Pending orders **expire** if the deposit is not paid within the payment window, which frees up the slot.
- The price and deposit are always **calculated on the server**. The client never sends a price that is trusted.
- Payment webhooks are **signature-verified** before the order status changes.
- The remaining balance is invoiced at handover. Paying it online is a [future improvement](../README.md#-roadmap).

---

## 6. Order Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending_payment: Order created
    pending_payment --> confirmed: Deposit paid
    pending_payment --> expired: Payment window passed
    pending_payment --> cancelled: Client cancels / payment failed
    confirmed --> in_progress: Project kickoff
    confirmed --> cancelled: Cancellation (policy applies)
    in_progress --> completed: Project handed over
    expired --> [*]
    cancelled --> [*]
    completed --> [*]
```

| Status | Uses capacity? | Description |
| --- | --- | --- |
| `pending_payment` | ✅ | Waiting for the deposit within the payment window |
| `confirmed` | ✅ | Deposit paid, waiting for kickoff |
| `in_progress` | ✅ | Project is being built |
| `completed` | ❌ | Project handed over |
| `cancelled` | ❌ | Cancelled by client, admin, or failed payment |
| `expired` | ❌ | Deposit not paid in time |

---

## 7. Consultation Booking

Consultations don't need online payment. The consultant confirms them from the Strapi admin and sends the meeting link.

```mermaid
sequenceDiagram
    autonumber
    actor C as Client
    participant W as Consultation Island (Vue)
    participant S as Strapi API
    participant DB as PostgreSQL
    actor Co as Consultant
    participant E as Email

    C->>W: Choose consultation type, date, time & topic
    W->>W: Validate against consultation hours
    W->>S: POST /api/consultation-bookings
    S->>DB: Save booking (pending)
    S->>E: Notify consultant
    S-->>W: Booking received
    W-->>C: "We'll confirm shortly"
    Co->>S: Confirm or decline in Admin
    S->>DB: Update status
    S->>E: Send result to client
    E-->>C: Booking confirmed (meeting link) / declined
```

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> confirmed: Consultant confirms
    pending --> declined: Slot unavailable
    confirmed --> cancelled: Client cancels
    confirmed --> completed: Call held
    confirmed --> no_show: Client didn't join
    declined --> [*]
    cancelled --> [*]
    completed --> [*]
    no_show --> [*]
```

---

## 8. Product Search & Filter

```mermaid
flowchart LR
    A(["Visitor types / picks filter"]) --> B["Debounce input<br/>(~300 ms)"]
    B --> C["Sync filters to URL<br/>?q=&category=&tech=&sort="]
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
| Order created | Client | Order received + deposit payment instructions |
| Payment success | Client | Order confirmation + client guide link |
| Payment success | Admin | New confirmed order |
| Payment failed / expired | Client | Payment failed / order expired |
| Order cancelled | Client & Admin | Cancellation notice |
| Consultation booking created | Consultant | New consultation booking |
| Consultation confirmed / declined | Client | Booking result + meeting link |
| H-1 before kickoff | Client | Kickoff reminder + preparation checklist *(future)* |
