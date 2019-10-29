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
	widthFactor: 27, // note density
	lineHeight: 180,
	clefWidth: 40,
	meterWidth: 40,
	repeatWidthModifier: 35,
	dottedNotesModifier: 23,
	keySigAccidentalWidth: 20,
	minWidthMultiplier: 2,
	renderWidth: 800 // higher value to make music smaller
};

// process the parsed object
const tune = AbcjsVexFlowRenderer.getTune(abcText, renderOptions);

// draw to the vexflow context
AbcjsVexFlowRenderer.drawToContext(context, tune);
```

#### Testing
`npm run-script start` will launch an HTML visual comparison tool that shows ABC tunes rendered via abcjs' built-in renderer in comparison to this library. To supply a custom set of tunes to view in the visual comparison tool, place the file at src/tunes.txt. The `jest` command will run the unit test suite.

#### About
I created this library for my React Native app, [React Native Songbook](https://github.com/matthewdorner/react-native-songbook). I decided to write this code because I wanted to include guitar tab, because VexFlow works in React Native, and because I wanted precise control over positioning and spacing to make the content usable on phones and tablets. This library is able to automatically generate guitar tabs for most ABC tunes. "Most" means a single voice set to chords. More complex music may not render correctly, and it currently ignores ties, slurs, lyrics and grace notes although I intend to add support for those.
