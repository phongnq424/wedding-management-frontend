export type CacheLoadOptions = {
  force?: boolean;
};

export type CacheEntry<T> = {
  data?: T;
  fetchedAt: number;
};

export type TimedResource<T> = {
  getData: () => T | undefined;
  getFetchedAt: () => number;
  isFresh: () => boolean;
  load: (loader: () => Promise<T>, options?: CacheLoadOptions) => Promise<T>;
  setData: (data: T) => void;
  invalidate: () => void;
  clear: () => void;
};

type TimedResourceConfig = {
  key: string;
  ttlMs: number;
};

export function createTimedResource<T>({ key, ttlMs }: TimedResourceConfig): TimedResource<T> {
  const entry: CacheEntry<T> = {
    data: undefined,
    fetchedAt: 0,
  };

  let pending: Promise<T> | undefined;

  function isFresh() {
    return entry.data !== undefined && Date.now() - entry.fetchedAt < ttlMs;
  }

  return {
    getData: () => entry.data,
    getFetchedAt: () => entry.fetchedAt,
    isFresh,
    async load(loader: () => Promise<T>, options?: CacheLoadOptions) {
      if (!options?.force && isFresh()) {
        return entry.data as T;
      }

      if (!pending) {
        pending = loader()
          .then((data) => {
            entry.data = data;
            entry.fetchedAt = Date.now();
            return data;
          })
          .finally(() => {
            pending = undefined;
          });
      }

      return pending;
    },
    setData(data: T) {
      entry.data = data;
      entry.fetchedAt = Date.now();
    },
    invalidate() {
      entry.fetchedAt = 0;
    },
    clear() {
      entry.data = undefined;
      entry.fetchedAt = 0;
      pending = undefined;
    },
  };
}
