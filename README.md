# Music Coding

A charcoal and mint browser studio for making music with plain commands. Write a melody, press Play, adjust a sound, and export WAV or MP3. The editor includes line numbers, automatic indentation, short command names, sliders, and a searchable command pane.

## Start on Windows

Open **Start Studio.cmd** in this folder. It opens the studio in Chrome at **http://127.0.0.1:5173**. Its local server runs quietly in the background. Open **Stop Studio.cmd** when you want to close that server. Chrome is the main browser for this app. Browser audio starts after you click Play or Preview.

On this Windows computer the launcher uses the bundled Codex Node runtime, so you do not need Node or npm on your PATH. Keep the project folder and installed dependencies together. If you move the app to another computer, install Node.js 22 or newer and the pinned dependencies first.

For development with Node on your PATH, use `corepack pnpm install --frozen-lockfile`, then `corepack pnpm dev`. Build with `corepack pnpm build` and serve the built app with `corepack pnpm preview`. Tests run with `corepack pnpm test`. The checked-in lockfile records the dependency versions used for this workspace. Do not open index.html directly from the filesystem: the app needs its local server to load audio modules.

The runtime, synthesizers, sample library, encoder, and help pages are local after setup. The app uses no account or cloud storage. It does not upload your music or recordings. Downloading dependencies for initial setup needs internet access.

## Start a song

```text
tempo: 120 bpm

track: melody
  sound: triangle
  notes: B4 B5 E2 F3
  faster: 2
  volume: 30%
  reverb: 20%

show: piano roll
```

One command goes on each line. A colon separates its name and value. Two spaces put a command inside its track. `v: 30%` also means `volume: 30%`.

The four notes fill one bar. `faster: 2` plays them twice in that bar, making eight note events. Multiple tracks play together. Use unique names such as `melody`, `melody-2`, and `bass`.

The Writing Guide explains syntax through code examples, beat grids, track boxes, and an arrangement timeline. Try example opens a practice project. The Command Guide and Commands pane list full names, short names, original Strudel names, categories, definitions, and examples.

## Save and restore

Projects, designed sounds, and uploaded sample originals are stored in this browser's IndexedDB. Keep using the same browser and local address to see the same projects. Another browser, port, computer, or private window has a different library. Clearing site data removes local saves.

Download a project ZIP backup regularly. It contains versioned project.json, sound presets, and actual audio samples used by the project. Import reads data and validates the archive; it never runs scripts from the archive. Each sample may be up to 64 MB; a project backup may contain up to 256 MB of sample data. WAV and MP3 uploads are supported when the browser can decode them. Other audio formats depend on the browser's decoder.

Autosave keeps current work. Undo, Redo, and Restore last working version help recover edits. A successful local save is different from a downloaded backup; keep a separate copy of songs you care about.

## Duration and audio exports

Bars measure musical time. Code line numbers help you find instructions. More source lines do not necessarily add more music: simultaneous tracks share the same timeline.

Arrange sections give the song an ending. Without an arrangement, music repeats until stopped. Export asks for a range or duration. Its summary shows total song bars and time, selected bars and time, effect tail, and final audio duration. At 120 BPM and four beats per bar, 16 bars take 32 seconds.

**Include tail** captures your chosen extra seconds for echoes, reverb, and fading notes. **Cut tail** ends at the selected bar with zero extra time. Cutting can stop a sound suddenly. WAV exports use stereo PCM16 at the capture sample rate; MP3 uses stereo at 192 kbps. Encoding happens locally.

Export captures the engine in real time and displays progress. A one-minute export takes approximately one minute, plus any earlier musical context and chosen tail. Keep the tab active and let it finish. Cancel stops capture. The app freezes the captured project while exporting. Random patterns produce the performance captured during that export; the same capture supplies either output format.

## Checks and current boundaries

Run `corepack pnpm test` for translator, timing, project restoration, playback cancellation, and export checks, and `corepack pnpm build` for TypeScript and production bundling. ZIP restoration checks verify code, preset settings, asset bytes, missing samples, unsafe paths, versions, and sample sizes.

`node tests/app-browser.mjs` checks the complete UI against the running app: editor keys, sliders and Undo, playback, working-version recovery, section selection, duration, downloaded WAV/MP3, visuals, designed sounds, and project bundles. Set `STUDIO_BROWSER_PATH` and `STUDIO_BROWSER_NAME` to select Edge. The test blocks outside internet requests and uses a separate browser profile. Additional storage, import-collision, and audio suites in tests run against the development server. The audio checks measure generated signals and file contents; listen through your own speakers or headphones to judge the music.

`node tests/mixed-sounds-browser.mjs` checks actual drum starts in Chrome, including `play: kick rest snare rest` and its reversed order at 150 BPM with `faster: 4`. It checks every note start, continuous pitch controls, held notes, nested patterns, and captured WAV audio. Set `STUDIO_BASE_URL` to your development server address if it differs from the test's default port 5174.

