export type ServiceId = 'x' | 'suno' | 'tiktok';

export type ServiceUrls = Record<ServiceId, string | null>;

export type ActiveService = {
  id: ServiceId;
  label: string;
  url: string;
};

const serviceLabels: Record<ServiceId, string> = {
  x: 'X',
  suno: 'Suno',
  tiktok: 'TikTok',
};

export const serviceUrls: ServiceUrls = {
  x: 'https://x.com/phstarrion',
  suno: 'https://suno.com/@phstarrion',
  tiktok: null,
};

function isVerifiedUrl(value: string | null): value is string {
  if (!value) return false;

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function getActiveServices(urls: ServiceUrls): ActiveService[] {
  return (Object.keys(serviceLabels) as ServiceId[])
    .filter((id) => isVerifiedUrl(urls[id]))
    .map((id) => ({ id, label: serviceLabels[id], url: urls[id] as string }));
}

export const activeServices = getActiveServices(serviceUrls);

/**
 * The @handle X attributes cards with, derived from the verified profile URL so the account is
 * declared in exactly one place. Returns null when no verified X profile is configured.
 */
export function getXHandle(urls: ServiceUrls = serviceUrls): string | null {
  const profile = urls.x;

  if (!isVerifiedUrl(profile)) return null;

  const handle = new URL(profile).pathname.replace(/^\/+|\/+$/g, '');

  return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? `@${handle}` : null;
}

export const xHandle = getXHandle();
