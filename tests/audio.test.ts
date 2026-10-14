import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeWav,evaluateExpression,secondsAtBar,splitArguments} from '../src/audio-utils';
import {compile} from '../src/language';

test('Export length integrates changing tempo and overlapping tracks only once',()=>{
  const song=compile('tempo: 120 bpm\ntrack: a\n  sound: triangle\n  notes: C4\ntrack: b\n  sound: sine\n  notes: C2\narrange:\n  section: start\n    bars: 4\n    tracks: a b\n  section: slower\n    bars: 4\n    tempo: 60 bpm\n    tracks: a b');
  assert.equal(song.errors.length,0);assert.equal(secondsAtBar(song,4),8);assert.equal(secondsAtBar(song,8),24);
  assert.equal(secondsAtBar(song,6)-secondsAtBar(song,2),12);
});

test('WAV uses stereo PCM16, exact frame length, clamping, and proper header',()=>{
  const data=encodeWav(new Float32Array([-2,0,.5]),new Float32Array([2,.25,-.5]),48000),view=new DataView(data);
  assert.equal(data.byteLength,56);assert.equal(view.getUint16(22,true),2);assert.equal(view.getUint32(24,true),48000);
  assert.equal(view.getUint32(28,true),192000);assert.equal(view.getUint32(40,true),12);
  assert.equal(view.getInt16(44,true),-32768);assert.equal(view.getInt16(46,true),32767);assert.equal(view.getInt16(50,true),8192);
});

test('Safe arithmetic handles precedence, functions, arrays, references, and predicates',()=>{
  assert.equal(evaluateExpression('x-1 * 2',{x:10}),8);
  assert.equal(evaluateExpression('max(2, 3) + 2 ** 3', {max:Math.max}),11);
  assert.deepEqual(evaluateExpression('[1, 2 + 3, $sweep]',{sweep:7}),[1,5,7]);
  assert.equal(evaluateExpression('cycle % 4 == 0 && cycle > 1',{cycle:8}),true);
  assert.deepEqual(splitArguments('200, max(300, 400), "C4, E4"'),['200','max(300, 400)','"C4, E4"']);
});

test('Expressions cannot execute JavaScript or access object properties',()=>{
  for(const expression of ['globalThis.alert(1)','x.constructor(1)','(()=>1)()','eval("alert(1)")','1; 2','process.exit()'])assert.throws(()=>evaluateExpression(expression,{x:1}));
});
