import Vex from 'vexflow';

/**
 * Takes the array of Part objects (the .tuneData property from the main class), and sets the
 * .position property of each Bar object contained there.
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
      const positionedBar = bar; //   why did I do this? is this preferable in any way to just mutating the parameter?
      let minWidth = bar.notes.length * widthFactor;

      if (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_END)) {
        minWidth += repeatWidthModifier;
      }

      minWidth += (dottedNotesModifier * bar.dottedNotesCount);

      if (minWidth > renderWidth) { minWidth = renderWidth; }

      if (minWidth < widthFactor * minWidthMultiplier) {
        minWidth = widthFactor * minWidthMultiplier;
      }
      if (bar.clef) { bar.clefSigMeterWidth += clefWidth; }
      if (bar.meter) { bar.clefSigMeterWidth += meterWidth; }

      if (bar.vexKeySignature !== '') { // checking 4 vex because I check for it in other cases...
        bar.clefSigMeterWidth += bar.abcKeySignature.accidentals.length * keySigAccidentalWidth;
      }

      // clefSigMeterWidth is left on the bar object becuase it's used in drawToContext
      minWidth += bar.clefSigMeterWidth;

      if (i === 0) { // first bar
        positionedBar.position.x = xOffset;
        positionedBar.position.y = (yCursor += (lineHeight * 1.25));
        // positionedBar.position.width = minWidth + clefsAndSigsWidth;
        positionedBar.position.width = minWidth; // already applied the clef, meter and sigs above
      } else if (part.bars[i - 1].position.x + part.bars[i - 1].position.width >= renderWidth) { // first bar on a new line
        positionedBar.position.x = xOffset;
        positionedBar.position.y = (yCursor += lineHeight);
        positionedBar.position.width = minWidth;
      } else { // bar on an incomplete line
        positionedBar.position.x = part.bars[i - 1].position.x + part.bars[i - 1].position.width;
        positionedBar.position.y = yCursor;
        positionedBar.position.width = minWidth;

        // check if next bar won't fit or there is no next bar. actually this doesn't work
        // if there's only one bar on the final line
        if (!part.bars[i + 1] || bar.position.x + minWidth + (part.bars[i + 1].notes.length * widthFactor) > renderWidth) {
          let extraSpace = (renderWidth - bar.position.x) - minWidth;
          let barsOnThisLine = 1;

          for (let j = i - 1; part.bars[j] && part.bars[j].position.y === bar.position.y; j -= 1) {
            barsOnThisLine += 1;
          }

          // if there will be extra space at the end because the next bar won't fit,
          // divide the extra space equally between all the bars on this line
          let spaceAdded = 0;
          for (let k = barsOnThisLine - 1; k >= 0; k -= 1) {
            const spaceToAdd = Math.floor(extraSpace / (k + 1));
            part.bars[i - k].position.x += spaceAdded;
            part.bars[i - k].position.width += spaceToAdd;
            extraSpace -= spaceToAdd;
            spaceAdded += spaceToAdd;
          }
        } else {
          positionedBar.position.width = minWidth;
        }
      }
      return positionedBar;
    });
    return {
      title: part.title,
      bars
    };
  });
}
