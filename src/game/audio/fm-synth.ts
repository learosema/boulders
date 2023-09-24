import { noteToFrequency } from "./notes";

type OscGainNode = {
  osc: OscillatorNode;
  gain: GainNode;
}

const createOscGainNode = (AC: AudioContext, type: OscillatorType = 'square') => {
  const node = {
    osc: AC.createOscillator(),
    gain: AC.createGain(),
  }
  node.osc.type=type;

  node.osc.start();
  return node;
}

export const createFilter = (AC: AudioContext, type: BiquadFilterType, frequency: number, Q?: number) => {
  const filter = AC.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  if (typeof Q !== 'undefined') {
    filter.Q.value = Q;
  }
  return filter;
}

export class FMSynth {

  carrier: OscGainNode;
  modulator: OscGainNode;
  output: AudioNode;
  destination: AudioNode|null = null;
  filter: BiquadFilterNode|null = null;

  constructor(
    public audioContext: AudioContext,
    public modulationFrequency = 12,
    public modulationDepth = 4,
    carrierType: OscillatorType = 'square',
    modulatorType: OscillatorType = 'square') {
    this.audioContext = audioContext;
    this.modulationDepth = modulationDepth;
    this.modulationFrequency = modulationFrequency;
    this.carrier = createOscGainNode(this.audioContext, carrierType);
    this.modulator = createOscGainNode(this.audioContext, modulatorType);

    this.modulator.osc.connect(this.modulator.gain);
    this.modulator.gain.connect(this.carrier.osc.frequency);

    this.carrier.osc.connect(this.carrier.gain);
    this.output = this.carrier.gain
  }

  withFilter(filter: BiquadFilterNode) {
    this.filter = filter;
    this.carrier.gain.connect(this.filter)
    this.output = this.filter;
    return this;
  }

  toDestination(destination: AudioNode|null = null) {
    this.destination = destination || this.audioContext.destination;
    this.output.connect(this.destination);
    return this;
  }

  play(note: string, startVolume = 1, startTime = 0) {
    const absStartTime = this.audioContext.currentTime + startTime;
    const frequency = noteToFrequency(note);
    this.carrier.osc.frequency.setValueAtTime(frequency, absStartTime);
    this.modulator.osc.frequency.setValueAtTime(this.modulationFrequency, absStartTime);
    this.modulator.gain.gain.setValueAtTime(frequency / this.modulationDepth, absStartTime);
    this.carrier.gain.gain.setValueAtTime(startVolume, absStartTime);
    return this;
  }

  rampToVolumeAtTime(volume: number, time: number) {
    const absTime = this.audioContext.currentTime + time;
    this.carrier.gain.gain.linearRampToValueAtTime(volume, absTime);
    return this;
  }

  setVolumeAtTime(volume: number, time: number) {
    const absTime = this.audioContext.currentTime + time;
    this.carrier.gain.gain.setValueAtTime(volume, absTime);
    return this;
  }

  dispose() {
    this.carrier.osc.stop();
    this.modulator.osc.stop();
    this.modulator.osc.disconnect();
    this.modulator.gain.disconnect();
    this.carrier.gain.disconnect();
    this.modulator.gain.disconnect();
  }
}
