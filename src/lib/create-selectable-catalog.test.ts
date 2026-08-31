import { createSelectableCatalog } from '@/lib/create-selectable-catalog';

describe('createSelectableCatalog', () => {
  it('starts at the given default id', () => {
    const catalog = createSelectableCatalog<'a' | 'b'>('a');
    expect(catalog.getId()).toBe('a');
  });

  it('remembers the last id written to it', () => {
    const catalog = createSelectableCatalog<'a' | 'b'>('a');
    catalog.setId('b');
    expect(catalog.getId()).toBe('b');
  });

  it('is independent per catalog instance', () => {
    const a = createSelectableCatalog<'a' | 'b'>('a');
    const b = createSelectableCatalog<'a' | 'b'>('b');
    a.setId('b');
    expect(a.getId()).toBe('b');
    expect(b.getId()).toBe('b');
    b.setId('a');
    expect(a.getId()).toBe('b');
    expect(b.getId()).toBe('a');
  });
});
