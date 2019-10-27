
class FakeStaveNote {
  constructor(duration, dots, keys, stemDirection) {
    this.duration = duration;
    this.dots = dots;
    this.keys = keys;
    this.stem_direction = stemDirection;
  }

  getStemDirection() {
    return this.stem_direction;
  }

  setStemDirection(direction) {
    this.stem_direction = direction;
  }
}

/**
   * Returns an array of fake StaveNote objects to use in testing
   * @param   {number} howMany how many to create
   * @param   {number} duration duration such as '8'
   * @param   {number} dots // actually what is this?
   * @param   {array} keys such as ['f/5']
   * @param   {bool} stem_direction
   *
   * @returns {Array} the array of fake StaveNotes
*/
function FakeStaveNoteArrayFactory(howMany, duration, dots, keys, stemDirection) {
  const notesArray = [];

  for (let i = 0; i < howMany; i += 1) {
    const direction = stemDirection == 'alternate_stems' ? i % 2 ? -1 : 1 : stemDirection;
    const note = new FakeStaveNote(duration, dots, keys, direction);
    notesArray.push(note);
    console.log("pushed note: " );
    console.log(note);
  }

  return notesArray;
}

export default { FakeStaveNoteArrayFactory, FakeStaveNote };
