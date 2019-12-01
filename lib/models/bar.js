export default class Bar {
  constructor() {
    this.notes = []; // includes rests
    this.tabNotes = [];
    this.beams = [];
    this.decorations = [];
    this.repeats = [];
    this.isFirst = false; // to identify what will usually be the lead-in bar
    this.abcKeySignature = null;
    this.cancelKeySig = null;
    this.clef = '';
    this.meter = '';
    this.voice = null;
    this.tuplets = [];
    this.tabTuplets = [];
    this.volta = null;
    this.position = {
      x: 0,
      y: 0,
      width: 0,
      // width of the 'invisible' extra bar to be drawn if necessary due to the fact that i couldn't get
      // spacing to match up when I was drawing things like Clef, Time Signature, Key Signature, in the
      // top (music) staff but not in the bottom (tab) staff, the tab notes wouldn't align with the 
      // music notes
      clefSigMeterWidth: 0
    };
    Object.seal(this);
  }
}
