import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAmbientSoundId, setAmbientSoundId } from '@/lib/ambient-sound';
import { DEFAULT_CUSTOM_DURATIONS, getCustomDurations, setCustomDurations } from '@/lib/custom-pattern';
import { DEFAULT_GUIDE_SOUND_ID, getGuideSoundId, setGuideSoundId } from '@/lib/guide-sound';
import { DEFAULT_PATTERN_ID } from '@/lib/patterns';
import { getLastPatternId, setLastPatternId } from '@/lib/last-pattern';
import { hydrateProfile, startProfilePersistence } from '@/lib/profile-persistence';
import { DEFAULT_SCENE_ID, getSceneId, setSceneId } from '@/lib/scene';
import { getCyclesForPattern, setCyclesForPattern } from '@/lib/session-length';

const STORAGE_KEY = 'tide.profile.v1';

function resetAllStoresToDefaults() {
  setLastPatternId(DEFAULT_PATTERN_ID);
  setSceneId(DEFAULT_SCENE_ID);
  setAmbientSoundId('none');
  setGuideSoundId(DEFAULT_GUIDE_SOUND_ID);
  setCustomDurations({ ...DEFAULT_CUSTOM_DURATIONS });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  resetAllStoresToDefaults();
});

describe('hydrateProfile', () => {
  it('leaves every store at its default when nothing is stored', async () => {
    await hydrateProfile();
    expect(getLastPatternId()).toBe(DEFAULT_PATTERN_ID);
    expect(getSceneId()).toBe(DEFAULT_SCENE_ID);
    expect(getAmbientSoundId()).toBe('none');
    expect(getGuideSoundId()).toBe(DEFAULT_GUIDE_SOUND_ID);
    expect(getCustomDurations()).toEqual(DEFAULT_CUSTOM_DURATIONS);
  });

  it('restores a previously stored Profile', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        patternId: '4-7-8',
        cyclesByPattern: { '4-7-8': 6, custom: 3 },
        customDurations: { inhale: 5, holdFull: 2, exhale: 7, holdEmpty: 1 },
        ambientSoundId: 'rain',
        guideSoundId: 'vibrate',
        sceneId: 'none',
      })
    );

    await hydrateProfile();

    expect(getLastPatternId()).toBe('4-7-8');
    expect(getSceneId()).toBe('none');
    expect(getAmbientSoundId()).toBe('rain');
    expect(getGuideSoundId()).toBe('vibrate');
    expect(getCustomDurations()).toEqual({ inhale: 5, holdFull: 2, exhale: 7, holdEmpty: 1 });
    expect(getCyclesForPattern('4-7-8')).toBe(6);
    expect(getCyclesForPattern('custom')).toBe(3);
  });

  it('ignores unrecognized values and keeps that store at its default', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ patternId: 'not-a-pattern', sceneId: 'waves', ambientSoundId: 'thunder' })
    );

    await hydrateProfile();

    expect(getLastPatternId()).toBe(DEFAULT_PATTERN_ID);
    expect(getSceneId()).toBe(DEFAULT_SCENE_ID);
    expect(getAmbientSoundId()).toBe('none');
  });

  it('falls back to the default Guide Sound when a Profile from the old tone catalog is loaded', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ guideSoundId: 'chime' }));

    await hydrateProfile();

    expect(getGuideSoundId()).toBe(DEFAULT_GUIDE_SOUND_ID);
  });

  it('does not throw on unparsable stored JSON', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'not json');
    await expect(hydrateProfile()).resolves.toBeUndefined();
    expect(getLastPatternId()).toBe(DEFAULT_PATTERN_ID);
  });
});

describe('startProfilePersistence', () => {
  it('writes the current Profile to storage whenever a setting changes', async () => {
    const stop = startProfilePersistence();

    setSceneId('none');
    // AsyncStorage's setItem is async; flush microtasks before reading back.
    await Promise.resolve();
    await Promise.resolve();

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw as string).sceneId).toBe('none');

    stop();
  });

  it('stops writing once stopped', async () => {
    const stop = startProfilePersistence();
    stop();

    setAmbientSoundId('rain');
    await Promise.resolve();
    await Promise.resolve();

    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('round-trips Session Length per Pattern through hydrate', async () => {
    const stop = startProfilePersistence();

    setCyclesForPattern('box', 10);
    await Promise.resolve();
    await Promise.resolve();
    stop();

    // Simulate a fresh launch where the in-memory store starts from a
    // different value before the persisted one is replayed back in.
    setCyclesForPattern('box', 4);

    await hydrateProfile();
    expect(getCyclesForPattern('box')).toBe(10);
  });
});
