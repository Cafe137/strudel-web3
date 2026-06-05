import { Pattern, noteToMidi, valueToMidi } from '@strudel/core';
import { aliasBank, registerSynthSounds, registerZZFXSounds, samples } from '@strudel/webaudio';
import { registerSamplesFromDB } from './idbutils.mjs';
import './piano.mjs';
import './files.mjs';

const baseCDN = 'https://strudel.b-cdn.net';

export async function prebake() {
  await Promise.all([
    registerSynthSounds(),
    registerZZFXSounds(),
    registerSamplesFromDB(),
    import('@strudel/soundfonts').then(({ registerSoundfonts }) => registerSoundfonts()),
    samples(`${baseCDN}/tidal-drum-machines.json`, `${baseCDN}/tidal-drum-machines/machines/`, {
      prebake: true,
      tag: 'drum-machines',
    }),
    samples(`${baseCDN}/uzu-drumkit.json`, `${baseCDN}/uzu-drumkit/`, {
      prebake: true,
      tag: 'drum-machines',
    }),
    samples(`${baseCDN}/mridangam.json`, `${baseCDN}/mrid/`, { prebake: true, tag: 'drum-machines' }),
  ]);

  aliasBank(`${baseCDN}/tidal-drum-machines-alias.json`);
}

const maxPan = noteToMidi('C8');
const panwidth = (pan, width) => pan * width + (1 - width) / 2;

Pattern.prototype.piano = function () {
  return this.fmap((v) => ({ ...v, clip: v.clip ?? 1 })) // set clip if not already set..
    .s('piano')
    .release(0.1)
    .fmap((value) => {
      const midi = valueToMidi(value);
      // pan by pitch
      const pan = panwidth(Math.min(Math.round(midi) / maxPan, 1), 0.5);
      return { ...value, pan: (value.pan || 1) * pan };
    });
};
