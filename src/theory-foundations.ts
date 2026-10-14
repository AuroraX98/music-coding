const foundationTexts = [
  {
    id:'sound-pitch-volume-tone',
    title:'Sound, pitch, volume, and tone',
    summary:'Separate how high a sound is, how loud it is, and what makes it recognizable.',
    body:`<h3>One sound has several qualities</h3>
<p>Sound begins with vibration. A speaker moves back and forth, making changes in air pressure that reach your ears. Music uses these vibrations in many ways.</p>
<p><strong>Pitch</strong> is how high or low a sound seems. A regularly repeating vibration usually gives a clear pitch. Its frequency is the number of repeats per second, measured in Hertz, or Hz. Faster repetition generally means higher pitch. Doubling a frequency raises it by one octave.</p>
<p><strong>Volume</strong> controls the sound level. Larger vibrations usually sound louder, but your ears also respond differently to different pitches. A higher note is not automatically a louder note.</p>
<p><strong>Timbre</strong>, pronounced “TAM-ber,” means tone quality. A flute and a piano can play the same pitch at a similar loudness and still sound different. Their mixtures of vibrations differ, as do the ways their sounds begin and fade.</p>
<p>Many drum and noise sounds have no single clear pitch. They still have loudness, tone quality, and timing. In this app, notes mainly choose pitch, sound chooses the instrument, and volume changes level. These controls work together.</p>`
  },
  {
    id:'pulse-beat-tempo',
    title:'Pulse, beats, and tempo',
    summary:'Understand the steady count beneath a rhythm and how quickly it moves.',
    body:`<h3>The count underneath the sounds</h3>
<p>A <strong>pulse</strong> is a regular series of moments you can count or tap. Each moment is a <strong>beat</strong>. A song can have a clear beat even when no instrument makes a sound exactly on every beat.</p>
<p><strong>Tempo</strong> tells you how quickly those beats pass. BPM means beats per minute. At 60 BPM, a beat lasts one second. At 120 BPM, two beats pass each second, so each beat lasts half a second.</p>
<p>Tempo and note count are different. Two notes can fit inside one beat, or one note can last for several beats. Adding more notes can make music feel busier without changing its tempo. A repeating pattern can also run faster while the shared beat stays steady.</p>
<p>A <strong>metronome</strong> makes a regular click to mark the beat. Musicians can follow a steady tempo, gradually speed up, gradually slow down, or play with flexible timing. Some music does not use a regular pulse at all.</p>
<p>In this app, the song tempo provides the shared clock. The faster and slower commands change a pattern's timing against that clock. They do not change the song's BPM setting.</p>`
  },
  {
    id:'rhythm-rests-subdivision',
    title:'Rhythm, rests, and swing',
    summary:'Learn how sounds and silences form patterns within a beat.',
    body:`<h3>Where sounds begin and how long they last</h3>
<p><strong>Rhythm</strong> is the pattern of sounds and silences through time. It includes when events begin, how long they last, and how they relate to the beat. A <strong>rest</strong> is an intentional span without a new note in that part. Other instruments can keep playing through it.</p>
<p>A <strong>subdivision</strong> splits a beat into smaller parts. Two equal parts can be counted “one-and.” Four can be counted “one-e-and-a.” These words help keep the parts evenly spaced; they are not extra beats.</p>
<p><strong>Straight</strong> timing gives equal length to equal subdivisions. <strong>Swing</strong> changes some pairs into a longer first part and a shorter second part. Swing is not one fixed ratio: its amount depends on the style, tempo, and player. A triplet-like long-short pair is one common example.</p>
<p>An <strong>accent</strong> gives a note extra emphasis. <strong>Syncopation</strong> emphasizes a normally weaker position, or carries a note across an expected strong beat. Neither requires changing the tempo.</p>
<p>Rhythm and sound length also differ. A short drum can leave space before the next hit; a ringing instrument can overlap it. The events may still begin at exactly the same times.</p>`
  },
  {
    id:'bars-meter-accent',
    title:'Bars, meter, and strong beats',
    summary:'Compare groups of three, groups of four, and the two large beats of 6/8.',
    body:`<h3>Beats can form repeating groups</h3>
<p>A <strong>bar</strong>, also called a measure, groups musical time. <strong>Meter</strong> describes a repeating pattern of stronger and weaker positions. The first beat often feels strongest, but musicians can emphasize other places too.</p>
<p>A written <strong>time signature</strong> has two numbers. The lower number names a note value: 4 means a quarter note, and 8 means an eighth note. The upper number tells how many of that value fit in a bar.</p>
<ul>
<li><strong>3/4:</strong> three quarter notes fit in a bar. It commonly feels like three beats: ONE, two, three.</li>
<li><strong>4/4:</strong> four quarter notes fit in a bar. It commonly feels like four beats: ONE, two, three, four.</li>
<li><strong>6/8:</strong> six eighth notes fit in a bar. It commonly feels like two larger beats, each divided into three: ONE-two-three, FOUR-five-six.</li>
</ul>
<p>Although 3/4 and 6/8 contain the same total written note value, their usual groupings differ. These are common uses in Western notation, not requirements for every musical tradition or performance.</p>
<p>This app's beats per bar setting counts tempo beats in a bar; it does not store a time signature's lower number. To create a typical 6/8 feel, you can use two tempo beats and divide each into three. Choosing six beats alone does not create that grouping.</p>`
  },
  {
    id:'note-names-accidentals',
    title:'Note names, sharps, and flats',
    summary:'Read A through G, understand accidentals, and see why one key can have two names.',
    body:`<h3>Seven letters repeat</h3>
<p>In common Western notation, note letters run A, B, C, D, E, F, G, then begin again at A. Moving to the next letter does not always mean moving the same pitch distance.</p>
<p>An <strong>accidental</strong> changes a written note. A <strong>sharp</strong>, written ♯ or #, raises it by one semitone. A <strong>flat</strong>, written ♭ or b, lowers it by one semitone. A <strong>natural</strong>, written ♮, cancels a sharp or flat in the relevant notation context. A semitone is the distance between neighboring piano keys, including black keys.</p>
<p>For example, C♯ lies one key above C. D♭ lies one key below D. On a normally tuned modern piano, these names point to the same key. Such spellings are called <strong>enharmonic</strong>. Their different names can show how a note belongs to a scale or chord.</p>
<p>This equality depends on the tuning system. In other tunings, notes spelled C♯ and D♭ need not have exactly the same frequency.</p>
<p>There is no black key between E and F, or between B and C. Those neighboring white keys are already a semitone apart. A sharp can therefore name a white key: E♯ uses the F key on a modern piano.</p>`
  },
  {
    id:'keyboard-octaves-register',
    title:'The keyboard, octaves, and register',
    summary:'Find notes on a piano and understand the number in a name such as C4.',
    body:`<h3>Recognize the repeating keyboard pattern</h3>
<p>A piano's black keys form groups of two and three. C is the white key immediately to the left of a group of two black keys. Moving right from C, the white keys are C, D, E, F, G, A, B, then C again.</p>
<p>The distance from one C to the next C is an <strong>octave</strong>. It contains twelve semitone steps. In the usual tuning, the higher C vibrates twice as fast as the lower one. The notes share a letter name, but they are different pitches.</p>
<p>The number in <strong>C4</strong> identifies its octave. In this app's naming system, C4 is middle C. The number changes when you pass from B to C: B3 is followed by C4, and B4 by C5. Some other music software labels octaves differently, even when it plays the same pitch.</p>
<p><strong>Register</strong> means a general area of pitch, such as low, middle, or high. Moving a melody to another register can change how clear, heavy, or bright it feels.</p>
<p>Real instruments and voices have different ranges. A part that is easy for one instrument may be too high or low for another.</p>`
  },
  {
    id:'intervals-pitch-distance',
    title:'Intervals: the distance between notes',
    summary:'Count semitones and letter names, then connect the two ways of naming pitch distance.',
    body:`<h3>Compare two pitches</h3>
<p>An <strong>interval</strong> is the distance between two pitches. Notes played one after another form a melodic interval. Notes played together form a harmonic interval.</p>
<p>A <strong>semitone</strong> is one step between neighboring piano keys, including black keys. A <strong>tone</strong>, also called a whole step, is two semitones. Notes at the same pitch form a <strong>unison</strong>. An <strong>octave</strong> spans twelve semitones in the usual twelve-note system.</p>
<p>Interval names also count letters, including both ends. C to E counts C-D-E, so it is a third. C to G is a fifth. The words major, minor, and perfect make the distance more exact.</p>
<table><caption>Common intervals measured upward from C</caption><thead><tr><th scope="col">Notes</th><th scope="col">Name</th><th scope="col">Semitones</th></tr></thead><tbody>
<tr><td>C–C</td><td>Unison</td><td>0</td></tr><tr><td>C–D</td><td>Major second</td><td>2</td></tr><tr><td>C–E♭</td><td>Minor third</td><td>3</td></tr><tr><td>C–E</td><td>Major third</td><td>4</td></tr><tr><td>C–F</td><td>Perfect fourth</td><td>5</td></tr><tr><td>C–G</td><td>Perfect fifth</td><td>7</td></tr><tr><td>C–A</td><td>Major sixth</td><td>9</td></tr><tr><td>C–B</td><td>Major seventh</td><td>11</td></tr><tr><td>C–next C</td><td>Octave</td><td>12</td></tr>
</tbody></table>
<p><strong>Consonance</strong> often describes a sense of blending or stability; <strong>dissonance</strong> often describes tension. These qualities depend on tuning, sound, musical context, and listening traditions. Tension is a useful musical choice, not a mistake.</p>`
  },
  {
    id:'reading-written-music',
    title:'Reading written music',
    summary:'Meet the staff, clefs, note lengths, rests, ties, dots, and tuplets.',
    body:`<h3>Marks for pitch and time</h3>
<p>A <strong>staff</strong> has five horizontal lines. A note's position on a line or in a space shows its pitch. Short extra lines, called ledger lines, extend the range. A <strong>clef</strong> identifies reference pitches: treble clef marks G on the second line from the bottom; bass clef marks F on the second line from the top.</p>
<p>A note's shape shows its relative length. One whole note equals two half notes, four quarter notes, eight eighth notes, or sixteen sixteenth notes. A quarter note lasts one beat when the quarter note is the chosen beat unit. These lengths are not fixed numbers of seconds: tempo determines that.</p>
<p><strong>Rests</strong> have symbols for the same time values. A <strong>tie</strong> joins notes at the same pitch into one continuous duration, without another attack. A similar curved mark over different notes is a <strong>slur</strong>, which usually asks for connected playing.</p>
<p>A <strong>dot</strong> after a note adds half its value. A dotted quarter therefore lasts as long as three eighth notes. A second dot adds half as much as the first dot.</p>
<p>A <strong>tuplet</strong> fits a different number of equal notes into an expected span. A common example is three eighth-note triplets in the time normally taken by two eighth notes. A number, sometimes with a bracket, identifies the grouping.</p>`
  },
] as const;

