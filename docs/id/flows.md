# 🔄 Alur

[← Kembali ke README](../../README.id.md) · [🇬🇧 English](../flows.md)

Halaman ini menjelaskan alur utama pengguna dan sistem di platform ini.

## Daftar Isi

1. [Perjalanan Pengunjung](#1-perjalanan-pengunjung)
2. [Publikasi Konten](#2-publikasi-konten)
3. [Request Halaman & Rendering](#3-request-halaman--rendering)
4. [Cek Ketersediaan Project](#4-cek-ketersediaan-project)
5. [Pemesanan Project & Pembayaran](#5-pemesanan-project--pembayaran)
6. [Siklus Status Order](#6-siklus-status-order)
7. [Booking Konsultasi](#7-booking-konsultasi)
8. [Pencarian & Filter Produk](#8-pencarian--filter-produk)
9. [Notifikasi Email](#9-notifikasi-email)

---

## 1. Perjalanan Pengunjung

Bagaimana calon klien bergerak di dalam website.

```mermaid
flowchart TD
    Start(["Pengunjung masuk ke situs"]) --> Entry{"Titik masuk"}
    Entry -- "Navbar portofolio / pencarian" --> Home["Home"]
    Entry -- "Link kampanye" --> LP["Landing Page"]
    Entry -- "Link artikel" --> Blog["Artikel Blog / Studi Kasus"]

    Home --> Packages["Daftar Paket"]
    Home --> Portfolio["Portofolio"]
    Home --> Consult["Konsultasi"]
    Home --> Events["Event"]
    Home --> Products["Produk Digital"]
    LP --> Packages
    Blog --> Packages
    Portfolio --> Packages

    Packages --> Detail["Detail Paket"]
    Detail --> Avail["Cek Ketersediaan Tanggal Mulai"]
    Avail --> Order["Form Order + Brief Project"]
    Order --> Pay["Pembayaran DP"]
    Pay --> Confirm(["Order Terkonfirmasi"])
    Confirm --> Guide["Panduan Klien<br/>Onboarding · Kebijakan · FAQ"]

    Consult --> Book["Booking Konsultasi"]
    Book --> BConfirm(["Booking Diterima"])
```

---

## 2. Publikasi Konten

Editor mengelola konten di Strapi. Saat konten di-publish, situs di-rebuild supaya halaman statis selalu terbaru.

```mermaid
sequenceDiagram
    autonumber
    actor Ed as Editor
    participant S as Strapi Admin
    participant DB as PostgreSQL
    participant CL as Cloudinary
    participant H as Deploy Hook
    participant A as Astro Build

    Ed->>S: Buat / ubah konten (draft)
    Ed->>S: Upload gambar
    S->>CL: Simpan media
    S->>DB: Simpan draft
    Ed->>S: Publish
    S->>DB: Isi publishedAt
    S->>H: Webhook (entry.publish)
    H->>A: Mulai build
    A->>S: Ambil konten yang sudah publish
    S-->>A: Konten JSON
    A->>A: Generate halaman statis
    A-->>Ed: Versi baru live
```

> [!TIP]
> Data yang harus selalu live, seperti slot project dan harga saat order, **tidak pernah** diambil dari hasil build statis. Data ini selalu diambil saat runtime.

---

## 3. Request Halaman & Rendering

Cara sebuah request dilayani tergantung jenis halamannya.

```mermaid
flowchart TD
    Req(["HTTP request"]) --> Type{"Jenis halaman?"}

    Type -- "SSG<br/>home, blog, detail paket…" --> Static["Sajikan HTML hasil build<br/>dari CDN"]
    Type -- "SSR<br/>katalog dengan filter…" --> SSR["Route server Astro"]
    SSR --> Fetch["Ambil data dari Strapi API"]
    Fetch --> Render["Render HTML"]

    Static --> Browser["Browser menampilkan HTML"]
    Render --> Browser

    Browser --> Island{"Ada Vue island?"}
    Island -- "Tidak" --> Done(["Selesai · zero JS"])
    Island -- "Ya" --> Hydrate["Hydrate island<br/>client:load / idle / visible"]
    Hydrate --> Live["Island memanggil API saat runtime"]
    Live --> Done2(["Interaktif"])
```

---

## 4. Cek Ketersediaan Project

Berjalan di dalam **Vue island** ketersediaan pada halaman detail paket. Tim hanya bisa mengerjakan sejumlah project dalam waktu bersamaan, jadi sebuah tanggal mulai baru tersedia kalau masih ada kapasitas kosong di sepanjang timeline project.

```mermaid
flowchart TD
    A(["Klien memilih tier, add-on<br/>& tanggal mulai"]) --> V{"Input valid?<br/>tanggal mulai ≥ hari ini + lead time<br/>tier milik paket tersebut"}
    V -- "Tidak" --> Err["Tampilkan error validasi"]
    V -- "Ya" --> Call["GET /api/packages/:id/availability"]
    Call --> End["Hitung tanggal selesai<br/>mulai + durasi tier + minggu tambahan add-on"]
    End --> Q["Hitung order yang bentrok dengan<br/>timeline project dan statusnya masih<br/>pending_payment, confirmed, atau in_progress"]
    Q --> Full{"Jumlah ≥ kapasitas project?"}
    Full -- "Ya" --> NA["❌ Penuh<br/>sarankan tanggal mulai terdekat yang kosong"]
    Full -- "Tidak" --> Price["Hitung harga<br/>harga tier + add-on ± promo<br/>DP = total × persen DP"]
    Price --> OK["✅ Tersedia<br/>tampilkan tanggal selesai, total, DP & 'Pesan sekarang'"]
```

**Aturan kapasitas.** Sebuah order yang sudah ada memakai satu slot di timeline yang diminta jika:

```text
existing.start_date  <  requested.end_date
AND
existing.end_date    >  requested.start_date
AND
existing.status IN ('pending_payment', 'confirmed', 'in_progress')
```

Tanggal mulai tersedia jika `COUNT(order yang bentrok) < SiteSetting.project_capacity`.

---

## 5. Pemesanan Project & Pembayaran

```mermaid
sequenceDiagram
    autonumber
    actor C as Klien
    participant W as Order Island (Vue)
    participant S as Strapi API
    participant DB as PostgreSQL
    participant M as Midtrans
    participant E as Email (SMTP)

    C->>W: Kirim form order + brief project
    W->>S: POST /api/orders
    S->>S: Validasi input
    S->>DB: Cek ulang kapasitas (transaction)
    alt Slot sudah tidak tersedia
        S-->>W: 409 Conflict
        W-->>C: Minta pilih tanggal mulai lain
    else Tersedia
        S->>DB: Buat order (pending_payment, kedaluwarsa dalam N menit)
        S->>M: Buat transaksi Snap (nominal DP)
        M-->>S: Snap token
        S-->>W: Kode order + Snap token
        W->>M: Buka popup pembayaran Snap
        C->>M: Bayar DP
        M->>S: POST /api/payments/notification
        S->>S: Verifikasi signature
        alt Pembayaran berhasil
            S->>DB: status = confirmed
            S->>E: Kirim email konfirmasi
            E-->>C: Konfirmasi + link panduan klien
        else Pembayaran gagal / kedaluwarsa
            S->>DB: status = cancelled / expired
            S->>E: Kirim email pembayaran gagal
        end
        W-->>C: Tampilkan halaman hasil
    end
```

**Aturan penting**

- Kapasitas dicek **dua kali**: sekali untuk ditampilkan, dan sekali lagi di dalam transaksi DB saat order dibuat. Ini mencegah tim menerima project melebihi kapasitas.
- Order yang masih pending akan **kedaluwarsa** jika DP tidak dibayar dalam batas waktu pembayaran, sehingga slotnya kosong lagi.
- Harga dan DP selalu **dihitung di server**. Harga yang dikirim dari klien tidak pernah dipercaya.
- Webhook pembayaran **diverifikasi signature-nya** sebelum status order diubah.
- Sisa pembayaran ditagihkan saat serah terima. Pelunasan secara online masuk ke [pengembangan ke depan](../../README.id.md#-roadmap).

---

## 6. Siklus Status Order

```mermaid
stateDiagram-v2
    [*] --> pending_payment: Order dibuat
    pending_payment --> confirmed: DP dibayar
    pending_payment --> expired: Batas waktu bayar lewat
    pending_payment --> cancelled: Klien membatalkan / pembayaran gagal
    confirmed --> in_progress: Kickoff project
    confirmed --> cancelled: Pembatalan (sesuai kebijakan)
    in_progress --> completed: Project diserahkan
    expired --> [*]
    cancelled --> [*]
    completed --> [*]
```

| Status | Memakai kapasitas? | Keterangan |
| --- | --- | --- |
| `pending_payment` | ✅ | Menunggu DP dalam batas waktu pembayaran |
| `confirmed` | ✅ | DP sudah dibayar, menunggu kickoff |
| `in_progress` | ✅ | Project sedang dikerjakan |
| `completed` | ❌ | Project sudah diserahkan |
| `cancelled` | ❌ | Dibatalkan oleh klien, admin, atau karena pembayaran gagal |
| `expired` | ❌ | DP tidak dibayar tepat waktu |

---

## 7. Booking Konsultasi

Konsultasi tidak memerlukan pembayaran online. Konsultan mengonfirmasi booking dari admin Strapi lalu mengirim link meeting.

```mermaid
sequenceDiagram
    autonumber
    actor C as Klien
    participant W as Consultation Island (Vue)
    participant S as Strapi API
    participant DB as PostgreSQL
    actor Co as Konsultan
    participant E as Email

    C->>W: Pilih jenis konsultasi, tanggal, jam & topik
    W->>W: Validasi terhadap jam konsultasi
    W->>S: POST /api/consultation-bookings
    S->>DB: Simpan booking (pending)
    S->>E: Beri tahu konsultan
    S-->>W: Booking diterima
    W-->>C: "Kami akan segera mengonfirmasi"
    Co->>S: Konfirmasi atau tolak di Admin
    S->>DB: Update status
    S->>E: Kirim hasil ke klien
    E-->>C: Booking dikonfirmasi (link meeting) / ditolak
```

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> confirmed: Konsultan mengonfirmasi
    pending --> declined: Slot tidak tersedia
    confirmed --> cancelled: Klien membatalkan
    confirmed --> completed: Call terlaksana
    confirmed --> no_show: Klien tidak hadir
    declined --> [*]
    cancelled --> [*]
    completed --> [*]
    no_show --> [*]
```

---

## 8. Pencarian & Filter Produk

```mermaid
flowchart LR
    A(["Pengunjung mengetik / memilih filter"]) --> B["Debounce input<br/>(~300 ms)"]
    B --> C["Sinkronkan filter ke URL<br/>?q=&category=&tech=&sort="]
    C --> D["GET /api/products<br/>dengan filter Strapi"]
    D --> E["Tampilkan hasil di island"]
    C -. "bisa dibagikan / SSR saat reload" .-> F["Halaman katalog SSR<br/>membaca query param"]
```

Filter disimpan di URL, jadi hasil filter bisa dibagikan, di-bookmark, dan diindeks mesin pencari.

---

## 9. Notifikasi Email

Dikirim dari lifecycle hook atau controller Strapi melalui SMTP / Nodemailer.

| Pemicu | Penerima | Email |
| --- | --- | --- |
| Order dibuat | Klien | Order diterima + instruksi pembayaran DP |
| Pembayaran berhasil | Klien | Konfirmasi order + link panduan klien |
| Pembayaran berhasil | Admin | Ada order baru yang terkonfirmasi |
| Pembayaran gagal / kedaluwarsa | Klien | Pembayaran gagal / order kedaluwarsa |
| Order dibatalkan | Klien & Admin | Pemberitahuan pembatalan |
| Booking konsultasi dibuat | Konsultan | Ada booking konsultasi baru |
| Konsultasi dikonfirmasi / ditolak | Klien | Hasil booking + link meeting |
| H-1 sebelum kickoff | Klien | Pengingat kickoff + checklist persiapan *(ke depan)* |
