import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const base=process.env.STUDIO_BASE_URL||'http://127.0.0.1:5174';
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const report={errors:[]};
try{
 const context=await browser.newContext(),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base+'/tests/audio-browser.html');await page.waitForFunction(()=>window.audioTest);
 report.audio=await page.evaluate(async()=>{
  const {AudioEngine,DEFAULT_PRESETS,Strudel,compile}=window.audioTest,engine=new AudioEngine(),mix={master:.75,muted:new Set(),solo:new Set()};
  engine.setSounds(DEFAULT_PRESETS,[]);await engine.initialize();await engine.context.resume();engine.setMix(mix);
  const analyser=engine.context.createAnalyser();analyser.fftSize=2048;Strudel.getSuperdoughAudioController().output.destinationGain.connect(analyser);
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  async function capture(play){await wait(1100);let peak=0,sum=0,count=0;const values=new Float32Array(analyser.fftSize);await play();const end=performance.now()+1000;while(performance.now()<end){analyser.getFloatTimeDomainData(values);for(const v of values){peak=Math.max(peak,Math.abs(v));sum+=v*v;count++;}await wait(10);}return {peak,rms:Math.sqrt(sum/count)};}
  const notes=[['vcsl_piano','C4'],['karoryfer_bass','C3'],['vsco_violin','C4']];const sounds={};
  for(const [id,note] of notes)sounds[id]=await capture(()=>engine.previewInstrument(id,note,.75));
  const triangle={...DEFAULT_PRESETS[3],waveform:'triangle',space:0,length:.3,advanced:{note:'C4'}};
  sounds.triangle=await capture(()=>engine.previewPreset(triangle,.75));
  const lower=await capture(()=>engine.previewInstrument('vcsl_piano','C4',.25));
  const zero=await capture(()=>engine.previewInstrument('vcsl_piano','C4',0));
  engine.setMix({...mix,master:0});const masterMuted=await capture(()=>engine.previewInstrument('vcsl_piano','C4',.75));engine.setMix(mix);
  const source='tempo: 240 bpm\ntrack: melody\n  sound: vcsl_piano\n  notes: C4 E4 G4 C4\n  volume: 35%';const song=compile(source);
  const options={compilation:song,mix,startBar:1,endBar:1,tailSeconds:.1,format:'wav',onProgress:()=>{},signal:new AbortController().signal};
  async function exported(){engine.cache=undefined;const out=await engine.exportAudio(options),v=new DataView(await out.blob.arrayBuffer());let peak=0,sum=0,count=0;for(let i=44;i<v.byteLength;i+=2){const x=v.getInt16(i,true)/32768;peak=Math.max(peak,Math.abs(x));sum+=x*x;count++;}return {peak,rms:Math.sqrt(sum/count),size:v.byteLength};}
  const before=await exported();await engine.previewInstrument('vcsl_piano','C4',1);await wait(1200);const after=await exported();
  await engine.play(song,mix);await wait(200);const position=engine.state.seconds;await engine.previewInstrument('vcsl_piano','C4',.75);await wait(300);const continued=engine.state.playing&&engine.state.seconds>position;engine.stop();
  return {sounds,lower,zero,masterMuted,before,after,continued,sourceUnchanged:song.source===source};
 });
 for(const [name,level] of Object.entries(report.audio.sounds)){assert.ok(level.peak>.035,`${name} must have a useful audible peak, got ${level.peak}`);assert.ok(level.rms>.004,`${name} must sustain audible energy, got ${level.rms}`);assert.ok(level.peak<.6,`${name} must retain headroom`);}
 const a=report.audio;assert.ok(a.lower.rms/a.sounds.vcsl_piano.rms>.2&&a.lower.rms/a.sounds.vcsl_piano.rms<.45,'Lower piano slider reduces actual audio');assert.ok(a.zero.peak<.00001,'Zero piano slider is silent');assert.ok(a.masterMuted.peak<.00001,'Master mute still silences piano');assert.ok(a.continued&&a.sourceUnchanged,'Audition preserves song playback and source');assert.equal(a.before.size,a.after.size);assert.ok(Math.abs(a.after.rms/a.before.rms-1)<.05,'Fresh WAV render level stays unchanged');assert.ok(Math.abs(a.after.peak/a.before.peak-1)<.05,'Fresh WAV render peak stays unchanged');
 await page.goto(base);await page.waitForFunction(()=>window.studioDiagnostics);const source=await page.evaluate(()=>window.studioDiagnostics.project.source);
 assert.equal(await page.locator('#sp-volume').inputValue(),'75');await page.locator('#sp-volume').fill('40');assert.equal(await page.locator('#sp-volume-value').textContent(),'40%');await page.reload();await page.waitForFunction(()=>window.studioDiagnostics);assert.equal(await page.locator('#sp-volume').inputValue(),'40');assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),source);report.sliderPersistence=true;
 report.layouts=[];for(const width of [1024,390]){await page.setViewportSize({width,height:950});const layout=await page.locator('.studio-piano-panel').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,page:document.documentElement.scrollWidth,viewport:innerWidth}));assert.ok(layout.scroll<=layout.width+1,'Piano panel fits at '+width);assert.ok(layout.page<=layout.viewport+1,'Page fits at '+width);report.layouts.push({width,...layout});}
 assert.deepEqual(report.errors,[]);report.success=true;
}finally{await browser.close();await mkdir('.qa',{recursive:true});await writeFile('.qa/piano-volume-browser-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
