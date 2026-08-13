const STORAGE_KEY = 'sixSevenAudioSettings';

const CLICK_URL = '/audio/click.mp3';
const MUSIC_URL = '/audio/music.mp3';
const CLICK_PITCH_VARIATION = 0.14;

const DEFAULT_SETTINGS = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.35,
  sfxVolume: 0.7,
};

/** @type {AudioContext | null} */
let audioContext = null;

/** @type {GainNode | null} */
let musicGain = null;

/** @type {GainNode | null} */
let sfxGain = null;

/** @type {HTMLAudioElement | null} */
let musicElement = null;

/** @type {MediaElementAudioSourceNode | null} */
let musicSource = null;

/** @type {AudioBuffer | null} */
let clickBuffer = null;

/** @type {Promise<AudioBuffer | null> | null} */
let clickBufferPromise = null;

/** @type {Set<(settings: object) => void>} */
const listeners = new Set();

let settings = loadSettings();

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return normalizeSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function normalizeSettings(raw = {}) {
  return {
    musicEnabled:
      typeof raw.musicEnabled === 'boolean'
        ? raw.musicEnabled
        : DEFAULT_SETTINGS.musicEnabled,
    sfxEnabled:
      typeof raw.sfxEnabled === 'boolean'
        ? raw.sfxEnabled
        : DEFAULT_SETTINGS.sfxEnabled,
    musicVolume: clamp01(raw.musicVolume ?? DEFAULT_SETTINGS.musicVolume),
    sfxVolume: clamp01(raw.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume),
  };
}

function notifyListeners() {
  const snapshot = getSettings();
  listeners.forEach((fn) => fn(snapshot));
}

function persistSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  notifyListeners();
}

function clamp01(value) {
  return Math.min(1, Math.max(0, Number(value) || 0));
}

function getContext() {
  return audioContext;
}

function ensureContext() {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  return audioContext;
}

function ensureSfxGain(ctx) {
  if (!sfxGain) {
    sfxGain = ctx.createGain();
    sfxGain.connect(ctx.destination);
  }
  sfxGain.gain.value = settings.sfxEnabled ? settings.sfxVolume : 0;
  return sfxGain;
}

function ensureMusicGain(ctx) {
  if (!musicGain) {
    musicGain = ctx.createGain();
    musicGain.connect(ctx.destination);
  }
  updateMusicGain();
  return musicGain;
}

function updateMusicGain() {
  if (!musicGain) return;
  musicGain.gain.value = settings.musicEnabled ? settings.musicVolume : 0;
}

function updateSfxGain() {
  if (!sfxGain) return;
  sfxGain.gain.value = settings.sfxEnabled ? settings.sfxVolume : 0;
}

function ensureMusicElement(ctx) {
  if (!musicElement) {
    musicElement = new Audio(MUSIC_URL);
    musicElement.loop = true;
    musicElement.preload = 'auto';
    musicSource = ctx.createMediaElementSource(musicElement);
    musicSource.connect(ensureMusicGain(ctx));
  }
  return musicElement;
}

