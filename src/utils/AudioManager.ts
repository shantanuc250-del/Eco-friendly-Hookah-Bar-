export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private masterGain: GainNode | null = null;

  // Nodes for persistent sounds
  private ambienceNode: AudioBufferSourceNode | null = null;
  private ambienceGain: GainNode | null = null;

  private bubblingNode: AudioBufferSourceNode | null = null;
  private bubblingGain: GainNode | null = null;
  private bubblingFilter: BiquadFilterNode | null = null;

  private hoseNode: AudioBufferSourceNode | null = null;
  private hoseGain: GainNode | null = null;
  
  private panner: StereoPannerNode | null = null;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.panner = this.ctx.createStereoPanner();
    
    // Spatialization: Hookah is slightly left
    this.panner.pan.value = -0.2;

    this.masterGain.connect(this.panner);
    this.panner.connect(this.ctx.destination);
    
    this.masterGain.gain.value = 0; // Start muted
  }

  public async enable() {
    this.isEnabled = true;
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(1.0, this.ctx!.currentTime, 0.5);
    }
    this.startAmbience();
    this.startBubbling();
    this.startHose();
  }

  public disable() {
    this.isEnabled = false;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    }
  }

  private createNoiseBuffer(durationSeconds: number, type: 'white' | 'pink' | 'brown'): AudioBuffer {
    if (!this.ctx) throw new Error("No AudioContext");
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'white') {
        data[i] = white;
      } else if (type === 'brown') {
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5;
      } else {
        // Pinkish approximation
        lastOut = (lastOut * 0.9) + (white * 0.1);
        data[i] = lastOut * 2;
      }
    }
    return buffer;
  }

  private startAmbience() {
    if (!this.ctx || !this.masterGain || this.ambienceNode) return;
    
    const buffer = this.createNoiseBuffer(5, 'brown');
    this.ambienceNode = this.ctx.createBufferSource();
    this.ambienceNode.buffer = buffer;
    this.ambienceNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.value = 0.1; // 10% volume

    this.ambienceNode.connect(filter);
    filter.connect(this.ambienceGain);
    this.ambienceGain.connect(this.masterGain);

    this.ambienceNode.start();
  }

  private startBubbling() {
    if (!this.ctx || !this.masterGain || this.bubblingNode) return;

    const buffer = this.createNoiseBuffer(2, 'brown');
    this.bubblingNode = this.ctx.createBufferSource();
    this.bubblingNode.buffer = buffer;
    this.bubblingNode.loop = true;

    this.bubblingFilter = this.ctx.createBiquadFilter();
    this.bubblingFilter.type = 'bandpass';
    this.bubblingFilter.frequency.value = 300;
    this.bubblingFilter.Q.value = 5.0;

    // LFO to modulate filter frequency to create bubbling effect
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 8; // 8 Hz wobble
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 400; // Sweep range

    lfo.connect(lfoGain);
    lfoGain.connect(this.bubblingFilter.frequency);
    lfo.start();

    this.bubblingGain = this.ctx.createGain();
    this.bubblingGain.gain.value = 0.05; // 5% volume, very subtle

    this.bubblingNode.connect(this.bubblingFilter);
    this.bubblingFilter.connect(this.bubblingGain);
    this.bubblingGain.connect(this.masterGain);

    this.bubblingNode.start();
  }

  private startHose() {
    if (!this.ctx || !this.masterGain || this.hoseNode) return;

    const buffer = this.createNoiseBuffer(3, 'pink');
    this.hoseNode = this.ctx.createBufferSource();
    this.hoseNode.buffer = buffer;
    this.hoseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1.5;

    this.hoseGain = this.ctx.createGain();
    this.hoseGain.gain.value = 0; // Starts silent

    this.hoseNode.connect(filter);
    filter.connect(this.hoseGain);
    this.hoseGain.connect(this.masterGain);

    this.hoseNode.start();
  }

  public playGrab() {
    if (!this.isEnabled || !this.ctx || !this.masterGain) return;
    
    // Soft tactile click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  public updateHoseVelocity(velocity: number) {
    if (!this.isEnabled || !this.ctx || !this.hoseGain) return;
    // Map velocity (0 to 1) to volume (0 to 0.15)
    const targetGain = Math.min(Math.max(velocity * 0.5, 0), 0.15);
    this.hoseGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
  }

  public startInhale() {
    if (!this.isEnabled || !this.ctx || !this.masterGain) return;
    
    // Increase bubbling slightly
    if (this.bubblingGain) {
      this.bubblingGain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 0.2);
    }
    if (this.bubblingFilter) {
      this.bubblingFilter.frequency.setTargetAtTime(600, this.ctx.currentTime, 0.3);
    }

    // Play inhale suction sound
    const buffer = this.createNoiseBuffer(1.5, 'white');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.8);
    filter.Q.value = 1.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.3);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    source.stop(this.ctx.currentTime + 0.8);
  }

  public startExhale() {
    if (!this.isEnabled || !this.ctx || !this.masterGain) return;
    
    // Play soft breath/air release
    const buffer = this.createNoiseBuffer(2.0, 'pink');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 1.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    source.stop(this.ctx.currentTime + 1.6);
  }

  public endInhale() {
    if (!this.isEnabled || !this.ctx) return;
    // Restore normal bubbling
    if (this.bubblingGain) {
      this.bubblingGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.5);
    }
    if (this.bubblingFilter) {
      this.bubblingFilter.frequency.setTargetAtTime(300, this.ctx.currentTime, 0.5);
    }
  }
  
  public setHookahFlavor(flavor: string) {
     if (!this.isEnabled || !this.ctx || !this.bubblingFilter) return;
     
     let baseFreq = 300;
     if (flavor === 'Ice Pearl') baseFreq = 400; // Cooler/higher
     if (flavor === 'Royal Gold') baseFreq = 200; // Warmer/lower
     
     this.bubblingFilter.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 1.0);
  }
}

export const audioManager = AudioManager.getInstance();
