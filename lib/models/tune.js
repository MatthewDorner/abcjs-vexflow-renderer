export default class Tune {
  constructor(tuneAttrs, renderOptions) {
    this.tuneAttrs = tuneAttrs;
    this.renderOptions = renderOptions;
    this.parts = []; // the Part class from bar.js
    Object.seal(this);
  }
}
