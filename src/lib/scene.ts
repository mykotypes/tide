import { createSelectableCatalog, type CatalogOption } from '@/lib/create-selectable-catalog';

export type SceneId = 'shore' | 'none';

export const SCENE_OPTIONS: readonly CatalogOption<SceneId>[] = [
  { id: 'shore', label: 'Shore' },
  { id: 'none', label: 'None' },
];

export const DEFAULT_SCENE_ID: SceneId = 'shore';

export function isSceneId(value: unknown): value is SceneId {
  return typeof value === 'string' && SCENE_OPTIONS.some((option) => option.id === value);
}

const sceneCatalog = createSelectableCatalog<SceneId>(DEFAULT_SCENE_ID);

export const getSceneId = sceneCatalog.getId;
export const setSceneId = sceneCatalog.setId;
export const subscribeSceneId = sceneCatalog.subscribe;
export const useScene = sceneCatalog.useSelected;
