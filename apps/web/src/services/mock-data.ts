// Placeholder content until the Strapi models exist (Phase 2).
// Clients, projects and testimonials here are fictional: never ship them to production.
import type { Homepage, Package, SiteSetting } from '@service/shared';

export const packages: Package[] = [
  {
    name: 'Landing Page',
    slug: 'landing-page',
    type: 'landing_page',
    description: 'Satu halaman yang fokus pada konversi untuk kampanye, produk baru, atau event.',
    starting_price: 2_500_000,
    tiers: [
      { name: 'Basic', price: 2_500_000, duration_weeks: 1, revision_count: 2, features: ['1 halaman', 'Desain responsif', 'Form kontak'] },
      { name: 'Pro', price: 4_000_000, duration_weeks: 2, revision_count: 3, features: ['Semua fitur Basic', 'Copywriting', 'Integrasi analytics'] },
    ],
  },
  {
    name: 'Company Profile',
    slug: 'company-profile',
    type: 'company_profile',
    description: 'Website profil perusahaan yang rapi dan mudah dikelola sendiri lewat CMS.',
    starting_price: 6_000_000,
    tiers: [
      { name: 'Basic', price: 6_000_000, duration_weeks: 3, revision_count: 3, features: ['Hingga 5 halaman', 'CMS', 'SEO dasar'] },
      { name: 'Pro', price: 9_500_000, duration_weeks: 4, revision_count: 4, features: ['Hingga 10 halaman', 'Blog', 'Multi-bahasa'] },
    ],
  },
  {
    name: 'Toko Online',
    slug: 'toko-online',
    type: 'ecommerce',
    description: 'Katalog produk, keranjang, dan pembayaran online untuk mulai berjualan sendiri.',
    starting_price: 15_000_000,
    tiers: [
      { name: 'Basic', price: 15_000_000, duration_weeks: 6, revision_count: 3, features: ['Hingga 100 produk', 'Payment gateway', 'Dashboard pesanan'] },
    ],
  },
];

export const homepage: Homepage = {
  hero: {
    title: 'Website yang cepat, rapi, dan siap mendatangkan klien.',
    subtitle:
      'Jasa pembuatan website untuk UMKM dan perusahaan, dari landing page sampai aplikasi web. Pilih paket, cek jadwal mulai, lalu bayar DP langsung online.',
  },
  featured_packages: packages,
  portfolio_highlights: [
    {
      title: 'Website reservasi klinik',
      slug: 'website-reservasi-klinik',
      client_name: 'Klinik Pratama Sehati',
      summary: 'Reservasi online menggantikan antrean telepon. Waktu respons admin turun dari jam ke menit.',
      tech_stack: ['Astro', 'Vue', 'Strapi'],
    },
    {
      title: 'Toko online produk kopi',
      slug: 'toko-online-kopi',
      client_name: 'Kopi Lereng',
      summary: 'Katalog dan checkout sendiri, tidak lagi bergantung pada marketplace untuk pelanggan tetap.',
      tech_stack: ['Next.js', 'PostgreSQL', 'Midtrans'],
    },
    {
      title: 'Company profile kontraktor',
      slug: 'company-profile-kontraktor',
      client_name: 'Bangun Karya Mandiri',
      summary: 'Portofolio proyek yang bisa diperbarui sendiri oleh tim marketing tanpa bantuan developer.',
      tech_stack: ['Astro', 'Tailwind CSS', 'Strapi'],
    },
  ],
  work_process: [
    { title: 'Konsultasi', description: 'Ceritakan kebutuhan Anda. Kita tentukan paket dan cakupan yang paling pas.' },
    { title: 'Pesan & DP', description: 'Pilih tier dan tanggal mulai yang tersedia, lalu bayar DP online.' },
    { title: 'Desain', description: 'Rancangan tampilan dikirim untuk direview sebelum masuk development.' },
    { title: 'Development', description: 'Website dibangun dengan progres yang bisa Anda pantau setiap minggu.' },
    { title: 'Launch', description: 'Website online, serah terima akses, dan panduan mengelola konten.' },
  ],
  testimonials: [
    {
      name: 'Rina Kusuma',
      company: 'Klinik Pratama Sehati',
      quote: 'Prosesnya jelas dari awal. Jadwal mulai sudah pasti sejak bayar DP, dan selesai tepat waktu.',
      rating: 5,
    },
    {
      name: 'Dimas Pratama',
      company: 'Kopi Lereng',
      quote: 'Sekarang kami bisa update produk sendiri. Website-nya juga terasa jauh lebih cepat.',
      rating: 5,
    },
    {
      name: 'Sari Wulandari',
      company: 'Bangun Karya Mandiri',
      quote: 'Komunikasinya enak dan revisi ditangani dengan cepat. Hasilnya sesuai brief.',
      rating: 4,
    },
  ],
};

export const siteSetting: SiteSetting = {
  site_name: 'Service',
  contact: {
    email: 'halo@example.com',
    whatsapp: '6281234567890',
  },
  social_links: [
    { label: 'GitHub', url: 'https://github.com/AnggaWikaNugraha' },
  ],
};
