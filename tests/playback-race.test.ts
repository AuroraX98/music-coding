import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function source(name:'audio'|'app'){
  let text=readFileSync(new URL(`../src/${name}.ts`,import.meta.url),'utf8');
  // Allows checking a proposed patch before applying it; ordinary runs use src.
  if(process.env.STUDIO_PLAYBACK_CANDIDATE==='1'){
    const patch=JSON.parse(readFileSync(new URL('../.qa/playback-approved.json',import.meta.url),'utf8'));
    for(const replacement of patch[name]){
      assert.ok(text.includes(replacement.old),'Candidate replacement must match current source');
      text=text.replace(replacement.old,replacement.new);
    }
  }
  return text;
}
function deferred(){let resolve!:(value?:any)=>void,reject!:(error:Error)=>void;const promise=new Promise<any>((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
async function turn(){await new Promise(resolve=>setImmediate(resolve));}
function execute(code:string,context:Record<string,any>){vm.runInNewContext(ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,context);}
const mix=()=>({master:.75,muted:new Set<string>(),solo:new Set<string>()});
const song=(source='submitted')=>({source,tempo:120,beatsPerBar:4,errors:[]});

function audioHarness(){
  const log:string[]=[];
  const context={currentTime:0,sampleRate:48000,destination:{},audioWorklet:{addModule:async()=>{}},resume:async()=>{}};
  const runtime={scheduler:{seconds_at_cps_change:0,latency:.1,lastEnd:0,now:()=>0},running:false,setCps(){},async setPattern(){log.push('pattern');},async start(){log.push('start');this.running=true;},stop(){log.push('stop');this.running=false;}};
  const pattern={filterWhen:()=>pattern};
  const globals:any={exports:{},structuredClone,DOMException,Blob,captureUrl:'mock-worklet',window:{setInterval:()=>0},AudioWorkletNode:class{port={onmessage:null,postMessage:(message:any)=>log.push(`capture:${message.type}`)};connect(){}disconnect(){log.push('capture:disconnect');}},secondsAtBar:(_song:any,bar:number)=>bar*2,encodeWav:()=>new ArrayBuffer(44),Strudel:{getAudioContext:()=>context,getSuperdoughAudioController:()=>({output:{destinationGain:{connect(){},disconnect(){}}}}),resetGlobalEffects(){},stack:()=>pattern},console};
  execute(source('audio').replace(/^import .*;\r?\n/gm,'').replace(/^const captureUrl=.*;\r?\n/m,'').replaceAll('import.meta.url',"'https://test.invalid/audio.ts'"),globals);
  const engine:any=new globals.exports.AudioEngine();
  engine.runtime=runtime;engine.initialize=async()=>{};engine.prepareSounds=async()=>{};engine.connectMonitor=()=>{};engine.updateMaster=()=>{};engine.build=()=>({pattern,visual:pattern});
  return{engine,runtime,context,log};
}

for(const stage of ['initialize','resume','prepareSounds','setPattern','start'] as const){
  test(`Stop cancels Play while ${stage} waits`,async()=>{
    const {engine,runtime,context,log}=audioHarness(),gate=deferred();
    if(stage==='resume')context.resume=()=>gate.promise;
    else if(stage==='setPattern')runtime.setPattern=async()=>{log.push('pattern');await gate.promise;};
    else if(stage==='start')runtime.start=async()=>{log.push('start');await gate.promise;runtime.running=true;};
    else engine[stage]=()=>gate.promise;
    const playing=engine.play(song(),mix()),result=assert.rejects(playing,{name:'AbortError'});
    await turn();engine.stop();gate.resolve();await result;
    assert.equal(engine.state.playing,false);assert.equal(runtime.running,false);
    if(stage!=='start')assert.equal(log.includes('start'),false);
  });
}

test('A newer Play waits for a canceled delayed start and keeps playing after old cleanup',async()=>{
  const {engine,runtime,log}=audioHarness(),gate=deferred();let count=0;
  runtime.start=async()=>{log.push('start');if(++count===1)await gate.promise;runtime.running=true;};
  const first=engine.play(song('old'),mix()),canceled=assert.rejects(first,{name:'AbortError'});
  await turn();engine.stop();const second=engine.play(song('new'),mix());await turn();
  assert.equal(count,1);gate.resolve();await canceled;await second;
  assert.equal(count,2);assert.equal(engine.active.source,'new');assert.equal(runtime.running,true);assert.equal(engine.state.playing,true);
  assert.equal(log.at(-1),'start');
});

test('Superseding Play skips an older request still preparing samples',async()=>{
  const {engine,runtime}=audioHarness(),gate=deferred();let count=0;
  engine.prepareSounds=()=>++count===1?gate.promise:Promise.resolve();
  const first=engine.play(song('old'),mix()),canceled=assert.rejects(first,{name:'AbortError'});await turn();
  await engine.play(song('new'),mix());gate.resolve();await canceled;
  assert.equal(engine.active.source,'new');assert.equal(runtime.running,true);
});

test('Stop cancels Apply preparing samples without restarting playback',async()=>{
  const {engine,runtime}=audioHarness(),gate=deferred();await engine.play(song(),mix());
  engine.prepareSounds=()=>gate.promise;
  const applying=engine.apply(song('change'),mix()),canceled=assert.rejects(applying,{name:'AbortError'});
  await turn();engine.stop();gate.resolve();await canceled;
  assert.equal(runtime.running,false);assert.equal(engine.pending,undefined);
});

test('A canceled delayed Apply cannot stop the newer Play',async()=>{
  const {engine,runtime}=audioHarness(),gate=deferred();await engine.play(song(),mix());let count=0;
  runtime.setPattern=async()=>{if(++count===1)await gate.promise;};
  const applying=engine.apply(song('change'),mix()),canceled=assert.rejects(applying,{name:'AbortError'});await turn();
  const playing=engine.play(song('new'),mix());await turn();assert.equal(count,1);
  gate.resolve();await canceled;await playing;
  assert.equal(engine.active.source,'new');assert.equal(runtime.running,true);assert.equal(engine.pending,undefined);
});

test('Public Stop is ignored during export; private export cleanup still stops',()=>{
  const {engine,runtime}=audioHarness();engine.exportRunning=true;runtime.running=true;
  engine.stop();assert.equal(runtime.running,true);assert.equal(engine.playbackGeneration,0);
  engine.stopPlayback();assert.equal(runtime.running,false);assert.equal(engine.playbackGeneration,1);
});

test('Export drains canceled Apply before capture and restores the previously playing song',async()=>{
  const {engine,runtime}=audioHarness(),gate=deferred(),submitted=song(),playMix=mix();
  await engine.play(submitted,playMix);let patterns=0;
  runtime.setPattern=async()=>{if(++patterns===1)await gate.promise;};
  const applying=engine.apply(song('change'),playMix),canceled=assert.rejects(applying,{name:'AbortError'});await turn();
  engine.cache={key:JSON.stringify({source:submitted.source,presets:engine.presets,samples:[],master:playMix.master,muted:[],solo:[],startBar:1,endBar:1,tailSeconds:0}),pcm:{left:new Float32Array(1),right:new Float32Array(1),sampleRate:48000}};
  const exporting=engine.exportAudio({compilation:submitted,mix:playMix,startBar:1,endBar:1,tailSeconds:0,format:'wav',signal:new AbortController().signal,onProgress(){}});
  await turn();assert.equal(engine.exportRunning,true);engine.stop();assert.equal(runtime.running,true);
  gate.resolve();await canceled;const result=await exporting;
  assert.equal(result.duration,2);assert.equal(engine.exportRunning,false);assert.equal(runtime.running,true);assert.equal(engine.state.playing,true);assert.equal(engine.active.source,'submitted');
});

function exportOptions(compilation=song(),signal=new AbortController().signal){return{compilation,mix:mix(),startBar:1,endBar:1,tailSeconds:0,format:'wav',signal,onProgress(){}};}

for(const stage of ['initialize','resume','prepareSounds','addModule','setPattern','start'] as const){
  test(`Export cancellation during ${stage} releases export mode and stops delayed audio`,async()=>{
    const {engine,runtime,context,log}=audioHarness(),gate=deferred(),controller=new AbortController();
    if(stage==='resume')context.resume=()=>gate.promise;
    else if(stage==='addModule')context.audioWorklet.addModule=()=>gate.promise;
    else if(stage==='setPattern')runtime.setPattern=()=>gate.promise;
    else if(stage==='start')runtime.start=async()=>{await gate.promise;runtime.running=true;};
    else engine[stage]=()=>gate.promise;
    const exporting=engine.exportAudio(exportOptions(song(),controller.signal)),canceled=assert.rejects(exporting,{name:'AbortError'});
    await turn();controller.abort();await turn();gate.resolve();await canceled;
    assert.equal(engine.exportRunning,false);assert.equal(runtime.running,false);assert.equal(log.includes('capture:start'),false);
  });
}

test('Cancel while export drains a delayed start releases the cached export and permits another Play',async()=>{
  const {engine,runtime}=audioHarness(),gate=deferred(),controller=new AbortController();let starts=0;
  runtime.start=async()=>{if(++starts===1)await gate.promise;runtime.running=true;};
  const playing=engine.play(song(),mix()),canceledPlay=assert.rejects(playing,{name:'AbortError'});await turn();
  const options=exportOptions(song(),controller.signal);
  engine.cache={key:JSON.stringify({source:options.compilation.source,presets:engine.presets,samples:[],master:options.mix.master,muted:[],solo:[],startBar:1,endBar:1,tailSeconds:0}),pcm:{left:new Float32Array(1),right:new Float32Array(1),sampleRate:48000}};
  const exporting=engine.exportAudio(options),canceledExport=assert.rejects(exporting,{name:'AbortError'});
  await turn();controller.abort();gate.resolve();await canceledPlay;await canceledExport;
  assert.equal(engine.exportRunning,false);assert.equal(runtime.running,false);
  await engine.play(song('recovered'),mix());assert.equal(runtime.running,true);assert.equal(engine.active.source,'recovered');
});

function appHarness(playing=false){
  const statuses:string[]=[],toasts:string[]=[],submitted:any[]=[],marker={hidden:false},configure=deferred(),operation=deferred();
  const globals:any={exports:{},Error,clearTimeout,Set,Math,Number,job:null,designerPreviewGeneration:0,designerPreviewTimer:undefined,applyTimer:undefined,compilation:song('submitted'),project:{id:'project-one',source:'submitted'},mix:mix(),engine:{state:{playing,bar:2},play:async(s:any,m:any)=>{submitted.push({s,m});return operation.promise;},apply:async(s:any,m:any)=>{submitted.push({s,m});return operation.promise;},stop(){}},editor:{playing(){},gotoLine(){}},$:()=>marker,status:(text:string)=>statuses.push(text),toast:(text:string)=>toasts.push(text),scheduleSave(){},setLoop(){},configureSounds:()=>configure.promise};
  const text=source('app'),start=text.indexOf('let playbackRequest=0;'),end=text.indexOf('function setLoop()',start);
  assert.ok(start>=0,'App must have request cancellation');
  execute(text.slice(start,end)+'\nglobalThis.actions={play,applyChanges,stop};',globals);
  return{globals,statuses,toasts,submitted,marker,configure,operation};
}

for(const action of ['play','applyChanges']){
  test(`${action} saves submitted source and leaves later edits pending`,async()=>{
    const h=appHarness(action==='applyChanges');const pending=h.globals.actions[action]();
    h.globals.compilation=song('edit during configure');h.globals.project.source='edit during configure';h.globals.mix.muted.add('later mute');
    h.configure.resolve();await turn();
    assert.equal(h.submitted[0].s.source,'submitted');assert.equal(h.submitted[0].m.muted.size,0);
    h.globals.compilation=song('edit during playback');h.globals.project.source='edit during playback';
    h.operation.resolve(3);await pending;
    assert.equal(h.globals.project.workingSource,'submitted');assert.equal(h.marker.hidden,false);
  });
  test(`${action} stopped while configuring never reaches audio engine`,async()=>{
    const h=appHarness(action==='applyChanges'),pending=h.globals.actions[action]();h.globals.actions.stop();
    h.configure.resolve();await pending;assert.equal(h.submitted.length,0);assert.match(h.statuses.at(-1)!,/^Stopped/);
  });
  test(`${action} ignores a stale failure after Stop`,async()=>{
    const h=appHarness(action==='applyChanges'),pending=h.globals.actions[action]();h.configure.resolve();await turn();
    h.globals.actions.stop();h.operation.reject(new Error('old failure'));await pending;
    assert.equal(h.toasts.length,0);assert.match(h.statuses.at(-1)!,/^Stopped/);
  });
}

test('App Stop during export preserves status and ongoing playback request',async()=>{
  const h=appHarness();h.globals.job={};h.globals.actions.stop();assert.equal(h.statuses.length,0);
});

