// Typed access to site content. Pages only read content through these functions.
// Phase 2 swaps the mock reads for fetches to the Strapi REST API; the signatures stay the same.
import type { Homepage, Package, SiteSetting } from '@service/shared';
import { homepage, packages, siteSetting } from './mock-data';

export async function getHomepage(): Promise<Homepage> {
  return homepage;
}

export async function getPackages(): Promise<Package[]> {
  return packages;
}

export async function getSiteSetting(): Promise<SiteSetting> {
  return siteSetting;
}
