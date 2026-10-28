export const PORTFOLIO_URL = 'https://port-tau-azure.vercel.app/';

export interface NavItem {
  href: string;
  label: string;
}

export type PortfolioNavKey = 'home' | 'projects' | 'services' | 'blog' | 'about' | 'language';

// Mirrors `publicNavItems` in the portfolio's navbar (../port/src/app/components/navbar),
// plus Services, which points back to this site.
export const portfolioNavItems: (NavItem & { key: PortfolioNavKey })[] = [
  { key: 'home', href: PORTFOLIO_URL, label: 'Home' },
  { key: 'projects', href: new URL('/pages/projects', PORTFOLIO_URL).href, label: 'Projects' },
  { key: 'services', href: '/', label: 'Services' },
  { key: 'blog', href: 'https://knowly-headless-cms.vercel.app/', label: 'Blog' },
  { key: 'about', href: new URL('/pages/about', PORTFOLIO_URL).href, label: 'About' },
  { key: 'language', href: new URL('/pages/language', PORTFOLIO_URL).href, label: 'Language' },
];

export const navItems: NavItem[] = [
  { href: '/packages', label: 'Paket' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/consultation', label: 'Konsultasi' },
  { href: '/products', label: 'Produk' },
  { href: '/blog', label: 'Blog' },
  { href: '/events', label: 'Event' },
  { href: '/guide', label: 'Panduan' },
];

export function isActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
