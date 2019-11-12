import Vex from 'vexflow';

/**
 * Takes the Tune and sets the .position properties of each Bar object contained there.
 * Sets width of each Bar according to the renderOptions and based on the contents of
 * that Bar: number of notes, dotted notes, key signature, time signature, clef, repeat signs.
 * Determines when new line is necessary and places a newline and a slightly larger
 * vertical gap to mark the beginning of a new Part.
 * @param   {Object} tuneData The array of Part objects
 *
 * @returns {Object} Array of Part objects
 */
export default function setBarPositions(tune) {
  const {
    renderWidth, xOffset, widthFactor, lineHeight, clefWidth, meterWidth, repeatWidthModifier, minWidthMultiplier, dottedNotesModifier, keySigAccidentalWidth
  } = tune.renderOptions;

  let yCursor = (0 - (lineHeight * 1.25));
  const newTune = Object.assign({}, tune);

  newTune.parts = tune.parts.map((part, partIndex) => {
    /*
      what I'm doing here, copying part and then mutating it, isn't the correct way to use
      immutable. I should create an empty array and then do part.map() to the new array, and then
      freeze it afterwards.
    */
    const newPart = Object.assign({}, part);
    newPart.bars = newPart.bars.map((bar, i) => {
      const newBar = Object.assign({}, bar);
      let minWidth = newBar.notes.length * widthFactor;

      if (newBar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
        minWidth += repeatWidthModifier;
      }

      minWidth += (dottedNotesModifier * newBar.dottedNotesCount);

      if (minWidth > renderWidth) { minWidth = renderWidth; }

      if (minWidth < widthFactor * minWidthMultiplier) {
        minWidth = widthFactor * minWidthMultiplier;
      }
      if (newBar.clef) { newBar.position.clefSigMeterWidth += clefWidth; }
      if (newBar.meter) { newBar.position.clefSigMeterWidth += meterWidth; }

      if (newBar.vexKeySignature !== '') { // checking 4 vex because I check for it in other cases...
        newBar.position.clefSigMeterWidth += newBar.abcKeySignature.accidentals.length * keySigAccidentalWidth;
      }

      // position.clefSigMeterWidth is left on the bar object becuase it's used in drawToContext
      minWidth += newBar.position.clefSigMeterWidth;

      if (i === 0) { // first bar of part
        newBar.position.x = xOffset;
        if (tune.renderOptions.tabsVisibility || partIndex === 0) {
          yCursor += (lineHeight * 1.25); // get rid of all these magic numbers
        } else {
          yCursor += (lineHeight * 1.25) * 0.65;
        }
        newBar.position.y = yCursor;
        // newBar.position.width = minWidth + clefsAndSigsWidth;
        newBar.position.width = minWidth;
      } else if (newPart.bars[i - 1].position.x + newPart.bars[i - 1].position.width + minWidth > renderWidth) {
        newBar.position.x = xOffset;
        if (tune.renderOptions.tabsVisibility) {
          yCursor += lineHeight;
        } else {
          yCursor += lineHeight * 0.6;
        }
        newBar.position.y = yCursor;
        newBar.position.width = minWidth;
      } else { // bar on an incomplete line
        newBar.position.x = newPart.bars[i - 1].position.x + newPart.bars[i - 1].position.width;
        newBar.position.y = yCursor;
        newBar.position.width = minWidth;
      }
      return newBar;
    });
    return newPart;
  });
  return newTune;
}
