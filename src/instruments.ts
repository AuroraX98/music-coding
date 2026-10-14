/** Curated original CC0 WAVs. See public/instruments/ for sources, licenses and hashes. */
export interface BuiltinInstrument {
  id: string;
  name: string;
  description: string;
  samples: Record<string, string>;
  license: string;
  sourceUrl: string;
  category?: string;
  previewNote?: string;
  exampleNotes?: string;
}

export const BUILTIN_INSTRUMENTS: BuiltinInstrument[] = [
  {
    id: "vcsl_piano",
    name: "Soft grand piano",
    description: "A gentle recorded piano. Try it for chords and melodies.",
    license: 'CC0-1.0',
    sourceUrl: 'https://github.com/sgossner/VCSL',
    samples: {
      'C3': `${import.meta.env.BASE_URL}instruments/vcsl/piano/C2.wav`,
      'C4': `${import.meta.env.BASE_URL}instruments/vcsl/piano/C3.wav`,
      'F#4': `${import.meta.env.BASE_URL}instruments/vcsl/piano/Fs3.wav`,
      'C5': `${import.meta.env.BASE_URL}instruments/vcsl/piano/C4.wav`,
    },
  },
  {
    id: "vcsl_harp",
    name: "Folk harp",
    description: "Plucked strings with a clear ringing sound. Try notes one after another.",
    license: 'CC0-1.0',
    sourceUrl: 'https://github.com/sgossner/VCSL',
    samples: {
      'C4': `${import.meta.env.BASE_URL}instruments/vcsl/harp/C3.wav`,
      'F#4': `${import.meta.env.BASE_URL}instruments/vcsl/harp/Fs3.wav`,
      'C5': `${import.meta.env.BASE_URL}instruments/vcsl/harp/C4.wav`,
      'F#5': `${import.meta.env.BASE_URL}instruments/vcsl/harp/Fs4.wav`,
    },
  },
  {
    id: "vcsl_marimba",
    name: "Marimba",
    description: "Wooden bars hit with mallets. Try a gentle repeating tune.",
    license: 'CC0-1.0',
    sourceUrl: 'https://github.com/sgossner/VCSL',
    samples: {
      'F4': `${import.meta.env.BASE_URL}instruments/vcsl/marimba/F3.wav`,
      'C5': `${import.meta.env.BASE_URL}instruments/vcsl/marimba/C4.wav`,
      'G5': `${import.meta.env.BASE_URL}instruments/vcsl/marimba/G4.wav`,
      'B5': `${import.meta.env.BASE_URL}instruments/vcsl/marimba/B4.wav`,
    },
  },
  {
    id: "vcsl_vibraphone",
    name: "Vibraphone",
    description: "Soft mallets tap metal bars for a warm ringing sound. Try slow chords.",
    license: 'CC0-1.0',
    sourceUrl: 'https://github.com/sgossner/VCSL',
    samples: {
      'C4': `${import.meta.env.BASE_URL}instruments/vcsl/vibraphone/C3.wav`,
      'F5': `${import.meta.env.BASE_URL}instruments/vcsl/vibraphone/F4.wav`,
      'C6': `${import.meta.env.BASE_URL}instruments/vcsl/vibraphone/C5.wav`,
    },
  },
  {
    id: "vcsl_glockenspiel",
    name: "Glockenspiel",
    description: "Metal bars with a bright bell sound. Try high sparkling notes.",
    license: 'CC0-1.0',
    sourceUrl: 'https://github.com/sgossner/VCSL',
    samples: {
      'C6': `${import.meta.env.BASE_URL}instruments/vcsl/glockenspiel/C5.wav`,
      'G6': `${import.meta.env.BASE_URL}instruments/vcsl/glockenspiel/G5.wav`,
      'C7': `${import.meta.env.BASE_URL}instruments/vcsl/glockenspiel/C6.wav`,
    },
  },
  {
    id: "vcsl_recorder",
    name: "Short recorder",
    description: "A breathy wooden flute sound played in short bursts. Long notes will still sound short.",
    license: 'CC0-1.0',
    sourceUrl: 'https://github.com/sgossner/VCSL',
    samples: {
      'C5': `${import.meta.env.BASE_URL}instruments/vcsl/recorder/C4.wav`,
      'F#5': `${import.meta.env.BASE_URL}instruments/vcsl/recorder/Fs4.wav`,
      'C6': `${import.meta.env.BASE_URL}instruments/vcsl/recorder/C5.wav`,
    },
  },
  {
    id: "vcsl_sax",
    name: "Short tenor sax",
    description: "A rich reed sound played in short bursts. Long notes will still sound short.",
    license: 'CC0-1.0',
    sourceUrl: 'https://github.com/sgossner/VCSL',
    samples: {
      'C3': `${import.meta.env.BASE_URL}instruments/vcsl/sax/C2.wav`,
      'F#3': `${import.meta.env.BASE_URL}instruments/vcsl/sax/Fs2.wav`,
      'C4': `${import.meta.env.BASE_URL}instruments/vcsl/sax/C3.wav`,
      'F#4': `${import.meta.env.BASE_URL}instruments/vcsl/sax/Fs3.wav`,
      'C5': `${import.meta.env.BASE_URL}instruments/vcsl/sax/C4.wav`,
    },
  },
{
  "id": "karoryfer_guitar_black",
  "name": "Warm hollowbody guitar",
  "description": "A second electric guitar with a warm, rounded pluck. Compare both guitars using the same notes.",
  "category": "guitar",
  "previewNote": "C3",
  "exampleNotes": "C3 E3 G3 C4",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sfzinstruments/karoryfer.black-and-green-guitars",
  "samples": {
    "E2": `${import.meta.env.BASE_URL}instruments/karoryfer-guitar/karoryfer_guitar_black/E3.wav`,
    "C3": `${import.meta.env.BASE_URL}instruments/karoryfer-guitar/karoryfer_guitar_black/C4.wav`,
    "G3": `${import.meta.env.BASE_URL}instruments/karoryfer-guitar/karoryfer_guitar_black/G4.wav`,
    "C4": `${import.meta.env.BASE_URL}instruments/karoryfer-guitar/karoryfer_guitar_black/C5.wav`
  }
},
{
  "id": "vcsl_kick_deep",
  "name": "Deep concert bass drum",
  "description": "A different concert bass drum with a long, deep boom. Use C4 for the original sound.",
  "category": "drums",
  "previewNote": "C4",
  "exampleNotes": "C4 rest C4 rest",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sgossner/VCSL",
  "samples": {
    "C4": `${import.meta.env.BASE_URL}instruments/vcsl/vcsl_kick_deep/C4.wav`
  }
},
{
  "id": "vcsl_snare_alt",
  "name": "Second snare drum",
  "description": "A second snare drum with its own rattle. Compare the two snares using C4.",
  "category": "drums",
  "previewNote": "C4",
  "exampleNotes": "rest C4 rest C4",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sgossner/VCSL",
  "samples": {
    "C4": `${import.meta.env.BASE_URL}instruments/vcsl/vcsl_snare_alt/C4.wav`
  }
},
{
  "id": "karoryfer_guitar",
  "name": "Clean hollowbody guitar",
  "description": "A clean electric guitar with a bright twang. Try a melody or play chord notes one at a time.",
  "category": "guitar",
  "previewNote": "C3",
  "exampleNotes": "C3 E3 G3 C4",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sfzinstruments/karoryfer.black-and-green-guitars",
  "samples": {
    "E2": `${import.meta.env.BASE_URL}instruments/karoryfer-guitar/karoryfer_guitar/E3.wav`,
    "C3": `${import.meta.env.BASE_URL}instruments/karoryfer-guitar/karoryfer_guitar/C4.wav`,
    "G3": `${import.meta.env.BASE_URL}instruments/karoryfer-guitar/karoryfer_guitar/G4.wav`,
    "C4": `${import.meta.env.BASE_URL}instruments/karoryfer-guitar/karoryfer_guitar/C5.wav`
  }
},
{
  "id": "karoryfer_bass",
  "name": "Growly electric bass",
  "description": "A real electric bass with a rough edge. Try low notes to support your song.",
  "category": "bass",
  "previewNote": "E2",
  "exampleNotes": "E2 E2 G2 A2",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sfzinstruments/karoryfer.growlybass",
  "samples": {
    "E1": `${import.meta.env.BASE_URL}instruments/karoryfer-bass/karoryfer_bass/E2.wav`,
    "A1": `${import.meta.env.BASE_URL}instruments/karoryfer-bass/karoryfer_bass/A2.wav`,
    "C2": `${import.meta.env.BASE_URL}instruments/karoryfer-bass/karoryfer_bass/C3.wav`,
    "A2": `${import.meta.env.BASE_URL}instruments/karoryfer-bass/karoryfer_bass/A3.wav`
  }
},
{
  "id": "vsco_violin",
  "name": "Bowed violin section",
  "description": "Several violins bow together for a singing sound. Try long notes. Each recording lasts only a few seconds.",
  "category": "strings",
  "previewNote": "D4",
  "exampleNotes": "D4 F4 A4 D5",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sgossner/VSCO-2-CE",
  "samples": {
    "G3": `${import.meta.env.BASE_URL}instruments/vsco/vsco_violin/G2.wav`,
    "D4": `${import.meta.env.BASE_URL}instruments/vsco/vsco_violin/D3.wav`,
    "A4": `${import.meta.env.BASE_URL}instruments/vsco/vsco_violin/A3.wav`,
    "E5": `${import.meta.env.BASE_URL}instruments/vsco/vsco_violin/E4.wav`
  }
},
{
  "id": "vsco_cello",
  "name": "Bowed cello section",
  "description": "Several cellos bow together for a deep, warm sound. Try slow low notes. Each recording lasts only a few seconds.",
  "category": "strings",
  "previewNote": "C3",
  "exampleNotes": "C3 G2 A2 G2",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sgossner/VSCO-2-CE",
  "samples": {
    "C2": `${import.meta.env.BASE_URL}instruments/vsco/vsco_cello/C1.wav`,
    "G2": `${import.meta.env.BASE_URL}instruments/vsco/vsco_cello/G1.wav`,
    "D3": `${import.meta.env.BASE_URL}instruments/vsco/vsco_cello/D2.wav`,
    "A3": `${import.meta.env.BASE_URL}instruments/vsco/vsco_cello/A2.wav`
  }
},
{
  "id": "vcsl_kick",
  "name": "Concert bass drum",
  "description": "A large concert bass drum hit with a mallet. Use C4 for its original deep thump.",
  "category": "drums",
  "previewNote": "C4",
  "exampleNotes": "C4 rest C4 rest",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sgossner/VCSL",
  "samples": {
    "C4": `${import.meta.env.BASE_URL}instruments/vcsl/vcsl_kick/C4.wav`
  }
},
{
  "id": "vcsl_snare",
  "name": "Snare drum",
  "description": "A drum with wires underneath that make a crisp rattle. Use C4 for its original sound.",
  "category": "drums",
  "previewNote": "C4",
  "exampleNotes": "rest C4 rest C4",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sgossner/VCSL",
  "samples": {
    "C4": `${import.meta.env.BASE_URL}instruments/vcsl/vcsl_snare/C4.wav`
  }
},
{
  "id": "vcsl_hihat",
  "name": "Closed hi-hat",
  "description": "Two cymbals held closed and hit with a stick. Use repeated C4 notes for a steady tick.",
  "category": "drums",
  "previewNote": "C4",
  "exampleNotes": "C4 C4 C4 C4",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sgossner/VCSL",
  "samples": {
    "C4": `${import.meta.env.BASE_URL}instruments/vcsl/vcsl_hihat/C4.wav`
  }
},
{
  "id": "vcsl_tom",
  "name": "Low tom drum",
  "description": "A low tom drum with a rounded knock. Try C4 notes at the end of a rhythm.",
  "category": "drums",
  "previewNote": "C4",
  "exampleNotes": "C4 rest C4 C4",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sgossner/VCSL",
  "samples": {
    "C4": `${import.meta.env.BASE_URL}instruments/vcsl/vcsl_tom/C4.wav`
  }
},
{
  "id": "vcsl_crash",
  "name": "Crash cymbal",
  "description": "A cymbal struck with a stick. Try C4 once at the start of a new section.",
  "category": "drums",
  "previewNote": "C4",
  "exampleNotes": "C4 rest rest rest",
  "license": "CC0-1.0",
  "sourceUrl": "https://github.com/sgossner/VCSL",
  "samples": {
    "C4": `${import.meta.env.BASE_URL}instruments/vcsl/vcsl_crash/C4.wav`
  }
},
];

export interface BuiltinKit { id: string; name: string; description: string; tracks: { sound: string; notes: string; volume?: number }[]; }
export const BUILTIN_KITS: BuiltinKit[] = [
  { id: 'concert_kit', name: 'Concert drum kit', description: 'A mallet bass drum, snare and closed hi-hat. Each line plays one part of the beat.', tracks: [
    { sound: 'vcsl_kick', notes: 'C4 rest C4 rest', volume: 0.7 },
    { sound: 'vcsl_snare', notes: 'rest C4 rest C4', volume: 0.5 },
    { sound: 'vcsl_hihat', notes: 'C4 C4 C4 C4', volume: 0.3 },
  ] },
  { id: 'deep_kit', name: 'Deep drum kit', description: 'A different bass drum and snare, with a low tom and cymbal. Try changing just one line.', tracks: [
    { sound: 'vcsl_kick_deep', notes: 'C4 rest C4 rest', volume: 0.5 },
    { sound: 'vcsl_snare_alt', notes: 'rest C4 rest C4', volume: 0.5 },
    { sound: 'vcsl_tom', notes: 'rest rest rest C4', volume: 0.4 },
    { sound: 'vcsl_crash', notes: 'C4 rest rest rest', volume: 0.2 },
  ] },
];
