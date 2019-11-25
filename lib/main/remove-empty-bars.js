import Vex from 'vexflow';

/**
 * Takes the tune data and removes empty bars, shifting any important markers (repeat signs, etc)
 * to the nearest bar with notes in it. The empty bars mostly occur due to the fact that I merge
 * 'line breaks' from the parsed object, so there's a bar at the end of one line, and a bar at the
 * beginning of the next line, but I see it as two barlines.
 * @param   {Array} tuneData The array of Part objects
 *
 * @returns {Array} The same array after map and filter operations that removes empty bars.
 */
export default function removeEmptyBars(tune) {
  const newTune = Object.assign({}, tune);
  newTune.parts = newTune.parts.map((part, partIndex) => {
    const newPart = Object.assign({}, part);
    newPart.bars = part.bars.filter((bar, i) => {
      const newBar = Object.assign({}, bar);
      if (newBar.notes.length === 0) {
        if (newBar.abcKeySignature) {
          if (i + 1 < newPart.bars.length) {
            newPart.bars[i + 1].abcKeySignature = newBar.abcKeySignature;
          } else if (partIndex < (newTune.parts.length - 1) && newTune.parts[partIndex + 1].bars.length > 0) {
            newTune.parts[partIndex + 1].bars[0].abcKeySignature = newBar.abcKeySignature;
          } else {
            // key signature gets lost?
          }
        }

        if (newBar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
          if (i > 0) {
            newPart.bars[i - 1].repeats.push(Vex.Flow.Barline.type.REPEAT_END);
          } else {
            // console.log('LOST A REPEAT_END');
          }
        }
        if (newBar.repeats.includes(Vex.Flow.Barline.type.REPEAT_BEGIN)) {
          if (i > 0) {
            newPart.bars[i + 1].repeats.push(Vex.Flow.Barline.type.REPEAT_BEGIN);
          } else {
            // console.log('LOST A REPEAT_BEGIN');
          }
        }

        return false;
      }
      return true;
    });
    return newPart;
  });
  return newTune;
}
