import ABCJS from 'abcjs';

import generateVexObjects from './generate-vex-objects';
import removeEmptyBars from './remove-empty-bars';
import setBarPositions from './set-bar-positions';
import fillEmptySpace from './fill-empty-space';
import parseTuneStructure from './parse-tune-structure';
import VexUtils from '../vex-utils';

/**
 * Takes the ABC notation text, calls abcjs parseOnly method on it, and then returns a converted
 * Tune object that can be easily drawn using the drawToContext method.
 * @param   {string} abcString The ABC tune string
 * @param   {Object} renderOptions Options, should be documented more
 *
 * @returns {Object} the Tune object, ready to be drawn via drawToContext
 */
export default function getTune(abcString, renderOptions) {
  // GET THE PARSED OBJECT AND PROPERTIES
  const parsedObject = ABCJS.parseOnly(abcString);
  const tuneObjArray = parsedObject[0].lines
    .map(line => line.staff[0].voices[0])
    .reduce((acc, val) => acc.concat(val), []);

  if (!parsedObject[0].lines[0]) {
    return null; // what to return in this case?
  }

  // GET THE TUNE ATTRIBUTES
  const tuneAttrs = {
    meter: VexUtils.getMeter(abcString),
    clef: parsedObject[0].lines[0].staff[0].clef.type,
    abcKeySignature: parsedObject[0].lines[0].staff[0].key,
    vexKeySignature: VexUtils.convertKeySignature(parsedObject[0].lines[0].staff[0].key)
  };

  // PROCESS and return a Tune object ready to draw with drawToContext
  return fillEmptySpace(
    setBarPositions(
      removeEmptyBars(
        generateVexObjects(
          parseTuneStructure(tuneObjArray), tuneAttrs, renderOptions
        )
      )
    )
  );
}
