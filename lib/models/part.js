export default class Part {
  constructor(title) {
    this.title = title; // i don't really use this...
    this.bars = []; // the Bar class from bar.js
    Object.seal(this);
  }
}
