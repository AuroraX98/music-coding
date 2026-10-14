const lessons: Array<{id:string;title:string;summary:string;body:string}> = [
  {
    id:'melody-and-phrases',
    title:'Build a melody people can follow',
    summary:'Use a small idea, repeat it, and change its ending.',
    body:`<p>A <strong>melody</strong> is a line of notes heard as one musical part. Its rhythm matters as much as its pitches. Playing the same notes with different lengths and rests can make a very different melody.</p>
<p>A <strong>motif</strong> is a short idea you can recognize when it returns. It might be three notes, a rhythm, or both. A <strong>phrase</strong> is a longer musical thought with a beginning and some sense of an ending. Phrases often last four or eight bars, but they can be shorter or longer.</p>
<h3>Make one idea last four bars</h3>
<p>Start with C4, D4, E4, and a rest. Repeat that idea in bar two. In bar three, keep the rhythm but change one pitch. In bar four, give the ending a longer note or a longer rest. You now have repetition, a change, and an ending.</p>
<p><strong>Contour</strong> means the melody's overall shape: rising, falling, staying level, or arching up and down. Small steps can connect notes smoothly. A large jump attracts attention. Neither is automatically better. Listen for the shape you want, and leave enough space to hear it.</p>`
  },
  {
    id:'bass-and-chords',
    title:'Help the bass and chords work together',
    summary:'Choose bass notes by listening to the chord above them and the drum rhythm beside them.',
    body:`<p>The <strong>bass</strong> is a low musical part. It can give weight to the beat and help us hear the harmony. A <strong>chord</strong> is a group of notes sounding together. The bass note is the lowest note we hear; it does not always have to be the chord's root.</p>
<p>The <strong>root</strong> is the note a chord is named after. A C major chord contains C, E, and G, so C is its root. Start by playing C2 beneath that chord. Then try E2 or G2. These are still chord notes, but changing the lowest note changes the sound. This is called a <strong>chord inversion</strong> when a chord note other than the root is lowest.</p>
<h3>Give the bass a clear job</h3>
<p>For your first loop, play the root when each chord begins. Add a second bass note only after the first version feels clear. Keep the notes short enough to hear the rhythm.</p>
<p>Listen to the kick drum and bass together. They can strike at the same time for emphasis, or take turns to leave space. If their low sounds blur, try shortening a bass note, moving it, or lowering one part's volume.</p>`
  },
  {
    id:'drum-groove',
    title:'Make a drum groove',
    summary:'Use a steady pulse, a few accents, and small changes near an ending.',
    body:`<p>A <strong>groove</strong> is the repeating feel made by rhythms working together. It depends on note placement, note length, loudness, and small timing differences. The same drum sounds can create many grooves.</p>
<p>For a simple pattern in four beats per bar, put a kick on beats 1 and 3 and a snare on beats 2 and 4. Add a hi-hat on each beat. This is one common starting pattern, not a requirement for every style.</p>
<h3>Hear the spaces between beats</h3>
<p>Count “1 and 2 and 3 and 4 and.” Those eight equal positions divide the beats in half. Add a quiet hi-hat on an “and,” then listen again. <strong>Syncopation</strong> happens when accents or held notes draw attention away from the expected strong beats. A loud hit between beats is one way to create it.</p>
<p>A <strong>fill</strong> is a short change that helps lead into the next phrase or section. Try an extra snare hit near the end of bar four, then return to the main groove. A fill can also be a pause. Keep some parts steady while another changes so the listener can still follow the pulse.</p>`
  },
  {
    id:'tension-and-release',
    title:'Create tension and release',
    summary:'Build expectation, then decide whether to satisfy it or keep it going.',
    body:`<p><strong>Tension</strong> is a feeling that the music is active, unsettled, or waiting for something. <strong>Release</strong> is a feeling of arrival or easing. You can shape these feelings with pitch, rhythm, loudness, texture, and silence.</p>
<p><strong>Consonance</strong> describes note combinations often heard as blended or stable. <strong>Dissonance</strong> describes combinations often heard as rougher or less settled. What feels stable depends on the instruments, register, surrounding music, and musical traditions you know. Dissonance is a useful sound, not a mistake.</p>
<h3>Try a small arrival</h3>
<p>Hold a C major chord, then play D4 followed by C4 above it. D is outside that chord; C belongs to it. Listen to whether the movement feels like an arrival. Then reverse the order. The surrounding music can change what you hear.</p>
<p>You can also build tension without changing chords: repeat a rhythm more often, gradually add instruments, or delay an expected drum hit. Release might come from a clear downbeat, a familiar melody returning, fewer notes, or a rest. Major and minor do not guarantee a happy or sad mood; speed, sound, rhythm, and context matter too.</p>`
  },
  {
    id:'song-form',
    title:'Turn loops into a song',
    summary:'Give each section a purpose, then make its arrival easy to hear.',
    body:`<p><strong>Form</strong> is the order of a song's larger parts. A section might introduce an idea, repeat something memorable, create contrast, or finish the song. Names such as intro, verse, chorus, bridge, breakdown, and outro describe common jobs; a song does not need all of them.</p>
<h3>Start with three sections</h3>
<p>Make a four-bar intro using just drums. Follow it with eight bars of drums, bass, and melody. End with four bars that remove one or two parts. This gives you a beginning, a fuller middle, and an ending using the same musical material.</p>
<p>Another useful plan is A–B–A: play one idea, introduce a different idea, then bring the first back. The return is easier to notice because something changed in between.</p>
<p>A <strong>transition</strong> connects sections. You might use a drum fill, a held note, a short pause, or a sound that grows louder. A transition can be very small. Choose one clear change first, and listen across the boundary between sections. Four and eight bars are useful practice lengths because repeated groups are easy to follow; many styles also use other lengths or avoid regular groups.</p>`
  },
  {
    id:'arrangement-and-space',
    title:'Give every part room',
    summary:'Choose what each instrument does and when it needs to be heard.',
    body:`<p><strong>Arranging</strong> means deciding which parts play your ideas, how they play them, and when they enter or leave. <strong>Instrumentation</strong> means your choice of instruments or sounds. A melody on a soft pad feels different from the same melody on a short, bright pluck.</p>
<p><strong>Register</strong> means a low, middle, or high pitch area. If the bass and melody keep playing in the same area, they may be harder to tell apart. Try a low bass, chords in the middle, and a higher melody. This is a useful experiment, not a fixed layout.</p>
<h3>Choose what matters most</h3>
<p>Play the melody alone, then add each other part one at a time. If an added part hides the melody, try fewer notes, a quieter volume, a different register, or a different rhythm.</p>
<p><strong>Texture</strong> describes how the parts combine: one melody alone, melody with backing, or several independent lines. <strong>Density</strong> describes how much is happening. You can make a section feel bigger by adding activity, or make an important phrase clearer by removing it. A rest is useful space. Every instrument does not need to play through every bar.</p>`
  },
  {
    id:'dynamics-and-articulation',
    title:'Make repeated notes feel expressive',
    summary:'Change loudness, note length, and the way sounds begin and end.',
    body:`<p><strong>Dynamics</strong> means changes in loudness. An <strong>accent</strong> makes one note stand out. A <strong>crescendo</strong> gradually grows louder; a <strong>diminuendo</strong> gradually grows quieter. These changes can shape a phrase even when its pitches stay the same.</p>
<p><strong>Articulation</strong> is how notes begin, continue, and end. <strong>Staccato</strong> notes are short and separated. <strong>Legato</strong> notes sound connected. The result depends on the instrument as well as note length. A drum hit naturally fades, while a sustained synthesizer note can keep sounding.</p>
<h3>Change one feature at a time</h3>
<p>Repeat a four-note melody. First, make its final note longer. Then return to the original and make the first note louder. Listen to how each change moves your attention.</p>
<p>The sound's <strong>attack</strong> is its beginning: a quick attack starts sharply, and a slower one swells in. <strong>Release</strong> is how it fades after the note ends. A long release can overlap the next note. If a phrase becomes blurry, shorten its notes or release. Keep overall playback comfortable while comparing versions; louder can seem more impressive even when the musical idea has not improved.</p>`
  },
  {
    id:'listening-and-ear-training',
    title:'Learn by hearing one difference',
    summary:'Listen, describe a small detail, and compare it with a changed version.',
    body:`<p><strong>Ear training</strong> means practicing how you recognize and imagine musical sounds. You do not need to name every note before you start making music. Begin with differences you can already hear: higher or lower, earlier or later, longer or shorter, busier or quieter.</p>
<h3>Listen to one part</h3>
<p>Choose a short passage you like. Listen once for the steady beat, once for the bass, and once for the melody. Notice when a part enters or stops. If following all the parts is difficult, return to just one.</p>
<p>In your own loop, play the original, change one note or one setting, then replay the same passage. Describe the difference in ordinary words. “The last note feels unfinished” is useful information even before you know a theory term for it.</p>
<p>You can hum a short idea before finding its notes, or tap its rhythm before writing code. Matching what you imagined takes practice. There is no need to turn every listening session into a quiz. Keep a version when it helps your intended sound, undo it when it does not, and save interesting surprises for another track.</p>`
  },
  {
    id:'compose-and-keep-learning',
    title:'Finish a small track, then explore further',
    summary:'Make an eight-bar idea before adding more techniques.',
    body:`<p>Start with four bars: choose a comfortable tempo, one drum groove, a bass note or chord, and a short melody. Repeat them for four more bars. In bar eight, change one ending note or add a brief fill. Listen to all eight bars before adding another part.</p>
<p>Choose one goal for the next edit: make the beat clearer, give the melody more space, or make the ending feel complete. Keep or undo that edit, then make the next choice. A small finished track teaches you how its parts work together.</p>
<h3>Ideas to explore next</h3>
<ul>
<li><strong>Harmonic rhythm:</strong> how often the chords change. Try one chord every two bars, then one each bar.</li>
<li><strong>Counterpoint:</strong> two or more melodies that work together while keeping their own shapes.</li>
<li><strong>Polyrhythm:</strong> different beat divisions sounding together, such as three evenly spaced hits against two over the same time.</li>
<li><strong>Tuning systems:</strong> ways to choose the exact pitches of notes. Twelve equal steps per octave is common, but many other systems exist.</li>
<li><strong>Style and tradition:</strong> musical communities develop different rhythms, forms, tunings, and ways of performing. Listen to specific examples before treating one approach as universal.</li>
</ul>`
  }
];

