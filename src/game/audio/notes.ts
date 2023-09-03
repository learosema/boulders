/**
 * Returns frequency from a note
 * @param note A note string followed by an octave like C1, C#1
 * @returns frequency
 */
export function noteToFrequency(note: string): number {
  return 440 * Math.pow(2, (noteToMIDI(note) - 69) / 12);
}

/**
 * Returns midi note
 * @param note
 * @returns
 */
export function noteToMIDI(note: string): number {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = parseInt(note.slice(-1));
  const noteName = note.slice(0, -1);
  return (octave + 1) * 12 + noteNames.indexOf(noteName);
}

