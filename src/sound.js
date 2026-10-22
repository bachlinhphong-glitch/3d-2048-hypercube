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

  playTileDrop() {
    this.triggerHaptic('drop');
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
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
}

export const soundManager = new SoundManager();
