type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<any>>();

export function getCache<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return;
  }
  return entry.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function clearCache(key?: string) {
  if (key) {
    store.delete(key);
  } else {
    store.clear();
  }
}

