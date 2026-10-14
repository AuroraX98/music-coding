# Command coverage and language

The command catalogue is extracted from the supplied Strudel study plan. It includes all 12 levels, their native names and synonyms, mini-notation symbols, the prose additions `every` and legacy `stut`, bipolar signals, and underscore visualization names. Connections appear in their own category and produce a clear later-release message when compiled.

The compiler stores values as text. It does not evaluate JavaScript. Audio builds safe runtime values and applies the corresponding Strudel command. Listing a command in this catalogue does not alone prove its audible behavior; runtime coverage is checked separately.

## Names and grouping

`resolveCommand(name)` recognizes either the friendly name or a native name without parentheses. For example, `notes`, `nt`, and `note` select the same command; `volume`, `v`, and `gain` select volume. Friendly names for camel-case functions contain spaces, with the original spelling available as an alias. The alias `v` always means volume.

Categories are sounds, samples, notes, timing, structure, effects, variation, moving numbers and controls, visuals, and later external connections. Symbols resolve for opening their guide entries but produce a diagnostic if used as standalone line commands. Strudel's `$:` and `_$:` become a named track and its Mute button.

## Blocks and musical time

Use two spaces per level. A `track:` owns its indented commands. `pattern:`, `change:`, and `signal:` name reusable definitions. `use:` references a pattern or change. A dollar reference such as `$sweep` uses a named signal. Function-taking commands own indented changes:

```text
pattern: theme
  notes: C4 E4 G4 E4

signal: sweep
  sine:
  range: 200, 2000

track: melody
  sound: triangle
  use: theme
  lowpass: $sweep
  every: 4
    faster: 2
```

Track and definition names must be unique. Put track names containing spaces in quotes when selecting them in a section. The compiler reports unknown commands, references, invalid nesting, and definition loops with line numbers.

Music repeats indefinitely unless `arrange:` contains finite sections. Section bar numbers begin at one. A section chooses its bars, tracks, and optionally tempo. If tracks are omitted, all tracks play. A tempo change persists into later sections until another tempo is set.

```text
arrange:
  section: intro
    bars: 8
    tracks: melody
  section: ending
    bars: 8
    tracks: melody
    tempo: 90 bpm
```

Without an arrangement, `totalBars` and `totalSeconds` are null. `durationForRange` still calculates a chosen repeating span. Its first and last bars are inclusive; invalid ranges throw a `RangeError`. Pattern speed changes do not change the arrangement's length. Simultaneous tracks count once.

Defaults are 120 BPM and four beats per bar. Native `setcpm` and `setcps` convert cycle speed using the configured beat count. Source line count never measures audio duration. `tidy` preserves command names, order, comments, and nesting and returns invalid source unchanged rather than guessing its intended indentation.

## Verification

`tests/language.test.ts` checks aliases, repeating and finite length, per-section tempo, parallel tracks, whole and fractional export ranges, speed independence, source lines, definition references and loops, ambiguous indentation, comments, formatting, cycle-tempo conversion, visualization aliases, and inline pattern groups. `canOwnChildren` provides the same block rules to the editor.

Examples in the catalogue are command snippets: insert them inside a suitable track or definition. Multiline pattern string literals are represented by one-line command values in this app. The guide retains the native backtick notation for reference.

## Sound groups, nested patterns, and visual commands

The built-in `studio` bank contains `kick`, `snare`, and `hat`. For example:

```text
track: drums
  play: kick snare hat snare
  bank: studio
```

Bank selection uses the complete registered name, such as `studio_kick`. An unloaded bank or sound produces an error instead of allowing a silent track to appear successful. Sounds first reached later in playback are checked as well. Remove an unavailable bank command to return to ordinary built-in or uploaded sound names.

Inline branches under combining commands inherit the preceding track settings. A branch can override its own sound or volume. This makes `sound: sine` before a nested `stack:` apply to both branches unless they choose another sound.

`color: red` (or a CSS color such as `#7042bf`) changes note colors in the music display. Waveform and spectrum show combined audio. `markcss`, `log`, `lfo`, and `arp with` are not available in this app and produce an explicit diagnostic; MIDI and OSC connections remain planned features. Use a named moving signal instead of LFO configuration objects, and `arp:` for a simple chord-note order.

`when: <1 0>` alternates changed and unchanged bars. A condition such as `when: cycle % 2 == 0` also works; cycle counting starts at zero. Indent the change beneath the command, or pass a named change as the second input.

Tempo and arrangement commands belong at the song or section level, not inside reusable pattern/change/signal definitions. Invalid placement is reported before playback.