type CompositionQuestion = {prompt:string;options:string[];answer:number;explanation:string};
const question = (prompt:string,options:string[],answer:number,explanation:string):CompositionQuestion => ({prompt,options,answer,explanation});
const questions: Record<string,CompositionQuestion[]> = {
  'melody-and-phrases': [
    question('What is a melody?', ['A line of notes heard as one musical part', 'Only the lowest notes in a song', 'The number of beats per minute'], 0, 'A melody is a musical line. Its pitches, rhythms, and rests all help shape it.'),
    question('You repeat a short three-note idea throughout a song. What is that idea called?', ['A tempo', 'A motif', 'A tuning system'], 1, 'A motif is a short, recognizable musical idea. It may use pitches, a rhythm, or both.'),
    question('What does a melody’s contour describe?', ['The number of instruments', 'Its recording volume', 'Its overall rising and falling shape'], 2, 'Contour follows the shape of the pitches as they rise, fall, or stay level.'),
    question('You keep C4 E4 G4 but change the note lengths and add a rest. What has changed?', ['The rhythm of the melody', 'The names of its pitches', 'The number of beats in every bar'], 0, 'Note lengths and rests are part of rhythm. The pitch names can stay the same.'),
    question('Which description best matches a musical phrase?', ['Any single drum hit', 'A musical thought with a beginning and some sense of an ending', 'A command that changes volume'], 1, 'A phrase is a connected stretch of music that can feel like one thought.'),
    question('You want bar two to be easy to recognize as a return of bar one. Which choice most directly helps?', ['Remove every note', 'Change every pitch and rhythm', 'Repeat the same short idea'], 2, 'Repetition lets the listener recognize an idea. Later changes can make that return less exact.'),
    question('Your goal is to keep a motif’s rhythm while changing its pitches. Which edit does that?', ['Replace C4 D4 E4 with E4 F4 G4 using the same note lengths', 'Double the length of every note', 'Add rests between every note'], 0, 'Replacing pitches while preserving their starts and lengths keeps the rhythm.'),
    question('C4 D4 E4 G4 moves in which overall direction?', ['Downward', 'Upward', 'It stays on one pitch'], 1, 'These pitches get higher, so this short melody has a rising contour.'),
    question('Which statement about phrase length is accurate?', ['Every phrase must last four bars', 'Phrases must always last at least eight bars', 'Four and eight bars are common, but other lengths work too'], 2, 'Phrase length depends on the music. Four and eight bars are useful starting choices.'),
    question('You want to test whether the fourth bar feels more like an ending. Which is a focused experiment?', ['Lengthen its final note and compare the two versions', 'Change all instruments, notes, and tempo at once', 'Assume every melody must end with silence'], 0, 'One change makes its effect easier to hear. A longer final note may help an ending, but listening decides whether it suits this phrase.')
  ],
  'bass-and-chords': [
    question('What does bass describe here?', ['Only a loud sound', 'A low musical part', 'The fastest notes in a song'], 1, 'Bass is a low part. It can support the rhythm and help make the harmony clear.'),
    question('A C major chord contains C, E, and G. Which note is its root?', ['E', 'G', 'C'], 2, 'The root is the note the chord is named after: C in C major.'),
    question('Which bass note is a simple root-note starting choice under a C major chord?', ['C2', 'F2', 'D2'], 0, 'C2 is a low C, so it supplies the chord’s root in the bass.'),
    question('C, E, and G sound together with E as the lowest note. What is this?', ['A change of tempo', 'An inversion of the C major chord', 'A C major chord with no bass note'], 1, 'An inversion puts a chord note other than its root at the bottom. E still belongs to C major.'),
    question('Must the bass always play the chord’s root?', ['Yes, every other note is an error', 'Yes, unless the drums stop', 'No; other choices can work and change the sound'], 2, 'The root is a useful starting point. Other chord notes or carefully chosen moving notes can also work.'),
    question('Your goal is to make the bass and kick strike together. Which edit does that?', ['Move a bass note’s start onto a kick hit', 'Change only the melody’s instrument', 'Change only the song’s title'], 0, 'Aligning the starts makes the two parts strike together. Their lengths and levels still affect the result.'),
    question('The low sounds overlap so much that the rhythm is hard to hear. Which is a focused first experiment?', ['Add more low notes immediately', 'Shorten the bass notes and compare', 'Delete the melody’s name'], 1, 'Shorter bass notes can reduce overlap. Compare before and after to hear whether the rhythm becomes clearer.'),
    question('Your goal is a simple bass part that follows each new chord. What is a useful starting plan?', ['Ignore when the chords change', 'Play every possible note at once', 'Play the root when each chord begins'], 2, 'This links the bass to the chord changes. You can add movement after hearing the simpler version.'),
    question('Which statement correctly connects root and bass note?', ['The root names the chord; the bass note is its lowest sounding note', 'Root and bass note always mean the same pitch', 'The root is always the loudest note'], 0, 'A chord keeps its root even when another note is lowest.'),
    question('You want the kick and bass to take turns instead of striking together. Which plan matches that goal?', ['Put every bass start on every kick hit', 'Place bass starts in gaps between kick hits', 'Make both parts silent for the whole track'], 1, 'Putting bass notes between kick hits creates alternating starts. Listen to their lengths too, because the sounds can still overlap.')
  ],
  'drum-groove': [
    question('What is a groove?', ['The repeating feel made by rhythms working together', 'Only the name of a drum sound', 'The highest pitch in a chord'], 0, 'A groove comes from rhythmic placement, duration, accents, timing, and how parts interact.'),
    question('In the starting pattern from this lesson, which beats have the snare?', ['1 and 3', '2 and 4', 'Only the first beat'], 1, 'This lesson starts with kick on 1 and 3 and snare on 2 and 4. Other grooves use different choices.'),
    question('When you count “1 and 2 and 3 and 4 and,” how many equal positions are there?', ['Four', 'Six', 'Eight'], 2, 'Each of the four beats is divided into two positions, making eight in total.'),
    question('Where is the “and” after beat 1?', ['Halfway between beats 1 and 2', 'At exactly the same time as beat 1', 'After the whole fourth beat'], 0, 'With equal divisions, the “and” falls halfway between two numbered beats.'),
    question('Which description matches syncopation?', ['Making every note equally loud', 'Drawing attention away from expected strong beats', 'Changing only the instrument’s name'], 1, 'Accents between beats or notes held across expected accents can create syncopation.'),
    question('You want a brief change that leads into the next section. What is this called?', ['A root', 'A scale', 'A fill'], 2, 'A fill briefly varies the main rhythm, often near a section or phrase ending.'),
    question('Which is a small fill to try near the end of four bars?', ['One extra snare hit in bar four, then return to the groove', 'Change every drum hit forever', 'Raise every melody note by an octave'], 0, 'A brief change followed by a return makes the fill and the main groove distinct.'),
    question('Can a pause be part of a drum fill?', ['No, a fill must contain more hits', 'Yes, removing hits can also lead into a new section', 'Only if the tempo changes'], 1, 'A short pause can draw attention to what comes next, even without adding hits.'),
    question('One drum part becomes busy during a fill. What can help the pulse stay easy to follow?', ['Randomly move every other part', 'Remove all repeated timing', 'Keep another part steady'], 2, 'A steady part gives the listener a clear pulse while another part changes.'),
    question('Is kick on 1 and 3 with snare on 2 and 4 required for every style?', ['No; it is one common starting pattern', 'Yes; otherwise the music has no groove', 'Yes; all drum patterns share those positions'], 0, 'Styles and individual tracks use many different accent patterns and drum placements.')
  ],
  'tension-and-release': [
    question('What does tension describe in this lesson?', ['A required volume setting', 'A feeling of activity, uncertainty, or expectation', 'Only an incorrect note'], 1, 'Tension can make us expect something to happen. It can come from rhythm, harmony, sound, or other choices.'),
    question('What does release describe?', ['A guarantee that the song is over', 'A command that always removes drums', 'A feeling of arrival or easing'], 2, 'Release can happen anywhere a musical expectation feels satisfied or the activity eases.'),
    question('What does consonance usually describe?', ['Note combinations heard as blended or stable', 'A rhythm with no rests', 'The number of tracks in a song'], 0, 'Consonance concerns how combined notes are heard. Context and musical experience also affect this.'),
    question('Is dissonance automatically a mistake?', ['Yes, it must always be removed', 'No, it can be an intentional and useful sound', 'Yes, unless the song has drums'], 1, 'Dissonance can create color, movement, or tension. Its usefulness depends on the musical goal.'),
    question('Which factor can change whether notes feel stable together?', ['Only the track’s title', 'Only the file format', 'The surrounding harmony, instruments, and register'], 2, 'The same pitches can feel different with different sounds, spacing, and musical surroundings.'),
    question('A C major chord contains C, E, and G. Which note below is outside that chord?', ['D', 'E', 'G'], 0, 'D is outside this chord. It can still be used as a melody note; being outside a chord does not make a note wrong.'),
    question('You hold a C major chord while a melody moves D4 to C4. What is worth listening for?', ['Whether the tempo must double', 'Whether the move toward a chord note feels like arrival', 'Whether the chord must disappear'], 1, 'C belongs to the held chord. Moving to it may feel more settled in this context, but listen to the actual result.'),
    question('Which could build expectation without changing chords?', ['Rename the song', 'Save a backup', 'Repeat a rhythm more often before a section change'], 2, 'Increasing rhythmic activity can build expectation even while the harmony stays the same.'),
    question('Which statement about major and minor is accurate?', ['Mood also depends on rhythm, tempo, sound, and context', 'Major always sounds happy', 'Minor always sounds sad'], 0, 'Major and minor are musical structures, not guarantees of one emotion.'),
    question('Your goal is to compare two possible endings. Which method helps you hear their effect?', ['Change both endings and every instrument at once', 'Keep the lead-in the same and compare the two endings', 'Choose only the louder ending without listening to the phrase'], 1, 'Keeping the lead-in fixed lets you hear how each ending responds to the same musical expectation.')
  ],
  'song-form': [
    question('What is song form?', ['The order of the song’s larger parts', 'The shape of a speaker', 'The loudness of one note'], 0, 'Form describes how sections and larger ideas are ordered over time.'),
    question('Which section name commonly describes the beginning that introduces a song?', ['Outro', 'Intro', 'Bridge'], 1, 'An intro begins the song and may introduce its sound, pulse, or musical material.'),
    question('You arrange four bars of intro, eight bars of a full section, and four bars of ending. How long is the arrangement?', ['Eight bars', 'Twelve bars', 'Sixteen bars'], 2, 'Add the section lengths: 4 + 8 + 4 = 16 bars.'),
    question('What does A–B–A mean in a simple form?', ['An idea, a contrasting idea, then the first idea returns', 'Three different tempos in every bar', 'Three notes played together'], 0, 'Letters label sections or ideas. Repeating A tells us the first idea returns after B.'),
    question('What is a transition?', ['The root note of every chord', 'A connection between sections', 'A rule that every section lasts eight bars'], 1, 'A transition helps one section lead into another, using a fill, pause, held note, or another change.'),
    question('Which is a focused transition experiment?', ['Change every section to a new key immediately', 'Delete the entire arrangement', 'Add a short pause just before the next section'], 2, 'A short pause can draw attention to the next entrance. Listen across the section boundary to judge its effect.'),
    question('Must a song contain an intro, verse, chorus, bridge, breakdown, and outro?', ['No; choose sections that serve the song', 'Yes; otherwise it is not a song', 'Yes; each must last the same time'], 0, 'These names describe common jobs. A song can use fewer sections or other forms.'),
    question('Why might returning to A be easy to recognize after B?', ['The listener has never heard A before', 'A is familiar and B created a contrast', 'Every section has become silent'], 1, 'The listener has already heard A. Hearing a different idea in between can make its return clearer.'),
    question('You want an ending that becomes less dense. Which arrangement fits?', ['Add three new parts', 'Double every drum hit', 'Remove one or two parts near the end'], 2, 'Removing parts reduces how much is happening, which matches the stated goal.'),
    question('Are four- and eight-bar sections the only valid lengths?', ['No; they are useful practice lengths, and many others are used', 'Yes; every style requires them', 'Yes; longer sections cannot repeat'], 0, 'Regular groups can be easy to follow, but form varies across styles and individual pieces.')
  ],
  'arrangement-and-space': [
    question('What does arranging involve?', ['Only saving the finished file', 'Choosing which parts play, how they play, and when they enter', 'Only setting the tempo'], 1, 'Arranging organizes musical ideas into parts and decides how those parts interact over time.'),
    question('What does instrumentation mean?', ['The total number of beats', 'The final note of a phrase', 'The choice of instruments or sounds'], 2, 'Instrumentation is about which sounds perform the music.'),
    question('What does register mean?', ['A low, middle, or high pitch area', 'The number of files you saved', 'How many times a section repeats'], 0, 'Register describes where a part sits in pitch, rather than its loudness or speed.'),
    question('The bass and melody occupy the same pitch area and are hard to distinguish. Which experiment changes their registers?', ['Rename both tracks', 'Move the bass down an octave', 'Change only the song title'], 1, 'Moving the bass down changes its pitch area and may make the two parts easier to distinguish.'),
    question('What does musical texture describe?', ['Only the sound’s volume', 'Only the tempo', 'How the musical parts combine'], 2, 'Examples include one melody alone, melody with backing, and several independent lines.'),
    question('What does density describe here?', ['How much musical activity is happening', 'The root of a chord', 'The name of a tuning system'], 0, 'A denser passage has more activity or overlapping parts. A sparse passage has less.'),
    question('Your goal is to hear which added part hides the melody. What is a useful method?', ['Turn on every part at once and never compare', 'Start with the melody, then add one part at a time', 'Delete the melody before listening'], 1, 'Adding parts one at a time helps identify when the melody becomes harder to hear.'),
    question('An added part covers the melody. Which edit directly tests reducing that interference?', ['Make the added part much louder', 'Add more notes to every track', 'Lower that part’s volume and compare'], 2, 'Reducing its volume is one focused way to test whether the melody becomes clearer.'),
    question('Do all instruments need to play in every bar?', ['No; entrances, exits, and rests can shape the arrangement', 'Yes; otherwise the song loses its form', 'Yes; quiet instruments do not count'], 0, 'Leaving space can make other parts clearer and help sections feel different.'),
    question('You keep the notes and timing but replace a pad with a pluck. What definitely changed?', ['The written melody’s contour', 'The instrumentation', 'The number of beats per bar'], 1, 'The instrument changed. A pluck and a pad can give the same written notes different starts and durations.')
  ],
  'dynamics-and-articulation': [
    question('What are dynamics?', ['Changes in loudness', 'Only changes in pitch', 'Only the section names'], 0, 'Dynamics shape loudness over a note, phrase, or larger part of a song.'),
    question('What is an accent?', ['A note that must be lower', 'Emphasis that makes a note stand out', 'A rest lasting a whole song'], 1, 'An accent draws attention to a note, often by making it louder or giving it a stronger start.'),
    question('What does crescendo mean?', ['Gradually become quieter', 'Jump to a lower octave', 'Gradually become louder'], 2, 'A crescendo is an increase in loudness over time.'),
    question('What does diminuendo mean?', ['Gradually become quieter', 'Gradually play faster', 'Add another chord note'], 0, 'A diminuendo decreases loudness over time. It does not necessarily change speed.'),
    question('Which description matches staccato?', ['Notes that must overlap', 'Short, separated notes', 'Only very low notes'], 1, 'Staccato articulation leaves separation between notes.'),
    question('Which description matches legato?', ['Every note is random', 'Every note has the same pitch', 'Notes sound connected'], 2, 'Legato describes a connected way of playing. The instrument and timing affect how connected it sounds.'),
    question('What is a sound’s attack?', ['The way its sound begins', 'Only its final pitch', 'The length of the entire song'], 0, 'Attack describes the beginning, such as a sharp start or a gradual swell.'),
    question('A sound keeps fading after its note ends. Which setting describes that fade?', ['Tempo', 'Release', 'Beats per bar'], 1, 'Release controls the fade after the note ends. A long release can overlap later notes.'),
    question('Long fading notes make the phrase blurry. Which is a focused first experiment?', ['Raise every track’s volume', 'Make every release longer', 'Shorten the release and compare'], 2, 'Shortening the release can reduce overlap. Listen to whether the phrase becomes clearer.'),
    question('You want to hear the effect of an accent on the first note. Which comparison is most useful?', ['Keep everything else the same and make only that note louder', 'Change tempo, pitches, and instruments too', 'Compare two completely different songs'], 0, 'Changing one feature makes it easier to hear what the accent contributes.')
  ],
  'listening-and-ear-training': [
    question('What is ear training?', ['Learning to save a file', 'Practicing how to recognize and imagine musical sounds', 'Making every track louder'], 1, 'Ear training develops listening and musical imagination, including pitch, rhythm, and other sound differences.'),
    question('Do you need to name every note before making music?', ['Yes, every note in every tuning', 'Yes, otherwise listening cannot help', 'No; you can begin with differences you already hear'], 2, 'Higher/lower, earlier/later, and longer/shorter are useful starting observations.'),
    question('A full track is hard to follow. Which listening plan can make it easier?', ['Listen once for the bass alone', 'Try to describe every instrument at the same instant', 'Assume there is nothing to learn'], 0, 'Focusing on one part reduces how much you need to follow at once.'),
    question('You want to hear the effect of changing one note. Which method fits?', ['Change every note and all instruments', 'Compare the same passage before and after the one change', 'Listen only to a different song'], 1, 'A controlled comparison makes the effect of that one note easier to notice.'),
    question('You say, “The last note feels unfinished,” but do not know a theory term. Is the observation useful?', ['No, only technical terms count', 'No, feelings cannot guide musical choices', 'Yes, it describes what you hear and can guide the next edit'], 2, 'Ordinary words can capture a useful musical observation. Theory can help name it later.'),
    question('You have a melody idea but have not found its pitches yet. What can help?', ['Hum the idea before finding its notes', 'Delete the project immediately', 'Add every available effect'], 0, 'Humming can preserve the shape you imagine while you work out how to play or code it.'),
    question('You have a rhythm idea. What can help before writing its code?', ['Change only the track color', 'Tap the rhythm and listen to its timing', 'Assume rhythm must come after pitch'], 1, 'Tapping lets you hear and feel the timing before choosing the exact written pattern.'),
    question('Must every listening session include a quiz?', ['Yes, or it is not practice', 'Yes, before you can write any music', 'No; focused listening and comparison are also practice'], 2, 'Listening can be purposeful without a quiz. Questions are one optional way to check understanding.'),
    question('You want a quieter ending, and an edit makes the ending much busier and louder. What is a reasonable next action?', ['Undo it or save it for another idea, then try a change that serves the goal', 'Keep it because more activity is always better', 'Assume your original goal was impossible'], 0, 'Judging an edit against your intended sound helps you choose. An interesting result can still be useful elsewhere.'),
    question('What can repeated listening for instrument entrances teach you?', ['Only the names of note pitches', 'How the arrangement changes over time', 'The exact file size'], 1, 'Noticing when parts enter and stop helps reveal section changes, density, and arrangement.')
  ],
  'compose-and-keep-learning': [
    question('You have a four-bar idea and repeat it once. How long is the result?', ['Eight bars', 'Four bars', 'Twelve bars'], 0, 'The original four bars plus one four-bar repeat make eight bars.'),
    question('Which plan follows this lesson’s starting workflow?', ['Add every technique before hearing the loop', 'Build a small groove, bass or chord, and melody, then listen', 'Write only a title and export'], 1, 'A few parts make a complete small idea you can hear and improve.'),
    question('Why choose one goal for the next edit?', ['It guarantees every listener will agree', 'It stops you from ever changing your mind', 'It helps you judge whether that edit serves the track'], 2, 'A goal such as making the beat clearer gives you a concrete thing to listen for.'),
    question('What is harmonic rhythm?', ['How often the chords change', 'How high the melody goes', 'The volume of the bass'], 0, 'Harmonic rhythm describes the timing and rate of chord changes.'),
    question('Chords first change every two bars, then every bar. What changed?', ['Only the instrumentation', 'The harmonic rhythm became faster', 'The beats per bar must have doubled'], 1, 'The chords now change more often. The beat speed and meter can remain the same.'),
    question('What is counterpoint?', ['A rule that all parts use one pitch', 'Another name for a volume slider', 'Independent melodies that work together'], 2, 'In counterpoint, musical lines have their own shapes while combining into a whole.'),
    question('Which example is a polyrhythm?', ['Three evenly spaced hits against two over the same time', 'One instrument playing alone', 'Two instruments always hitting the same four beats'], 0, 'The three-hit and two-hit patterns divide the same span differently and sound together.'),
    question('What is a tuning system?', ['The order of sections in a song', 'A way of choosing the exact pitches of notes', 'A list of instrument names'], 1, 'Tuning systems determine pitch relationships. Twelve equal steps per octave is one widely used system.'),
    question('Are twelve equal steps per octave the only way music can organize pitches?', ['Yes, every musical tradition requires it', 'Yes, other systems cannot contain melodies', 'No, many other tuning systems exist'], 2, 'Musical traditions use a range of pitch systems. Their notes and relationships need to be understood in context.'),
    question('You want to learn a musical style that is new to you. Which starting approach is most useful?', ['Listen to specific examples and learn their practices', 'Assume your first loop’s habits apply to every tradition', 'Use only section names to guess the entire style'], 0, 'Specific listening helps you understand a tradition’s rhythms, forms, sounds, and performance choices without treating one approach as universal.')
  ]
};

