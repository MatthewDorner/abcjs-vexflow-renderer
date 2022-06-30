/**
 * Takes an ABCJS parser output obj to extract the start/end curve (tie/slur)
 * markers that are attached to the obj or individual pitches in the obj. The .curves[] array
 * will be used later on to create the VexFlow Curve objects. Can't create them here because we
 * need to position the bars first before we can create the Curves, in order to be able to handle curves
 * that go across line breaks.
 *
 * @param   {Array}     curves    the Part.curves[] array as it exists so far
 * @param   {object}    obj       the obj element from the abcjs parser output array
 * @param   {StaveNote} noteToAdd the VexFlow note that was created earlier in the GenerateVexObjects loop iteration
 *
 * @returns {Array} updated curves[] with the relevant curve markers added with a reference to noteToAdd
 */
export function getCurves(curves, obj, noteToAdd) {
  const newCurves = [...curves];

  // handle curves on obj
  if (obj.startSlur) {
    obj.startSlur.forEach(() => {
      newCurves.push({
        startNote: noteToAdd
      });
    });
  }
  if (obj.endSlur) {
    obj.endSlur.forEach(() => {
      let i = newCurves.length - 1;
      while (i >= 0) {
        if (!newCurves[i].endNote) {
          newCurves[i].endNote = noteToAdd;
          break;
        }
        i -= 1;
      }
    });
  }

  // handle curves on pitch
  obj.pitches.forEach((pitch) => {
    if (pitch.startTie) {
      newCurves.push({
        startNote: noteToAdd
      });
    }
    if (pitch.endTie) {
      newCurves[newCurves.length - 1].endNote = noteToAdd;
      let i = newCurves.length - 1;
      while (i >= 0) {
        if (!newCurves[i].endNote) {
          newCurves[i].endNote = noteToAdd;
          break;
        }
        i -= 1;
      }
    }
    if (pitch.startSlur) {
      pitch.startSlur.forEach(() => {
        newCurves.push({
          startNote: noteToAdd
        });
      });
    }
    if (pitch.endSlur) {
      pitch.endSlur.forEach(() => {
        let i = newCurves.length - 1;
        while (i >= 0) {
          if (!newCurves[i].endNote) {
            newCurves[i].endNote = noteToAdd;
            break;
          }
          i -= 1;
        }
      });
    }
  });

  return newCurves;
}
