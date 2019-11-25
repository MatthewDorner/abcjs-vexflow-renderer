import { Beam } from 'vexflow/src/beam';

/**
 * Takes an array of the StaveNotes in a measure, and returns an array
 * of Beams. This is only for compound time signatures (3/8, 6/8,
 * 9/8, 12/8) as VexFlow's built-in beaming code hasn't worked for this.
 * This method doesn't need to know exactly what the time signature is,
 * just that it's compound something/8.
 * @param   {Array} notes the StaveNotes in this bar
 *
 * @returns {Array} the Beams for this bar
 */
export default function generateBeamsCompound(notes) {
  let timeLeft = 0.375;
  let notesToBeam = [];
  const beams = [];

  notes.forEach((note) => {
    let duration; let isRest;

    if (note.duration.includes('r')) {
      duration = 1 / (note.duration.slice(0, note.duration.indexOf('r')));
      isRest = true;
    } else {
      duration = 1 / note.duration;
      isRest = false;
    }

    if (note.tuplet) { duration *= (note.tuplet.notes_occupied / note.tuplet.num_notes); }

    switch (note.dots) {
      case 0:
        break;
      case 1:
        duration *= 1.5;
        break;
      case 2:
        duration *= 1.75;
        break;
      case 3:
        duration *= 1.875;
        break;
      default:
        break;
    }

    if (duration >= 0.250 || timeLeft <= 0) { // purge existing beams
      if (notesToBeam.length > 1) {
        beams.push(setStemDirectionandGenerateBeam(notesToBeam));
      }
      if (timeLeft <= 0) {
        timeLeft += 0.375;
      }
      notesToBeam = [];
    }

    if (duration < 0.250 && timeLeft >= duration && !isRest) {
      notesToBeam.push(note);
    }
    timeLeft -= duration;
  });

  // deal w/ notes left over at end of iterations
  if (notesToBeam.length > 1) {
    beams.push(setStemDirectionandGenerateBeam(notesToBeam));
  }

  return beams;
}

/**
 * Takes an array of the StaveNotes to be beamed, sets
 * the stem_direction of each note to be the same as the
 * first note, and returns a Beam of those notes.
 * @param   {Array} notes the StaveNotes to beam, should have
 * length greater than 1, otherwise there's no point.
 *
 * @returns {Array} the Beam of the notes.
 */
function setStemDirectionandGenerateBeam(notesToBeam) {
  const direction = notesToBeam[0].getStemDirection();
  notesToBeam.forEach((noteToBeam) => {
    noteToBeam.setStemDirection(direction);
  });
  return new Beam(notesToBeam);
}