type QuestionInput = readonly [prompt:string,options:readonly string[],answer:number,explanation:string];
const questions=(items:readonly QuestionInput[])=>items.map(([prompt,options,answer,explanation])=>({prompt,options:[...options],answer,explanation}));

const foundationQuestions:Record<typeof foundationTexts[number]['id'],ReturnType<typeof questions>>={
  'sound-pitch-volume-tone':questions([
    ['What does pitch describe?',['How loud a sound is','How high or low a sound seems','How long a song lasts'],1,'Pitch describes high and low. Loudness and duration are different qualities.'],
    ['What does a frequency of 200 Hz mean?',['200 vibrations each second','200 notes in the song','A volume of 200 percent'],0,'Hertz counts repeating vibrations per second.'],
    ['A clear tone changes from 200 Hz to 400 Hz. What happens to its pitch?',['It falls an octave','It stays the same','It rises an octave'],2,'Doubling a repeating frequency raises the pitch by one octave.'],
    ['A piano and flute play the same note at similar loudness. What helps you tell them apart?',['Their timbre','Their bar number','Their note letter must differ'],0,'Timbre includes the mixture of vibrations and the way each sound starts and fades.'],
    ['Which app control mainly chooses the tune’s pitches?',['Volume','Notes','Master volume'],1,'Notes chooses pitches. Volume controls change sound level.'],
    ['You want the same melody to sound like another instrument. Which control is the most direct choice?',['Tempo','Notes','Sound'],2,'Sound chooses the instrument. You can keep the melody’s notes.'],
    ['Does raising a note’s pitch automatically make it louder?',['Yes, every time','No, pitch and loudness are different','Only when it is C'],1,'A high note can be quiet, and a low note can be loud.'],
    ['Which statement about a snare-like noise is correct?',['It must have one clear note pitch','It cannot have a timbre','It can have no single clear pitch and still be musical'],2,'Noise and many drums contain vibrations that do not give one clear repeating pitch.'],
    ['What produces the pressure changes that a speaker sends through the air?',['The speaker moving back and forth','The name of the note','The song’s printed title'],0,'The speaker’s motion makes changing air pressure, which carries sound.'],
    ['Two sounds have the same pitch. Must they have the same timbre?',['Yes, pitch fixes every part of a sound','No, their vibration mixtures and endings can differ','Yes, if they play in the same bar'],1,'Pitch is only one quality. Instruments can share a pitch while sounding different.'],
  ]),
  'pulse-beat-tempo':questions([
    ['What is a beat?',['One moment in a regular musical pulse','Every note in a melody','The loudest sound in a recording'],0,'A beat is part of the underlying count; notes can occur on it, between beats, or across it.'],
    ['What does BPM stand for?',['Bars per melody','Beats per minute','Bass pitches measured'],1,'BPM tells how many tempo beats pass in one minute.'],
    ['At 60 BPM, how long is one beat?',['Half a second','Two seconds','One second'],2,'Sixty beats in sixty seconds gives one second per beat.'],
    ['At 120 BPM, how long is one beat?',['Half a second','One second','Four seconds'],0,'There are two beats per second at 120 BPM.'],
    ['Four tempo beats at 120 BPM take how long?',['Four seconds','Two seconds','Half a second'],1,'Each beat takes half a second, so four beats take two seconds.'],
    ['A melody adds two notes between beats while the shared pulse stays the same. Has the tempo necessarily changed?',['Yes, more notes always means a faster tempo','Yes, every note must be a beat','No, the rhythm can become busier at the same tempo'],2,'The beat rate and the number of notes between beats are separate.'],
    ['Can a beat continue through a moment when no instrument plays a new note?',['Yes','No','Only at 60 BPM'],0,'The pulse can still be felt or counted during a rest.'],
    ['What does a metronome normally provide?',['A different chord each bar','Regular clicks marking the beat','The melody’s note names'],1,'A metronome marks a steady pulse so the beat is easy to hear.'],
    ['Which statement about music and pulse is correct?',['All music must have a regular pulse','Music without a regular pulse is always a mistake','Some music has flexible timing or no regular pulse'],2,'A regular pulse is common, but it is not a requirement for all music.'],
    ['In this app, faster: 2 changes a track’s pattern. What can stay unchanged?',['The shared song tempo setting','The number of pattern repeats per bar','The pattern’s event times'],0,'Faster changes the pattern against the song’s clock; it does not change the song’s BPM setting.'],
  ]),
  'rhythm-rests-subdivision':questions([
    ['What does rhythm include?',['Only the loudest notes','When sounds and silences occur','Only the song tempo'],1,'Rhythm concerns beginnings, lengths, and spaces through time.'],
    ['One instrument has a rest. What can another instrument do?',['Keep playing','It must stop too','It must change key'],0,'A rest belongs to that musical part; other parts can continue.'],
    ['A beat is split into two equal parts. Which count fits?',['One-two-three-four-five','One-e-and-a','One-and'],2,'One-and marks two equal parts of one beat.'],
    ['What does one-e-and-a usually count?',['Four equal parts of one beat','Four whole bars','One note with no subdivisions'],0,'The four spoken syllables mark four subdivisions inside a beat.'],
    ['What is straight timing for a pair of equal subdivisions?',['The second is always longer','Both parts have equal length','The first part is always silent'],1,'Straight timing keeps equal subdivisions evenly spaced.'],
    ['What commonly happens to a pair of subdivisions with swing?',['Both disappear','The second becomes the first note’s pitch','The first lasts longer and the second is shorter'],2,'Swing commonly changes an equal pair into a long-short pair.'],
    ['Is every performance’s swing ratio identical?',['Yes, it is always exactly 2 to 1','No, it can vary with style, tempo, and player','Yes, it is always exactly 3 to 1'],1,'A triplet-like ratio is common, but swing is not fixed to one ratio.'],
    ['What is an accent?',['Extra emphasis on a note or position','A mandatory change of tempo','A silent bar'],0,'An accent makes an event stand out, often through louder or sharper playing.'],
    ['Which example describes syncopation?',['Emphasizing only every first beat','Removing all rhythm','Emphasizing a normally weaker position between strong beats'],2,'Syncopation shifts emphasis away from expected strong positions.'],
    ['A short drum and a ringing bell start at the same moments. What can differ?',['Their start times must differ','How long their sounds continue','They must have different tempos'],1,'Identical event starts can still produce different audible lengths.'],
  ]),
  'bars-meter-accent':questions([
    ['What is another name for a bar?',['A measure','An octave','A frequency'],0,'A bar or measure is a group of musical time.'],
    ['What does meter describe?',['An instrument’s loudness limit','Repeating groups of stronger and weaker positions','The frequency of middle C'],1,'Meter concerns the repeating organization of beats and accents.'],
    ['In 3/4, how many quarter notes fit in one bar?',['Four','Six','Three'],2,'The 3 counts three units, and the lower 4 identifies quarter notes.'],
    ['In 4/4, what does the lower 4 identify?',['The quarter-note value','Four bars in every song','A frequency of 4 Hz'],0,'The lower number identifies the note value being counted.'],
    ['How many eighth notes fit in one 6/8 bar?',['Two','Six','Eight'],1,'The upper 6 counts six eighth-note values.'],
    ['How does 6/8 commonly feel?',['Six large beats, each divided in two','Three large beats, each divided in four','Two large beats, each divided in three'],2,'The usual grouping is ONE-two-three, FOUR-five-six.'],
    ['What commonly distinguishes 3/4 from 6/8?',['Their grouping: three beats of two versus two beats of three','They must have different numbers of instruments','6/8 must always be twice as fast'],0,'Both hold six eighth-note values, but their usual emphasis and beat grouping differ.'],
    ['Which beat often feels strongest in a bar?',['The last beat in every style','The first beat','No beat can feel stronger'],1,'The first beat often has the strongest metric position, though music can emphasize other places.'],
    ['Does this app’s beats per bar setting store a time signature’s lower number?',['Yes, it always stores 4','Yes, it always stores 8','No'],2,'It counts tempo beats per bar and does not specify a notated denominator.'],
    ['Which app approach can produce a typical 6/8 grouping?',['Two tempo beats per bar, each split into three','Three tempo beats with no subdivisions, by definition','Changing the instrument to piano'],0,'Two groups of three subdivisions match the common 6/8 feel.'],
  ]),
  'note-names-accidentals':questions([
    ['Which letter follows G in the repeating musical note names?',['H','A','C'],1,'The seven letters A through G repeat; after G comes A.'],
    ['What does a sharp do to a written note?',['Raises it by one semitone','Raises it by one octave','Always makes it louder'],0,'A sharp changes pitch by one semitone upward.'],
    ['What does a flat do to a written note?',['Makes it quieter','Raises it by one tone','Lowers it by one semitone'],2,'A flat lowers the note by one semitone.'],
    ['What is the job of a natural sign?',['Cancel a sharp or flat in the relevant notation context','Double a note’s length','Play the note twice'],0,'A natural returns the note to its unaltered letter pitch in that notation context.'],
    ['Which pair names the same key on a normally tuned modern piano?',['C and D','C-sharp and D-flat','C and C-sharp'],1,'C-sharp is one key above C, and D-flat is one key below D: the same piano key.'],
    ['What does enharmonic mean here?',['Two notes with equal written lengths','Two instruments playing loudly','Different note spellings that share a pitch in the tuning being used'],2,'Enharmonic spellings can name the same pitch, such as C-sharp and D-flat in equal temperament.'],
    ['Must C-sharp and D-flat have exactly the same frequency in every tuning system?',['No','Yes','Only when written with capital letters'],0,'Their equality is tuning-dependent; other tuning systems can distinguish them.'],
    ['Which neighboring white keys have no black key between them?',['C and D','E and F','F and G'],1,'E and F are already one semitone apart. B and C are another such pair.'],
    ['On a modern piano, which key does E-sharp use?',['E','D','F'],2,'E-sharp is one semitone above E, which is the F key.'],
    ['Why can the choice between two enharmonic spellings matter?',['It can show how a note belongs to a scale or chord','It always changes the piano’s volume','It tells the pianist to use a different instrument'],0,'Spelling communicates musical relationships even when two names use the same piano key.'],
  ]),
  'keyboard-octaves-register':questions([
    ['Where is C on a piano keyboard?',['Immediately left of a group of two black keys','Immediately right of every group of three black keys','On every black key'],0,'The repeating group of two black keys gives an easy landmark for C.'],
    ['What is the white-key order beginning on C?',['C E G A B D F','C D E F G A B','C D F G A B E'],1,'The letter names proceed in order and repeat after B when starting from C.'],
    ['How many semitone steps are in the usual octave?',['Seven','Eight','Twelve'],2,'The octave contains twelve semitone steps, counting both white and black keys.'],
    ['What is the frequency relationship between a note and the note one octave above?',['The higher one has twice the frequency','They have the same frequency','The higher one has half the frequency'],0,'An octave upward doubles the repeating vibration frequency.'],
    ['What does the 4 in C4 identify?',['Its volume','Its octave','How many times it repeats'],1,'The number distinguishes this C from Cs in higher or lower octaves.'],
    ['Which name does this app use for middle C?',['C1','C8','C4'],2,'This app uses C4 for middle C, though some other software labels octaves differently.'],
    ['Which white-key note follows B3 when moving upward?',['C4','C3','B4'],0,'The octave number changes at C, so B3 is followed by C4.'],
    ['Which white-key note follows A4 when moving upward?',['C5','B4','B5'],1,'A4 is followed by B4; the number does not change until C5.'],
    ['What does register mean?',['How many notes are in a bar','A type of rest','A general low, middle, or high pitch area'],2,'Register describes the pitch area occupied by a voice, instrument, or musical part.'],
    ['Can every real instrument easily play the same high and low notes?',['No, instruments have different ranges','Yes, all instruments have identical ranges','Only if the tempo is slow'],0,'Instrument construction and playing technique limit or affect their usable pitch ranges.'],
  ]),
  'intervals-pitch-distance':questions([
    ['What is an interval?',['The loudness of a note','The distance between two pitches','The number of instruments'],1,'An interval compares pitches, whether they occur together or one after another.'],
    ['Two different pitches sound together. What kind of interval do they form?',['A harmonic interval','A melodic interval only','A tempo interval'],0,'A harmonic interval uses simultaneous pitches; a melodic interval uses successive pitches.'],
    ['How many semitones make one whole tone?',['One','Twelve','Two'],2,'A whole tone, or whole step, spans two semitone steps.'],
    ['Two notes have exactly the same pitch. What interval is that?',['A unison','A fifth','An octave'],0,'A unison has no pitch distance. An octave uses different pitches.'],
    ['Why is C to E called a third?',['It is always three semitones','Counting C, D, E includes three letter names','Every chord has three notes'],1,'Interval numbers count letter positions including both endpoints.'],
    ['How many semitones are in C up to E-flat?',['Four','Seven','Three'],2,'C to E-flat is a minor third, spanning three semitones.'],
    ['Which interval is C up to E?',['A major third','A perfect fifth','A unison'],0,'C to E spans four semitones and three letter positions, so it is a major third.'],
    ['How many semitones are in a perfect fifth such as C up to G?',['Five','Seven','Twelve'],1,'A perfect fifth spans seven semitones in the usual twelve-note system.'],
    ['Which description best fits musical dissonance?',['A wrong note in every situation','A sound that must be quiet','A sense of tension that depends on context and listening traditions'],2,'Dissonance can create useful tension. It does not automatically mean an error.'],
    ['Which interval is C up to the next C?',['An octave spanning twelve semitones','A unison spanning zero semitones','A major sixth spanning nine semitones'],0,'The two notes share a letter name but occupy neighboring octaves.'],
  ]),
  'reading-written-music':questions([
    ['How many horizontal lines are in a standard staff?',['Four','Five','Six'],1,'A staff has five lines; the spaces also hold notes.'],
    ['What are ledger lines?',['Short extra lines extending the staff’s pitch range','Lines that divide every second into beats','Marks that always mean silence'],0,'Ledger lines let notes appear above or below the five-line staff.'],
    ['Which pitch does treble clef identify on the second line from the bottom?',['C','F','G'],2,'Treble clef is also called G clef because it identifies that G line.'],
    ['Which pitch does bass clef identify on the second line from the top?',['F','G','A'],0,'Bass clef is an F clef and identifies that F line.'],
    ['How many quarter notes equal one whole note?',['Two','Four','Eight'],1,'A whole note equals four quarter notes, regardless of the tempo.'],
    ['Is a quarter note always one second long?',['Yes','Yes, in every time signature','No, its duration depends on tempo and the beat unit'],2,'Note values describe relative lengths. Tempo and the chosen beat unit determine seconds.'],
    ['Two quarter notes at the same pitch are tied together. How are they played?',['As one continuous duration, without a second attack','As two separate attacks with a rest between','As two pitches an octave apart'],0,'A tie joins equal-pitch note durations into one sustained event.'],
    ['How many eighth-note values equal a dotted quarter note?',['Two','Three','Four'],1,'The dot adds half the quarter’s value: two eighths plus one more eighth.'],
    ['What does a common group of three eighth-note triplets fit into?',['The time of three ordinary quarter notes','Three whole bars','The time normally occupied by two eighth notes'],2,'This triplet divides that usual two-eighth span into three equal parts.'],
    ['What usually distinguishes a slur from a tie?',['A slur connects different pitches for connected playing; a tie joins the same pitch’s durations','A slur always changes tempo; a tie always changes volume','They always mean exactly the same thing'],0,'Similar curved marks do different jobs: connected phrasing for a slur, added duration at one pitch for a tie.'],
  ]),
};

