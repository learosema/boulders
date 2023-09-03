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

export class FreqMod {

  carrier: OscGainNode;
  modulator: OscGainNode;

  constructor(
    public audioContext: AudioContext,
    public destination: AudioNode,
    public modulationFrequency = 12,
    public modulationDepth = 4) {
    this.audioContext = audioContext;
    this.modulationDepth = modulationDepth;
    this.modulationFrequency = modulationFrequency;
    this.carrier = createOscGainNode(this.audioContext, 'square');
    this.modulator = createOscGainNode(this.audioContext, 'square');

    this.modulator.osc.connect(this.modulator.gain);
    this.modulator.gain.connect(this.carrier.osc.frequency);

    this.carrier.osc.connect(this.carrier.gain);
    this.carrier.gain.connect(destination);
  }

  play(note: string, startTime: number, endTime: number) {
    const frequency = noteToFrequency(note);
    this.carrier.osc.frequency.setValueAtTime(frequency, startTime);
    this.modulator.osc.frequency.setValueAtTime(this.modulationFrequency, startTime);
    this.modulator.gain.gain.setValueAtTime(frequency / this.modulationDepth, startTime);
    this.carrier.gain.gain.setValueAtTime(1, startTime);
    this.carrier.gain.gain.linearRampToValueAtTime(0, endTime);
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
