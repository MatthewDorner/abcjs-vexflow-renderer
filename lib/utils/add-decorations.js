import { Articulation } from 'vexflow/src/articulation';
import { Ornament } from 'vexflow/src/ornament';

export function addDecorations(noteToAdd, decorations) {
  if (decorations && decorations.length > 0) {
    decorations.forEach((decoration) => {
      switch (decoration) {
        case 'staccato':
          noteToAdd.addArticulation(0, new Articulation('a.').setPosition(3));
          break;
        case 'fermata':
          noteToAdd.addArticulation(0, new Articulation('a@a').setPosition(3));
          break;
        case 'trill':
          noteToAdd.addModifier(0, new Ornament('tr'));
          break;
        default:
          break;
      }
    });
  }
}
