import type { CategoryId, CommandSpec } from './types';
import helpA from './command-help-a.json';
import helpB from './command-help-b.json';
import helpC from './command-help-c.json';
const suppliedRows: {level:number;names:string[];description:string}[] = [
  {
    "names": [
      "s()",
      "sound()"
    ],
    "level": 1,
    "description": "Selects a sample, instrument, or synthesizer sound."
  },
  {
    "names": [
      "note()"
    ],
    "level": 1,
    "description": "Selects musical pitches, such as C4 or F#3."
  },
  {
    "names": [
      "freq()"
    ],
    "level": 1,
    "description": "Sets the sound's frequency directly in Hertz (Hz)."
  },
  {
    "names": [
      "n()"
    ],
    "level": 1,
    "description": "Selects numbered positions in scales, chords, or sample collections."
  },
  {
    "names": [
      "bank()"
    ],
    "level": 1,
    "description": "Selects a collection of sounds, such as a drum machine."
  },
  {
    "names": [
      "setcpm()"
    ],
    "level": 1,
    "description": "Sets the global tempo in cycles per minute."
  },
  {
    "names": [
      "setcps()"
    ],
    "level": 1,
    "description": "Sets the global tempo in cycles per second."
  },
  {
    "names": [
      "cpm()"
    ],
    "level": 1,
    "description": "Sets the tempo of an individual pattern."
  },
  {
    "names": [
      "gain()"
    ],
    "level": 1,
    "description": "Adjusts the volume of sounds."
  },
  {
    "names": [
      "silence"
    ],
    "level": 1,
    "description": "Produces an empty, silent pattern."
  },
  {
    "names": [
      "hush()"
    ],
    "level": 1,
    "description": "Silences a pattern."
  },
  {
    "names": [
      "$:"
    ],
    "level": 1,
    "description": "Starts a playable pattern line, allowing several patterns to run together."
  },
  {
    "names": [
      "_$:"
    ],
    "level": 1,
    "description": "Mutes a pattern line without deleting it."
  },
  {
    "names": [
      "\" \""
    ],
    "level": 2,
    "description": "Surrounds a pattern; spaces between items create a sequence."
  },
  {
    "names": [
      " ",
      " "
    ],
    "level": 2,
    "description": "Allows a pattern to occupy several lines."
  },
  {
    "names": [
      "' '"
    ],
    "level": 2,
    "description": "Creates an ordinary text string."
  },
  {
    "names": [
      "()"
    ],
    "level": 2,
    "description": "Passes information into a function."
  },
  {
    "names": [
      "."
    ],
    "level": 2,
    "description": "Chains functions together, such as `.gain(0.5)`."
  },
  {
    "names": [
      "[]"
    ],
    "level": 2,
    "description": "Groups sounds into a subdivision of time."
  },
  {
    "names": [
      "<>"
    ],
    "level": 2,
    "description": "Alternates between items over successive cycles."
  },
  {
    "names": [
      "*"
    ],
    "level": 2,
    "description": "Makes a pattern repeat faster."
  },
  {
    "names": [
      "/"
    ],
    "level": 2,
    "description": "Makes a pattern play slower."
  },
  {
    "names": [
      "~",
      "-"
    ],
    "level": 2,
    "description": "Creates silence or a rest."
  },
  {
    "names": [
      ","
    ],
    "level": 2,
    "description": "Plays sounds simultaneously."
  },
  {
    "names": [
      "!"
    ],
    "level": 2,
    "description": "Repeats an item without speeding up the surrounding pattern."
  },
  {
    "names": [
      "@"
    ],
    "level": 2,
    "description": "Gives an item more time relative to other items."
  },
  {
    "names": [
      "_"
    ],
    "level": 2,
    "description": "Extends an item's time in mini-notation."
  },
  {
    "names": [
      "?"
    ],
    "level": 2,
    "description": "Randomly removes events according to probability."
  },
  {
    "names": [
      "{}"
    ],
    "level": 2,
    "description": "Groups patterns for polymeter."
  },
  {
    "names": [
      "%"
    ],
    "level": 2,
    "description": "Specifies the step count for a polymeter."
  },
  {
    "names": [
      "(3,8)"
    ],
    "level": 2,
    "description": "Distributes three hits across eight positions."
  },
  {
    "names": [
      ":"
    ],
    "level": 2,
    "description": "Separates values or selects variants, depending on context."
  },
  {
    "names": [
      "#",
      "b"
    ],
    "level": 2,
    "description": "Marks sharp or flat musical pitches."
  },
  {
    "names": [
      "x"
    ],
    "level": 2,
    "description": "Represents an active step in rhythm structures."
  },
  {
    "names": [
      "^"
    ],
    "level": 2,
    "description": "Marks a subdivision's step level in advanced stepwise patterns."
  },
  {
    "names": [
      "//"
    ],
    "level": 2,
    "description": "Turns the rest of a code line into a comment that Strudel ignores."
  },
  {
    "names": [
      "seq()",
      "fastcat()"
    ],
    "level": 3,
    "description": "Plays several patterns in sequence within one cycle."
  },
  {
    "names": [
      "cat()",
      "slowcat()"
    ],
    "level": 3,
    "description": "Plays patterns in sequence, giving each a full cycle."
  },
  {
    "names": [
      "stack()"
    ],
    "level": 3,
    "description": "Plays multiple patterns at the same time."
  },
  {
    "names": [
      "stepcat()"
    ],
    "level": 3,
    "description": "Joins patterns according to their step lengths."
  },
  {
    "names": [
      "arrange()"
    ],
    "level": 3,
    "description": "Organizes patterns into a longer sequence of sections."
  },
  {
    "names": [
      "polymeter()"
    ],
    "level": 3,
    "description": "Combines patterns with different step counts."
  },
  {
    "names": [
      "polymeterSteps()"
    ],
    "level": 3,
    "description": "Makes a polymeter using an explicit number of steps."
  },
  {
    "names": [
      "run()"
    ],
    "level": 3,
    "description": "Creates a sequence of numbers starting at zero."
  },
  {
    "names": [
      "binary()"
    ],
    "level": 3,
    "description": "Converts a number into a pattern of zeros and ones."
  },
  {
    "names": [
      "binaryN()"
    ],
    "level": 3,
    "description": "Creates a binary pattern with a specified length."
  },
  {
    "names": [
      "fast()"
    ],
    "level": 4,
    "description": "Speeds up a repeating pattern."
  },
  {
    "names": [
      "slow()"
    ],
    "level": 4,
    "description": "Slows down a repeating pattern."
  },
  {
    "names": [
      "rev()"
    ],
    "level": 4,
    "description": "Reverses the order of events within each cycle."
  },
  {
    "names": [
      "palindrome()"
    ],
    "level": 4,
    "description": "Alternates between normal and reversed playback."
  },
  {
    "names": [
      "early()"
    ],
    "level": 4,
    "description": "Moves events earlier in time."
  },
  {
    "names": [
      "late()"
    ],
    "level": 4,
    "description": "Moves events later in time."
  },
  {
    "names": [
      "swing()"
    ],
    "level": 4,
    "description": "Adds rhythmic swing or shuffle."
  },
  {
    "names": [
      "swingBy()"
    ],
    "level": 4,
    "description": "Gives more detailed control over swing."
  },
  {
    "names": [
      "ply()"
    ],
    "level": 4,
    "description": "Repeats each event a specified number of times."
  },
  {
    "names": [
      "euclid()"
    ],
    "level": 4,
    "description": "Distributes beats evenly over a number of steps."
  },
  {
    "names": [
      "euclidRot()"
    ],
    "level": 4,
    "description": "Rotates the position of a Euclidean rhythm."
  },
  {
    "names": [
      "euclidLegato()"
    ],
    "level": 4,
    "description": "Connects the pulses of a Euclidean rhythm."
  },
  {
    "names": [
      "iter()"
    ],
    "level": 4,
    "description": "Shifts the starting subdivision across cycles."
  },
  {
    "names": [
      "iterBack()"
    ],
    "level": 4,
    "description": "Shifts subdivisions in the opposite direction."
  },
  {
    "names": [
      "segment()"
    ],
    "level": 4,
    "description": "Turns a pattern into a specified number of events per cycle."
  },
  {
    "names": [
      "compress()"
    ],
    "level": 4,
    "description": "Squeezes a pattern into part of a cycle."
  },
  {
    "names": [
      "zoom()"
    ],
    "level": 4,
    "description": "Selects a section of a pattern and expands it to fill a cycle."
  },
  {
    "names": [
      "linger()"
    ],
    "level": 4,
    "description": "Repeats a selected fraction of a pattern."
  },
  {
    "names": [
      "fastGap()"
    ],
    "level": 4,
    "description": "Speeds up a pattern while leaving a gap afterward."
  },
  {
    "names": [
      "inside()"
    ],
    "level": 4,
    "description": "Applies a transformation at a smaller time scale."
  },
  {
    "names": [
      "outside()"
    ],
    "level": 4,
    "description": "Applies a transformation at a larger time scale."
  },
  {
    "names": [
      "ribbon()"
    ],
    "level": 4,
    "description": "Loops a selected span of musical time."
  },
  {
    "names": [
      "clip()",
      "legato()"
    ],
    "level": 4,
    "description": "Changes how long events last relative to their allotted time."
  },
  {
    "names": [
      "scale()"
    ],
    "level": 5,
    "description": "Converts numbered positions into musical notes in a chosen scale."
  },
  {
    "names": [
      "transpose()"
    ],
    "level": 5,
    "description": "Moves notes up or down by a number of semitones."
  },
  {
    "names": [
      "scaleTranspose()"
    ],
    "level": 5,
    "description": "Moves notes by steps within their scale."
  },
  {
    "names": [
      "chord()"
    ],
    "level": 5,
    "description": "Specifies musical chords by name."
  },
  {
    "names": [
      "voicing()"
    ],
    "level": 5,
    "description": "Turns chord names into actual combinations of notes."
  },
  {
    "names": [
      "dict()"
    ],
    "level": 5,
    "description": "Chooses a library of chord voicings."
  },
  {
    "names": [
      "anchor()"
    ],
    "level": 5,
    "description": "Sets a reference pitch for arranging chord notes."
  },
  {
    "names": [
      "mode()"
    ],
    "level": 5,
    "description": "Controls how chord notes are positioned around a reference pitch."
  },
  {
    "names": [
      "rootNotes()"
    ],
    "level": 5,
    "description": "Extracts the root note of each chord."
  },
  {
    "names": [
      "arp()"
    ],
    "level": 5,
    "description": "Selects notes from a chord to create an arpeggio."
  },
  {
    "names": [
      "arpWith()"
    ],
    "level": 5,
    "description": "Uses a custom function to select notes from a chord."
  },
  {
    "names": [
      "samples()"
    ],
    "level": 6,
    "description": "Loads additional sound libraries or audio files."
  },
  {
    "names": [
      "soundAlias()"
    ],
    "level": 6,
    "description": "Gives a sound another name."
  },
  {
    "names": [
      "begin()"
    ],
    "level": 6,
    "description": "Changes where playback starts inside a sample."
  },
  {
    "names": [
      "end()"
    ],
    "level": 6,
    "description": "Changes where playback stops inside a sample."
  },
  {
    "names": [
      "loop()"
    ],
    "level": 6,
    "description": "Repeats an audio sample continuously."
  },
  {
    "names": [
      "loopBegin()"
    ],
    "level": 6,
    "description": "Sets the beginning of the looping region."
  },
  {
    "names": [
      "loopEnd()"
    ],
    "level": 6,
    "description": "Sets the end of the looping region."
  },
  {
    "names": [
      "loopAt()"
    ],
    "level": 6,
    "description": "Adjusts a loop to occupy a selected musical duration."
  },
  {
    "names": [
      "cut()"
    ],
    "level": 6,
    "description": "Places sounds into groups that can interrupt one another."
  },
  {
    "names": [
      "fit()"
    ],
    "level": 6,
    "description": "Adjusts sample playback to match a musical duration."
  },
  {
    "names": [
      "chop()"
    ],
    "level": 6,
    "description": "Divides a sample into repeating pieces."
  },
  {
    "names": [
      "striate()"
    ],
    "level": 6,
    "description": "Breaks a sample into smaller segments and plays them across an event."
  },
  {
    "names": [
      "slice()"
    ],
    "level": 6,
    "description": "Divides a sample into slices that we can select."
  },
  {
    "names": [
      "splice()"
    ],
    "level": 6,
    "description": "Plays selected slices at speeds fitted to their timing."
  },
  {
    "names": [
      "scrub()"
    ],
    "level": 6,
    "description": "Moves through different positions within an audio sample."
  },
  {
    "names": [
      "speed()"
    ],
    "level": 6,
    "description": "Changes playback speed and usually changes pitch as well."
  },
  {
    "names": [
      "partials()"
    ],
    "level": 7,
    "description": "Controls the individual harmonics that make up a sound."
  },
  {
    "names": [
      "phases()"
    ],
    "level": 7,
    "description": "Changes the starting positions of those harmonics."
  },
  {
    "names": [
      "noise()"
    ],
    "level": 7,
    "description": "Adds noise to a synthesized sound."
  },
  {
    "names": [
      "density()"
    ],
    "level": 7,
    "description": "Controls the density of crackling noise."
  },
  {
    "names": [
      "vib()"
    ],
    "level": 7,
    "description": "Adds vibrato, a repeated movement in pitch."
  },
  {
    "names": [
      "vibmod()"
    ],
    "level": 7,
    "description": "Controls how far the vibrato moves the pitch."
  },
  {
    "names": [
      "fm()"
    ],
    "level": 7,
    "description": "Changes tone using frequency modulation."
  },
  {
    "names": [
      "fmh()"
    ],
    "level": 7,
    "description": "Controls the frequency relationship used by FM synthesis."
  },
  {
    "names": [
      "fmattack()"
    ],
    "level": 7,
    "description": "Controls how quickly FM modulation develops."
  },
  {
    "names": [
      "fmdecay()"
    ],
    "level": 7,
    "description": "Controls how quickly FM modulation falls."
  },
  {
    "names": [
      "fmsustain()"
    ],
    "level": 7,
    "description": "Sets the continuing FM modulation level."
  },
  {
    "names": [
      "fmenv()"
    ],
    "level": 7,
    "description": "Sets the amount of FM envelope modulation."
  },
  {
    "names": [
      "lfo()"
    ],
    "level": 7,
    "description": "Creates continuous modulation of sound parameters."
  },
  {
    "names": [
      "attack()"
    ],
    "level": 7,
    "description": "Controls how quickly a sound rises in volume."
  },
  {
    "names": [
      "decay()"
    ],
    "level": 7,
    "description": "Controls how quickly volume falls after its initial peak."
  },
  {
    "names": [
      "sustain()"
    ],
    "level": 7,
    "description": "Sets the continuing volume level while a note is held."
  },
  {
    "names": [
      "release()"
    ],
    "level": 7,
    "description": "Controls how long a sound fades after the note ends."
  },
  {
    "names": [
      "adsr()"
    ],
    "level": 7,
    "description": "Sets attack, decay, sustain, and release together."
  },
  {
    "names": [
      "lpf()",
      "cutoff()"
    ],
    "level": 8,
    "description": "Removes high frequencies above a chosen cutoff."
  },
  {
    "names": [
      "lpq()"
    ],
    "level": 8,
    "description": "Controls lowpass filter resonance."
  },
  {
    "names": [
      "hpf()"
    ],
    "level": 8,
    "description": "Removes low frequencies below a chosen cutoff."
  },
  {
    "names": [
      "hpq()"
    ],
    "level": 8,
    "description": "Controls highpass filter resonance."
  },
  {
    "names": [
      "bpf()"
    ],
    "level": 8,
    "description": "Allows a selected band of frequencies through."
  },
  {
    "names": [
      "bpq()"
    ],
    "level": 8,
    "description": "Controls bandpass filter resonance."
  },
  {
    "names": [
      "ftype()"
    ],
    "level": 8,
    "description": "Selects the filter's type or response."
  },
  {
    "names": [
      "vowel()"
    ],
    "level": 8,
    "description": "Gives the sound vowel-like qualities."
  },
  {
    "names": [
      "lpattack()"
    ],
    "level": 8,
    "description": "Sets the attack time of a lowpass filter envelope."
  },
  {
    "names": [
      "lpdecay()"
    ],
    "level": 8,
    "description": "Sets how quickly that filter envelope falls."
  },
  {
    "names": [
      "lpsustain()"
    ],
    "level": 8,
    "description": "Sets the continuing filter envelope level."
  },
  {
    "names": [
      "lprelease()"
    ],
    "level": 8,
    "description": "Sets the filter envelope release time."
  },
  {
    "names": [
      "lpenv()"
    ],
    "level": 8,
    "description": "Controls how strongly the lowpass filter moves."
  },
  {
    "names": [
      "pattack()"
    ],
    "level": 8,
    "description": "Sets the attack time of a pitch envelope."
  },
  {
    "names": [
      "pdecay()"
    ],
    "level": 8,
    "description": "Sets the decay time of a pitch envelope."
  },
  {
    "names": [
      "prelease()"
    ],
    "level": 8,
    "description": "Sets the release time of a pitch envelope."
  },
  {
    "names": [
      "penv()"
    ],
    "level": 8,
    "description": "Controls how much the pitch changes over time."
  },
  {
    "names": [
      "pcurve()"
    ],
    "level": 8,
    "description": "Controls the shape of the pitch movement."
  },
  {
    "names": [
      "panchor()"
    ],
    "level": 8,
    "description": "Sets the pitch envelope's reference position."
  },
  {
    "names": [
      "velocity()"
    ],
    "level": 8,
    "description": "Sets note intensity."
  },
  {
    "names": [
      "compressor()"
    ],
    "level": 8,
    "description": "Controls differences between louder and quieter sounds."
  },
  {
    "names": [
      "postgain()"
    ],
    "level": 8,
    "description": "Adjusts volume after effects have been processed."
  },
  {
    "names": [
      "xfade()"
    ],
    "level": 8,
    "description": "Gradually blends between two patterns."
  },
  {
    "names": [
      "pan()"
    ],
    "level": 8,
    "description": "Moves sound between the left and right speakers."
  },
  {
    "names": [
      "jux()"
    ],
    "level": 8,
    "description": "Plays a transformed version in the right stereo channel."
  },
  {
    "names": [
      "juxBy()"
    ],
    "level": 8,
    "description": "Adjusts the stereo width of that transformation."
  },
  {
    "names": [
      "coarse()"
    ],
    "level": 8,
    "description": "Reduces the effective sample rate."
  },
  {
    "names": [
      "crush()"
    ],
    "level": 8,
    "description": "Reduces the audio bit depth."
  },
  {
    "names": [
      "distort()"
    ],
    "level": 8,
    "description": "Adds distortion, making sounds rougher or more aggressive."
  },
  {
    "names": [
      "orbit()"
    ],
    "level": 8,
    "description": "Assigns sounds to shared effect groups."
  },
  {
    "names": [
      "delay()"
    ],
    "level": 8,
    "description": "Adds repeated echoes."
  },
  {
    "names": [
      "delaytime()"
    ],
    "level": 8,
    "description": "Controls the time between echoes."
  },
  {
    "names": [
      "delayfeedback()"
    ],
    "level": 8,
    "description": "Controls how much of each echo feeds back into the next."
  },
  {
    "names": [
      "room()"
    ],
    "level": 8,
    "description": "Adds reverberation, creating a sense of space."
  },
  {
    "names": [
      "roomsize()"
    ],
    "level": 8,
    "description": "Changes the apparent size of that space."
  },
  {
    "names": [
      "roomfade()"
    ],
    "level": 8,
    "description": "Controls the reverb fade time."
  },
  {
    "names": [
      "roomlp()"
    ],
    "level": 8,
    "description": "Filters high frequencies in the reverb."
  },
  {
    "names": [
      "roomdim()"
    ],
    "level": 8,
    "description": "Further controls the reverb's frequency decay."
  },
  {
    "names": [
      "iresponse()"
    ],
    "level": 8,
    "description": "Selects an impulse response for reverberation."
  },
  {
    "names": [
      "phaser()"
    ],
    "level": 8,
    "description": "Creates a moving, sweeping effect."
  },
  {
    "names": [
      "phaserdepth()"
    ],
    "level": 8,
    "description": "Controls the strength of the phaser."
  },
  {
    "names": [
      "phasercenter()"
    ],
    "level": 8,
    "description": "Controls its center frequency."
  },
  {
    "names": [
      "phasersweep()"
    ],
    "level": 8,
    "description": "Controls its frequency sweep range."
  },
  {
    "names": [
      "am()"
    ],
    "level": 8,
    "description": "Applies amplitude modulation."
  },
  {
    "names": [
      "tremolosync()"
    ],
    "level": 8,
    "description": "Sets tremolo speed relative to cycles."
  },
  {
    "names": [
      "tremolodepth()"
    ],
    "level": 8,
    "description": "Controls how much the volume pulses."
  },
  {
    "names": [
      "tremoloskew()"
    ],
    "level": 8,
    "description": "Adjusts the shape of those pulses."
  },
  {
    "names": [
      "tremolophase()"
    ],
    "level": 8,
    "description": "Shifts the position of the tremolo cycle."
  },
  {
    "names": [
      "tremoloshape()"
    ],
    "level": 8,
    "description": "Chooses the tremolo waveform."
  },
  {
    "names": [
      "duckorbit()"
    ],
    "level": 8,
    "description": "Makes one sound reduce another sound's volume."
  },
  {
    "names": [
      "duckattack()"
    ],
    "level": 8,
    "description": "Controls the ducked sound's volume recovery."
  },
  {
    "names": [
      "duckdepth()"
    ],
    "level": 8,
    "description": "Controls the strength of the volume reduction."
  },
  {
    "names": [
      "choose()"
    ],
    "level": 9,
    "description": "Randomly chooses a value."
  },
  {
    "names": [
      "wchoose()"
    ],
    "level": 9,
    "description": "Chooses randomly with different probabilities."
  },
  {
    "names": [
      "chooseCycles()"
    ],
    "level": 9,
    "description": "Randomly chooses a pattern each cycle."
  },
  {
    "names": [
      "wchooseCycles()"
    ],
    "level": 9,
    "description": "Chooses a pattern each cycle using weighted probabilities."
  },
  {
    "names": [
      "degrade()"
    ],
    "level": 9,
    "description": "Randomly removes about half of the events."
  },
  {
    "names": [
      "degradeBy()"
    ],
    "level": 9,
    "description": "Controls the chance that events are removed."
  },
  {
    "names": [
      "undegrade()"
    ],
    "level": 9,
    "description": "Selects the complementary random events."
  },
  {
    "names": [
      "undegradeBy()"
    ],
    "level": 9,
    "description": "Controls that complementary selection probability."
  },
  {
    "names": [
      "sometimes()"
    ],
    "level": 9,
    "description": "Applies a change randomly, with a 50% chance."
  },
  {
    "names": [
      "sometimesBy()"
    ],
    "level": 9,
    "description": "Applies a change with a chosen probability."
  },
  {
    "names": [
      "someCycles()"
    ],
    "level": 9,
    "description": "Randomly changes entire cycles."
  },
  {
    "names": [
      "someCyclesBy()"
    ],
    "level": 9,
    "description": "Changes cycles according to a chosen probability."
  },
  {
    "names": [
      "often()"
    ],
    "level": 9,
    "description": "Applies a change 75% of the time."
  },
  {
    "names": [
      "rarely()"
    ],
    "level": 9,
    "description": "Applies a change 25% of the time."
  },
  {
    "names": [
      "almostNever()"
    ],
    "level": 9,
    "description": "Applies a change 10% of the time."
  },
  {
    "names": [
      "almostAlways()"
    ],
    "level": 9,
    "description": "Applies a change 90% of the time."
  },
  {
    "names": [
      "never()"
    ],
    "level": 9,
    "description": "Prevents a given transformation from being applied."
  },
  {
    "names": [
      "always()"
    ],
    "level": 9,
    "description": "Always applies the transformation."
  },
  {
    "names": [
      "firstOf()"
    ],
    "level": 9,
    "description": "Makes a change at the beginning of each group of cycles."
  },
  {
    "names": [
      "lastOf()"
    ],
    "level": 9,
    "description": "Makes a change at the end of each group of cycles."
  },
  {
    "names": [
      "when()"
    ],
    "level": 9,
    "description": "Applies a change when a condition is active."
  },
  {
    "names": [
      "chunk()"
    ],
    "level": 9,
    "description": "Changes one selected subdivision at a time."
  },
  {
    "names": [
      "chunkBack()"
    ],
    "level": 9,
    "description": "Processes subdivisions in the opposite order."
  },
  {
    "names": [
      "fastChunk()"
    ],
    "level": 9,
    "description": "Applies chunk transformations without the same cycle repetition."
  },
  {
    "names": [
      "struct()"
    ],
    "level": 9,
    "description": "Places events according to a chosen rhythmic structure."
  },
  {
    "names": [
      "mask()"
    ],
    "level": 9,
    "description": "Turns parts of a pattern on or off."
  },
  {
    "names": [
      "reset()"
    ],
    "level": 9,
    "description": "Resets a pattern to the beginning of its cycle."
  },
  {
    "names": [
      "restart()"
    ],
    "level": 9,
    "description": "Restarts a pattern from its first cycle."
  },
  {
    "names": [
      "invert()"
    ],
    "level": 9,
    "description": "Switches zeros and ones in a binary pattern."
  },
  {
    "names": [
      "pick()"
    ],
    "level": 9,
    "description": "Selects a pattern using an index or name."
  },
  {
    "names": [
      "pickmod()"
    ],
    "level": 9,
    "description": "Like `pick()`, but wraps indexes around the choices."
  },
  {
    "names": [
      "pickF()"
    ],
    "level": 9,
    "description": "Chooses which transformation function to apply."
  },
  {
    "names": [
      "pickmodF()"
    ],
    "level": 9,
    "description": "Like `pickF()`, with wrapping indexes."
  },
  {
    "names": [
      "pickRestart()"
    ],
    "level": 9,
    "description": "Selects a pattern and restarts it."
  },
  {
    "names": [
      "pickmodRestart()"
    ],
    "level": 9,
    "description": "Adds wrapping indexes to `pickRestart()`."
  },
  {
    "names": [
      "pickReset()"
    ],
    "level": 9,
    "description": "Selects a pattern and resets its current cycle."
  },
  {
    "names": [
      "pickmodReset()"
    ],
    "level": 9,
    "description": "Adds wrapping indexes to `pickReset()`."
  },
  {
    "names": [
      "inhabit()"
    ],
    "level": 9,
    "description": "Places selected patterns inside another pattern's timing."
  },
  {
    "names": [
      "inhabitmod()"
    ],
    "level": 9,
    "description": "Like `inhabit()`, with wrapping indexes."
  },
  {
    "names": [
      "squeeze()"
    ],
    "level": 9,
    "description": "Compresses selected patterns into individual events."
  },
  {
    "names": [
      "superimpose()"
    ],
    "level": 9,
    "description": "Adds transformed copies over the original pattern."
  },
  {
    "names": [
      "layer()"
    ],
    "level": 9,
    "description": "Combines transformed copies into layers."
  },
  {
    "names": [
      "off()"
    ],
    "level": 9,
    "description": "Adds a modified copy shifted in time."
  },
  {
    "names": [
      "echo()"
    ],
    "level": 9,
    "description": "Repeats patterns with delays and decreasing intensity."
  },
  {
    "names": [
      "echoWith()"
    ],
    "level": 9,
    "description": "Creates repeated copies with custom transformations."
  },
  {
    "names": [
      "add()"
    ],
    "level": 10,
    "description": "Adds a number to pattern values."
  },
  {
    "names": [
      "sub()"
    ],
    "level": 10,
    "description": "Subtracts a number from pattern values."
  },
  {
    "names": [
      "mul()"
    ],
    "level": 10,
    "description": "Multiplies pattern values."
  },
  {
    "names": [
      "div()"
    ],
    "level": 10,
    "description": "Divides pattern values."
  },
  {
    "names": [
      "round()"
    ],
    "level": 10,
    "description": "Rounds values to the nearest integer."
  },
  {
    "names": [
      "floor()"
    ],
    "level": 10,
    "description": "Rounds values downward."
  },
  {
    "names": [
      "ceil()"
    ],
    "level": 10,
    "description": "Rounds values upward."
  },
  {
    "names": [
      "range()"
    ],
    "level": 10,
    "description": "Maps values from 0–1 into a selected range."
  },
  {
    "names": [
      "rangex()"
    ],
    "level": 10,
    "description": "Maps values using an exponential range."
  },
  {
    "names": [
      "range2()"
    ],
    "level": 10,
    "description": "Maps values from −1 to 1 into a selected range."
  },
  {
    "names": [
      "ratio()"
    ],
    "level": 10,
    "description": "Creates numerical frequency ratios."
  },
  {
    "names": [
      "as()"
    ],
    "level": 10,
    "description": "Assigns several control values from a pattern."
  },
  {
    "names": [
      "sine"
    ],
    "level": 10,
    "description": "Generates a smooth, repeating sine signal."
  },
  {
    "names": [
      "cosine"
    ],
    "level": 10,
    "description": "Generates a cosine signal."
  },
  {
    "names": [
      "saw"
    ],
    "level": 10,
    "description": "Generates a rising sawtooth signal."
  },
  {
    "names": [
      "tri"
    ],
    "level": 10,
    "description": "Generates a rising and falling triangle signal."
  },
  {
    "names": [
      "square"
    ],
    "level": 10,
    "description": "Generates a signal switching between two values."
  },
  {
    "names": [
      "rand"
    ],
    "level": 10,
    "description": "Generates random values."
  },
  {
    "names": [
      "sine2",
      "saw2"
    ],
    "level": 10,
    "description": "Generate corresponding signals between −1 and 1."
  },
  {
    "names": [
      "perlin"
    ],
    "level": 10,
    "description": "Generates smoothly varying random values."
  },
  {
    "names": [
      "irand()"
    ],
    "level": 10,
    "description": "Generates random whole numbers."
  },
  {
    "names": [
      "brand"
    ],
    "level": 10,
    "description": "Generates random zeros and ones."
  },
  {
    "names": [
      "brandBy()"
    ],
    "level": 10,
    "description": "Controls the probability of random ones."
  },
  {
    "names": [
      "time"
    ],
    "level": 10,
    "description": "Provides the current cycle time as a signal."
  },
  {
    "names": [
      "signal()"
    ],
    "level": 10,
    "description": "Defines a custom continuous signal."
  },
  {
    "names": [
      "mousex"
    ],
    "level": 10,
    "description": "Reads horizontal mouse position."
  },
  {
    "names": [
      "mousey"
    ],
    "level": 10,
    "description": "Reads vertical mouse position."
  },
  {
    "names": [
      "pace()"
    ],
    "level": 11,
    "description": "Fits a pattern to a specified number of steps per cycle."
  },
  {
    "names": [
      "stepalt()"
    ],
    "level": 11,
    "description": "Joins patterns while accounting for step counts and alternatives."
  },
  {
    "names": [
      "expand()"
    ],
    "level": 11,
    "description": "Expands the size of pattern steps."
  },
  {
    "names": [
      "contract()"
    ],
    "level": 11,
    "description": "Contracts the size of pattern steps."
  },
  {
    "names": [
      "extend()"
    ],
    "level": 11,
    "description": "Repeats events while increasing the step count."
  },
  {
    "names": [
      "take()"
    ],
    "level": 11,
    "description": "Keeps a selected number of steps."
  },
  {
    "names": [
      "drop()"
    ],
    "level": 11,
    "description": "Removes a selected number of steps."
  },
  {
    "names": [
      "shrink()"
    ],
    "level": 11,
    "description": "Makes a pattern progressively shorter."
  },
  {
    "names": [
      "grow()"
    ],
    "level": 11,
    "description": "Makes a pattern progressively longer."
  },
  {
    "names": [
      "tour()"
    ],
    "level": 11,
    "description": "Moves an inserted pattern through a series of other patterns."
  },
  {
    "names": [
      "zip()"
    ],
    "level": 11,
    "description": "Interleaves the steps of multiple patterns."
  },
  {
    "names": [
      "color()"
    ],
    "level": 11,
    "description": "Changes the visual color of events."
  },
  {
    "names": [
      "pianoroll()"
    ],
    "level": 11,
    "description": "Displays note patterns visually."
  },
  {
    "names": [
      "punchcard()"
    ],
    "level": 11,
    "description": "Displays pattern events with their transformations."
  },
  {
    "names": [
      "spiral()"
    ],
    "level": 11,
    "description": "Displays patterns on a moving spiral."
  },
  {
    "names": [
      "scope()"
    ],
    "level": 11,
    "description": "Displays the audio waveform."
  },
  {
    "names": [
      "pitchwheel()"
    ],
    "level": 11,
    "description": "Displays pitches around a circle."
  },
  {
    "names": [
      "spectrum()"
    ],
    "level": 11,
    "description": "Shows the frequency content of sound."
  },
  {
    "names": [
      "markcss()"
    ],
    "level": 11,
    "description": "Customizes the appearance of highlighted code."
  },
  {
    "names": [
      "log()"
    ],
    "level": 11,
    "description": "Displays event information for inspection."
  },
  {
    "names": [
      "midi()"
    ],
    "level": 12,
    "description": "Sends musical information to MIDI devices or software."
  },
  {
    "names": [
      "midin()"
    ],
    "level": 12,
    "description": "Receives MIDI controller information."
  },
  {
    "names": [
      "midikeys()"
    ],
    "level": 12,
    "description": "Receives notes from a MIDI keyboard."
  },
  {
    "names": [
      "midiport()"
    ],
    "level": 12,
    "description": "Selects a MIDI output device."
  },
  {
    "names": [
      "midichan()"
    ],
    "level": 12,
    "description": "Selects a MIDI channel."
  },
  {
    "names": [
      "midicmd()"
    ],
    "level": 12,
    "description": "Sends MIDI clock and transport commands."
  },
  {
    "names": [
      "osc()"
    ],
    "level": 12,
    "description": "Sends pattern events through Open Sound Control."
  }
]
;
export const categories: {id:CategoryId;title:string;color:string}[] = [
{id:'sounds',title:'Sounds and instruments',color:'#8be0b9'}, {id:'samples',title:'Audio samples',color:'#f0b78d'},
{id:'notes',title:'Notes, scales, and chords',color:'#91d8ff'}, {id:'timing',title:'Timing and rhythm',color:'#b5df91'},
{id:'structure',title:'Tracks, patterns, and songs',color:'#a1e9cf'}, {id:'effects',title:'Volume and effects',color:'#f1a7bb'},
{id:'variation',title:'Variation and randomness',color:'#f0cb82'}, {id:'math',title:'Numbers and moving controls',color:'#abc4ff'},
{id:'visuals',title:'Music visuals',color:'#88dedc'}, {id:'connections',title:'External connections · later',color:'#bdc8c1'}];
const levelCategories:Record<number,CategoryId>={1:'sounds',2:'timing',3:'structure',4:'timing',5:'notes',6:'samples',7:'sounds',8:'effects',9:'variation',10:'math',11:'timing',12:'connections'};
const practical:Record<string,{name:string;aliases?:string[];category?:CategoryId}>={
sound:{name:'sound',aliases:['s']},note:{name:'notes',aliases:['nt'],category:'notes'},freq:{name:'frequency',category:'notes'},n:{name:'positions',category:'notes'},gain:{name:'volume',aliases:['v'],category:'effects'},fast:{name:'faster'},slow:{name:'slower'},room:{name:'reverb',aliases:['rvb']},lpf:{name:'lowpass',aliases:['cutoff']},hpf:{name:'highpass'},bpf:{name:'bandpass'},attack:{name:'attack',aliases:['atk']},decay:{name:'decay',aliases:['dec']},release:{name:'release',aliases:['rel']},delay:{name:'delay',aliases:['dly']},pianoroll:{name:'piano roll',category:'visuals'},scope:{name:'waveform',category:'visuals'},pitchwheel:{name:'pitch wheel',category:'visuals'}};
const visualNames=new Set('color pianoroll punchcard spiral scope pitchwheel spectrum markcss log'.split(' '));
const transforms=new Set('inside outside arpWith jux juxBy sometimes sometimesBy someCycles someCyclesBy often rarely almostNever almostAlways never always firstOf lastOf when chunk chunkBack fastChunk superimpose layer off echoWith every'.split(' '));
const signals=new Set('sine cosine saw tri square rand sine2 cosine2 saw2 tri2 square2 rand2 perlin perlin2 brand time mousex mousey'.split(' '));
const noValue=new Set('silence hush rev palindrome degrade undegrade invert round floor ceil voicing fit ratio'.split(' '));
function readable(name:string){return name.replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase();}
function slider(native:string):CommandSpec['slider']{
if(['gain','postgain'].includes(native))return{min:0,max:1,step:0.01,unit:'%'};
if(['room','delay','delayfeedback','pan','sustain','noise','degradeBy','undegradeBy','tremolodepth','duckdepth'].includes(native))return{min:0,max:1,step:0.01,unit:'%'};
if(['freq','lpf','hpf','bpf','roomlp','roomdim','phasercenter'].includes(native))return{min:20,max:20000,step:1,unit:'Hz',scale:'log'};
if(['velocity','fmsustain','lpsustain','tremoloskew','tremolophase'].includes(native))return{min:0,max:1,step:0.01,unit:'%'};
if(['vib','phaser'].includes(native))return{min:0,max:20,step:0.1,unit:'Hz'};
if(['vibmod','fm','fmh','fmenv','distort','lpenv','penv','phaserdepth'].includes(native))return{min:0,max:8,step:0.05};
if(['lpq','hpq','bpq'].includes(native))return{min:0,max:20,step:0.1};
if(['attack','decay','release','lpattack','lpdecay','lprelease','pattack','pdecay','prelease','fmattack','fmdecay','delaytime','roomfade'].includes(native))return{min:0,max:5,step:0.01,unit:'seconds'};
if(['fast','slow','speed'].includes(native))return{min:0.125,max:16,step:0.125};
if(['transpose','scaleTranspose'].includes(native))return{min:-24,max:24,step:1};
if(['begin','end','loopBegin','loopEnd','scrub'].includes(native))return{min:0,max:1,step:0.01};return undefined;}
function example(native:string,name:string){
const values:Record<string,string>={sound:'triangle',note:'C4 E4 G4 E4',freq:'440 Hz',n:'0 2 4',bank:'my drums',gain:'30%',fast:'2',slow:'2',room:'20%',lpf:'1200 Hz',scale:'C:minor',chord:'C Am F G',attack:'0.01 seconds',decay:'0.2 seconds',release:'0.3 seconds',pan:'50%',samples:'my-sample',signal:'sweep',setcpm:'30',setcps:'0.5',cpm:'30',run:'8',binary:'5',binaryN:'8, 5',seq:'C4 E4, G4 B4',cat:'C4 E4, G4 B4',stack:'C4 E4, G4 B4',range:'200, 2000',rangex:'200, 2000',range2:'200, 2000',adsr:'0.01, 0.2, 0.5, 0.3',euclid:'3, 8',euclidRot:'3, 8, 1',swingBy:'0.2, 4'};
return `${name}: ${values[native]??(signals.has(native)||noValue.has(native)||visualNames.has(native)?'':'2')}`.trimEnd();}
export const commands:CommandSpec[]=suppliedRows.filter(row=>!row.names.includes('sine2')).map(row=>{
const names=row.names.map(n=>n.replace(/\(\)$/,'').trim());
if(row.level===2)return{name:names.join(' / '),aliases:names,native:null,category:names.includes('//')?'structure':'timing',description:row.description,example:names[0],kind:'symbol'};
const native=names.includes('sound')?'sound':names[0];const p=practical[native];const name=p?.name??readable(native);
if(['$:','_$:'].includes(native))return{name:native,aliases:[],native:null,category:'structure',description:row.description+' In this app, write a track: block and use its Mute button.',example:'track: drums\n  play: kick rest snare rest',kind:'symbol'};
return{name,aliases:[...new Set([...names,...(p?.aliases??[])].filter(x=>x!==name))],native,category:p?.category??(visualNames.has(native)?'visuals':levelCategories[row.level]),description:row.level===12?`${row.description} Planned for a later release.`:row.description,example:example(native,name),kind:row.level===12?'later':transforms.has(native)?'transform':signals.has(native)?'signal':noValue.has(native)?'flag':visualNames.has(native)?'visual':'value',slider:slider(native)};});
// These functions and signals occur in prose rather than separate table rows.
for(const native of ['every','stut','sine2','cosine2','saw2','tri2','square2','rand2','perlin2'])if(!commands.some(c=>c.native===native))commands.push({name:readable(native),aliases:native!==readable(native)?[native]:[],native,category:signals.has(native)?'math':'variation',kind:transforms.has(native)?'transform':signals.has(native)?'signal':'value',description:native==='stut'?'Legacy echo command. Use echo for new songs.':native==='every'?'Apply a change every chosen number of bars.':'Make a moving value between minus one and one.',example:native==='every'?'every: 4\n  faster: 2':`${readable(native)}:`});
commands.push(
{name:'|',aliases:['\\|'],native:null,category:'variation',kind:'symbol',description:'Randomly choose between alternatives inside a pattern.',example:'notes: C4 | E4 | G4'},
{name:'` `',aliases:[],native:null,category:'structure',kind:'symbol',description:'Strudel uses backticks to hold multiline patterns. In this app keep each command value on one line.',example:'notes: C4 E4 G4'},
{name:'tempo',aliases:['tmp'],native:null,category:'timing',description:'Set how many beats play in a minute.',example:'tempo: 120 bpm',slider:{min:30,max:300,step:1,unit:'bpm'}},
{name:'beats per bar',aliases:['beats'],native:null,category:'timing',description:'Choose how many beats belong to each bar.',example:'beats per bar: 4',slider:{min:1,max:16,step:1}},
{name:'track',aliases:[],native:null,category:'structure',kind:'block',description:'Start one musical part. Indent its commands beneath it.',example:'track: melody\n  sound: triangle\n  notes: C4 E4 G4'},
{name:'play',aliases:['p'],native:'sound',category:'sounds',description:'Write sounds and rests to play in one bar.',example:'play: kick rest snare rest'},
{name:'show',aliases:[],native:null,category:'visuals',description:'Choose a display for the song or this track.',example:'show: piano roll'},
{name:'section',aliases:[],native:null,category:'structure',kind:'block',description:'Name one part of your arrangement.',example:'section: intro\n  bars: 8\n  tracks: melody'},
{name:'bars',aliases:[],native:null,category:'structure',description:'Choose how many bars a section lasts.',example:'bars: 8',slider:{min:1,max:128,step:1}},
{name:'tracks',aliases:[],native:null,category:'structure',description:'Choose the tracks playing in this section.',example:'tracks: melody bass'},
{name:'pattern',aliases:[],native:null,category:'structure',kind:'block',description:'Name reusable musical instructions.',example:'pattern: theme\n  notes: C4 E4 G4'},
{name:'change',aliases:[],native:null,category:'structure',kind:'block',description:'Name a reusable group of changes.',example:'change: brighter\n  lowpass: 4000 Hz'},
{name:'use',aliases:[],native:null,category:'structure',description:'Use a pattern or change you named earlier.',example:'use: theme'});
for(const c of commands){
if(['setcpm','setcps','cpm'].includes(c.native??''))c.category='timing';
if(c.kind==='visual')c.aliases.push(`_${c.native}`);
if(c.kind==='transform')c.example=`${c.name}: ${['every','firstOf','lastOf','chunk','chunkBack','fastChunk','inside','outside'].includes(c.native??'')?'4':['sometimesBy','someCyclesBy','juxBy'].includes(c.native??'')?'0.5':''}\n  faster: 2`;
}
const correctedExamples:Record<string,string>={euclidLegato:'3, 8',compress:'0, 0.5',zoom:'0, 0.5',ribbon:'0, 2',slice:'8, 0 1 2 3',splice:'8, 0 1 2 3',off:'0.125\n  transpose: 12',echo:'3, 0.125, 0.5',echoWith:'3, 0.125\n  volume: 50%',pickF:'0, [rev, rev]',pickmodF:'0, [rev, rev]',wchoose:'["C4", 3], ["E4", 1]',wchooseCycles:'["C4", 3], ["E4", 1]',stut:'3, 0.5, 0.125',soundAlias:'triangle, soft-tone'};
for(const c of commands)if(c.native&&c.native in correctedExamples)c.example=`${c.name}: ${correctedExamples[c.native]}`;
const am=commands.find(c=>c.native==='am');if(am)am.description+=' This browser runtime uses tremolo for this moving volume control.';
const sampleCommand=commands.find(c=>c.native==='samples');if(sampleCommand){sampleCommand.description='Choose an audio file already uploaded in Sound Library. The name must match your uploaded sample.';sampleCommand.example='samples: my-sample';}
const bankCommand=commands.find(c=>c.native==='bank');if(bankCommand){bankCommand.description='Choose a loaded group of sounds. The studio bank contains kick, snare, and hat. Other banks must already be loaded; an unavailable sound shows an error.';bankCommand.example='play: kick snare hat snare\nbank: studio';}
const colorCommand=commands.find(c=>c.native==='color');if(colorCommand){colorCommand.kind='value';colorCommand.description='Choose a note color in the music display, such as red or #7042bf. Waveform and spectrum show the combined audio.';colorCommand.example='color: red';}
for(const c of commands)if(c.native==='markcss'||c.native==='log'){c.kind='later';c.description=c.native==='markcss'?'Not available in this app. Use color: to change note colors.':'Not available in this app. Use the music display to inspect your notes.';}
// Keep the complete source catalogue while presenting plain-language help.
const plainHelp=new Map<string,{name:string;description:string;notes?:string[];example?:string}>([...helpA,...helpB,...helpC].map(entry=>[entry.name,entry]));
for(const command of commands){const help=plainHelp.get(command.name);if(help){command.description=help.description;command.notes=help.notes;if(help.example)command.example=help.example;}}
for(const command of commands)if(command.native==='lfo'||command.native==='arpWith'){
  command.kind='later';
  command.description=command.native==='lfo'?'Move a setting up and down repeatedly while a note plays. This command is not available in this app yet.':'Choose chord notes with a custom selection function. This command is not available in this app yet.';
  command.notes=command.native==='lfo'?['Use a named signal, such as sine: followed by range:, then pass $name to lowpass: or volume: instead.']:['Use arp: 0 1 2 1 to choose a simple order for chord notes. Custom selection functions are not supported by this app’s plain syntax.'];
  command.example=command.native==='lfo'?'signal: sweep\n  sine:\n  range: 300, 2000\ntrack: melody\n  sound: triangle\n  notes: C4 E4 G4\n  lowpass: $sweep':'arp: 0 1 2 1';
}
const multiline=commands.find(c=>c.name===' / ');if(multiline){multiline.name='multiline text';multiline.aliases=[];multiline.example='notes: C4 E4 G4 E4';}
const argumentsHelp=commands.find(c=>c.name==='');if(argumentsHelp){argumentsHelp.name='function arguments';argumentsHelp.aliases=['()'];argumentsHelp.example='volume: max(0.2, 0.5)';}
const lookup=new Map<string,CommandSpec>();
const normalize=(s:string)=>s.trim().replace(/:$/,'').replace(/\(\)$/,'').replace(/\s+/g,' ').toLowerCase();
for(const c of commands)for(const name of [c.name,...c.aliases])if(name.trim())lookup.set(normalize(name),c);
lookup.set('v',commands.find(c=>c.name==='volume')!);
export function resolveCommand(name:string):CommandSpec|undefined{return lookup.get(normalize(name));}
