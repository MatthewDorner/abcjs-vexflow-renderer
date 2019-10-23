export default {
  parsePartStructure(partObjArray) {
    const barRegions = []; // array of BarRegion objects to return
    function BarRegion() {
      this.startBarLine = {};
      this.endBarLine = {};
      this.contents = [];
    }

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
  },

  parseTuneStructure(tuneObjArray) {
    const partRegions = []; // array of PartRegion objects to return
    function PartRegion(title) {
      this.title = title;
      this.barRegions = []; // the BarRegion object defined in parsePartStructure()
    }

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
            currentPartObjects = [];
            currentPart = new PartRegion(obj.title);
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
  }
};
