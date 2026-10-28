// Content types mirroring the Strapi models in docs/content-model.md.
// Media fields (gallery, avatar, icon) are added with the Cloudinary integration.

export type PackageType = 'landing_page' | 'company_profile' | 'ecommerce' | 'web_app';

/** `package.tier` component */
export interface PackageTier {
  name: string;
  price: number;
  duration_weeks: number;
  revision_count: number;
  features: string[];
}

export interface Package {
  name: string;
  slug: string;
  type: PackageType;
  description: string;
  starting_price: number;
  tiers: PackageTier[];
}

export interface PortfolioProject {
  title: string;
  slug: string;
  client_name: string;
  summary: string;
  tech_stack: string[];
  live_url?: string;
}

export interface Testimonial {
  name: string;
  company: string;
  quote: string;
  rating: number;
}

export interface Hero {
  title: string;
  subtitle: string;
}

export interface WorkStep {
  title: string;
  description: string;
}

/** `Homepage` single type */
export interface Homepage {
  hero: Hero;
  featured_packages: Package[];
  portfolio_highlights: PortfolioProject[];
  work_process: WorkStep[];
  testimonials: Testimonial[];
}

/** `shared.contact` component */
export interface Contact {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  map_url?: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

/** `SiteSetting` single type (public fields only) */
export interface SiteSetting {
  site_name: string;
  contact: Contact;
  social_links: SocialLink[];
}