const foundationPractice:Record<typeof foundationTexts[number]['id'],{title:string;instruction:string;listenFor:string;source:string}>={
  'sound-pitch-volume-tone':{
    title:'Change the instrument, keep the notes',
    instruction:'Change sound: triangle to sound: sine. Play again, then change it back to compare.',
    listenFor:'The tune keeps the same pitches and timing. The tone quality changes; the sounds may also seem different in loudness even at the same volume setting.',
    source:'tempo: 90 bpm\n\ntrack: tune\n  sound: triangle\n  notes: C4 E4 G4 E4\n  volume: 0.2',
  },
  'pulse-beat-tempo':{
    title:'Hear the beat speed up',
    instruction:'Change tempo: 90 bpm to tempo: 120 bpm. Keep the four drum hits the same, then restore 90 bpm.',
    listenFor:'The same four hits fit into a shorter bar. At 120 BPM, these evenly spaced hits arrive twice per second.',
    source:'tempo: 90 bpm\nbeats per bar: 4\n\ntrack: pulse\n  play: kick*4\n  volume: 0.2',
  },
  'rhythm-rests-subdivision':{
    title:'Add a hit inside the same bar',
    instruction:'In the rhythm track, change the first rest to snare. Keep tempo and the hat track unchanged. Restore rest to compare.',
    listenFor:'The new snare fills an empty step, but the eight quiet hats keep the same spacing. More hits do not require a faster tempo.',
    source:'tempo: 100 bpm\n\ntrack: rhythm\n  play: kick rest snare rest\n  volume: 0.2\n\ntrack: subdivisions\n  play: hat*8\n  volume: 0.08',
  },
  'bars-meter-accent':{
    title:'Group six steps in two different ways',
    instruction:'Change kick*2 to kick*3 in the accents track. Keep hat*6 unchanged. Switch back to kick*2 when you want to hear two groups of three again.',
    listenFor:'Two kicks mark two groups of three hat steps, a common 6/8 grouping. Three kicks mark three groups of two. This compares accents over six subdivisions; the app does not write a time signature or change its denominator.',
    source:'tempo: 90 bpm\nbeats per bar: 2\n\ntrack: accents\n  play: kick*2\n  volume: 0.2\n\ntrack: six steps\n  play: hat*6\n  volume: 0.08',
  },
  'note-names-accidentals':{
    title:'Two spellings for the same pitch',
    instruction:'Change C#4 to Db4 in the notes line. Leave every other note unchanged, then compare the two versions.',
    listenFor:'With this synthesizer’s usual tuning, that note keeps the same pitch. Its written name changes. This demonstrates the app’s tuning, not every possible tuning system.',
    source:'tempo: 80 bpm\n\ntrack: note names\n  sound: sine\n  notes: C4 C#4 D4 C4\n  volume: 0.2',
  },
  'keyboard-octaves-register':{
    title:'Move one note by an octave',
    instruction:'Change the first C3 to C4. Leave E3, G3, and the last C3 unchanged. Change it back after listening.',
    listenFor:'Only the opening note moves up an octave. It keeps its C name and start time, but its pitch becomes higher.',
    source:'tempo: 90 bpm\n\ntrack: register\n  sound: triangle\n  notes: C3 E3 G3 C3\n  volume: 0.2',
  },
  'intervals-pitch-distance':{
    title:'Compare a fifth and a third',
    instruction:'Change G4 to E4 inside [C4,G4]. Keep C4 and all other settings the same, then restore G4 to compare.',
    listenFor:'Two notes still begin together. Their distance changes from a perfect fifth to a major third. Compare the combination without treating one choice as automatically better.',
    source:'tempo: 80 bpm\n\ntrack: interval\n  sound: sine\n  notes: [C4,G4] rest\n  volume: 0.2',
  },
  'reading-written-music':{
    title:'Compare a held note with repeated notes',
    instruction:'Replace the underscore in C4 _ E4 rest with another C4. Play again, then restore the underscore.',
    listenFor:'The underscore continues the first C4 across two steps. Writing C4 again starts a new note on the second step. This demonstrates timing like a tie versus separate notes; the app shows code rather than drawing a staff.',
    source:'tempo: 80 bpm\nbeats per bar: 4\n\ntrack: note lengths\n  sound: triangle\n  notes: C4 _ E4 rest\n  attack: 0.02\n  release: 0.06\n  volume: 0.2',
  },
};

export const foundationLessons=foundationTexts.map(lesson=>({...lesson,questions:foundationQuestions[lesson.id],practice:foundationPractice[lesson.id]}));
