/**
 * Converts an array of pitches (from abcjs parsed object) into an array of
 * keys that can be used by VexFlow. For example, middle in the treble clef
 * is abc pitch number 6.
 * @param   {Array} abcPitches such as [ { pitch: 6, verticalPos: 6 } ]
 *
 * @returns {Array} such as [ 'b/4' ]
 */
export default function getKeys(abcPitches) {
  const keys = [];
  abcPitches.forEach((pitch) => {
    const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    const octave = (Math.floor(pitch.pitch / 7)); // this not right?? no, I think it is right.
    const vexOctave = octave + 4;
    const note = pitch.pitch - (octave * 7);
    keys.push(`${notes[note]}/${vexOctave.toString()}`);
  });

  return keys;
}
