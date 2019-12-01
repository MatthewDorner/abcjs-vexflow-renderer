import Vex from 'vexflow';

/**
 * Takes the tune data and removes empty bars, shifting any important markers (repeat signs, etc)
 * to the nearest bar with notes in it. The empty bars mostly occur due to the fact that I merge
 * 'line breaks' from the parsed object, so there's a bar at the end of one line, and a bar at the
 * beginning of the next line, but I see it as two barlines. This entire method should be gotten
 * rid of and instead, should have tuneArrayParser handle the lines and assemble them correctly
 * into parts to begin with.
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
        // key signature needs to be applied to the next bar
        if (newBar.abcKeySignature) {
          if (i + 1 < newPart.bars.length) {
            newPart.bars[i + 1].abcKeySignature = newBar.abcKeySignature;
            newPart.bars[i + 1].cancelKeySig = newBar.cancelKeySig;
          } else if (partIndex < (newTune.parts.length - 1) && newTune.parts[partIndex + 1].bars.length > 0) {
            newTune.parts[partIndex + 1].bars[0].abcKeySignature = newBar.abcKeySignature;
            newTune.parts[partIndex + 1].bars[0].cancelKeySig = newBar.cancelKeySig;
          } else {
            // key signature gets lost?
          }
        }

        // REPEAT_END needs to be applied to the previous bar
        if (newBar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
          if (i > 0) {
            newPart.bars[i - 1].repeats.push(Vex.Flow.Barline.type.REPEAT_END);
          } else {
            // console.log('LOST A REPEAT_END');
          }
        }

        // REPEAT_BEGIN needs to be applied to the next bar
        if (newBar.repeats.includes(Vex.Flow.Barline.type.REPEAT_BEGIN)) {
          if (i + 1 < newPart.bars.length) {
            newPart.bars[i + 1].repeats.push(Vex.Flow.Barline.type.REPEAT_BEGIN);
          } else {
            // console.log('LOST A REPEAT_BEGIN');
          }
        }

        // BEGIN volta needs to be applied to next bar, END volta needs to be
        // applied to previous bar. if there is no next / previous bar, the volta will
        // be lost...  but that wouldn't make sense anyway if it's a BEGIN or END volta,
        // there should always be a next / previous bar. Otherwise it would be a BEGIN_END volta
        if (newBar.volta) {
          if (newBar.volta.type === Vex.Flow.Volta.type.BEGIN && i + 1 < newPart.bars.length) {
            const nextBar = newPart.bars[i + 1];
            if (nextBar.volta && nextBar.volta.type === Vex.Flow.Volta.type.MID) {
              nextBar.volta = {
                number: newBar.volta.number,
                type: Vex.Flow.Volta.type.BEGIN
              };
            } else if (nextBar.volta && nextBar.volta.type === Vex.Flow.Volta.type.END) {
              nextBar.volta = {
                number: newBar.volta.number,
                type: Vex.Flow.Volta.type.BEGIN_END
              };
            }
          } else if (newBar.volta.type === Vex.Flow.Volta.type.END && i > 0) {
            const prevBar = newPart.bars[i - 1];
            if (prevBar.volta && prevBar.volta.type === Vex.Flow.Volta.type.MID) {
              prevBar.volta = {
                number: 0,
                type: Vex.Flow.Volta.type.END
              };
            } else if (prevBar.volta && prevBar.volta.type === Vex.Flow.Volta.type.BEGIN) {
              prevBar.volta = {
                number: prevBar.volta.number,
                type: Vex.Flow.Volta.type.BEGIN_END
              };
            }
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
