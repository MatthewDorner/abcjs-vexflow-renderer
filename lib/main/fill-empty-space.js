import Vex from 'vexflow';

/**
 * After setBarPositions sets each bar to its minimum acceptable width, there will be extra space
 * at the end of most lines. This function will add (amount of extra space on the line) / (number
 * of bars) space to each bar. This is a separate function as it relies on having the width
 * and position of each bar already known, else it would require backtracking and mutating of
 * already set values in the setBarPositions loop.
 * @param   {Object} tune
 *
 * @returns {Object} The Tune after empty space has been filled
 */
export default function fillEmptySpace(tune) {
  const newTune = Object.assign({}, tune);
  newTune.parts = tune.parts.map((part) => {
    const newPart = Object.assign({}, part);
    let cursor = 0; let outputBars = [];

    for (let line = getLine(part.bars, cursor); line.length > 0; line = getLine(part.bars, cursor)) {
      // test whether it's a single bar on the last line (tested by object identity)
      if (line[0] !== part.bars[part.bars.length - 1]) {
        const expandedLine = expandBars(line, tune.renderOptions);
        cursor += line.length;
        outputBars = outputBars.concat(expandedLine);
      } else {
        cursor += 1; // it's the very last bar of part on a new line so don't expand
        outputBars = outputBars.concat(line);
      }
    }

    newPart.bars = outputBars;
    return newPart;
  });
  return newTune;
}

function getLine(bars, cursor) {
  const line = [];
  for (let i = cursor; bars[i] && bars[i].position.y === bars[cursor].position.y; i += 1) {
    line.push(bars[i]);
  }
  return line;
}

function expandBars(line, renderOptions) {
  let extraSpace = renderOptions.renderWidth - (line[line.length - 1].position.x + line[line.length - 1].position.width);
  let spaceAdded = 0;

  const expandedBars = line.map((bar, i) => {
    const newBar = Object.assign({}, bar);

    // if it's a lead-in bar, don't add space
    let spaceToAdd;
    if ((bar.isFirst || (bar.repeats.includes(Vex.Flow.Barline.type.REPEAT_BEGIN) && bar !== line[line.length - 1])) && bar.notes.length < 3) {
      spaceToAdd = 0;
    } else {
      spaceToAdd = Math.floor(extraSpace / (line.length - i));
    }

    newBar.position.x += spaceAdded;
    newBar.position.width += spaceToAdd;
    extraSpace -= spaceToAdd;
    spaceAdded += spaceToAdd;

    return newBar;
  });

  return expandedBars;
}
