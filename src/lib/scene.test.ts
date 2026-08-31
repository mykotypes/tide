import { DEFAULT_SCENE_ID, isSceneId, SCENE_OPTIONS } from '@/lib/scene';

describe('SCENE_OPTIONS', () => {
  it('contains Shore and None, in that order', () => {
    expect(SCENE_OPTIONS.map((o) => o.id)).toEqual(['shore', 'none']);
  });

  it('each option has a non-empty label', () => {
    for (const option of SCENE_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);
    }
  });

  it('defaults to Shore', () => {
    expect(DEFAULT_SCENE_ID).toBe('shore');
  });
});

describe('isSceneId', () => {
  it('is true for each known id', () => {
    expect(isSceneId('shore')).toBe(true);
    expect(isSceneId('none')).toBe(true);
  });

  it('is false for unknown values', () => {
    expect(isSceneId('waves')).toBe(false);
    expect(isSceneId(undefined)).toBe(false);
  });
});