type CompositionPractice = {title:string;instruction:string;listenFor:string;source:string};
const practice: Record<string,CompositionPractice> = {
  'melody-and-phrases': {
    title:'Change the ending of a four-bar melody',
    instruction:'Play the four-bar melody. Change the final D4@4 to C4@4, then play it again.',
    listenFor:'Listen to whether the fourth bar feels more settled. The repeated rhythm in the first three bars stays easy to recognize.',
    source:`tempo: 100 bpm
beats per bar: 4

track: melody
  sound: triangle
  notes: <[C4 D4 E4 rest] [C4 D4 E4 rest] [C4 E4 G4 rest] [D4@4]>
  volume: 22%

arrange:
  section: phrase
    bars: 4
    tracks: melody

show: piano roll`
  },
  'bass-and-chords': {
    title:'Hear a different bass note under one chord',
    instruction:'Listen with C2 in the bass. Change only the bass track’s C2 to E2 and listen again.',
    listenFor:'The upper chord keeps C, E, and G. Hear how changing the lowest note changes the combined sound.',
    source:`tempo: 90 bpm
beats per bar: 4

track: chord
  sound: triangle
  notes: "[C4,E4,G4]"
  volume: 12%

track: bass
  sound: sine
  notes: C2
  volume: 20%

show: piano roll`
  },
  'drum-groove': {
    title:'Put one hi-hat between the beats',
    instruction:'Play the groove. In the hats track, change only the first rest to hat.',
    listenFor:'The new hi-hat falls on the “and” after beat 1. The kick and snare keep the original beat positions.',
    source:`tempo: 100 bpm
beats per bar: 4

track: drums
  play: kick snare kick snare
  volume: 25%

track: hats
  play: hat rest hat rest hat rest hat rest
  volume: 12%

show: punchcard`
  },
  'tension-and-release': {
    title:'Compare two melody endings over a chord',
    instruction:'Listen to D4 followed by C4 over the chord. Reverse just those two melody notes to C4 D4.',
    listenFor:'Compare ending on C, which belongs to the chord, with ending on D, which is outside it. Notice whether either version feels more settled to you.',
    source:`tempo: 85 bpm
beats per bar: 4

track: chord
  sound: triangle
  notes: "[C3,E3,G3]"
  volume: 10%

track: melody
  sound: triangle
  notes: D4 C4
  volume: 20%

show: piano roll`
  },
  'song-form': {
    title:'Hear an intro become a fuller section',
    instruction:'Play the sixteen-bar arrangement. In the intro section only, change tracks: drums to tracks: drums bass.',
    listenFor:'Hear how adding bass to the intro changes the contrast when the melody enters in the full section.',
    source:`tempo: 120 bpm
beats per bar: 4

track: drums
  play: kick snare kick snare
  volume: 22%

track: bass
  sound: sine
  notes: C2 rest G2 rest
  volume: 18%

track: melody
  sound: triangle
  notes: C4 E4 G4 E4
  volume: 20%

arrange:
  section: intro
    bars: 4
    tracks: drums
  section: full
    bars: 8
    tracks: drums bass melody
  section: ending
    bars: 4
    tracks: drums bass

show: piano roll`
  },
  'arrangement-and-space': {
    title:'Separate two parts by pitch area',
    instruction:'The low-part track begins in the melody’s pitch area. Change only its notes from C4 rest G4 rest to C2 rest G2 rest.',
    listenFor:'Hear whether the two parts become easier to follow when one moves two octaves lower.',
    source:`tempo: 100 bpm
beats per bar: 4

track: low-part
  sound: triangle
  notes: C4 rest G4 rest
  volume: 16%

track: melody
  sound: triangle
  notes: C4 D4 E4 G4
  volume: 20%

show: piano roll`
  },
  'dynamics-and-articulation': {
    title:'Hear how release changes overlap',
    instruction:'Play the melody with release: 0.8 seconds. Change only that value to 0.05 seconds.',
    listenFor:'Compare the fading sound after each note. A shorter release should leave less sound overlapping the next note.',
    source:`tempo: 100 bpm
beats per bar: 4

track: melody
  sound: triangle
  notes: C4 E4 G4 E4
  release: 0.8 seconds
  volume: 18%

show: piano roll`
  },
  'listening-and-ear-training': {
    title:'Follow one part in a two-part loop',
    instruction:'Listen once for the bass alone and once for the melody. Then change only the melody’s final E4 to D4 and compare.',
    listenFor:'Describe the final note as higher or lower than before, and notice whether the phrase’s ending feels different. The bass stays the same.',
    source:`tempo: 95 bpm
beats per bar: 4

track: bass
  sound: sine
  notes: C2 rest G2 rest
  volume: 18%

track: melody
  sound: triangle
  notes: C4 E4 G4 E4
  volume: 20%

show: piano roll`
  },
  'compose-and-keep-learning': {
    title:'Make an eight-bar idea end differently',
    instruction:'Play the eight-bar melody. Change only the final group from [C4 E4 G4 E4] to [C4@4].',
    listenFor:'The first seven bars repeat the motif. Hear how holding C4 throughout bar eight changes the ending.',
    source:`tempo: 105 bpm
beats per bar: 4

track: drums
  play: kick snare kick snare
  volume: 20%

track: bass
  sound: sine
  notes: C2 rest G2 rest
  volume: 18%

track: melody
  sound: triangle
  notes: <[C4 E4 G4 E4] [C4 E4 G4 E4] [C4 E4 G4 E4] [C4 E4 G4 E4] [C4 E4 G4 E4] [C4 E4 G4 E4] [C4 E4 G4 E4] [C4 E4 G4 E4]>
  volume: 20%

arrange:
  section: idea
    bars: 8
    tracks: drums bass melody

show: piano roll`
  }
};

export const compositionLessons = lessons.map(lesson => ({...lesson, questions: questions[lesson.id], practice: practice[lesson.id]}));
