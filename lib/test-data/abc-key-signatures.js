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

const DMajor = {
  accidentals: [
    {
      acc: 'sharp',
      note: 'c'
    },
    {
      acc: 'sharp',
      note: 'f'
    }

  ]

};

const AbcKeySignatures = { CMajor, DMajor, GMajor, BFlatMajor };
export default AbcKeySignatures;
