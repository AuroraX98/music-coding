import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try{
  const page=await browser.newPage();
  await page.goto((process.env.STUDIO_BASE_URL||'http://127.0.0.1:5173')+'/tests/audio-browser.html');
  await page.waitForFunction(()=>window.audioTest);
  const result=await page.evaluate(async()=>{
    const {AudioEngine,DEFAULT_PRESETS,compile,Strudel:S}=window.audioTest;
    const engine=new AudioEngine(),mix={master:.6,muted:new Set(),solo:new Set()},errors=[];
    engine.onError=error=>errors.push(error.message);
    engine.setSounds(DEFAULT_PRESETS,[]);await engine.initialize();await engine.prepareSounds();
    const base='tempo: 600 bpm\ntrack: test\n  sound: sine\n  notes: C4*4';
    const build=source=>engine.build(compile(source),mix);
    let bankError;
    try{await engine.play(compile(base+'\n  bank: my drums'),mix);}catch(error){bankError=error.message;}
    const badBankStopped=!engine.state.playing;
    await engine.play(compile('tempo: 600 bpm\ntrack: drums\n  play: kick snare hat snare\n  bank: studio'),mix);
    let peak=0;
    for(let i=0;i<10;i++){await new Promise(r=>setTimeout(r,40));const data=new Float32Array(engine.analyser.fftSize);engine.analyser.getFloatTimeDomainData(data);for(const sample of data)peak=Math.max(peak,Math.abs(sample));}
    engine.stop();
    const source='track: test\n  sound: sine\n  volume: 25%\n  stack:\n    pattern: high\n      notes: C5 E5\n    pattern: low\n      notes: C3';
    const inherited=build(source).visual.queryArc(0,1).filter(h=>h.hasOnset()).map(h=>({start:+h.whole.begin,end:+h.whole.end,sound:h.value.s,gain:h.value.gain,note:h.value.note}));
    const overridden=build(source.replace('notes: C3','sound: square\n      volume: 50%\n      notes: C3')).visual.queryArc(0,1).find(h=>h.value.note==='C3').value;
    const fastcat=build(source.replace('stack:','fastcat:')).visual.queryArc(0,1).filter(h=>h.hasOnset()).map(h=>({start:+h.whole.begin,end:+h.whole.end,sound:h.value.s}));
    const whenBase='track: test\n  sound: sine\n  notes: C4 E4';
    const starts=source=>build(source).visual.queryArc(0,2).filter(h=>h.hasOnset()).map(h=>+h.whole.begin);
    const when={predicate:starts(whenBase+'\n  when: cycle % 2 == 0\n    faster: 2'),pattern:starts(whenBase+'\n  when: <1 0>\n    faster: 2'),zero:starts(whenBase+'\n  when: 0\n    faster: 2'),false:starts(whenBase+'\n  when: false\n    faster: 2'),named:starts('change: rush\n  faster: 2\n'+whenBase+'\n  when: <1 0>, $rush')};
    engine.built=build(base+'\n  color: red');const colors=engine.getEvents(0,1).map(event=>event.color);
    let arrangedError;
    try{build('track: intro\n  sound: sine\n  notes: C4\ntrack: ending\n  sound: notloaded\n  notes: C4\narrange:\n  section: first\n    bars: 5\n    tracks: intro\n  section: last\n    bars: 1\n    tracks: ending');}catch(error){arrangedError=error.message;}
    await engine.play(compile('tempo: 600 bpm\ntrack: test\n  sound: <triangle triangle triangle triangle notloaded>\n  notes: C4'),mix);
    for(let i=0;i<70&&!errors.length;i++)await new Promise(r=>setTimeout(r,40));
    const lateStopped=!engine.state.playing,lateErrors=[...errors];
    await engine.play(compile(base),mix);const recovered=engine.state.playing;engine.stop();
    // A renderer failure can occur after startup even for a registered sound.
    let calls=0;
    S.registerSound('fails_later',()=>{if(++calls>=5)throw new Error('Test renderer failed after startup');return undefined;},{type:'synth'});
    let exportError,exportReturned=false;
    try{await engine.exportAudio({compilation:compile('tempo: 600 bpm\ntrack: test\n  sound: fails_later\n  notes: C4'),mix,format:'wav',startBar:1,endBar:6,tailSeconds:0,signal:new AbortController().signal,onProgress(){}});exportReturned=true;}catch(error){exportError=error.message;}
    return {bankError,badBankStopped,peak,inherited,overridden:{s:overridden.s,gain:overridden.gain},fastcat,when,colors,arrangedError,lateErrors,lateStopped,recovered,exportError,exportReturned,exportStopped:!engine.state.playing};
  });
  assert.match(result.bankError,/Line 5: Bank.*my.*Remove the bank command/);assert.equal(result.badBankStopped,true);
  assert.ok(result.peak>.001,'Registered studio bank must produce real audio');
  assert.deepEqual(result.inherited,[{start:0,end:.5,sound:'sine',gain:.25,note:'C5'},{start:.5,end:1,sound:'sine',gain:.25,note:'E5'},{start:0,end:1,sound:'sine',gain:.25,note:'C3'}]);
  assert.deepEqual(result.overridden,{s:'square',gain:.5});
  assert.deepEqual(result.fastcat,[{start:0,end:.25,sound:'sine'},{start:.25,end:.5,sound:'sine'},{start:.5,end:1,sound:'sine'}]);
  for(const key of ['predicate','pattern','named'])assert.deepEqual(result.when[key],[0,.25,.5,.75,1,1.5],`when ${key} must change alternate bars without losing starts`);
  for(const key of ['zero','false'])assert.deepEqual(result.when[key],[0,.5,1,1.5],`when ${key} must leave the pattern unchanged`);
  assert.deepEqual(result.colors,['red','red','red','red']);
  assert.match(result.arrangedError,/Line 6: Sound.*notloaded.*not loaded/);
  assert.equal(result.lateErrors.length,1);assert.match(result.lateErrors[0],/Line .*notloaded.*not loaded/);assert.equal(result.lateStopped,true);assert.equal(result.recovered,true);
  assert.equal(result.exportReturned,false);assert.match(result.exportError,/Test renderer failed after startup/);assert.equal(result.exportStopped,true);
  console.log(JSON.stringify({passed:true,...result},null,2));
}finally{await browser.close();}
