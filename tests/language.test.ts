import test from 'node:test';
import assert from 'node:assert/strict';
import {compile,tidy,durationForRange,describeDuration,stripComment,canOwnChildren} from '../src/language';
import {commands,resolveCommand} from '../src/catalog';

const melody='track: melody\n  sound: triangle\n  notes: B4 B5 E2 F3\n  faster: 2\n  volume: 30%';
const arranged=`tempo: 120 bpm\n${melody}\n\ntrack: bass\n  s: sine\n  nt: C2 rest G2 rest\n\narrange:\n  section: intro\n    bars: 8\n    tracks: melody\n  section: slower section\n    bars: 8\n    tracks: melody bass\n    tempo: 60 bpm`;

test('native names and aliases resolve to the same command',()=>{
  assert.equal(resolveCommand('v'),resolveCommand('volume'));assert.equal(resolveCommand('gain'),resolveCommand('volume'));
  assert.equal(resolveCommand('fast')?.name,'faster');assert.equal(resolveCommand('nt')?.native,'note');
  assert.equal(resolveCommand('saw2')?.native,'saw2');assert.equal(resolveCommand('sine2')?.native,'sine2');assert.equal(resolveCommand('vib')?.native,'vib');
  assert.ok(commands.length>260);assert.equal(resolveCommand('midi')?.kind,'later');
});
test('repeating tracks have no invented length',()=>{
  const c=compile(melody);assert.deepEqual(c.errors,[]);assert.equal(c.totalBars,null);assert.equal(c.totalSeconds,null);
  assert.equal(durationForRange(c,1,16),32);assert.equal(c.tracks[0].endLine,5);
});
test('finite duration counts parallel tracks once and honors section tempo',()=>{
  const c=compile(arranged);assert.deepEqual(c.errors,[]);assert.equal(c.totalBars,16);assert.equal(c.totalSeconds,48);
  assert.equal(c.sections[1].startBar,9);assert.equal(durationForRange(c,7,10),12);
  assert.equal(compile(arranged.replace('faster: 2','faster: 8')).totalSeconds,48);
  assert.throws(()=>durationForRange(c,1,17),RangeError);assert.throws(()=>durationForRange(c,0,2),RangeError);
});
test('references and callback blocks retain source lines',()=>{
  const c=compile(`pattern: tune\n  notes: C4 E4\nchange: rush\n  faster: 2\nsignal: sweep\n  sine:\n  range: 200, 2000\ntrack: melody\n  use: tune\n  lowpass: $sweep\n  every: 4\n    use: rush`);
  assert.deepEqual(c.errors,[]);assert.equal(c.definitions.length,3);assert.equal(c.tracks[0].commands[2].children[0].line,12);
  assert.equal(c.tracks[0].commands[1].value,'$sweep');
  assert.deepEqual(compile(`change: rush\n  faster: 2\n${melody}\n  every: 4, $rush\n  sometimes: rush`).errors,[]);
});
test('missing references, duplicates and definition cycles explain errors',()=>{
  assert.match(compile(melody+'\n  use: absent').errors[0].message,/No pattern/);
  assert.ok(compile(melody+'\n'+melody).errors.some(e=>e.message.includes('already exists')));
  assert.ok(compile('pattern: a\n  use: b\npattern: b\n  use: a\n'+melody).errors.some(e=>e.message.includes('loop')));
  assert.ok(compile(arranged.replace('tracks: melody bass','tracks: missing')).errors.some(e=>e.message.includes('No track')));
});
test('indentation mistakes are located and tidy never guesses their meaning',()=>{
  const bad='track: melody\n    sound: triangle\n  notes: C4';assert.equal(compile(bad).errors[0].line,2);assert.equal(tidy(bad),bad);
  assert.ok(compile('track: melody\n  notes: C4\n    volume: 20%').errors.some(e=>e.line===3));
  assert.ok(compile('track: melody\n   notes: C4').errors.some(e=>e.line===2));
});
test('comments and ordered code survive tidy',()=>{
  const source='// theme\ntrack : melody // name\n  s : triangle\n  nt : C4 E4 // two notes\n  rvb : 20%';
  assert.deepEqual(compile(source).errors,[]);const clean=tidy(source);assert.ok(clean.includes('  nt: C4 E4 // two notes'));assert.ok(clean.includes('track: melody // name'));assert.equal(compile(clean).tracks[0].commands[0].name,'sound');
  assert.equal(stripComment('samples: "https://example.org/s.wav" // source'),'samples: "https://example.org/s.wav" ');
  assert.equal(describeDuration(64),'1:04');
});
test('native cycle tempo converts using configured beats per bar',()=>{
  const c=compile(`beats per bar: 3\nsetcpm: 40\n${melody}`);assert.deepEqual(c.errors,[]);assert.equal(c.tempo,120);assert.equal(durationForRange(c,1,4),6);
});
test('visual names and inline combining blocks follow the same grammar as editor helpers',()=>{
  const c=compile('track: melody\n  sound: triangle\n  stack:\n    pattern: high\n      notes: C5 E5\n    pattern: low\n      notes: C3 G3\nshow: _scope()');
  assert.deepEqual(c.errors,[]);assert.deepEqual(c.views,['waveform']);assert.equal(canOwnChildren('someCycles'),true);assert.equal(canOwnChildren('juxBy'),true);assert.equal(canOwnChildren('fastcat'),true);assert.equal(canOwnChildren('volume'),false);
  assert.equal(resolveCommand('[]')?.kind,'symbol');assert.ok(compile(melody+'\n  []: C4').errors.some(e=>e.message.includes('inside a pattern')));
});
test('fractional export bar input is rejected rather than silently rounded',()=>{
  assert.throws(()=>durationForRange(compile(melody),1,4.5),RangeError);
});

test('misplaced arrangement commands inside definitions are caught before Play',()=>{
  for(const kind of ['pattern','change','signal'])for(const command of ['tempo: 90','setcpm: 30','bars: 4','tracks: melody']){
    const song=compile(`${kind}: theme\n  ${command}\n${melody}`);
    assert.ok(song.errors.some(e=>e.line===2&&e.message.includes('does not belong')),`${kind}: ${command}`);
  }
  const valid=compile('pattern: theme\n  stack:\n    pattern: high\n      notes: C5\n    pattern: low\n      notes: C3\ntrack: melody\n  sound: sine\n  use: theme');
  assert.deepEqual(valid.errors,[]);
});

test('unavailable visual commands explain their limit and color requires a value',()=>{
  for(const command of ['log','markcss','_log','_markcss']){
    const song=compile(`${melody}\n  ${command}:`);
    assert.ok(song.errors.some(e=>e.line===6&&e.message.includes('not available')));
    assert.ok(!song.errors.some(e=>e.message.includes('MIDI')));
  }
  assert.deepEqual(compile(`${melody}\n  color: red`).errors,[]);
  assert.ok(compile(`${melody}\n  color:`).errors.some(e=>e.message.includes('Add a value')));
});
