// Procedural Web Audio API sound generator for 3D 2048 & Hypercube
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.bgmMasterGain = null;
    this.bgmFilter = null;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
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
        if (type === 'slide') {
          navigator.vibrate(12);
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
            if (type === 'merge_small') {
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

  // Procedural Lofi Ambient Chords BGM (Zero byte asset overhead)
  startBGM() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;

    // Peaceful chord progression: Cmaj7 -> Am7 -> Fmaj7 -> G7sus
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [110.00, 130.81, 164.81, 196.00], // Am7
      [87.31, 110.00, 130.81, 164.81],  // Fmaj7
      [98.00, 123.47, 146.83, 174.61]   // G7sus
    ];

    let chordIdx = 0;
    this.bgmMasterGain = this.ctx.createGain();
    this.bgmMasterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.bgmMasterGain.gain.exponentialRampToValueAtTime(0.045, this.ctx.currentTime + 1.5);

    // Warm dreamy lofi lowpass filter
    this.bgmFilter = this.ctx.createBiquadFilter();
    this.bgmFilter.type = 'lowpass';
    this.bgmFilter.frequency.setValueAtTime(480, this.ctx.currentTime);
    this.bgmFilter.Q.setValueAtTime(1.1, this.ctx.currentTime);

    this.bgmMasterGain.connect(this.bgmFilter);
    this.bgmFilter.connect(this.ctx.destination);

    const playNextChord = () => {
      if (!this.bgmPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.detune.setValueAtTime((Math.random() - 0.5) * 6, t);
        osc.frequency.setValueAtTime(freq, t);

        const chordDuration = 3.8;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.06, t + 0.8);
        gain.gain.linearRampToValueAtTime(0.04, t + chordDuration - 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + chordDuration);

        osc.connect(gain);
        gain.connect(this.bgmMasterGain);

        osc.start(t);
        osc.stop(t + chordDuration);
      });

      this.bgmTimer = setTimeout(playNextChord, 3500);
    };

    playNextChord();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmMasterGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.bgmMasterGain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
    }
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
}

export const soundManager = new SoundManager();
