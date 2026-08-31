import { createModuleStore, createKeyedModuleStore } from '@/lib/create-module-store';

describe('createModuleStore', () => {
  it('starts at the given initial value', () => {
    const store = createModuleStore({ count: 0 });
    expect(store.get()).toEqual({ count: 0 });
  });

  it('remembers the last value written to it', () => {
    const store = createModuleStore(0);
    store.set(5);
    expect(store.get()).toBe(5);
    store.set(9);
    expect(store.get()).toBe(9);
  });

  it('is independent per store instance', () => {
    const a = createModuleStore('a');
    const b = createModuleStore('b');
    a.set('changed');
    expect(a.get()).toBe('changed');
    expect(b.get()).toBe('b');
  });

  it('notifies subscribers with the new value on set', () => {
    const store = createModuleStore(0);
    const listener = jest.fn();
    store.subscribe(listener);
    store.set(5);
    expect(listener).toHaveBeenCalledWith(5);
    store.set(9);
    expect(listener).toHaveBeenCalledWith(9);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('stops notifying a subscriber once unsubscribed', () => {
    const store = createModuleStore(0);
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set(5);
    expect(listener).not.toHaveBeenCalled();
  });

  it('supports multiple independent subscribers', () => {
    const store = createModuleStore(0);
    const a = jest.fn();
    const b = jest.fn();
    store.subscribe(a);
    const unsubscribeB = store.subscribe(b);
    store.set(1);
    unsubscribeB();
    store.set(2);
    expect(a).toHaveBeenCalledTimes(2);
    expect(b).toHaveBeenCalledTimes(1);
  });
});

describe('createKeyedModuleStore', () => {
  it('returns undefined for a key that was never set', () => {
    const store = createKeyedModuleStore<string, number>();
    expect(store.get('unset')).toBeUndefined();
  });

  it('remembers a value per key independently', () => {
    const store = createKeyedModuleStore<string, number>();
    store.set('a', 1);
    store.set('b', 2);
    expect(store.get('a')).toBe(1);
    expect(store.get('b')).toBe(2);

    store.set('a', 99);
    expect(store.get('a')).toBe(99);
    expect(store.get('b')).toBe(2);
  });

  it('notifies subscribers with the key and value on set', () => {
    const store = createKeyedModuleStore<string, number>();
    const listener = jest.fn();
    store.subscribe(listener);
    store.set('a', 1);
    expect(listener).toHaveBeenCalledWith('a', 1);
  });

  it('stops notifying a subscriber once unsubscribed', () => {
    const store = createKeyedModuleStore<string, number>();
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set('a', 1);
    expect(listener).not.toHaveBeenCalled();
  });
});
