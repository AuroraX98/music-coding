import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage();
page.on('pageerror',error=>console.error('PAGE ERROR:',error.message));
page.on('console',message=>{if(message.type()==='error'||message.type()==='warning')console.error(message.text());});
try{
await page.goto((process.env.STUDIO_BASE_URL||'http://127.0.0.1:5173')+'/tests/audio-browser.html');
await page.waitForFunction(()=>window.audioTest);
const result=await page.evaluate(async()=>{
  const {AudioEngine,DEFAULT_PRESETS,compile}=window.audioTest;
  const engine=new AudioEngine(),mix={master:.6,muted:new Set(),solo:new Set()};
  const source='tempo: 240 bpm\ntrack: melody\n  sound: triangle\n  notes: B4 B5 E2 F3\n  faster: 2\n  volume: 30%\n  reverb: 10%';
  const song=compile(source);if(song.errors.length)throw new Error(JSON.stringify(song.errors));
  engine.setSounds(DEFAULT_PRESETS,[]);await engine.play(song,mix);
  const events=engine.getEvents(0,1);if(events.length!==8)throw new Error(`Expected 8 notes, received ${events.length}`);
  if(engine.built.visual.queryArc(0,1).filter(hap=>hap.hasOnset()).length!==8)throw new Error('The eight melody notes did not all have sound starts.');
  await new Promise(resolve=>setTimeout(resolve,250));
  const data=new Float32Array(engine.analyser.fftSize);engine.analyser.getFloatTimeDomainData(data);let peak=Math.max(...data.map(Math.abs));
  if(peak<.0001)throw new Error('The engine produced no real audio.');
  const pending=await engine.apply(compile(source.replace('30%','20%')),mix);if(pending<2)throw new Error('Live changes were not queued at a future bar.');
  engine.stop();
  // Delay real-engine sample preparation to exercise Stop before the awaited start.
  const prepareSounds=engine.prepareSounds.bind(engine);let releasePreparation,preparationEntered;
  const preparing=new Promise(resolve=>{preparationEntered=resolve;}),prepared=new Promise(resolve=>{releasePreparation=resolve;});
  engine.prepareSounds=async()=>{preparationEntered();await prepared;await prepareSounds();};
  const delayed=engine.play(song,mix).then(()=>{throw new Error('Stopped loading request still started.');},error=>{if(error.name!=='AbortError')throw error;});
  await preparing;engine.stop();releasePreparation();await delayed;engine.prepareSounds=prepareSounds;
  if(engine.state.playing)throw new Error('Stop while loading left playback running.');
  const options={compilation:song,mix,startBar:1,endBar:1,tailSeconds:0,format:'wav',onProgress:()=>{},signal:new AbortController().signal};
  const wav=await engine.exportAudio(options);const bytes=await wav.blob.arrayBuffer(),view=new DataView(bytes);
  if(bytes.byteLength!==44+engine.context.sampleRate*4)throw new Error(`Unexpected WAV length ${bytes.byteLength}`);
  let recordedPeak=0;for(let i=44;i<bytes.byteLength;i+=2)recordedPeak=Math.max(recordedPeak,Math.abs(view.getInt16(i,true)));if(recordedPeak<10)throw new Error('Captured WAV is silent.');
  engine.setSounds(structuredClone(DEFAULT_PRESETS),[]);
  let reused=false;
  const mp3=await engine.exportAudio({...options,format:'mp3',onProgress:(_,label)=>{if(label.includes('same captured'))reused=true;}});if(mp3.blob.size<1000)throw new Error('MP3 file is too small.');if(!reused)throw new Error('Stable setSounds discarded the WAV/MP3 performance cache.');
  const fractional=await engine.exportAudio({...options,endBar:.3});if(Math.abs(fractional.duration-.3)>.0001||fractional.blob.size!==44+Math.round(.3*engine.context.sampleRate)*4)throw new Error('Fractional chosen-duration export was not exact.');
  let changedMaster=false;
  const frozen=await engine.exportAudio({...options,endBar:1,tailSeconds:.05,onProgress:fraction=>{if(fraction>.1&&!changedMaster){changedMaster=true;engine.setMix({...mix,master:0});engine.stop();}}});
  const frozenView=new DataView(await frozen.blob.arrayBuffer());let latePeak=0;for(let i=Math.round(engine.context.sampleRate*.7)*4+44;i<Math.round(engine.context.sampleRate*.95)*4+44;i+=2)latePeak=Math.max(latePeak,Math.abs(frozenView.getInt16(i,true)));if(latePeak<10)throw new Error('Mix changes affected the frozen export snapshot.');engine.setMix(mix);
  const defined=compile('signal: sweep\n  sine:\n  range: 300, 3000\npattern: theme\n  notes: C4 E4 G4\nchange: rush\n  faster: 2\ntrack: lead\n  sound: lead\n  use: theme\n  every: 4, $rush\n  lowpass: $sweep');
  await engine.play(defined,mix);if(!engine.getEvents(0,1).length)throw new Error('Named patterns, changes, and signals did not make events.');engine.stop();
  const drums=compile('track: drums\n  play: kick rest snare hat\n  volume: 50%');
  await engine.play(drums,mix);if(engine.getEvents(0,1).length!==3||engine.built.visual.queryArc(0,1).filter(hap=>hap.hasOnset()).length!==3)throw new Error('Original drum sound sequence failed to start every hit.');engine.stop();
  engine.setSounds(DEFAULT_PRESETS,[{id:'uploaded',name:'my sample',blob:wav.blob,rootNote:'C4'}]);
  const sampleSong=compile('tempo: 240 bpm\ntrack: sample\n  sound: my_sample\n  notes: C4 C5\n  volume: 40%');
  await engine.play(sampleSong,mix);if(engine.getEvents(0,1).length!==2)throw new Error('Pitched uploaded sample failed.');engine.stop();
  const arranged=compile('tempo: 240 bpm\ntrack: melody\n  sound: triangle\n  notes: C4 E4\narrange:\n  section: first\n    bars: 1\n    tracks: melody\n  section: second\n    bars: 1\n    tempo: 120 bpm\n    tracks: melody');
  await engine.play(arranged,mix);if(engine.getEvents(2,4).length)throw new Error('Finite arrangement visual events escaped the ending.');engine.stop();
  const rangeWav=await engine.exportAudio({...options,compilation:arranged,startBar:2,endBar:2,tailSeconds:.25});
  if(rangeWav.duration!==2.25||rangeWav.blob.size!==44+2.25*engine.context.sampleRate*4)throw new Error('Selected section duration or effect tail failed.');
  const controller=new AbortController();setTimeout(()=>controller.abort(),100);
  try{await engine.exportAudio({...options,endBar:16,signal:controller.signal});throw new Error('Export ignored cancellation.');}catch(error){if(error.name!=='AbortError')throw error;}
  await engine.play(song,mix);engine.stop();
  return {events:events.length,peak,pending,wavBytes:bytes.byteLength,recordedPeak,mp3Bytes:mp3.blob.size,duration:wav.duration,selectedWithTail:rangeWav.duration,fractionalDuration:fractional.duration,samePerformanceCache:reused,exportSnapshot:true,namedPatterns:true,uploadedSample:true,originalDrums:true,cancelRecovery:true,stopDuringPreparation:true,contextState:engine.context.state};
});
console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
