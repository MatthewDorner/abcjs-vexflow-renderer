import Vex from 'vexflow';

/**
 * Takes the array of Part objects (the .tuneData property from the main class), and sets the
 * .position properties of each Bar object contained there. Sets width of each Bar according to
 * the renderOptions and based on the contents of that Bar: number of notes, dotted notes,
 * key signature, time signature, clef, repeat signs.
 * @param   {Array} tuneData The array of Part objects
 * @param   {Object} renderOptions Options, should be documented more
 *
 * @returns {Array} Array of Part objects
 */
export default function setBarPositions(tuneData, renderOptions) {
  const {
    renderWidth, xOffset, widthFactor, lineHeight, clefWidth, meterWidth, repeatWidthModifier, minWidthMultiplier, dottedNotesModifier, keySigAccidentalWidth
  } = renderOptions;

  let yCursor = (0 - (lineHeight * 1.25));

  return tuneData.map((part) => {
    const bars = part.bars.map((bar, i) => {
      const newBar = Object.assign({}, bar); // to prepare for using immutable?
      let minWidth = bar.notes.length * widthFactor;

      if (newBar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
        minWidth += repeatWidthModifier;
      }

      minWidth += (dottedNotesModifier * newBar.dottedNotesCount);

      if (minWidth > renderWidth) { minWidth = renderWidth; }

      if (minWidth < widthFactor * minWidthMultiplier) {
        minWidth = widthFactor * minWidthMultiplier;
      }
      if (newBar.clef) { newBar.clefSigMeterWidth += clefWidth; }
      if (newBar.meter) { newBar.clefSigMeterWidth += meterWidth; }

      if (newBar.vexKeySignature !== '') { // checking 4 vex because I check for it in other cases...
        newBar.clefSigMeterWidth += newBar.abcKeySignature.accidentals.length * keySigAccidentalWidth;
      }

      // clefSigMeterWidth is left on the bar object becuase it's used in drawToContext
      minWidth += newBar.clefSigMeterWidth;

      if (i === 0) { // first bar
        newBar.position.x = xOffset;
        newBar.position.y = (yCursor += (lineHeight * 1.25));
        // newBar.position.width = minWidth + clefsAndSigsWidth;
        newBar.position.width = minWidth; // already applied the clef, meter and sigs above
      } else if (part.bars[i - 1].position.x + part.bars[i - 1].position.width + minWidth > renderWidth) {
        newBar.position.x = xOffset;
        newBar.position.y = (yCursor += lineHeight);
        newBar.position.width = minWidth;
      } else { // bar on an incomplete line
        newBar.position.x = part.bars[i - 1].position.x + part.bars[i - 1].position.width;
        newBar.position.y = yCursor;
        newBar.position.width = minWidth;
      }
      return newBar;
    });
    return {
      title: part.title,
      bars
    };
  });
}
