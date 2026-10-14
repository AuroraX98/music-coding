# Music Coding license scope

The [MIT license](Music-Coding-LICENSE.txt) covers the original Music Coding code and documentation contributed to this repository, including original files in `src/`, `tests/`, and `scripts/`, the launcher and server code, and project documentation. This grant applies to those original contributions. It does not replace licenses or copyright notices belonging to other authors.

## Third-party software keeps its own licenses

Music Coding uses third-party software. The package versions and preserved notices are listed in [public/licenses/packages.json](packages.json) and [public/licenses/index.html](index.html).

- Strudel, Kabelsalat, superdough, and supradough packages retain their GNU AGPL version 3 or later terms.
- CodeMirror, fflate, and the wasm-media-encoders JavaScript wrapper retain their MIT terms.
- The embedded LAME MP3 encoder retains its LGPL terms. Its source and build references are in [the LAME notice](LAME-notice.txt).
- Other dependencies, fonts, and included third-party material retain their own notices and license terms.

An original file that contains third-party material is covered by MIT only for the original contribution; the included material keeps its existing terms. A directory name or repository-level MIT notice does not relicense that material.

## The complete application is not an MIT-only distribution

The built browser application combines Music Coding code with AGPL components. Distribution and applicable network use must comply with those AGPL terms, including their corresponding-source and notice requirements. The MIT license for original contributions does not remove those obligations or grant permission to relicense the combined application as MIT-only.

Preserve the upstream notices, license texts, and applicable source access when redistributing or hosting the application. The app provides a source archive at `/source.zip`; it includes original app code, build instructions, the pinned dependency lockfile, and dependency notices. It does not bundle installed dependencies. Their source references and licenses remain in the dependency notices; the app archive alone should not be represented as replacing all corresponding-source obligations for third-party components.

Read the preserved license texts for their full conditions. Music projects, uploaded recordings, and exported audio retain their own rights and are not relicensed by this repository's MIT notice.
