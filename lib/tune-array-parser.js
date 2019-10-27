import BarRegion from './models/bar-region';
import PartRegion from './models/part-region';

export default {

  /**
   * Takes the abcjs parser output array representing the entire tune, and return
   * an array of PartRegions, each of which contains the portion of that array
   * representing a single part.
   * @param   {Array} tuneObjArray The array representing the tune
   *
   * @returns {Array} The array of PartRegions
   */
  parseTuneStructure(tuneObjArray) {
    const partRegions = []; // array of PartRegion objects to return

    // variables that hold parser state + initialization of those
    let currentPart = new PartRegion('default');
    let currentPartObjects = [];

    tuneObjArray.forEach((obj) => {
      switch (obj.el_type) {
        case 'part':
          if (currentPartObjects.length === 0) {
            // if the current part is still empty, just rename the current part
            currentPart.title = obj.title;
          } else {
            // convert and apply bars to part, push to partRegions[]
            currentPart.barRegions = this.parsePartStructure(currentPartObjects);
            partRegions.push(currentPart);
            // reset the state variables
            currentPart = new PartRegion(obj.title);
            currentPartObjects = [];
          }
          break;
        default:
          currentPartObjects.push(obj);
          break;
      }
    });

    // deal with the final part also ignore final part if it's empty
    if (currentPartObjects.length > 0) {
      currentPart.barRegions = this.parsePartStructure(currentPartObjects);
      partRegions.push(currentPart);
    }
    return partRegions;
  },

  /**
   * Takes the abcjs parser output array segment representing a single part, and return
   * an array of BarRegions, each of which contains the portion of that array
   * representing a single bar.
   * @param   {Array} partObjArray The array representing the part
   *
   * @returns {Array} The array of BarRegions
   */
  parsePartStructure(partObjArray) {
    const barRegions = []; // array of BarRegion objects to return

    // variables that hold parser state + initialization of those
    let currentBar = new BarRegion();
    let currentBarObjects = [];

    partObjArray.forEach((obj, i) => {
      switch (obj.el_type) {
        case 'bar':
          if (i === 0) { // if it's the very first obj, just apply it to the (empty) currentBar
            currentBar.startBarLine = obj;
          } else { // apply the current bar and push
            currentBar.endBarLine = obj;
            currentBar.contents = currentBarObjects;
            barRegions.push(currentBar);
          }
          if (i !== obj.length) { // reset the state 2 prepare for next bar
            currentBar = new BarRegion();
            currentBarObjects = [];
            currentBar.startBarLine = obj;
          }
          break;
        default:
          currentBarObjects.push(obj);
          break;
      }
    });

    // deal with the last bar (if the last object was a barline, this shouldn't execute)
    if (currentBarObjects.length > 0) {
      currentBar.contents = currentBarObjects;
      barRegions.push(currentBar);
    }
    return barRegions;
  }
};
