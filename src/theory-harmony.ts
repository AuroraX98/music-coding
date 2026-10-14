import harmonyPractice from './theory-harmony-practice.json';
import harmonyQuestions from './theory-harmony-questions.json';

/** Trusted lesson HTML written for the local Music Theory guide. */
const lessons: {id:string;title:string;summary:string;body:string}[] = [
  {
    id:'scales-major-minor',
    title:'Major and minor scales',
    summary:'Learn the gaps that build a scale, and why minor has several common forms.',
    body:`<p>A <strong>scale</strong> is a set of notes arranged from low to high. In the Western twelve-note system used here, a <strong>half step</strong> or semitone moves to the next piano key, including black keys. A <strong>whole step</strong> is two half steps. E–F and B–C are half steps even though both keys are white.</p>
<p>A major scale follows <strong>W W H W W W H</strong>. Start on C and you get C D E F G A B C. Start on D and you need D E F♯ G A B C♯ D to keep those same gaps. The pattern determines the sharps.</p>
<table><caption>Three common minor scales starting on A</caption><thead><tr><th scope='col'>Scale</th><th scope='col'>Notes</th></tr></thead><tbody><tr><th scope='row'>Natural minor</th><td>A B C D E F G A</td></tr><tr><th scope='row'>Harmonic minor</th><td>A B C D E F G♯ A</td></tr><tr><th scope='row'>Melodic minor, ascending</th><td>A B C D E F♯ G♯ A</td></tr></tbody></table>
<p>Natural minor follows <strong>W H W W H W W</strong>. Harmonic minor raises its seventh note. Ascending melodic minor raises its sixth and seventh. In classical practice, descending melodic minor commonly returns to natural minor; jazz often uses the raised form in both directions. These are common choices, not restrictions. Major and minor alone do not decide whether music feels happy or sad.</p>`
  },
  {
    id:'keys-tonic',
    title:'Keys, tonic, and key signatures',
    summary:'A key gives notes a musical center; a key signature tells you the usual sharps or flats.',
    body:`<p>The <strong>tonic</strong> is the note that feels most settled in a passage. In C major it is C; in A minor it is A. A <strong>key</strong> describes that center and the major or minor relationships around it. Music can use notes outside its main scale and still stay in the same key.</p>
<p>A <strong>key signature</strong> puts the usual sharps or flats at the start of written music. G major has one sharp, F♯. F major has one flat, B♭. A separately written sharp, flat, or natural is an <strong>accidental</strong>. It can change a note without changing the key of the whole song.</p>
<table><caption>Two different ways keys can be related</caption><thead><tr><th scope='col'>Relationship</th><th scope='col'>Example</th><th scope='col'>What they share</th></tr></thead><tbody><tr><th scope='row'>Relative major/minor</th><td>C major and A minor</td><td>The same key signature</td></tr><tr><th scope='row'>Parallel major/minor</th><td>C major and C minor</td><td>The same tonic</td></tr></tbody></table>
<p>A key signature alone cannot distinguish relative keys. Listen to which note and chord receive emphasis and where phrases settle. A song's first or last chord can be a clue, but it is not proof. Repeated notes, bass movement, and chord endings all help establish the center.</p>`
  },
  {
    id:'triads',
    title:'Building three-note chords',
    summary:'Major, minor, diminished, and augmented triads differ by just a few steps.',
    body:`<p>A <strong>chord</strong> combines notes heard together or understood together. A <strong>triad</strong> is a three-note chord built from a root, a third, and a fifth. The <strong>root</strong> names the chord. Count letter names to find the third and fifth: starting from C, C–D–E reaches the third, and C–D–E–F–G reaches the fifth.</p>
<table><caption>Four triad types with root C</caption><thead><tr><th scope='col'>Type</th><th scope='col'>Notes</th><th scope='col'>Semitones above root</th></tr></thead><tbody><tr><th scope='row'>Major</th><td>C E G</td><td>0, 4, 7</td></tr><tr><th scope='row'>Minor</th><td>C E♭ G</td><td>0, 3, 7</td></tr><tr><th scope='row'>Diminished</th><td>C E♭ G♭</td><td>0, 3, 6</td></tr><tr><th scope='row'>Augmented</th><td>C E G♯</td><td>0, 4, 8</td></tr></tbody></table>
<p>Major and minor differ in their third. Diminished has a minor third and a lowered fifth; augmented has a major third and a raised fifth. The distances above are measured from the root, not from the previous note.</p>
<p>The chord's notes can appear in different octaves or repeat. C E G C still belongs to a C major chord. Its root remains C even if another chord note is lowest. Chord type describes its construction; rhythm, instruments, and surrounding chords also shape how it feels.</p>`
  },
  {
    id:'diatonic-chords',
    title:'Chords inside a key and Roman numerals',
    summary:'Build chords from scale notes and name their place in the key.',
    body:`<p><strong>Diatonic</strong> means using notes from the scale being discussed. To build diatonic triads, start on each scale note and take every other scale note. In C major, starting on D gives D F A: a D minor chord. The scale contains E rather than E♭, but that does not make every chord major.</p>
<table><caption>Triads made only from C major's notes</caption><thead><tr><th scope='col'>Scale degree</th><th scope='col'>Chord</th><th scope='col'>Notes</th></tr></thead><tbody><tr><th scope='row'>I</th><td>C major</td><td>C E G</td></tr><tr><th scope='row'>ii</th><td>D minor</td><td>D F A</td></tr><tr><th scope='row'>iii</th><td>E minor</td><td>E G B</td></tr><tr><th scope='row'>IV</th><td>F major</td><td>F A C</td></tr><tr><th scope='row'>V</th><td>G major</td><td>G B D</td></tr><tr><th scope='row'>vi</th><td>A minor</td><td>A C E</td></tr><tr><th scope='row'>vii°</th><td>B diminished</td><td>B D F</td></tr></tbody></table>
<p>A <strong>scale degree</strong> is a note's numbered position in a scale. Roman numerals describe chords by the degree of their root. Uppercase means major, lowercase means minor, and ° means diminished. Major keys follow I, ii, iii, IV, V, vi, vii°.</p>
<p>The numerals make a progression portable: I–V–vi–IV is C–G–Am–F in C major, or D–A–Bm–G in D major. Minor-key harmony has more variants because musicians often raise the sixth or seventh note. Always check which scale form or altered notes the music actually uses.</p>`
  },
  {
    id:'progressions-cadences',
    title:'Progressions, chord roles, and endings',
    summary:'Hear how chords can create movement and different kinds of stopping points.',
    body:`<p>A <strong>chord progression</strong> is an ordered series of chords. In much Western tonal music, chords have familiar roles, called <strong>functions</strong>. The tonic chord, I, often feels settled. Chords such as ii and IV often prepare a move toward V. The dominant, V, often points back toward I. In C major, Dm–G–C demonstrates that movement.</p>
<p>One reason G–C can sound directed is that B in the G chord sits a half step below C. Moving B to C gives a small, clear motion. A G7 chord also includes F, which often moves down to E. These tendencies depend on the musical context.</p>
<table><caption>Common phrase endings, called cadences</caption><thead><tr><th scope='col'>Movement</th><th scope='col'>Common name</th><th scope='col'>In C major</th></tr></thead><tbody><tr><th scope='row'>V–I</th><td>Authentic</td><td>G–C</td></tr><tr><th scope='row'>Ends on V</th><td>Half</td><td>Dm–G</td></tr><tr><th scope='row'>IV–I</th><td>Plagal</td><td>F–C</td></tr><tr><th scope='row'>V–vi</th><td>Deceptive</td><td>G–Am</td></tr></tbody></table>
<p>A cadence is a phrase ending, not just any two adjacent chords. Rhythm, melody, bass, and timing help make it feel like an ending. Loop-based music may avoid a firm stop. These labels describe common patterns; they do not tell you which progression you must write.</p>`
  },
  {
    id:'inversions-voice-leading',
    title:'Inversions and smooth chord changes',
    summary:'Keep the same chord while changing its lowest note or the spacing of its notes.',
    body:`<p>An <strong>inversion</strong> changes which chord note is lowest. C E G has C in the bass and is in root position. E G C puts the third in the bass: first inversion. G C E puts the fifth in the bass: second inversion. All three are still C major.</p>
<p>A <strong>slash chord</strong> writes the bass after a slash. C/E means a C chord with E as its lowest note. A slash bass does not have to belong to the chord, so not every slash chord is an inversion.</p>
<p><strong>Voicing</strong> means how you arrange the chord's notes across octaves and instruments. <strong>Voice leading</strong> means how each individual part moves from one chord to the next. A voice can be a synth note or an instrument part; it need not be a singer.</p>
<table><caption>A small movement from C major to A minor</caption><thead><tr><th scope='col'>Part</th><th scope='col'>First chord</th><th scope='col'>Next chord</th></tr></thead><tbody><tr><th scope='row'>Low</th><td>C4</td><td>C4</td></tr><tr><th scope='row'>Middle</th><td>E4</td><td>E4</td></tr><tr><th scope='row'>High</th><td>G4</td><td>A4</td></tr></tbody></table>
<p>Two notes stay and one moves, creating a smooth change into Am/C. You can instead choose a large leap for a clear change of energy. Smooth movement is an available sound, not a requirement.</p>`
  },
  {
    id:'chord-numbers',
    title:'Sevenths, added notes, and suspended chords',
    summary:'Read chord labels such as C7, Cmaj7, Cadd9, and Csus4.',
    body:`<p>Chord numbers refer to intervals counted from the root using scale letters. In C, the seventh is some kind of B. The ninth is D an octave above the second; the eleventh corresponds to F, and the thirteenth to A. Actual voicings may place these notes in other octaves.</p>
<table><caption>Common labels built on C</caption><thead><tr><th scope='col'>Label</th><th scope='col'>Basic notes</th><th scope='col'>Meaning</th></tr></thead><tbody><tr><th scope='row'>Cmaj7</th><td>C E G B</td><td>Major triad plus major seventh</td></tr><tr><th scope='row'>C7</th><td>C E G B♭</td><td>Major triad plus minor seventh</td></tr><tr><th scope='row'>Cm7</th><td>C E♭ G B♭</td><td>Minor triad plus minor seventh</td></tr><tr><th scope='row'>Cadd9</th><td>C E G D</td><td>Add the ninth, with no seventh implied</td></tr><tr><th scope='row'>Csus2</th><td>C D G</td><td>Replace the third with the second</td></tr><tr><th scope='row'>Csus4</th><td>C F G</td><td>Replace the third with the fourth</td></tr></tbody></table>
<p>C9 normally includes the minor seventh B♭ as well as D; Cmaj9 uses B instead. Extended chords such as ninths, elevenths, and thirteenths build beyond a seventh. Musicians often omit some notes, especially the fifth, to keep the sound clear.</p>
<p><strong>Suspended</strong> chords replace the third; <strong>add</strong> chords keep it. Suspended chords can resolve to an ordinary triad, but they can also remain unchanged. The notation describes notes, not a compulsory next chord.</p>`
  },
  {
    id:'modes-and-small-scales',
    title:'Modes, pentatonic scales, and blues notes',
    summary:'Explore other note collections without assuming that the first note sets the key.',
    body:`<p>A <strong>mode</strong> has its own pattern of steps around a tonic. The familiar seven modes can share the notes of a major scale but emphasize different tonics. Playing C major's notes from D to D gives Dorian's steps, but music sounds Dorian only when D actually feels like the center.</p>
<table><caption>Modes compared with the same-root major scale</caption><thead><tr><th scope='col'>Mode</th><th scope='col'>Changed scale degrees</th></tr></thead><tbody><tr><th scope='row'>Ionian</th><td>None: the major scale</td></tr><tr><th scope='row'>Dorian</th><td>Lower 3 and 7</td></tr><tr><th scope='row'>Phrygian</th><td>Lower 2, 3, 6, 7</td></tr><tr><th scope='row'>Lydian</th><td>Raise 4</td></tr><tr><th scope='row'>Mixolydian</th><td>Lower 7</td></tr><tr><th scope='row'>Aeolian</th><td>Lower 3, 6, 7: natural minor</td></tr><tr><th scope='row'>Locrian</th><td>Lower 2, 3, 5, 6, 7</td></tr></tbody></table>
<p><strong>Pentatonic</strong> means five notes per octave. C major pentatonic is C D E G A; A minor pentatonic is A C D E G. They share notes but have different centers.</p>
<p>A common A minor blues scale adds E♭: A C D E♭ E G. Real blues also uses bends, slides, rhythm, and pitches between fixed piano keys. A six-note scale is one useful tool, not a full description of blues. Use a repeated bass note or chord to make the intended tonic easier to hear.</p>`
  },
  {
    id:'outside-the-key',
    title:'Notes outside the key and changing keys',
    summary:'Distinguish a passing note, a borrowed chord, a brief new focus, and a lasting key change.',
    body:`<p><strong>Chromatic</strong> notes lie outside the scale currently being used. A chromatic scale uses all twelve pitch classes in half steps. A <strong>pitch class</strong> groups versions of the same note across octaves, such as every C. In a C-major melody, C–C♯–D uses C♯ as a passing step; that single note need not change the key.</p>
<p><strong>Borrowing</strong>, also called modal mixture, uses a chord from a parallel scale while keeping the tonic. In C major, Fm can be borrowed from C minor: its A♭ is outside C major. The movement F–Fm–C keeps C as the center while one note changes from A to A♭ and then G.</p>
<p>A <strong>secondary dominant</strong> briefly points toward another chord. In C major, D7–G uses F♯ to strengthen the move to G. D7 is called V of V because it is the dominant of the key's dominant chord. This brief focus is called <strong>tonicization</strong>.</p>
<p><strong>Modulation</strong> establishes a new key for a passage. Repetition, melody, bass, and cadences can make G feel like the new tonic instead of a temporary destination. There is no fixed number of outside notes that proves a key change. Listen to the musical center over time.</p>`
  },
];

export const harmonyLessons = lessons.map(lesson => ({...lesson, questions: harmonyQuestions[lesson.id as keyof typeof harmonyQuestions], practice: harmonyPractice[lesson.id as keyof typeof harmonyPractice]}));
