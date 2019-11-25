import Vex from 'vexflow';
import { Formatter } from 'vexflow/src/formatter';

/**
 * Takes the Tune and sets the .position properties of each Bar object contained there.
 * Sets width of each Bar according to the renderOptions and based on the contents of
 * that Bar, as determined by VexFlow preCalculateMinTotalWidth method.
 * Determines when new line is necessary and places a newline and a slightly larger
 * vertical gap to mark the beginning of a new Part.
 * @param   {Object} tuneData The array of Part objects
 *
 * @returns {Object} Array of Part objects
 */
export default function setBarPositions(tune) {
  const {
    renderWidth, xOffset, widthFactor, lineHeight, clefWidth, meterWidth, repeatWidthModifier, minNotesWidth, keySigAccidentalWidth
  } = tune.renderOptions;

  let yCursor = (0 - (lineHeight * 1.25));
  const newTune = Object.assign({}, tune);

  newTune.parts = tune.parts.map((part, partIndex) => {
    const newPart = Object.assign({}, part);
    newPart.bars = newPart.bars.map((bar, i) => {
      const newBar = Object.assign({}, bar);

      // calculate space needed for clefSigMeterWidth
      if (newBar.clef) { newBar.position.clefSigMeterWidth += clefWidth; }
      if (newBar.meter) { newBar.position.clefSigMeterWidth += meterWidth; }
      if (newBar.abcKeySignature) {
        newBar.position.clefSigMeterWidth += newBar.abcKeySignature.accidentals.length * keySigAccidentalWidth;
      }

      // get vexFlow to tell me how much space the notes need
      const formatter = new Formatter();
      formatter.createTickContexts([newBar.voice]);

      let notesWidth = formatter.preCalculateMinTotalWidth([newBar.voice]) * widthFactor;

      // still had crowding in bars with few notes, even when using
      // preCalculateMinTotalWidth, seems to be the same problem my own code had before
      if (newBar.notes.length === 3) { notesWidth *= 1.18; }
      if (newBar.notes.length === 2) { notesWidth *= 1.3; }
      if (notesWidth < minNotesWidth) { notesWidth = minNotesWidth; }

      // determine total min width of the bar including clefSigMeterWidth
      let minWidth = notesWidth + newBar.position.clefSigMeterWidth;
      if (minWidth < minNotesWidth) { minWidth = minNotesWidth; }
      if (newBar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
        minWidth += repeatWidthModifier;
      }
      if (minWidth > renderWidth) { minWidth = renderWidth; }

      if (i === 0) { // first bar of part
        newBar.position.x = xOffset;
        if (tune.renderOptions.tabsVisibility || partIndex === 0) {
          yCursor += (lineHeight * 1.25);
        } else {
          yCursor += (lineHeight * 1.25) * 0.5;
        }
      } else if (newPart.bars[i - 1].position.x + newPart.bars[i - 1].position.width + minWidth > renderWidth) {
        newBar.position.x = xOffset;
        if (tune.renderOptions.tabsVisibility) {
          yCursor += lineHeight;
        } else {
          yCursor += lineHeight * 0.5;
        }
      } else { // bar on an incomplete line
        newBar.position.x = newPart.bars[i - 1].position.x + newPart.bars[i - 1].position.width;
      }
      newBar.position.y = yCursor;
      newBar.position.width = minWidth;

      return newBar;
    });
    return newPart;
  });
  return newTune;
}
