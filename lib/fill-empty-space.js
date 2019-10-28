
/**
 * After setBarPositions sets each bar to its minimum acceptable width, there will be extra space
 * at the end of most lines. This function will add (amount of extra space on the line) / (number
 * of bars) space to each bar. This is a separate function as it relies on having the width
 * and position of each bar already known, else it would require backtracking and mutating of
 * already set values in the setBarPositions loop.
 * @param   {Array} tuneData The array of Part objects
 *
 * @returns {Array} The same array after empty space has been filled
 */
export default function fillEmptySpace(tuneData, renderOptions) {
  return tuneData.map((part) => {
    const newPart = Object.assign({}, part);
    let cursor = 0; let outputBars = [];

    for (let line = getLine(part.bars, cursor); line.length > 0; line = getLine(part.bars, cursor)) {
      const expandedLine = expandBars(line, renderOptions);
      cursor += line.length;
      outputBars = outputBars.concat(expandedLine); // how is this for mutability?
    }

    newPart.bars = outputBars;
    return newPart;
  });
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

    const spaceToAdd = Math.floor(extraSpace / (line.length - i));
    newBar.position.x += spaceAdded;
    newBar.position.width += spaceToAdd;
    extraSpace -= spaceToAdd;
    spaceAdded += spaceToAdd;

    return newBar;
  });

  return expandedBars;
}
