import generateBeamsCompound from './generate-beams-compound';
import getTabPosition from './get-tab-position';
import getKeys from './get-keys';
import getAccidentals from './get-accidentals';
import { getVexDuration, getVolta, getMeter, convertKeySignature } from './vex-utils';

const VexUtils = {
  generateBeamsCompound,
  getTabPosition,
  getKeys,
  getAccidentals,
  getVexDuration,
  getVolta,
  getMeter,
  convertKeySignature
};

export default VexUtils;
