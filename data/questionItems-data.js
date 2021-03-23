import QuestionItem from '../models/questionItem'

const likertGerman = ['trifft zu','trifft eher zu','teils-teils','trifft eher nicht zu','trifft nicht zu',]
const likertEnglish = ['trifft zu','trifft eher zu','teils-teils','trifft eher nicht zu','trifft nicht zu',]

const binaryGerman = ['Ja', 'Nein']
const binaryEnglish = ['Yes', 'No']



export const DEMO_QUESTIONS = [
    new QuestionItem(
        'd1',
        'Was ist Dein Geschlecht?',
        ['Weiblich', 'Männlich', 'Divers']
    ),
    new QuestionItem(
        'd2',
        'Was ist Dein höchste Bildungsabschluss?',
        ['Mittelschule', 'Abitur oder gleichwertiger Abschluss', 'Bachelor-Abschluss', 'Master-Abschluss', 'Doktor-Grad']
    ),
    new QuestionItem(
        'd3',
        'Welche dieser Kategorien beschreibt Deinen aktuellen Beschäftiungsstatus?',
        ['Student', 'Angestellt', 'Ohne Beschäftigung', 'Pensioniert oder Rente', 'Selbstständig']
    ), new QuestionItem(
        'd4',
        'Was ist Dein aktueller Familienstand',
        ['Verheiratet', 'Verwitwet', 'Gecheiden', 'Getrennt', 'Ledig']
    )
]


export const AFFECT_QUESTIONS = [
    // AssessmentScreen
    new QuestionItem(
        'a1',
        'Ich fühle mich gerade müde',
        likertGerman
    ),
    new QuestionItem(
        'a2',
        'Ich fühle mich gerade angespannt',
        likertGerman
    ),
    new QuestionItem(
        'a3',
        'Ich fühle mich gerade lebhaft',
        likertGerman
    ),
    new QuestionItem(
        'a4',
        'Ich fühle mich gerade trauig',
        likertGerman
    ),
    new QuestionItem(
        'a5',
        'Ich fühle mich gerade ruhig',
        likertGerman
    ),
    new QuestionItem(
        'a6',
        'Ich fühle mich gerade glücklich',
        likertGerman
    ),
    new QuestionItem(
        'a7',
        'Ich fühle mich gerade gelassen',
        likertGerman
    ),
    new QuestionItem(
        'a8',
        'Ich fühle mich gerade fröhlich',
        likertGerman
    ),
    new QuestionItem(
        'a9',
        'Ich fühle mich gerade schlapp',
        likertGerman
    ),
    new QuestionItem(
        'a10',
        'Ich fühle mich gerade niedergeschlagen',
        likertGerman
    ),
    new QuestionItem(
        'a11',
        'Ich fühle mich gerade wach',
        likertGerman
    ),
    new QuestionItem(
        'a12',
        'Ich fühle mich gerade nervös',
        likertGerman
    )]
export const RUMINATE_QUESTIONS = [
    // AssessmentScreenRumination
    new QuestionItem(
        'r1',
        'Ich habe gerade gegrübelt',
        likertGerman
    ),
    new QuestionItem(
        'r2',
        'Ich mache mir gerade Sorgen gemacht',
        likertGerman
    ),
    new QuestionItem(
        'r3',
        'Ich hatte gerade wiederkehrende Gedanken',
        likertGerman
    )]

export const STRESS_QUESTIONS = [
    new QuestionItem(
        's1',
        'Wie gut kannst Du dich gerade konzentieren?',
        likertGerman
    ),
    new QuestionItem(
        's2',
        'Wie viel Stress erlebst Du in diesem Moment?',
        likertGerman
    )]


export const PRE_QUESTIONS = [
    new QuestionItem(
        'p1',
        'Wo befindest Du dich gerade?',
        ['geschlossener Raum', 'unter freiem Himmel']
    ),
    new QuestionItem(
        'p2',
        'Ich bin gerade...',
        ['allein', 'in Gesellschaft von Leuten die ich gut kenne', 'in Gesellschaft unter fremden Menschen']
    ),
    new QuestionItem(
        'p3',
        'Hast Du dich gerade geistig angestrengt?',
        likertGerman
    ),
    new QuestionItem(
        'p4',
        'Hast Du dich gerade körperlich angestrengt?',
        likertGerman
    ),
    new QuestionItem(
        'p5',
        'Hast Du gerade Freizeit?',
        binaryGerman
    ),
    new QuestionItem(
        'p6',
        'Wie sehr hast Du den Himmel vor der Fotoaufnahme wahrgenommen?',
        likertGerman
    )]

export const  EFFECT_QUESTIONS = [

    // AssessmentScreenPrePost
    new QuestionItem(
        'pp1',
        'Hast Du persönlich das Gefühl, das die Art der Wolken Deine Stimmung beeinflusst?',
        likertGerman
    ),
    new QuestionItem(
        'pp2',
        'Hast Du persönlich das Gefühl, das die Art der Wolken Dein Stressleben beeinflusst?',
        likertGerman
    ),
]
