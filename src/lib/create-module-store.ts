export interface ModuleStore<T> {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: (value: T) => void) => () => void;
}

export function createModuleStore<T>(initialValue: T): ModuleStore<T> {
  let current = initialValue;
  const listeners = new Set<(value: T) => void>();
  return {
    get: () => current,
    set: (value: T) => {
      current = value;
      listeners.forEach((listener) => listener(value));
    },
    subscribe: (listener: (value: T) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export interface KeyedModuleStore<K, V> {
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => void;
  subscribe: (listener: (key: K, value: V) => void) => () => void;
}

export function createKeyedModuleStore<K, V>(): KeyedModuleStore<K, V> {
  const values = new Map<K, V>();
  const listeners = new Set<(key: K, value: V) => void>();
  return {
    get: (key: K) => values.get(key),
    set: (key: K, value: V) => {
      values.set(key, value);
      listeners.forEach((listener) => listener(key, value));
    },
    subscribe: (listener: (key: K, value: V) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
