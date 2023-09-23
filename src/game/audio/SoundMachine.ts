import { ISoundMachine } from "../interfaces/isoundmachine";
import { FreqMod, createFilter } from "./FreqMod";

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
    const FM = new FreqMod(this.audioContext, 12, 4).withFilter(this.lowPass1).toDestination(this.mainGain);
    FM.play('C6', this.audioContext.currentTime, this.audioContext.currentTime + .25);
    setTimeout(() => FM.dispose(), 500);
  }

  rock(): void {
    this.#resume();
    const FM = new FreqMod(this.audioContext, 2, 2, 'sawtooth', 'sawtooth').withFilter(this.lowPass2).toDestination(this.mainGain);
    FM.play('A0', this.audioContext.currentTime, this.audioContext.currentTime + .25);
    setTimeout(() => FM.dispose(), 250);
  }

  push(): void {
    this.#resume();
    const FM = new FreqMod(this.audioContext, 2, 2, 'sawtooth', 'sine').withFilter(this.lowPass2).toDestination(this.mainGain);
    FM.play('C0', this.audioContext.currentTime, this.audioContext.currentTime + .25, .5, 1);
    setTimeout(() => FM.dispose(), 250);
  }

  gameover(): void {
    this.#resume();
    const FM = new FreqMod(this.audioContext, 24, 4).withFilter(this.lowPass1).toDestination(this.mainGain);
    FM.play('D#3', this.audioContext.currentTime, this.audioContext.currentTime + .25);
    FM.play('D3', this.audioContext.currentTime + .26, this.audioContext.currentTime + .5);
    FM.play('A#2', this.audioContext.currentTime + .51, this.audioContext.currentTime + .75);
    FM.play('G2', this.audioContext.currentTime + .76, this.audioContext.currentTime + 1.);
    setTimeout(() => FM.dispose(), 1300);
  }

  dispose() {
    this.mainGain.disconnect();
    this.lowPass1.disconnect();
    this.lowPass2.disconnect();
  }
}
