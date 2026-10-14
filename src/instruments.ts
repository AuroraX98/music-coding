/** Curated original CC0 VCSL WAVs. See public/instruments/vcsl/manifest.json for pinned sources and hashes. */
export interface BuiltinInstrument {
  id: string;
  name: string;
  description: string;
  samples: Record<string, string>;
  license: string;
  sourceUrl: string;
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
];
