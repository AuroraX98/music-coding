// helpTerms.ts — plain text supplements for existing command definitions.

export const HELP_TERMS: ReadonlyArray<{
  pattern: RegExp;
  explanation: string;
}> = [
  {
    pattern: /\bsamples?\b/i,
    explanation: "A sample is a recorded sound that you can play again.",
  },
  {
    pattern: /\b(?:synthesizers?|synthesis)\b/i,
    explanation: "Synthesis builds sound from signals. A synthesizer is an instrument that does this.",
  },
  {
    pattern: /\boscillators?\b/i,
    explanation: "An oscillator makes a repeating signal that can make sound or control it.",
  },
  {
    pattern: /\bwaveforms?\b/i,
    explanation: "A waveform shows how a sound signal changes over time. Its shape helps give the sound its tone.",
  },
  {
    pattern: /\bharmonics?\b/i,
    explanation: "Harmonics are tones that vibrate 2, 3, 4, or more times as fast as a sound's base tone. They help give it its character.",
  },
  {
    pattern: /\bpartials?\b/i,
    explanation: "Partials are the separate tones that combine to make a sound. They do not all have to be harmonics.",
  },
  {
    pattern: /\b(?:frequency|frequencies|hz)\b/i,
    explanation: "Frequency counts repeats each second. Hz means repeats per second; faster sound waves usually mean higher pitch.",
  },
  {
    pattern: /\bfilters?\b/i,
    explanation: "A filter changes a sound by turning down some frequencies more than others.",
  },
  {
    pattern: /\bcutoffs?\b/i,
    explanation: "Cutoff is a filter's boundary setting. It helps choose which pitches the filter turns down.",
  },
  {
    pattern: /\bresonance\b/i,
    explanation: "In a filter, resonance boosts frequencies near the cutoff and can make the sound ring.",
  },
  {
    pattern: /\b(?:envelopes?|adsr)\b/i,
    explanation: "An envelope shapes a setting over a note's life. ADSR means attack, decay, sustain, and release.",
  },
  {
    pattern: /\battack\b/i,
    explanation: "In an envelope, attack is the time taken to rise from the starting level to the peak.",
  },
  {
    pattern: /\bdecay\b/i,
    explanation: "In an envelope, decay is the time taken to fall from the peak to the sustain level.",
  },
  {
    pattern: /\bsustain\b(?![\s-]+pedal\b)/i,
    explanation: "In an envelope, sustain is the level held while a note stays on.",
  },
  {
    pattern: /\brelease\b/i,
    explanation: "In an envelope, release is the time taken to fade to zero after a note is turned off.",
  },
  {
    pattern: /\bvibrato\b/i,
    explanation: "Vibrato is a small, repeating rise and fall in pitch.",
  },
  {
    pattern: /\bfm\b/i,
    explanation: "FM changes pitch very fast and can create extra frequencies in the sound.",
  },
  {
    pattern: /\bmodulation\b/i,
    explanation: "Modulation uses one signal to change a setting, such as pitch, loudness, or filter cutoff.",
  },
  {
    pattern: /\blfos?\b/i,
    explanation: "An LFO is a slow repeating signal that changes a setting, such as pitch or loudness.",
  },
  {
    pattern: /\borbits?\b/i,
    explanation: "An orbit is an audio channel where sounds can share effects.",
  },
  {
    pattern: /\bcycles?\b/i,
    explanation: "In this app, a cycle is one bar. A pattern can fit inside one bar or stretch across several bars.",
  },
  {
    pattern: /\beuclidean[\s-]+rhythms?\b/i,
    explanation: "A Euclidean rhythm spreads a chosen number of hits as evenly as possible across a chosen number of steps.",
  },
  {
    pattern: /\bscales?\b/i,
    explanation: "A scale is an ordered set of notes used to build melodies.",
  },
  {
    pattern: /\bdegrees?\b/i,
    explanation: "A degree tells you a note's place in a scale, such as the first or third note.",
  },
  {
    pattern: /\bchords?\b/i,
    explanation: "A chord is a group of notes played together.",
  },
  {
    pattern: /\bvoicings?\b/i,
    explanation: "Voicing means choosing how a chord's notes are arranged from low to high.",
  },
  {
    pattern: /\boctaves?\b/i,
    explanation: "An octave takes you to the next higher or lower note with the same name, such as C4 to C5. Going up doubles its frequency.",
  },
  {
    pattern: /\bsemitones?\b/i,
    explanation: "A semitone is one small pitch step, like moving to the next piano key, counting the black keys too. Twelve steps make an octave.",
  },
  {
    pattern: /\binterpolation\b/i,
    explanation: "Interpolation calculates values between known points, such as the steps between two settings.",
  },
  {
    pattern: /\bexponential\b/i,
    explanation: "Exponential change uses the same multiplier at each equal step. It can grow or shrink.",
  },
  {
    pattern: /\blogarithmic\b/i,
    explanation: "A logarithmic scale gives equal space to equal multiplying steps, such as 1, 10, and 100.",
  },
  {
    pattern: /\b(?:probability|probabilities)\b/i,
    explanation: "Probability is the chance that something happens, such as whether a note plays.",
  },
  {
    pattern: /\b(?:quantize|quantizes|quantized|quantizing|quantization)\b/i,
    explanation: "Quantize snaps a value to allowed steps, such as note times on a beat grid or pitches in a scale.",
  },
  {
    pattern: /\b(?:pan|pans|panned|panning)\b/i,
    explanation: "Pan places a sound toward the left or right in stereo.",
  },
  {
    pattern: /\bcompressors?\b/i,
    explanation: "A compressor reduces a sound's level when it rises above a chosen level, helping control loud peaks.",
  },
  {
    pattern: /\bsustain[\s-]*pedals?\b/i,
    explanation: "A sustain pedal lets notes keep ringing after you let go of the keys.",
  },
];

export function explainTerms(text: string): string[] {
  const matches: Array<{
    position: number;
    order: number;
    explanation: string;
  }> = [];

  HELP_TERMS.forEach((entry, order) => {
    // Patterns have no global or sticky flags, so repeated calls are stable.
    const match = entry.pattern.exec(text);
    if (match) {
      matches.push({
        position: match.index,
        order,
        explanation: entry.explanation,
      });
    }
  });

  matches.sort(
    (a, b) => a.position - b.position || a.order - b.order,
  );

  const seen = new Set<string>();
  const result: string[] = [];

  for (const { explanation } of matches) {
    if (seen.has(explanation)) continue;
    seen.add(explanation);
    result.push(explanation);
    if (result.length === 3) break;
  }

  return result;
}
