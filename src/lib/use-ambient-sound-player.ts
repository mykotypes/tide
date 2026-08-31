import { useEffect } from 'react';
import { useAudioPlayer, type AudioPlayer } from 'expo-audio';

import { oceanVolumeForFullness, shouldPlayAmbientSound, type AmbientSoundId } from '@/lib/ambient-sound';

function syncPlayer(player: AudioPlayer, shouldPlay: boolean): void {
  if (shouldPlay) {
    if (!player.playing) player.play();
  } else {
    player.pause();
  }
}

export function useAmbientSoundPlayer(ambientSoundId: AmbientSoundId, soundEnabled: boolean, fullness: number): void {
  const rainPlayer = useAudioPlayer(require('../../assets/audio/rain.wav'));
  const oceanPlayer = useAudioPlayer(require('../../assets/audio/ocean.wav'));

  useEffect(() => {
    // expo-audio's AudioPlayer has no "loop" creation option — setting this
    // property is the documented way to enable looping on an existing player.
    // eslint-disable-next-line react-hooks/immutability
    rainPlayer.loop = true;
    // eslint-disable-next-line react-hooks/immutability
    oceanPlayer.loop = true;
  }, [rainPlayer, oceanPlayer]);

  useEffect(() => {
    const active = shouldPlayAmbientSound(ambientSoundId) && soundEnabled;
    syncPlayer(rainPlayer, active && ambientSoundId === 'rain');
    syncPlayer(oceanPlayer, active && ambientSoundId === 'ocean');
  }, [ambientSoundId, soundEnabled, rainPlayer, oceanPlayer]);

  useEffect(() => {
    // Ocean's wash swells/recedes with the engine's fullness value, so its
    // volume is re-set continuously while the session runs (a no-op write
    // when Ocean isn't the active player).
    // eslint-disable-next-line react-hooks/immutability
    oceanPlayer.volume = oceanVolumeForFullness(fullness);
  }, [fullness, oceanPlayer]);
}
