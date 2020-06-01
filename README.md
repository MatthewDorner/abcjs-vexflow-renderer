# abcjs-vexflow-renderer
### VexFlow renderer for abcjs. Usage:

```
import { AbcjsVexFlowRenderer, Vex } from 'abcjs-vexflow-renderer';
import abcText from './abc_tune.txt';

const whereToRender = document.getElementById('musicDiv');

// generate a VexFlow renderer & context
const renderer = new Vex.Flow.Renderer(whereToRender, Vex.Flow.Renderer.Backends.SVG);
renderer.resize(500, 500);
const context = renderer.getContext();

// set up rendering options
const renderOptions = {
  xOffset: 3,
  widthFactor: 1.7,
  lineHeight: 185,
  clefWidth: 45,
  meterWidth: 30,
  repeatWidthModifier: 35,
  keySigAccidentalWidth: 20,
  tabsVisibility: 1,
  voltaHeight: 25,
  renderWidth: 500,
  tuning: { tuning: ['e/3', 'a/3', 'd/4', 'g/4', 'b/4', 'e/5'], showFingerings: false }
};

// process the parsed object
const tune = AbcjsVexFlowRenderer.getTune(abcText, renderOptions);

// draw to the vexflow context
AbcjsVexFlowRenderer.drawToContext(context, tune);
```

#### Testing and Development

`git clone https://github.com/MatthewDorner/abcjs-vexflow-renderer`

`cd abcjs-vexflow-renderer`

`yarn`


Once environment is ready, `npm run-script start` will launch an HTML visual comparison tool that shows ABC tunes rendered via abcjs' built-in renderer in comparison to this library. To supply a custom set of tunes, place the file at visual-tool/tunes.txt. The `jest` command will run the unit test suite, and `jest --coverage` will produce an HTML unit test coverage report.

#### About
I created this library for my React Native app, [React Native Songbook](https://github.com/matthewdorner/react-native-songbook). I decided to write this code because I wanted to include guitar tab, because VexFlow works in React Native, and because I wanted precise control over positioning and spacing to make the content usable on phones and tablets. This library is able to automatically generate guitar tabs for most ABC tunes. "Most" means a single voice set to chords. More complex music may not render correctly, and not all ABC features are implemented.

Features currently supported:
- Repeat signs
- Multiple endings
- Chord symbols
- Grace Notes
- Tuplets
- Some ornamentation (trill, staccato, fermata)
- Custom tunings for tab
- Violin fingerings for tab

Features not supported, TODO:
- Multiple voices
- Lyrics
- Ties
- Slurs
- Non-treble clef
- Transposition