async function ensureClickBuffer() {
  const ctx = ensureContext();
  if (!ctx) return null;
  if (clickBuffer) return clickBuffer;

  if (!clickBufferPromise) {
    clickBufferPromise = fetch(CLICK_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${CLICK_URL}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
      .then((decoded) => {
        clickBuffer = decoded;
        return decoded;
      })
      .catch((err) => {
        console.warn('[audio] click buffer load failed', err);
        clickBufferPromise = null;
        return null;
      });
  }

  return clickBufferPromise;
}

export async function resumeAudio() {
  const ctx = ensureContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  void ensureClickBuffer();
  if (settings.musicEnabled) {
    startMusic();
  }
}

function startMusic() {
  if (!settings.musicEnabled) return;

  const ctx = ensureContext();
  if (!ctx) return;

  ensureMusicElement(ctx);
  ensureMusicGain(ctx);

  if (musicElement.paused) {
    void musicElement.play().catch(() => {});
  }
}

function stopMusic() {
  if (musicElement) {
    musicElement.pause();
  }
  updateMusicGain();
}

function applyMusicState() {
  if (settings.musicEnabled) {
    void resumeAudio();
  } else {
    stopMusic();
  }
}

function applySfxState() {
  const ctx = ensureContext();
  if (!ctx) return;
  ensureSfxGain(ctx);
  updateSfxGain();
}

function playSampledClick() {
  const ctx = ensureContext();
  if (!ctx || !clickBuffer || !settings.sfxEnabled) return;

  const source = ctx.createBufferSource();
  source.buffer = clickBuffer;
  source.playbackRate.value =
    1 + (Math.random() * 2 - 1) * CLICK_PITCH_VARIATION;
  source.connect(ensureSfxGain(ctx));
  source.start();
}

function playTone({
  frequency,
  duration = 0.1,
  type = 'square',
  volume = 0.2,
  pitchVariation = 0,
  when = 0,
  destination,
}) {
  const ctx = ensureContext();
  if (!ctx || !settings.sfxEnabled) return;

  const dest = destination ?? ensureSfxGain(ctx);
  const start = when || ctx.currentTime;
  const pitch = 1 + (Math.random() * 2 - 1) * pitchVariation;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency * pitch, start);

  const peak = volume * settings.sfxVolume;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playClickSound() {
  if (!settings.sfxEnabled) return;
  void resumeAudio();

  if (clickBuffer) {
    playSampledClick();
    return;
  }

  void ensureClickBuffer().then((buffer) => {
    if (buffer) {
      playSampledClick();
      return;
    }

    playTone({
      frequency: 520,
      duration: 0.07,
      type: 'square',
      volume: 0.18,
      pitchVariation: CLICK_PITCH_VARIATION,
    });
  });
}

export function playUpgradeSound() {
  void resumeAudio();
  const ctx = ensureContext();
  if (!ctx || !settings.sfxEnabled) return;

  const dest = ensureSfxGain(ctx);
  const base = ctx.currentTime;

  [523.25, 659.25, 783.99].forEach((freq, index) => {
    playTone({
      frequency: freq,
      duration: 0.12,
      type: 'triangle',
      volume: 0.22,
      pitchVariation: 0.03,
      when: base + index * 0.07,
      destination: dest,
    });
  });
}

/**
 * @param {'bonus' | 'crisis' | 'penalty' | 'twist' | string} type
 */
export function playEventSound(type) {
  void resumeAudio();

  if (type === 'bonus') {
    const ctx = ensureContext();
    const base = ctx?.currentTime ?? 0;
    playTone({ frequency: 660, duration: 0.14, type: 'sine', volume: 0.2, pitchVariation: 0.05 });
    playTone({
      frequency: 880,
      duration: 0.18,
      type: 'sine',
      volume: 0.18,
      pitchVariation: 0.05,
      when: base + 0.08,
    });
    return;
  }

  if (type === 'crisis') {
    playTone({ frequency: 180, duration: 0.25, type: 'sawtooth', volume: 0.16, pitchVariation: 0.04 });
    return;
  }

  if (type === 'penalty') {
    playTone({ frequency: 120, duration: 0.3, type: 'square', volume: 0.14, pitchVariation: 0.02 });
    return;
  }

  if (type === 'twist') {
    const ctx = ensureContext();
    const base = ctx?.currentTime ?? 0;
    playTone({ frequency: 400, duration: 0.1, type: 'triangle', volume: 0.16, pitchVariation: 0.25 });
    playTone({
      frequency: 300,
      duration: 0.14,
      type: 'triangle',
      volume: 0.14,
      pitchVariation: 0.25,
      when: base + 0.1,
    });
    return;
  }

  playTone({ frequency: 440, duration: 0.12, type: 'sine', volume: 0.15, pitchVariation: 0.08 });
}

export function getSettings() {
  return { ...settings };
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(getSettings());
  return () => listeners.delete(listener);
}

export function setMusicEnabled(enabled) {
  settings = { ...settings, musicEnabled: Boolean(enabled) };
  persistSettings();
  applyMusicState();
}

export function setSfxEnabled(enabled) {
  settings = { ...settings, sfxEnabled: Boolean(enabled) };
  persistSettings();
  applySfxState();
}

export function toggleMusic() {
  setMusicEnabled(!settings.musicEnabled);
}

export function toggleSfx() {
  setSfxEnabled(!settings.sfxEnabled);
}

export function setMusicVolume(volume) {
  settings = { ...settings, musicVolume: clamp01(volume) };
  persistSettings();
  updateMusicGain();
}

export function setSfxVolume(volume) {
  settings = { ...settings, sfxVolume: clamp01(volume) };
  persistSettings();
  updateSfxGain();
}

export function initAudioFromSettings() {
  // Settings are loaded at import. AudioContext is created on first user gesture.
}
