export default class Tune {
  constructor(tuneAttrs, renderOptions) {
    this.tuneAttrs = tuneAttrs;
    this.renderOptions = renderOptions;
    this.parts = []; // the Part class from part.js
    Object.seal(this);
  }
}