MIDI and OSC commands are documented as future connections. Browser music is handled by pinned Strudel packages. The app is designed for desktop Chrome.

The `studio` drum bank works with `play: kick snare hat snare` and `bank: studio`. Unavailable sounds or banks now give an actionable error, including sounds first reached later in a song. Nested pattern branches inherit earlier track settings unless the branch overrides them. `when: <1 0>` applies its indented change on alternate bars. `color: red` changes note display colors. Commands this plain syntax cannot currently support (`markcss`, `log`, `lfo`, and `arp with`) are clearly marked unavailable with alternatives where useful.

Every command and helper has a plain-language definition. The Command Guide and command help show “How to use it” notes explaining related commands, required patterns or uploaded sounds, value ranges, and limits. Search includes those notes. Command names and native aliases remain available.

Project and unused-sample deletion asks for confirmation. Download a backup before confirming permanent deletion. Command Guide remembers your search and category. In the note helper, click or Space previews a note; Enter or double-click inserts it. Press Escape then Tab to leave the code editor using the keyboard.

Additional regression checks: `tests/audio-regressions-browser.mjs` checks sound errors, working bank audio, nested settings, colors, and failed-export recovery against a development server. `tests/audio-ui-quality-browser.mjs` and `tests/navigation-quality-browser.mjs` check visible error feedback, deletion cancel/confirm, guide context, and keyboard behavior against either development or built apps. Set `STUDIO_BASE_URL` to the server being tested; all use isolated browser storage.

## Learn and practice

Music Theory contains 26 topics, 260 questions with explanations, a missed-question review, and one complete coding activity for every topic. Progress is saved in this browser. It is a broad introduction to Western tonal music, rhythm, arrangement, and sound, rather than every musical tradition.

Each of the 286 Command Guide entries includes a complete practice song and a button to open it as a separate saved project. Your current song is saved first. Sample examples explain what to upload. Unavailable commands offer a clearly labeled supported alternative where possible. Read the instructions, listen, then change one value and compare.

On a hosted address, browser storage starts separately from localhost. Download a project bundle from Projects and import it at the new address to move songs and recordings. Theory progress stays with the browser and address where you studied.

## Source and notices

Original Music Coding contributions use the [MIT license](LICENSE). Third-party software keeps its own terms, including AGPL for Strudel, Kabelsalat, and superdough. The combined application is not MIT-only. See [the license scope](LICENSE-SCOPE.md) before redistributing or hosting it.

App source is in src; checks are in tests. Download the current application source at **/source.zip**. It includes code, tests, build instructions, the pinned lockfile, and dependency notices. It excludes browser projects and uploaded recordings. Downloading it does not run code.

Third-party notices are available at **/licenses/index.html** and in public/licenses. Regenerate installed package notices with `node scripts/licenses.mjs` after dependency updates, then regenerate the source archive with `node scripts/source-archive.mjs` after app changes. Build output preserves these files. Preserve upstream licenses and provide the corresponding source when redistributing or sharing a hosted derivative using Strudel. Music and recordings retain their own rights.

Strudel packages declare AGPL-3.0-or-later. CodeMirror, fflate, and the wasm-media-encoders JavaScript wrapper declare MIT. The wrapper's embedded LAME MP3 encoder has its own LGPL terms. The LAME notice includes its source and build references. Read the preserved license texts for their exact requirements.

## Expanded Sound Designer

The charcoal and mint interface includes 14 synthesized starting sounds, 25 explained controls, a visual attack/decay/sustain/release shape, lowpass resonance and filter movement, and echo/reverb settings. Preview a repeating melody, chord pattern, bass line, or drum rhythm. Edits update a running repeated preview; Stop and leaving the designer end playback. Undo and comparison keep experimentation reversible.

The virtual piano plays the current sound. Written note names, recent manual key presses, and currently sounding pitches appear on the keyboard and labeled piano roll. The history shows press order, not recorded timing; it does not add notes to your song. Tuning changes are identified separately.

Add track to song inserts a complete playable track with every visible setting and existing advanced adjustments, using built-in sources instead of a hidden saved instrument reference. Preview plays that same generated code. When a song has an arrangement, the new track is added to the selected section or first section so it is audible. Save sound retains an editable instrument in your library, not an audio recording. Existing sample uploads remain available.

## Piano beside the Studio editor

The Studio tab includes a virtual piano and a small labeled piano roll beside the code editor on desktop. Choose Triangle or a saved sound, choose an octave, then click a key or focus it and press Enter or Space. The piano shows the note name, notes you tried, and currently sounding pitches. Auditioning notes does not change your song or stop its playback. Insert note is a separate action that adds the selected note at the existing editor cursor. The trial-note history shows order, not recorded timing.
