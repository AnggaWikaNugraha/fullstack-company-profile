import type { Package, PackageType } from '@service/shared';

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatIDR(amount: number): string {
  return idr.format(amount);
}

export const packageTypeLabel: Record<PackageType, string> = {
  landing_page: 'Landing page',
  company_profile: 'Company profile',
  ecommerce: 'E-commerce',
  web_app: 'Web app',
};

export function shortestDurationWeeks(pkg: Package): number {
  return Math.min(...pkg.tiers.map((tier) => tier.duration_weeks));
}
