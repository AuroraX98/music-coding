import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage();const report={browser:'Chrome',passed:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
try{
  await page.goto((process.env.STUDIO_BASE_URL||'http://127.0.0.1:5174')+'/tests/audio-browser.html');await page.waitForFunction(()=>window.audioTest);
  report.results=await page.evaluate(async()=>{
    const {AudioEngine,DEFAULT_PRESETS,compile,Strudel:S}=window.audioTest;
    const engine=new AudioEngine();engine.setSounds(DEFAULT_PRESETS,[]);await engine.initialize();
    const mix={master:.75,muted:new Set(),solo:new Set()};
    const check=(condition,message)=>{if(!condition)throw new Error(message);};
    const source=(sequence)=>'tempo: 150 bpm\ntrack: drums\n  play: '+sequence+'\n  volume: 45%\n  faster: 4\nshow: piano roll';
    const finite=(code,track='drums')=>code+'\narrange:\n  section: check\n    bars: 1\n    tracks: '+track;
    let calls=[];const originals={};
    for(const name of ['studio_kick','studio_snare']){
      const sound=S.soundMap.get()[name];originals[name]=sound;
      S.registerSound(name,(time,params,ended)=>{calls.push({name,time,gain:params.gain});return sound.onTrigger(time,params,ended);},sound.data);
    }
    const ordered=[];
    try{
      for(const sequence of ['kick rest snare rest','snare rest kick rest']){
        calls=[];await engine.play(compile(finite(source(sequence))),mix);
        const start=engine.startedAt;
        await new Promise(resolve=>setTimeout(resolve,1850));engine.stop();
        const triggered=calls.map(c=>({...c,seconds:Math.round((c.time-start)*1000000)/1000000})).filter(c=>c.seconds>=0&&c.seconds<1.6).sort((a,b)=>a.seconds-b.seconds);
        check(triggered.length===8,sequence+': expected 8 actual sound starts, got '+JSON.stringify(triggered));
        const names=sequence.startsWith('kick')?['studio_kick','studio_snare']:['studio_snare','studio_kick'];
        triggered.forEach((call,i)=>{check(call.name===names[i%2],'Wrong alternating sound at hit '+i);check(Math.abs(call.seconds-i*.2)<.00001,'Wrong starting time at hit '+i);check(call.gain===.45,'Volume setting lost.');});
        ordered.push({sequence,triggers:triggered});
      }
      const onsets=(code)=>engine.build(compile(code),mix).visual.queryArc(0,1).filter(h=>h.hasOnset()).sort((a,b)=>+a.whole.begin-+b.whole.begin);
      for(const lines of [
        '  sound: triangle\n  notes: C4 E4 G4 E4',
        '  notes: C4 E4 G4 E4\n  sound: triangle',
        '  volume: 25%\n  sound: triangle\n  notes: C4 E4 G4 E4',
      ]){
        const notes=onsets('track: melody\n'+lines);check(notes.length===4,'Melody lost starting notes: '+lines);notes.forEach((h,i)=>{check(+h.whole.begin===i/4,'Melody starts at wrong beat');check(h.value.note===['C4','E4','G4','E4'][i],'Melody value lost.');});
      }
      const held=onsets('track: melody\n  sound: triangle\n  notes: C4\n  volume: 0.2 0.8 0.4 0.6');check(held.length===1,'Volume changes incorrectly retrigger a held note.');
      const signal=onsets('signal: sweep\n  sine:\n  range: 220, 880\ntrack: melody\n  sound: triangle\n  notes: C4 E4 G4 E4\n  frequency: $sweep');check(signal.length===4,'Continuous pitch control removed note starts.');
      const frequency=onsets('track: tone\n  sound: triangle\n  frequency: 220 330 440 550');check(frequency.length===4,'Frequency sequence lost starts.');
      const definition=onsets('pattern: beat\n  play: kick rest snare rest\ntrack: drums\n  use: beat\n  faster: 4');check(definition.length===8,'Named pattern lost drum starts.');
      const nested=onsets('track: drums\n  stack:\n    play: kick rest snare rest\n    play: hat hat hat hat\n  faster: 2');check(nested.length===12,'Stack lost nested starts.');
      const callback=engine.build(compile('track: drums\n  play: kick rest snare rest\n  every: 2\n    faster: 2'),mix).visual.queryArc(0,4).filter(h=>h.hasOnset());check(callback.length===12,'Every callback lost its rhythm.');
      calls=[];const song=compile(finite(source('kick rest snare rest')));
      const wav=await engine.exportAudio({compilation:song,mix,startBar:1,endBar:1,tailSeconds:0,format:'wav',signal:new AbortController().signal,onProgress(){}});
      const data=new DataView(await wav.blob.arrayBuffer());const rate=data.getUint32(24,true);let peak=0;for(let i=44;i<data.byteLength;i+=2)peak=Math.max(peak,Math.abs(data.getInt16(i,true)));
      check(wav.duration===1.6&&data.byteLength===44+Math.round(rate*1.6)*4,'Wrong captured drum duration.');check(peak>100,'Captured drum audio is silent.');
      check(calls.filter(c=>c.name==='studio_kick').length===4&&calls.filter(c=>c.name==='studio_snare').length===4,'WAV export did not trigger both drums four times.');
      return{ordered,melodyOrders:true,controlsPreserved:true,heldNoteNotRetriggered:true,frequency:true,namedPattern:true,stack:true,every:true,wav:{seconds:wav.duration,bytes:data.byteLength,peak,kicks:4,snares:4}};
    }finally{engine.stop();for(const [name,sound]of Object.entries(originals))S.registerSound(name,sound.onTrigger,sound.data);}
  });
  report.passed.push('Both drum orders start all eight actual sounds at their correct scheduled times.','All melody notes start in both sound/notes line orders; controls preserve sound timing.','Named patterns, stack, every, frequency, and a held note with changing volume retain their starts.','WAV contains nonzero audio and triggers four kicks and four snares.');assert.deepEqual(report.errors,[]);
}catch(e){report.failure=e.stack;process.exitCode=1;}finally{await browser.close();await mkdir('.qa',{recursive:true});await writeFile('.qa/mixed-sounds-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
