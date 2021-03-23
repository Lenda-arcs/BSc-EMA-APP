import Slide from "../models/slide";
import * as QUESTIONS from '../data/questionItems-data'


//
const descriptionDemoDE = 'Beantworte zunächst ein paar Fragen zu Deiner Person.'
const descriptionDemoEN = '...'

const descriptionDE = 'Bitte wähle anhand der Skala aus, wie sehr die Aussage in diesem Moment auf Dich zutrifft.'
const descriptionEN = '...'

// ToDo: find good solution for language switch
// --> could use array in "description" field for different languages

const ASSESSMENT_SLIDES = [
    new Slide('demo', descriptionDemoDE, false, QUESTIONS.DEMO_QUESTIONS),
    new Slide('affect', descriptionDE, true, QUESTIONS.AFFECT_QUESTIONS.slice(0,7)),
    new Slide('affect-ruminate', descriptionDE, true, QUESTIONS.AFFECT_QUESTIONS.slice(8).concat(QUESTIONS.RUMINATE_QUESTIONS)),
    new Slide('stress-pre', descriptionDE, true, QUESTIONS.STRESS_QUESTIONS.concat(QUESTIONS.PRE_QUESTIONS)),
    new Slide('effect', descriptionDE, false, QUESTIONS.EFFECT_QUESTIONS ),
]

export default ASSESSMENT_SLIDES

