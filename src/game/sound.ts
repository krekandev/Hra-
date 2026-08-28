// High quality Web Audio Synthesizer for 2D Retro Dark Fantasy Action

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicMasterGain: GainNode | null = null;
  private musicIntervalId: any = null;
  private musicMode: 'explore' | 'boss' = 'explore';
  private currentStep: number = 0;
  private isMusicPlaying: boolean = false;

  // Frekvencie pre mysterióznu slovenskú folklórnu molovú tóninu (A mol / D mol modal)
  private readonly NOTE_FREQS: Record<string, number> = {
    'A2': 110.00, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'G3': 196.00,
    'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63,
    'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
    'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
  };

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        const base = import.meta.env.BASE_URL.replace(/\/$/, '');
        [
          'jakub_intro', 'simi_intro', 'filip_intro',
          'jakub_ch2', 'simi_ch2', 'filip_ch2',
          'jakub_ch3', 'simi_ch3', 'filip_ch3',
          'filip_victory', 'simi_victory', 'jakub_victory',
          'jakub_zasah', 'filip_dostali_ma', 'simon_podme_na_nich',
          'jakub_sme_tu'
        ].forEach(name => this.loadAudioBuffer(`${base}/sounds/${name}.wav`));

        this.musicMasterGain = this.ctx.createGain();
        this.musicMasterGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
        this.musicMasterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.musicMasterGain && this.ctx) {
      this.musicMasterGain.gain.setValueAtTime(muted ? 0 : 0.22, this.ctx.currentTime);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  // Spustenie / prepnutie dynamickej hudby (explore = mysteriózny les, boss = intenzívny boj)
  public startDynamicMusic(mode: 'explore' | 'boss' = 'explore') {
    this.initCtx();
    this.musicMode = mode;
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const tempoMs = 190; // 125 BPM 16th notes
    this.musicIntervalId = setInterval(() => {
      this.tickMusic();
    }, tempoMs);
  }

  public setMusicMode(mode: 'explore' | 'boss') {
    this.musicMode = mode;
  }

  public stopMusic() {
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    this.isMusicPlaying = false;
  }

  private tickMusic() {
    if (this.isMuted || !this.ctx || this.ctx.state === 'suspended') return;
    const now = this.ctx.currentTime;
    const step = this.currentStep % 32;
    this.currentStep++;

    // 1. BASOVÁ LINKA (Basa / Dvojhmat)
    if (step % (this.musicMode === 'boss' ? 2 : 4) === 0) {
      const bassNotes = this.musicMode === 'explore'
        ? ['A2', 'A2', 'D3', 'E3', 'A2', 'C3', 'D3', 'E3']
        : ['A2', 'E2', 'F2', 'E2', 'D3', 'C3', 'B2', 'E2', 'A2', 'G2', 'F2', 'E2', 'D3', 'E3', 'F3', 'E3'];
      const noteName = bassNotes[Math.floor(step / (this.musicMode === 'boss' ? 2 : 4)) % bassNotes.length];
      this.synthesizeNote(this.NOTE_FREQS[noteName] || 110, now, this.musicMode === 'boss' ? 0.22 : 0.4, 'sawtooth', this.musicMode === 'boss' ? 0.35 : 0.25, this.musicMode === 'boss' ? 900 : 450);
    }

    // 2. MYSTERIÓZNA FUJARA / MELÓDIA (Explore = tajomná lesná melódia, Boss = rýchly epický bojový čardáš)
    if (this.musicMode === 'explore') {
      // Lesný mysteriózny nápev (ľahké vibrato fujary)
      const flutePattern: Record<number, string> = {
        0: 'E4', 3: 'A4', 6: 'B4', 8: 'C5', 12: 'B4', 16: 'A4', 19: 'G4', 22: 'E4', 24: 'A4', 28: 'B4'
      };
      if (flutePattern[step]) {
        this.synthesizeFluteNote(this.NOTE_FREQS[flutePattern[step]], now, 0.55, 0.18);
      }

      // Ambientné lesné šumenie / chimes
      if (step === 14 || step === 30) {
        this.synthesizeChime(this.NOTE_FREQS['E5'], now);
      }
    } else {
      // INTENZÍVNY BOJ PRI TOTEME / BOSSOVI (Epický zbojnícky metal/čardáš synth s dvojitými bubnami)
      const battlePattern: Record<number, string> = {
        0: 'A4', 1: 'C5', 2: 'E5', 3: 'A5', 4: 'G5', 5: 'E5', 6: 'D5', 7: 'F5',
        8: 'E5', 9: 'D5', 10: 'C5', 11: 'B4', 12: 'A4', 13: 'C5', 14: 'E5', 15: 'G5',
        16: 'A5', 17: 'B5', 18: 'C5', 19: 'B4', 20: 'A4', 21: 'G4', 22: 'F4', 23: 'E4',
        24: 'D4', 25: 'F4', 26: 'A4', 27: 'D5', 28: 'E5', 29: 'D5', 30: 'C5', 31: 'B4'
      };
      if (battlePattern[step]) {
        this.synthesizeNote(this.NOTE_FREQS[battlePattern[step]], now, 0.14, 'square', 0.22, 3500);
      }

      // Tvrdé bojové bicie (Heavy Double Kick & Snare Roll)
      if (step % 2 === 0) {
        this.synthesizeDrum(now, 160, 40, 0.45); // Heavy Kick
      } else {
        this.synthesizeSnare(now); // Aggressive Snare
      }
      // Hi-hat cinknutie na každom kroku
      this.synthesizeChime(this.NOTE_FREQS['A5'], now);
    }
  }

  // Syntéza fujarového/dreveného dychového zvuku
  private synthesizeFluteNote(freq: number, startTime: number, duration: number, vol: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    // Jemné vibrato
    osc.frequency.linearRampToValueAtTime(freq + 4, startTime + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(freq - 2, startTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicMasterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private synthesizeNote(freq: number, startTime: number, duration: number, type: OscillatorType, vol: number, filterFreq: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, startTime);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicMasterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private synthesizeChime(freq: number, startTime: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.08, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

    osc.connect(gain);
    gain.connect(this.musicMasterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.7);
  }

  private synthesizeDrum(startTime: number, startFreq: number, endFreq: number, vol: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.12);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

    osc.connect(gain);
    gain.connect(this.musicMasterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.16);
  }

  private synthesizeSnare(startTime: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, startTime);
    osc.frequency.exponentialRampToValueAtTime(60, startTime + 0.08);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300, startTime);

    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicMasterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }

  // Jakub's Melee Slash 'Q'
  public playSlash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.14);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.14);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);

    // Add high pitched metal swish
    const noise = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();
    noise.type = 'triangle';
    noise.frequency.setValueAtTime(880, now);
    noise.frequency.exponentialRampToValueAtTime(220, now + 0.12);
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.12);
  }

  // Šimi's Arcane Magic Bolt 'W'
  public playMagic() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(330, now);
    osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(660, now + 0.22);

    osc2.frequency.setValueAtTime(660, now);
    osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(440, now + 0.22);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  // Arcane Explosion on hit
  public playMagicBurst() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Filip's Vanguard Slam 'E'
  public playSlam() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Heavy bass thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);

    // Rumble sub-oscillator
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.4);
    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.4);
  }

  // Monster hit / Hurt sound
  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Monster Death
  public playEnemyDeath() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Level Up / Relic Pickup Chime
  public playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    notes.forEach((freq, i) => {
      const now = this.ctx!.currentTime + i * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  // Item / Orb Pickup
  public playPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Dialogue Blip
  public playTypewriter() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(380 + Math.random() * 80, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Boss Roar
  public playBossRoar() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.1);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Hero Hurt Sound
  public playHeroHurt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Festival Drinking Click (Glass clink)
  public playDrinkClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200 + Math.random() * 300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Festival Shot Exnutie (Gulp + Chime)
  public playShotEx() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.22);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private audioLoadingMap: Map<string, Promise<AudioBuffer | null>> = new Map();

  // Preload an audio file into Web Audio API buffer
  public async loadAudioBuffer(src: string): Promise<AudioBuffer | null> {
    if (this.audioBufferCache.has(src)) {
      return this.audioBufferCache.get(src)!;
    }
    if (this.audioLoadingMap.has(src)) {
      return this.audioLoadingMap.get(src)!;
    }

    this.initCtx();
    if (!this.ctx) return null;

    const promise = (async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        if (!this.ctx) return null;
        const decoded = await this.ctx.decodeAudioData(arrayBuffer);
        this.audioBufferCache.set(src, decoded);
        return decoded;
      } catch (err) {
        return null;
      }
    })();

    this.audioLoadingMap.set(src, promise);
    return promise;
  }

  private currentCustomSource: AudioBufferSourceNode | null = null;
  private currentHTMLAudio: HTMLAudioElement | null = null;

  // Stop currently playing voice / custom audio
  public stopCustomAudio() {
    if (this.currentCustomSource) {
      try {
        this.currentCustomSource.stop();
      } catch {}
      this.currentCustomSource = null;
    }
    if (this.currentHTMLAudio) {
      try {
        this.currentHTMLAudio.pause();
        this.currentHTMLAudio.currentTime = 0;
      } catch {}
      this.currentHTMLAudio = null;
    }
  }

  // Play custom audio file with automatic fallback and Web Audio decoding
  public async playCustomAudio(filename: string, volume: number = 0.9) {
    if (this.isMuted) return;
    this.initCtx();
    this.stopCustomAudio();

    // Clean base name
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const baseName = filename.replace(/\.(aac|m4a|mp3|wav|ogg)$/i, '');
    const cleanFile = filename.startsWith('/') ? filename : `/${filename}`;
    const candidatePaths = [
      `${base}/sounds/${baseName}.wav`,
      `${base}/sounds/${baseName}.aac`,
      `${base}/sounds/${baseName}.mp3`,
      `${base}/sounds/${baseName}.m4a`,
      `${base}/sounds/${baseName}.ogg`,
      `${base}${cleanFile}`,
      `${base}/sounds${cleanFile}`
    ];

    // 1. Try playing via Web Audio Buffer (Zero latency, best quality)
    if (this.ctx) {
      for (const path of candidatePaths) {
        try {
          const buffer = await this.loadAudioBuffer(path);
          if (buffer && this.ctx && this.ctx.state !== 'suspended') {
            const source = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
            source.buffer = buffer;
            source.connect(gain);
            gain.connect(this.ctx.destination);
            this.currentCustomSource = source;
            source.onended = () => {
              if (this.currentCustomSource === source) {
                this.currentCustomSource = null;
              }
            };
            source.start(0);
            return;
          }
        } catch {
          // Continue to next path or HTML5 audio fallback
        }
      }
    }

    // 2. Fallback to HTMLAudioElement
    for (const path of candidatePaths) {
      try {
        const audio = new Audio(path);
        audio.volume = Math.max(0, Math.min(1, volume));
        this.currentHTMLAudio = audio;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browser blocked autoplay or failed
          });
          return;
        }
      } catch {
        // Try next
      }
    }
  }
}

export const sound = new SoundEngine();


