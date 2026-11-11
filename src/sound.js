// Procedural Web Audio API sound generator for 3D 2048 & Hypercube
export const BGM_TRACKS = [
  {
    id: 0,
    name: '☕ Midnight Coffee',
    genre: 'Lo-Fi Jazz Rhodes',
    tempo: 70,
    stepDuration: 4.6,
    filterFreq: 850,
    filterQ: 1.1,
    hasVinyl: true,
    chords: [
      // Dmaj9 (Warm Neo-Soul)
      { bass: 73.42, notes: [146.83, 185.00, 220.00, 277.18, 329.63], melody: [369.99, 440.00, 554.37, 659.25] },
      // F#m7(11)
      { bass: 92.50, notes: [138.59, 185.00, 220.00, 277.18, 329.63, 493.88], melody: [440.00, 554.37, 739.99] },
      // Bm9
      { bass: 61.74, notes: [123.47, 146.83, 185.00, 220.00, 277.18], melody: [293.66, 369.99, 440.00, 587.33] },
      // Gmaj7(9)
      { bass: 49.00, notes: [98.00, 146.83, 185.00, 220.00, 246.94], melody: [329.63, 369.99, 440.00, 493.88] },
      // Em9
      { bass: 82.41, notes: [130.81, 164.81, 196.00, 246.94, 293.66, 369.99], melody: [329.63, 440.00, 493.88] },
      // A13(sus)
      { bass: 55.00, notes: [110.00, 164.81, 196.00, 277.18, 369.99], melody: [329.63, 440.00, 554.37] }
    ]
  },
  {
    id: 1,
    name: '🌌 Cosmic Drift',
    genre: 'Ambient Chill Dreamscape',
    tempo: 56,
    stepDuration: 5.4,
    filterFreq: 1150,
    filterQ: 0.8,
    hasVinyl: false,
    chords: [
      // Asus2
      { bass: 55.00, notes: [110.00, 164.81, 220.00, 246.94, 329.63], melody: [440.00, 493.88, 659.25, 880.00] },
      // F#m11
      { bass: 46.25, notes: [92.50, 138.59, 220.00, 329.63, 493.88], melody: [554.37, 659.25, 739.99] },
      // Dmaj7(#11)
      { bass: 73.42, notes: [146.83, 220.00, 277.18, 369.99, 415.30], melody: [554.37, 739.99, 830.61] },
      // Esus4(add9)
      { bass: 41.20, notes: [82.41, 123.47, 164.81, 220.00, 369.99], melody: [493.88, 659.25, 987.77] }
    ]
  },
  {
    id: 2,
    name: '🎋 Zen Garden',
    genre: 'Rain & Bamboo Bells',
    tempo: 62,
    stepDuration: 4.8,
    filterFreq: 1300,
    filterQ: 1.3,
    hasVinyl: true,
    chords: [
      // C Minor Pentatonic Peace
      { bass: 65.41, notes: [130.81, 196.00, 233.08, 311.13, 392.00], melody: [523.25, 622.25, 783.99, 1046.50] },
      // Abmaj7
      { bass: 51.91, notes: [103.83, 155.56, 196.00, 261.63, 311.13], melody: [415.30, 523.25, 622.25] },
      // Fm9
      { bass: 43.65, notes: [87.31, 130.81, 155.56, 207.65, 261.63], melody: [349.23, 415.30, 523.25, 698.46] },
      // Gsus4 / G7(b9)
      { bass: 49.00, notes: [98.00, 146.83, 174.61, 246.94, 311.13], melody: [392.00, 493.88, 587.33] }
    ]
  }
];

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.bgmMelodyTimer = null;
    this.bgmMasterGain = null;
    this.bgmFilter = null;
    this.bgmBassGain = null;
    this.bgmBassFilter = null;
    this.bgmLfo = null;
    this.bgmLfoGain = null;
    this.bgmNoiseNode = null;
    this.bgmNoiseGain = null;
    this.chordIdx = 0;
    this.currentBgmTrack = 0;
    try {
      this.currentBgmTrack = parseInt(localStorage.getItem('3d2048_bgm_track') || '0', 10);
      if (isNaN(this.currentBgmTrack) || this.currentBgmTrack < 0 || this.currentBgmTrack > 2) {
        this.currentBgmTrack = 0;
      }
    } catch {
      this.currentBgmTrack = 0;
    }
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        // Zero-leak auto garbage collection: Auto-disconnect oscillators when stopped
        const origCreateOsc = this.ctx.createOscillator.bind(this.ctx);
        this.ctx.createOscillator = () => {
          const osc = origCreateOsc();
          osc.addEventListener('ended', () => {
            try { osc.disconnect(); } catch (e) {}
          }, { once: true });
          return osc;
        };
        this.initialized = true;
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') {
      try { this.ctx.suspend(); } catch (e) {}
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      try { this.ctx.resume(); } catch (e) {}
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.bgmPlaying) {
      this.stopBGM();
    }
    return this.muted;
  }

  triggerHaptic(type = 'slide') {
    // 1. Mobile Phone / Tablet vibration
    if ('vibrate' in navigator) {
      try {
        if (type === 'click') {
          navigator.vibrate(6);
        } else if (type === 'combo') {
          navigator.vibrate([18, 20, 25]);
        } else if (type === 'slide') {
          navigator.vibrate(12);
        } else if (type === 'grab') {
          navigator.vibrate(16);
        } else if (type === 'drop') {
          navigator.vibrate(10);
        } else if (type === 'merge_small') {
          navigator.vibrate([16, 14, 18]);
        } else if (type === 'merge_big') {
          navigator.vibrate([35, 25, 45, 25, 60]);
        } else if (type === 'win') {
          navigator.vibrate([50, 40, 80, 40, 140]);
        } else if (type === 'bomb') {
          navigator.vibrate([80, 30, 100]);
        }
      } catch {}
    }

    // 2. Gamepad DualSense / Xbox Controller vibration
    if ('getGamepads' in navigator) {
      try {
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
          if (gp && gp.vibrationActuator && gp.vibrationActuator.playEffect) {
            let duration = 120, weak = 0.25, strong = 0.15;
            if (type === 'click') {
              duration = 35; weak = 0.1; strong = 0.05;
            } else if (type === 'combo') {
              duration = 180; weak = 0.45; strong = 0.35;
            } else if (type === 'merge_small') {
              duration = 160; weak = 0.5; strong = 0.3;
            } else if (type === 'merge_big') {
              duration = 300; weak = 0.8; strong = 0.9;
            } else if (type === 'bomb') {
              duration = 450; weak = 1.0; strong = 1.0;
            } else if (type === 'win') {
              duration = 600; weak = 0.7; strong = 0.5;
            }
            gp.vibrationActuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration,
              weakMagnitude: weak,
              strongMagnitude: strong
            }).catch(() => {});
          }
        }
      } catch {}
    }
  }

  // Procedural Chill / Lo-Fi Generative Soundscape Engine (Zero byte asset overhead)
  createVinylNoiseBuffer() {
    if (!this.ctx) return null;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 2.5); // 2.5s loop
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise filtering
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        let pink = b0 + b1 + b2 + white * 0.08;
        // Subtle micro-vinyl pops (0.12% probability)
        if (Math.random() < 0.0012) {
          pink += (Math.random() - 0.5) * 0.35;
        }
        data[i] = pink * 0.18;
      }
      return buffer;
    } catch {
      return null;
    }
  }

  startVinylNoise() {
    if (!this.ctx || this.bgmNoiseNode) return;
    try {
      const buffer = this.createVinylNoiseBuffer();
      if (!buffer) return;
      this.bgmNoiseNode = this.ctx.createBufferSource();
      this.bgmNoiseNode.buffer = buffer;
      this.bgmNoiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.75, this.ctx.currentTime);

      this.bgmNoiseGain = this.ctx.createGain();
      this.bgmNoiseGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.bgmNoiseGain.gain.linearRampToValueAtTime(0.006, this.ctx.currentTime + 2.0);

      this.bgmNoiseNode.connect(filter);
      filter.connect(this.bgmNoiseGain);
      this.bgmNoiseGain.connect(this.ctx.destination);
      this.bgmNoiseNode.start();
    } catch {}
  }

  stopVinylNoise() {
    if (this.bgmNoiseNode) {
      try {
        if (this.bgmNoiseGain && this.ctx) {
          this.bgmNoiseGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
        }
        const node = this.bgmNoiseNode;
        const gain = this.bgmNoiseGain;
        setTimeout(() => {
          try { node.stop(); node.disconnect(); } catch {}
          try { gain.disconnect(); } catch {}
        }, 450);
        this.bgmNoiseNode = null;
        this.bgmNoiseGain = null;
      } catch {}
    }
  }

  getBGMTrack() {
    return BGM_TRACKS[this.currentBgmTrack] || BGM_TRACKS[0];
  }

  setBGMTrack(trackIdx) {
    const idx = parseInt(trackIdx, 10);
    if (isNaN(idx) || idx < 0 || idx >= BGM_TRACKS.length) return this.getBGMTrack();
    this.currentBgmTrack = idx;
    try {
      localStorage.setItem('3d2048_bgm_track', idx.toString());
    } catch {}

    if (this.bgmPlaying && this.ctx) {
      const track = this.getBGMTrack();
      if (this.bgmFilter) {
        this.bgmFilter.frequency.linearRampToValueAtTime(track.filterFreq, this.ctx.currentTime + 1.0);
        this.bgmFilter.Q.setValueAtTime(track.filterQ, this.ctx.currentTime);
      }
      if (track.hasVinyl) {
        this.startVinylNoise();
      } else {
        this.stopVinylNoise();
      }
      // Re-trigger fresh chord from new track
      this.chordIdx = 0;
      if (this.bgmTimer) clearTimeout(this.bgmTimer);
      if (this.bgmMelodyTimer) clearTimeout(this.bgmMelodyTimer);
      this.playNextChillChord();
    }
    return this.getBGMTrack();
  }

  startBGM(trackIdx = null) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    if (trackIdx !== null && typeof trackIdx === 'number') {
      this.currentBgmTrack = trackIdx;
    } else {
      try {
        const saved = parseInt(localStorage.getItem('3d2048_bgm_track') || '0', 10);
        this.currentBgmTrack = (saved >= 0 && saved < BGM_TRACKS.length) ? saved : 0;
      } catch {
        this.currentBgmTrack = 0;
      }
    }

    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    const track = this.getBGMTrack();

    // 1. Master Output Gain with gentle fade-in
    this.bgmMasterGain = this.ctx.createGain();
    this.bgmMasterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.bgmMasterGain.gain.exponentialRampToValueAtTime(0.05, this.ctx.currentTime + 1.8);

    // 2. Warm analog lowpass filter
    this.bgmFilter = this.ctx.createBiquadFilter();
    this.bgmFilter.type = 'lowpass';
    this.bgmFilter.frequency.setValueAtTime(track.filterFreq || 850, this.ctx.currentTime);
    this.bgmFilter.Q.setValueAtTime(track.filterQ || 1.1, this.ctx.currentTime);

    // 3. Gentle Breathing LFO for organic filter warmth (±65Hz sweep at 0.22Hz)
    try {
      this.bgmLfo = this.ctx.createOscillator();
      this.bgmLfoGain = this.ctx.createGain();
      this.bgmLfo.frequency.setValueAtTime(0.22, this.ctx.currentTime);
      this.bgmLfoGain.gain.setValueAtTime(65, this.ctx.currentTime);
      this.bgmLfo.connect(this.bgmLfoGain);
      this.bgmLfoGain.connect(this.bgmFilter.frequency);
      this.bgmLfo.start();
    } catch {}

    this.bgmMasterGain.connect(this.bgmFilter);
    this.bgmFilter.connect(this.ctx.destination);

    // 4. Dedicated Sub-Bass Channel (Clean low-end isolation at 155Hz)
    this.bgmBassGain = this.ctx.createGain();
    this.bgmBassGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.bgmBassGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.2);

    this.bgmBassFilter = this.ctx.createBiquadFilter();
    this.bgmBassFilter.type = 'lowpass';
    this.bgmBassFilter.frequency.setValueAtTime(155, this.ctx.currentTime);
    this.bgmBassFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    this.bgmBassGain.connect(this.bgmBassFilter);
    this.bgmBassFilter.connect(this.ctx.destination);

    // 5. Ambient Vinyl warmth / Coffee rain if enabled
    if (track.hasVinyl) {
      this.startVinylNoise();
    }

    this.chordIdx = 0;
    this.playNextChillChord();
  }

  playNextChillChord() {
    if (!this.bgmPlaying || !this.ctx) return;
    const track = this.getBGMTrack();
    const chords = track.chords;
    const chord = chords[this.chordIdx % chords.length];
    this.chordIdx++;
    const t = this.ctx.currentTime;
    const duration = track.stepDuration || 4.6;

    // 1. Polyphonic Rhodes / Ambient Chords
    chord.notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = track.genre.includes('Ambient') ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      // Subtle micro-detuning for lush warm chorus
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, t);

      gain.gain.setValueAtTime(0.0001, t);
      if (track.genre.includes('Ambient')) {
        gain.gain.linearRampToValueAtTime(0.035, t + 1.2);
      } else {
        gain.gain.linearRampToValueAtTime(0.045, t + 0.06);
      }
      gain.gain.linearRampToValueAtTime(0.02, t + duration - 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.bgmMasterGain);
      osc.start(t);
      osc.stop(t + duration);

      // Glassy Rhodes Tine Bell (High overtone chime with rapid physical decay)
      if (!track.genre.includes('Ambient')) {
        const tineOsc = this.ctx.createOscillator();
        const tineGain = this.ctx.createGain();
        tineOsc.type = 'sine';
        tineOsc.frequency.setValueAtTime(freq * 3.5, t);

        tineGain.gain.setValueAtTime(0.0001, t);
        tineGain.gain.linearRampToValueAtTime(0.012, t + 0.004);
        tineGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

        tineOsc.connect(tineGain);
        tineGain.connect(this.bgmMasterGain);
        tineOsc.start(t);
        tineOsc.stop(t + 0.2);
      }
    });

    // 2. Warm Walking Sub-Bass
    if (chord.bass && this.bgmBassGain) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(chord.bass, t);

      bassGain.gain.setValueAtTime(0.0001, t);
      bassGain.gain.linearRampToValueAtTime(0.075, t + 0.08);
      bassGain.gain.linearRampToValueAtTime(0.04, t + duration - 0.5);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmBassGain);
      bassOsc.start(t);
      bassOsc.stop(t + duration);
    }

    // 3. Generative Floating Melody (Improvised chimes between chords)
    if (chord.melody && chord.melody.length > 0 && Math.random() < 0.75) {
      const delay = 1.0 + Math.random() * (duration - 2.2);
      this.bgmMelodyTimer = setTimeout(() => {
        if (!this.bgmPlaying || !this.ctx) return;
        const mt = this.ctx.currentTime;
        const melFreq = chord.melody[Math.floor(Math.random() * chord.melody.length)];

        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = track.genre.includes('Zen') ? 'triangle' : 'sine';
        mOsc.frequency.setValueAtTime(melFreq, mt);

        mGain.gain.setValueAtTime(0.0001, mt);
        mGain.gain.linearRampToValueAtTime(0.03, mt + 0.03);
        mGain.gain.exponentialRampToValueAtTime(0.0001, mt + 1.6);

        mOsc.connect(mGain);
        mGain.connect(this.bgmMasterGain);
        mOsc.start(mt);
        mOsc.stop(mt + 1.65);
      }, delay * 1000);
    }

    const nextInterval = (duration * 1000) - 250;
    this.bgmTimer = setTimeout(() => this.playNextChillChord(), nextInterval);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmMelodyTimer) {
      clearTimeout(this.bgmMelodyTimer);
      this.bgmMelodyTimer = null;
    }
    if (this.bgmMasterGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.bgmMasterGain.gain.linearRampToValueAtTime(0.0001, t + 0.4);
    }
    if (this.bgmBassGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.bgmBassGain.gain.linearRampToValueAtTime(0.0001, t + 0.4);
    }
    if (this.bgmLfo) {
      try { this.bgmLfo.stop(); this.bgmLfo.disconnect(); } catch {}
      this.bgmLfo = null;
    }
    if (this.bgmLfoGain) {
      try { this.bgmLfoGain.disconnect(); } catch {}
      this.bgmLfoGain = null;
    }
    this.stopVinylNoise();
  }

  toggleBGM() {
    if (this.bgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  playGameStartEntrance() {
    this.triggerHaptic('slide');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Sub-bass cinematic riser & impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65, t);
    subOsc.frequency.exponentialRampToValueAtTime(140, t + 0.32);
    subOsc.frequency.exponentialRampToValueAtTime(48, t + 0.75);

    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.linearRampToValueAtTime(0.25, t + 0.28);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.85);

    // 2. Cyber Crystal Chime Chord (C Major 9 arpeggio: C5, E5, G5, B5, D6)
    const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];
    freqs.forEach((freq, idx) => {
      const startTime = t + 0.08 + (idx * 0.065);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.7);
    });
  }

  playClick() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  playSlide() {
    this.triggerHaptic('slide');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Warm tactile thud/pop on tile slide
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.07);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  playLayerMove(direction = 'up') {
    this.triggerHaptic('slide');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    if (direction === 'up') {
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.14);
    } else {
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.14);
    }

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  playTileGrab() {
    this.triggerHaptic('grab');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.12);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  playTileToss() {
    this.triggerHaptic('slide');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(460, t);
    osc.frequency.exponentialRampToValueAtTime(130, t + 0.14);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playPop() {
    this.triggerHaptic('merge_small');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Bubbly crystal pop: rapid upward chirp from 360Hz to 760Hz with fast decay
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.045);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.09);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.095);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  playTileDrop() {
    this.triggerHaptic('drop');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Deep tactile physical brick thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(145, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.08);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.095);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.095);
  }

  playMerge(value = 4, combo = 0) {
    this.triggerHaptic(value >= 512 ? 'merge_big' : 'merge_small');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Pentatonic / Major Scale (Đồ - Rê - Mi - Sol - La - Đố)
    const scale = [
      261.63, // C4 (Đồ)
      293.66, // D4 (Rê)
      329.63, // E4 (Mi)
      392.00, // G4 (Sol)
      440.00, // A4 (La)
      523.25, // C5 (Đố)
      587.33, // D5 (Rế)
      659.25, // E5 (Mí)
      783.99, // G5 (Sốl)
      880.00, // A5 (Lá)
      1046.50, // C6 (Đố cao)
      1174.66, // D6
      1318.51, // E6
      1567.98  // G6
    ];

    const power = Math.max(0, Math.round(Math.log2(value)) - 2); // 4 -> 0, 8 -> 1, 16 -> 2...
    const noteIndex = Math.min(scale.length - 1, power + Math.min(6, combo));
    const baseFreq = scale[noteIndex];

    // Dual harmonic tone: triangle (warm fundamental) + sine (sweet 5th/octave overtone)
    [
      { type: 'triangle', freq: baseFreq, vol: 0.15, mult: 1.0 },
      { type: 'sine', freq: baseFreq * 1.5, vol: 0.08, mult: 1.03 }
    ].forEach((voice) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = voice.type;
      osc.frequency.setValueAtTime(voice.freq, t);
      osc.frequency.exponentialRampToValueAtTime(voice.freq * voice.mult, t + 0.2);

      gain.gain.setValueAtTime(voice.vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  playBombTick() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  playBombDefused() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [587.33, 880.00, 1174.66]; // D5, A5, D6
    notes.forEach((freq, index) => {
      const t = this.ctx.currentTime + index * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  playBombExplode() {
    this.triggerHaptic('bomb');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  playTimeBonus() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playWin() {
    this.triggerHaptic('win');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const t = this.ctx.currentTime + index * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  playGameOver() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [392.00, 349.23, 311.13, 261.63];
    notes.forEach((freq, index) => {
      const t = this.ctx.currentTime + index * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  // 1. Hint Spell Sound: Crystal insight chime
  playSpellHint() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [587.33, 880.00, 1174.66].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);
      gain.gain.setValueAtTime(0.09, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.25);
    });
  }

  // 2. Undo Spell Sound: Rewind reverse sweep
  playSpellUndo() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.16);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // 3. Swap / Flash Spell Sound: High-voltage electric teleport zap
  playSpellSwap() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.2);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // 4. Recharge Sound: Triumphant summoner spell ready fanfare
  playSpellRecharge() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    chords.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.05);
      gain.gain.setValueAtTime(0.1, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.38);
    });
  }

  // 5. Milestone Unlock Fanfare: Uplifting chord arpeggio when unlocking major block tiers (64, 128, 256, 512, 1024, 2048)
  playMilestoneUnlock(value = 64) {
    this.triggerHaptic(value >= 256 ? 'win' : 'merge_big');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = value >= 1024 ? 659.25 : (value >= 256 ? 523.25 : 392.00);
    const intervals = [1.0, 1.25, 1.5, 1.875, 2.0]; // Radiant Major 7th arpeggio
    intervals.forEach((ratio, i) => {
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      oscHarmonic.type = 'sine';

      const f = baseFreq * ratio;
      osc.frequency.setValueAtTime(f, t + i * 0.07);
      oscHarmonic.frequency.setValueAtTime(f * 2, t + i * 0.07);

      gain.gain.setValueAtTime(0.14, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.45);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.07);
      oscHarmonic.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.48);
      oscHarmonic.stop(t + i * 0.07 + 0.48);
    });
  }

  // ⚡ Boss Mode Chill & Satisfying 3D Procedural Audio
  playBossLaser(damage = 64) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = damage >= 512 ? 880 : (damage >= 128 ? 720 : 540);
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.22);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  playBossHit(damage = 64) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Resonant crystal bell impact
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, t); // C5
    osc2.frequency.setValueAtTime(130.81, t); // C3 warm thud

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.28);
    osc2.stop(t + 0.28);
  }

  playPhaseTransition() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Peaceful, atmospheric chord progression: Fmaj7 -> Gsus4 -> Cmaj9
    const chord = [349.23, 440.00, 523.25, 659.25, 783.99]; // F, A, C, E, G
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.001, t + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.08, t + idx * 0.05 + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.05 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 1.25);
    });
  }

  playBossObliteration() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Sparkling celestial stardust cascade across octaves
    const arpeggio = [
      261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98
    ];
    arpeggio.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.12, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.06 + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 1.65);
    });
  }

  // =========================================================================
  // 1. UEFA Champions League C1 Style Fanfare (7/7 Quests Master Glory)
  // =========================================================================
  playChampionsLeagueFanfare() {
    this.triggerHaptic('win');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Ascending Royal Trumpet Anthem Motif: Bb3 -> F4 -> Bb4 -> D5 -> F5 -> Bb5
    const anthemNotes = [
      { f: 233.08, time: 0.00, dur: 0.22 },
      { f: 349.23, time: 0.20, dur: 0.22 },
      { f: 466.16, time: 0.40, dur: 0.35 },
      { f: 587.33, time: 0.72, dur: 0.24 },
      { f: 698.46, time: 0.94, dur: 0.24 },
      { f: 932.33, time: 1.18, dur: 1.80 }
    ];

    anthemNotes.forEach((note) => {
      const noteT = t + note.time;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, noteT);

      gain.gain.setValueAtTime(0.24, noteT);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + note.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteT);
      osc.stop(noteT + note.dur + 0.05);
    });

    // Shimmering Orchestral Choir & Trumpet Harmonics at Climax (Bb Major)
    const climaxT = t + 1.18;
    const majorChord = [466.16, 587.33, 698.46, 932.33, 1174.66];
    majorChord.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, climaxT);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, climaxT);
      filter.frequency.exponentialRampToValueAtTime(3800, climaxT + 0.4);
      filter.frequency.exponentialRampToValueAtTime(800, climaxT + 2.5);

      gain.gain.setValueAtTime(0.14, climaxT);
      gain.gain.exponentialRampToValueAtTime(0.0001, climaxT + 2.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(climaxT);
      osc.stop(climaxT + 2.85);
    });

    // Celebratory Stadium Fireworks Bursts
    [0.1, 0.6, 1.25].forEach((fwOffset) => {
      const fwT = t + fwOffset;
      const fwNoise = this.ctx.createBufferSource();
      const fwBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.4), this.ctx.sampleRate);
      const fwData = fwBuf.getChannelData(0);
      for (let i = 0; i < fwData.length; i++) fwData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
      fwNoise.buffer = fwBuf;

      const fwFilter = this.ctx.createBiquadFilter();
      fwFilter.type = 'highpass';
      fwFilter.frequency.setValueAtTime(3500, fwT);

      const fwGain = this.ctx.createGain();
      fwGain.gain.setValueAtTime(0.15, fwT);
      fwGain.gain.exponentialRampToValueAtTime(0.001, fwT + 0.4);

      fwNoise.connect(fwFilter);
      fwFilter.connect(fwGain);
      fwGain.connect(this.ctx.destination);
      fwNoise.start(fwT);
    });
  }

  // =========================================================================
  // Spammable Celebratory Fireworks Launch & Crackle Burst
  // =========================================================================
  playFireworkBurst() {
    this.triggerHaptic('combo');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Launch Whistle / Pop thump
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const baseFreq = 240 + Math.random() * 260;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * 2.4, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, t + 0.1);
      oscGain.gain.setValueAtTime(0.18, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);

      // 2. Crackle explosion burst
      const noise = this.ctx.createBufferSource();
      const bufLen = Math.floor(this.ctx.sampleRate * 0.26);
      const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
      }
      noise.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800 + Math.random() * 1800, t + 0.03);
      filter.Q.setValueAtTime(2.6, t + 0.03);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, t + 0.03);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t + 0.03);
    } catch {}
  }

  // =========================================================================
  // 2. Sekiro / Isshin Ashina / Dark Souls Epic Boss Execution Fanfare
  // =========================================================================
  playBossExecutionFanfare() {
    this.triggerHaptic('win');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Razor-sharp Katana Slash & Metal Clash ("SCHWING - KLING!")
    const slashNoise = this.ctx.createBufferSource();
    const slashBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.35), this.ctx.sampleRate);
    const data = slashBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    slashNoise.buffer = slashBuf;
    const slashFilter = this.ctx.createBiquadFilter();
    slashFilter.type = 'bandpass';
    slashFilter.frequency.setValueAtTime(3200, t);
    slashFilter.frequency.exponentialRampToValueAtTime(1200, t + 0.3);
    slashFilter.Q.setValueAtTime(3.5, t);
    const slashGain = this.ctx.createGain();
    slashGain.gain.setValueAtTime(0.28, t);
    slashGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    slashNoise.connect(slashFilter);
    slashFilter.connect(slashGain);
    slashGain.connect(this.ctx.destination);
    slashNoise.start(t);

    // High metal ring ("KLING")
    const klingOsc = this.ctx.createOscillator();
    const klingGain = this.ctx.createGain();
    klingOsc.type = 'sine';
    klingOsc.frequency.setValueAtTime(3850, t + 0.04);
    klingOsc.frequency.exponentialRampToValueAtTime(2900, t + 0.4);
    klingGain.gain.setValueAtTime(0.22, t + 0.04);
    klingGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
    klingOsc.connect(klingGain);
    klingGain.connect(this.ctx.destination);
    klingOsc.start(t + 0.04);
    klingOsc.stop(t + 0.9);

    // 2. Heavy Taiko War Drum Impacts (Booming Sub-bass punch)
    [0.12, 0.45, 0.95].forEach((drumOffset, dIdx) => {
      const drumT = t + drumOffset;
      const drumOsc = this.ctx.createOscillator();
      const drumGain = this.ctx.createGain();
      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(115, drumT);
      drumOsc.frequency.exponentialRampToValueAtTime(34, drumT + 0.45);
      drumGain.gain.setValueAtTime(dIdx === 2 ? 0.35 : 0.24, drumT);
      drumGain.gain.exponentialRampToValueAtTime(0.001, drumT + 0.7);
      drumOsc.connect(drumGain);
      drumGain.connect(this.ctx.destination);
      drumOsc.start(drumT);
      drumOsc.stop(drumT + 0.75);
    });

    // 3. Ancient Buddhist Temple Death Bell / Deep Inharmonic Gong (Isshin / Sekiro style)
    const gongTime = t + 0.55;
    const gongPartials = [98, 142, 218, 310];
    gongPartials.forEach((freq, idx) => {
      const gOsc = this.ctx.createOscillator();
      const gGain = this.ctx.createGain();
      gOsc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      gOsc.frequency.setValueAtTime(freq, gongTime);
      gGain.gain.setValueAtTime(0.14 / (idx + 1), gongTime);
      gGain.gain.exponentialRampToValueAtTime(0.0001, gongTime + 3.2);
      gOsc.connect(gGain);
      gGain.connect(this.ctx.destination);
      gOsc.start(gongTime);
      gOsc.stop(gongTime + 3.25);
    });

    // 4. Dark Heroic Minor Brass Climax (D Minor Epic Chords)
    const brassTime = t + 1.15;
    const darkBrassNotes = [73.42, 146.83, 174.61, 220.00, 293.66, 440.00];
    darkBrassNotes.forEach((freq) => {
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'sawtooth';
      bOsc.frequency.setValueAtTime(freq, brassTime);

      const bFilter = this.ctx.createBiquadFilter();
      bFilter.type = 'lowpass';
      bFilter.frequency.setValueAtTime(450, brassTime);
      bFilter.frequency.exponentialRampToValueAtTime(1600, brassTime + 0.6);
      bFilter.frequency.exponentialRampToValueAtTime(300, brassTime + 2.8);

      bGain.gain.setValueAtTime(0.09, brassTime);
      bGain.gain.exponentialRampToValueAtTime(0.0001, brassTime + 3.0);

      bOsc.connect(bFilter);
      bFilter.connect(bGain);
      bGain.connect(this.ctx.destination);
      bOsc.start(brassTime);
      bOsc.stop(brassTime + 3.1);
    });
  }

  // Grand Royal Fanfare for Unlocking the Exclusive 3D 2048 Trophy
  playTrophyUnlockFanfare() {
    this.playChampionsLeagueFanfare();
  }

  playTrophyUnlocked() {
    this.playTrophyUnlockFanfare();
  }
}

export const soundManager = new SoundManager();
