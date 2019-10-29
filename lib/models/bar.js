export default class Bar {
  constructor() {
    this.notes = [];
    this.tabNotes = [];
    this.beams = [];
    this.decorations = [];
    this.repeats = [];
    this.vexKeySignature = ''; // think all of these are strings, although maybe should init to null
    this.abcKeySignature = {};
    this.clef = '';
    this.meter = '';
    this.dottedNotesCount = 0;
    this.volta = {
      type: 0,
      number: 0
    };
    // this should be in .position
    this.clefSigMeterWidth = 0; // this is the width of the "invisible" extra bar to be drawn if necessary
    this.position = {
      x: 0,
      y: 0,
      width: 0
    };
    Object.seal(this);
  }
}
