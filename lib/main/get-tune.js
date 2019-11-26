import ABCJS from 'abcjs';

import generateVexObjects from './generate-vex-objects';
import removeEmptyBars from './remove-empty-bars';
import setBarPositions from './set-bar-positions';
import fillEmptySpace from './fill-empty-space';
import parseTuneStructure from './parse-tune-structure';

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
  while (parsedObject[0].lines[0].subtitle) {
    parsedObject[0].lines.shift();
  }

  const tuneObjArray = parsedObject[0].lines
    .map(line => line.staff[0].voices[0])
    .reduce((acc, val) => acc.concat(val), []);

  if (!parsedObject[0].lines[0]) {
    return null;
  }

  let meter = '';
  const meterLine = abcString.split('\n').filter(line => line.charAt(0) === 'M')[0];
  if (meterLine) {
    const meterCleaned = meterLine.replace(' ', '');
    meter = meterCleaned.slice(2, meterCleaned.length);
  }

  if (meter === 'C') { meter = '4/4'; }
  if (meter === 'C|') { meter = '2/2'; }
  if (meter === '') { throw new Error('Meter (M:) was not found'); }

  // GET THE TUNE ATTRIBUTES. it's not really right to set global attributes
  // like this because they can change during the tune
  const tuneAttrs = {
    meter,
    clef: parsedObject[0].lines[0].staff[0].clef.type,
    abcKeySignature: parsedObject[0].lines[0].staff[0].key
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
