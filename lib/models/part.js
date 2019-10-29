export default class Part {
  constructor(title) {
    this.title = title;
    this.bars = []; // the Bar class from bar.js
    Object.seal(this);
  }
}
