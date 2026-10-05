# 🗂️ Content Model

[← Kembali ke README](../../README.id.md) · [🇬🇧 English](../content-model.md)

Berikut **content type Strapi** yang diusulkan beserta relasi antar-content type.

> [!NOTE]
> Ini masih draf desain. Nama field dan relasi bisa berubah selama Fase 2 (CMS).

## Daftar Isi

- [Ringkasan](#ringkasan)
- [Paket & Pemesanan](#paket--pemesanan)
- [Konsultasi](#konsultasi)
- [Produk Digital](#produk-digital)
- [Blog](#blog)
- [Event](#event)
- [Landing Page](#landing-page)
- [Global & Single Types](#global--single-types)

---

## Ringkasan

| Grup | Collection Types | Single Types |
| --- | --- | --- |
| Paket & Pemesanan | `Package`, `Feature`, `PortfolioProject`, `Order` | — |
| Konsultasi | `Consultation`, `AddOnCategory`, `AddOn`, `ConsultationBooking` | — |
| Produk Digital | `Product`, `ProductCategory` | — |
| Blog | `Post`, `Category`, `Tag` | — |
| Event | `Event` | — |
| Marketing | `LandingPage`, `Testimonial` | — |
| Panduan Klien | `ClientGuide`, `Faq` | — |
| Global | — | `Homepage`, `About`, `SiteSetting` |

---

## Paket & Pemesanan

```mermaid
erDiagram
    PACKAGE ||--o{ ORDER : "has"
    PACKAGE }o--o{ FEATURE : "includes"
    PACKAGE }o--o{ PORTFOLIO_PROJECT : "showcases"
    PACKAGE ||--o{ TESTIMONIAL : "receives"
    ORDER }o--o{ ADD_ON : "adds"

    PACKAGE {
        string name
        uid slug
        enum type
        richtext description
        decimal starting_price
        component tiers
        media gallery
        component seo
    }
    FEATURE {
        string name
        media icon
        text description
    }
    PORTFOLIO_PROJECT {
        string title
        uid slug
        string client_name
        richtext summary
        json tech_stack
        string live_url
        media gallery
        component seo
    }
    ORDER {
        uid order_code
        string tier
        date start_date
        date end_date
        string client_name
        email client_email
        string client_phone
        string company_name
        richtext brief
        decimal total_price
        decimal deposit_amount
        enum status
        string payment_ref
        datetime expires_at
    }
    TESTIMONIAL {
        string name
        string company
        text quote
        int rating
        media avatar
    }
```

`Package.type` berisi salah satu dari `landing_page`, `company_profile`, `ecommerce`, atau `web_app`.

`Package.tiers` adalah komponen `package.tier` yang repeatable (misalnya *Basic*, *Pro*, *Enterprise*) dengan field `name`, `price`, `duration_weeks`, `revision_count`, dan `features`.

`Order.status` berisi salah satu dari `pending_payment`, `confirmed`, `in_progress`, `completed`, `cancelled`, atau `expired`. Lihat [Siklus Status Order](flows.md#6-siklus-status-order).

---

## Konsultasi

```mermaid
erDiagram
    CONSULTATION ||--o{ ADD_ON_CATEGORY : "lists"
    ADD_ON_CATEGORY ||--o{ ADD_ON : "contains"
    CONSULTATION ||--o{ CONSULTATION_BOOKING : "receives"

    CONSULTATION {
        string name
        uid slug
        richtext description
        int duration_minutes
        enum mode
        json consultation_hours
        media gallery
        component seo
    }
    ADD_ON_CATEGORY {
        string name
        int order
    }
    ADD_ON {
        string name
        text description
        decimal price
        int extra_weeks
        media image
        boolean is_available
    }
    CONSULTATION_BOOKING {
        date date
        time time
        string topic
        string client_name
        email client_email
        string client_phone
        string company_name
        text notes
        string meeting_url
        enum status
    }
```

Contoh jenis konsultasi: *Discovery Call*, *Technical Audit*, dan *Website Review*. `Consultation.mode` berisi `online` atau `offline`.

Add-on dikelompokkan ke dalam kategori seperti *Fitur Tambahan*, *Paket Maintenance*, dan *SEO & Konten*. Add-on yang sama bisa ditambahkan ke `Order`, dan field `extra_weeks` memperpanjang timeline project.

`ConsultationBooking.status` berisi salah satu dari `pending`, `confirmed`, `declined`, `cancelled`, `completed`, atau `no_show`.

---

## Produk Digital

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
        json tech_stack
        string demo_url
        boolean is_available
        component seo
    }
```

Contoh kategori: *Template Website*, *UI Kit*, dan *Starter Kit*.

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

Contoh kategori: *Tutorial*, *Studi Kasus*, dan *Bisnis & Digital*.

---

## Event

```mermaid
erDiagram
    EVENT {
        string title
        uid slug
        enum type
        datetime start_at
        datetime end_at
        string location
        string registration_url
        richtext description
        media gallery
        component seo
    }
```

`Event.type` berisi salah satu dari `webinar`, `workshop`, `bootcamp`, atau `corporate_training`.

---

## Landing Page

Landing page disusun dari **dynamic zone**, jadi editor bisa merangkai halaman kampanye dari block yang reusable tanpa menulis kode.

```mermaid
flowchart LR
    LP["LandingPage<br/>title · slug · seo"] --> DZ{{"Dynamic Zone: blocks"}}
    DZ --> H["blocks.hero"]
    DZ --> F["blocks.feature-grid"]
    DZ --> V["blocks.package-highlight"]
    DZ --> P["blocks.promo-banner"]
    DZ --> T["blocks.testimonials"]
    DZ --> G["blocks.gallery"]
    DZ --> C["blocks.cta"]
    DZ --> Q["blocks.faq"]
```

Setiap block dipetakan 1:1 ke komponen Astro di `apps/web/src/components/astro/blocks/`.

Contoh penggunaannya: kampanye promo, paket UMKM, diskon musiman, bundling website + maintenance, dan kampanye event.

---

## Global & Single Types

| Type | Field |
| --- | --- |
| `Homepage` | Hero, paket unggulan, sorotan portofolio, proses kerja, testimoni, SEO |
| `About` | Cerita, tim, proses kerja, tech stack, galeri, SEO |
| `SiteSetting` | Nama situs, logo, info kontak, link media sosial, `project_capacity`, `deposit_percentage`, `order_lead_days`, SEO default |
| `ClientGuide` | Judul, slug, kategori (`onboarding`, `workflow`, `policy`, `info`), konten |
| `Faq` | Pertanyaan, jawaban, kategori, urutan |

**Komponen bersama**

| Komponen | Field |
| --- | --- |
| `shared.seo` | `meta_title`, `meta_description`, `og_image`, `canonical_url`, `no_index` |
| `shared.contact` | `phone`, `whatsapp`, `email`, `address`, `map_url` |
| `package.tier` | `name`, `price`, `duration_weeks`, `revision_count`, `features` |
