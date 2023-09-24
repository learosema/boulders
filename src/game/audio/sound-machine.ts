import { ISoundMachine } from "../interfaces/isound-machine";
import { FMSynth, createFilter } from "./fm-synth";

export class SoundMachine implements ISoundMachine {

  audioContext = new AudioContext();
  mainGain = this.audioContext.createGain();
  lowPass1 = createFilter(this.audioContext, 'lowpass', 800);
  lowPass2 = createFilter(this.audioContext, 'lowpass', 350);

  #resume(): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setup() {
    this.mainGain.gain.value = .25;
    this.mainGain.connect(this.audioContext.destination);
  }

  bling(): void {
    this.#resume();
    const FM = new FMSynth(this.audioContext, 12, 4).withFilter(this.lowPass1).toDestination(this.mainGain);
    FM.play('C6').rampToVolumeAtTime(0, 0.25);
    setTimeout(() => FM.dispose(), 500);
  }

  rock(): void {
    this.#resume();
    const FM = new FMSynth(this.audioContext, 2, 2, 'sawtooth', 'sawtooth').withFilter(this.lowPass2).toDestination(this.mainGain);
    FM.play('A0').rampToVolumeAtTime(0, .25);
    setTimeout(() => FM.dispose(), 250);
  }

  push(): void {
    this.#resume();
    const FM = new FMSynth(this.audioContext, 2, 2, 'sawtooth', 'sine').withFilter(this.lowPass2).toDestination(this.mainGain);
    FM.play('C0', 0.5).rampToVolumeAtTime(1, 0.25);
    setTimeout(() => FM.dispose(), 250);
  }

  gameover(): void {
    this.#resume();
    const FM = new FMSynth(this.audioContext, 24, 4).withFilter(this.lowPass1).toDestination(this.mainGain);
    FM.play('D#3', 1, 0).rampToVolumeAtTime(0, .25);
    FM.play('D3', 1, .26).rampToVolumeAtTime(0, 0.5);
    FM.play('A#2', 1, .51).rampToVolumeAtTime(0, .75);
    FM.play('G2', 1, .76).rampToVolumeAtTime(0, 1.);
    setTimeout(() => FM.dispose(), 1010);
  }

  dispose() {
    this.mainGain.disconnect();
    this.lowPass1.disconnect();
    this.lowPass2.disconnect();
  }
}
