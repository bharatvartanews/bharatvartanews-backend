type CacheEntry = {
  en: string;
  hi: string;
  date: string;
};

export const astroCache = new Map<string, CacheEntry>();
