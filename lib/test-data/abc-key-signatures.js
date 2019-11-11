import DeepFreeze from 'deep-freeze';

const GMajor = {
  accidentals: [
    {
      note: 'f',
      acc: 'sharp'
    }
  ]
};

const CMajor = {
  accidentals: []
};

const BFlatMajor = {
  accidentals: [
    {
      acc: 'flat',
      note: 'B' // 'B' is actually how it comes from the abcjs parser
    },
    {
      acc: 'flat',
      note: 'e'
    }
  ]
};
const AbcKeySignatures = { CMajor, GMajor, BFlatMajor };
DeepFreeze(AbcKeySignatures);
export default AbcKeySignatures;
