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
export default function removeEmptyBars(tuneData) {
  return tuneData.map((part, partIndex) => {
    part.bars = part.bars.filter((bar, i) => {
      if (bar.notes.length === 0) {
        if (bar.vexKeySignature !== '') {
          if (i + 1 < part.bars.length) { // fiddle hill jig fails
            // shouldn't mutate part here...
            part.bars[i + 1].vexKeySignature = bar.vexKeySignature;
            part.bars[i + 1].abcKeySignature = bar.abcKeySignature;
          } else if (partIndex < (tuneData.length - 1) && tuneData[partIndex + 1].bars.length > 0) {
            // shouldn't mutate tuneData here... overhaul entire way of handling key signatures
            tuneData[partIndex + 1].bars[0].vexKeySignature = bar.vexKeySignature;
            tuneData[partIndex + 1].bars[0].abcKeySignature = bar.abcKeySignature;
          } else {
            // key signature gets lost?
          }
        }

        if (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
          if (i > 0) {
            bars[i - 1].repeats.push(Vex.Flow.Barline.type.REPEAT_END);
          } else {
            // console.log('LOST A REPEAT_END');
          }
        }
        if (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_BEGIN)) {
          if (i > 0) {
            bars[i + 1].repeats.push(Vex.Flow.Barline.type.REPEAT_BEGIN);
          } else {
            // console.log('LOST A REPEAT_BEGIN');
          }
        }

        return false;
      }
      return true;
    });
    return part;
  });
}
