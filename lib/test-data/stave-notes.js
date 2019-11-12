class FakeStaveNote {
  constructor(duration, dots, keys, stemDirection) {
    this.duration = duration;
    this.dots = dots;
    this.keys = keys;
    this.stem_direction = stemDirection;
  }

  // might refactor this, but also not sure if I should DeepFreeze the fake VexFlow objects. they do get
  // mutated by the VexFlow code, but I don't think by my code, but have to check and make sure.

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
   * @param   {number} for dotted note durations, how many dots
   * @param   {array} keys such as ['f/5']
   * @param   {number} 'alternate_stems' to alternate, otherwise numeric -1 or 1 (the values VexFlow actually uses)
   *
   * @returns {Array} the array of fake StaveNotes
*/
function FakeStaveNoteArrayFactory(howMany, duration, dots, keys, stemDirection) {
  const notesArray = [];

  for (let i = 0; i < howMany; i += 1) {
    const alternatingDirection = i % 2 ? -1 : 1;
    const direction = stemDirection === 'alternate_stems' ? alternatingDirection : stemDirection;
    const note = new FakeStaveNote(duration, dots, keys, direction);
    notesArray.push(note);
  }

  return notesArray;
}

export default { FakeStaveNoteArrayFactory, FakeStaveNote };
