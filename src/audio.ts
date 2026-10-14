/// <reference types="vite/client" />
import * as Strudel from '@strudel/web';
import type {Compilation,ExportOptions,LiveState,MixOptions,SampleAsset,SoundPreset,Statement,VisualEvent} from './types';
import {encodeWav,evaluateExpression,secondsAtBar,splitArguments} from './audio-utils';
import {commands as catalogue} from './catalog';
import {BUILTIN_INSTRUMENTS,BUILTIN_KITS} from './instruments';
const captureUrl=`${import.meta.env.BASE_URL}capture-worklet.js`;

const S=Strudel as Record<string,any>;
const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
const soundName=(name:string)=>name.trim().toLowerCase().replace(/\s+/g,'_');
export const DEFAULT_PRESETS:SoundPreset[]=[
  {id:'kick',name:'kick',kind:'kick',waveform:'sine',volume:.7,brightness:.35,attack:.001,length:.35,space:0},
  {id:'snare',name:'snare',kind:'snare',waveform:'noise',volume:.55,brightness:.7,attack:.001,length:.18,space:.08},
  {id:'bass',name:'bass',kind:'bass',waveform:'sawtooth',volume:.35,brightness:.25,attack:.005,length:.2,space:0},
  {id:'lead',name:'lead',kind:'lead',waveform:'square',volume:.3,brightness:.65,attack:.01,length:.15,space:.12},
  {id:'pad',name:'pad',kind:'pad',waveform:'triangle',volume:.3,brightness:.45,attack:.4,length:.8,space:.25},
];

type Pattern=any;
type Runtime=any;
type PCM={left:Float32Array<ArrayBuffer>;right:Float32Array<ArrayBuffer>;sampleRate:number};
type BuiltSong={pattern:Pattern;visual:Pattern};
const defaultMix=():MixOptions=>({master:.75,muted:new Set(),solo:new Set()});

export class AudioEngine {
  private runtime:Runtime;
  private ready?:Promise<void>;
  private presets:SoundPreset[]=structuredClone(DEFAULT_PRESETS);
  private assets:SampleAsset[]=[];
  private loaded=new Map<string,{blob:Blob;url:string;root?:string}>();
  private presetMap=new Map<string,SoundPreset>();
  private reservedSounds=new Set<string>();
  private instrumentLoads=new Map<string,Promise<void>>();
  private instrumentRetries=new Map<string,number>();
  private instrumentPreviewLevels=new Map<string,{note:number;gain:number}[]>();
  private kitPreviewGeneration=0;
  private kitPreviewTimers:ReturnType<typeof setTimeout>[]=[];
  private active?:Compilation;
  private mix=defaultMix();
  private built?:BuiltSong;
  private startedAt=0;
  private ticker?:number;
  private monitor?:AnalyserNode;
  private pending?:{bar:number;compilation:Compilation;built:BuiltSong;mix:MixOptions};
  private exportRunning=false;
  private playbackGeneration=0;
  private playbackTail:Promise<void>=Promise.resolve();

  private checkPlayback(request:number):void {
    if(request!==this.playbackGeneration||this.exportRunning)throw new DOMException('Playback canceled.','AbortError');
  }

  private async withPlayback<T>(request:number,action:()=>Promise<T>):Promise<T>{
    const previous=this.playbackTail;
    let release!:()=>void;
    this.playbackTail=new Promise<void>(resolve=>{release=resolve;});
    await previous;
    try{this.checkPlayback(request);return await action();}finally{release();}
  }
  private captureLoaded=false;
  private cache?:{key:string;pcm:PCM};
  private soundFingerprint='';
  private soundBlobs:Blob[]=[];
  private deferredMix?:MixOptions;
  private live:LiveState={bar:1,seconds:0,playing:false,levels:[0,0]};
  onState?:(state:LiveState)=>void;
  onError?:(error:Error)=>void;
  private renderError?:Error;
  private rejectCapture?:(error:Error)=>void;
  isReservedSoundName(name:string){return this.reservedSounds.has(soundName(name));}
  get analyser(){return this.monitor;}
  get context():AudioContext|undefined{return this.runtime?S.getAudioContext():undefined;}
  get state():LiveState{return {...this.live};}

  async initialize():Promise<void>{
    if(!this.ready)this.ready=(async()=>{
      this.runtime=await S.initStrudel({sync:false,onEvalError:(error:Error)=>this.reportPlaybackError(error),defaultOutput:async(hap:any,deadline:number,duration:number,cps:number,time:number)=>{
        const generation=this.playbackGeneration;
        if(this.renderError)return;
        try{
          this.validateSound(hap.value);
          // The renderer mutates banked sound names; keep the queried event intact.
          await S.superdough({...hap.value},time,duration,cps,hap.whole?.begin.valueOf());
        }catch(error){if(generation===this.playbackGeneration)this.reportPlaybackError(error);}
      }});
      await S.initAudio();
      this.registerOriginalDrums();
      for(const instrument of BUILTIN_INSTRUMENTS)await S.samples({[instrument.id]:instrument.samples});
      this.reservedSounds=new Set(Object.keys(S.soundMap.get()).map(soundName));
      this.connectMonitor();
      this.ticker=window.setInterval(()=>this.tick(),40);
    })();
    return this.ready;
  }

  private validateSound(event:Record<string,any>):void {
    if(!event.s||event._studioClock||['-','~','_'].includes(event.s))return;
    const key=event.bank?`${event.bank}_${event.s}`:event.s;
    if(S.soundMap.get()[key])return;
    if(event.bank)throw new Error(`Line ${event._studioBankLine??event._studioLine}: Bank “${event.bank}” has no loaded sound “${event._studioSound??event.s}”. Remove the bank command, or use bank: studio with play: kick snare hat.`);
    throw new Error(`Line ${event._studioLine}: Sound “${event._studioSound??event.s}” is not loaded. Choose a built-in sound or upload it in the Sound Library.`);
  }

  private reportPlaybackError(cause:unknown):void {
    if(this.renderError)return;
    const error=cause instanceof Error?cause:new Error(String(cause));
    this.renderError=error;
    this.rejectCapture?.(error);
    this.stopPlayback();
    this.onError?.(error);
  }

  setSounds(presets:SoundPreset[],samples:SampleAsset[]):void {
    const fingerprint=JSON.stringify({presets,samples:samples.map(sample=>({id:sample.id,name:sample.name,root:sample.rootNote}))});
    const unchanged=fingerprint===this.soundFingerprint&&samples.length===this.soundBlobs.length&&samples.every((sample,index)=>sample.blob===this.soundBlobs[index]);
    this.soundFingerprint=fingerprint;this.soundBlobs=samples.map(sample=>sample.blob);
    this.presets=presets;this.assets=samples;this.presetMap.clear();
    for(const preset of [...DEFAULT_PRESETS,...presets]){this.presetMap.set(soundName(preset.id),preset);this.presetMap.set(soundName(preset.name),preset);}
    if(!unchanged)this.cache=undefined;
  }

  private connectMonitor(){
    this.monitor?.disconnect();
    this.monitor=this.context!.createAnalyser();this.monitor.fftSize=2048;this.monitor.smoothingTimeConstant=.7;
    S.getSuperdoughAudioController().output.destinationGain.connect(this.monitor);
    this.updateMaster();
  }

  private updateMaster(){
    if(this.context)S.getSuperdoughAudioController().output.destinationGain.gain.setTargetAtTime(clamp(this.mix.master),this.context.currentTime,.015);
  }

  private presetSettings(preset:SoundPreset):Record<string,any>{
    let controls=S.pure({s:preset.kind==='kick'?'studio_kick':preset.kind==='snare'?'studio_snare':preset.waveform,gain:preset.volume,cutoff:100+Math.pow(clamp(preset.brightness),2)*17900,attack:preset.attack,decay:preset.length,release:preset.length,room:preset.space,sustain:preset.kind==='pad'?.7:.45});
    for(const [key,value]of Object.entries(preset.advanced??{})){
      if(key==='transpose')continue;
      // Controls such as fm are composite: use the runtime's mapping to fmi/fmh.
      if(typeof controls[key]==='function')controls=controls[key](value);
      else controls=controls.fmap((event:Record<string,any>)=>({...event,[key]:value}));
    }
    return controls.queryArc(0,1)[0]?.value??{};
  }

  private async loadInstrument(id:string):Promise<void>{
    const instrument=BUILTIN_INSTRUMENTS.find(item=>item.id===id);
    if(!instrument)throw new Error('This instrument is not available.');
    let pending=this.instrumentLoads.get(id);
    if(!pending){
      const retry=this.instrumentRetries.get(id)??0;
      const mapping=Object.fromEntries(Object.entries(instrument.samples).map(([note,url])=>[note,retry?`${url}?retry=${retry}`:url]));
      // Strudel caches rejected loads too. A fresh URL lets a recovered connection retry.
      pending=(async()=>{await S.samples({[id]:mapping});const levels=await Promise.all(Object.entries(mapping).map(async([note,url])=>{
        const buffer:AudioBuffer=await S.loadBuffer(url,this.context,instrument.name);
        let peak=0,sum=0,count=0;
        // Measure the start heard in a piano audition, rather than a long silent tail.
        const frames=Math.min(buffer.length,Math.ceil(buffer.sampleRate));
        for(let channel=0;channel<buffer.numberOfChannels;channel++){const data=buffer.getChannelData(channel);for(let i=0;i<frames;i++){const sample=data[i];peak=Math.max(peak,Math.abs(sample));sum+=sample*sample;count++;}}
        const rms=Math.sqrt(sum/Math.max(1,count));
        return {note:S.noteToMidi(note),gain:peak>.00001?Math.min(128,.45/peak,.1/Math.max(rms,.00001)):0};
      }));this.instrumentPreviewLevels.set(id,levels);})().catch(()=>{this.instrumentLoads.delete(id);this.instrumentRetries.set(id,retry+1);throw new Error(`Could not load ${instrument.name}. Check your connection and try again.`);});
      this.instrumentLoads.set(id,pending);
    }
    await pending;
  }

  private async prepareSounds(source=''){
    const names=new Set(source.toLowerCase().match(/[a-z0-9_]+/g)??[]);
    await Promise.all(BUILTIN_INSTRUMENTS.filter(item=>names.has(item.id)).map(item=>this.loadInstrument(item.id)));
    if(!this.presetMap.size)this.setSounds(this.presets,this.assets);
    const assetNames=new Set<string>();
    for(const asset of this.assets){
      const name=soundName(asset.name);
      if(this.presetMap.has(name)||this.reservedSounds.has(name)||assetNames.has(name))throw new Error(`Sample name “${asset.name}” is already used. Rename this sample in the Sound Library.`);
      assetNames.add(name);
      const previous=this.loaded.get(asset.id);if(previous?.blob===asset.blob&&previous.root===asset.rootNote)continue;
      if(previous)URL.revokeObjectURL(previous.url);
      const url=URL.createObjectURL(asset.blob);
      try{
        const mapping=asset.rootNote?{[asset.rootNote]:[url]}:[url];
        await S.samples({[soundName(asset.name)]:mapping,[soundName(asset.id)]:mapping});
        await S.loadBuffer(url,this.context,asset.name);
        this.loaded.set(asset.id,{blob:asset.blob,url,root:asset.rootNote});
      }catch(error){URL.revokeObjectURL(url);throw new Error(`Could not read sample ${asset.name}: ${error instanceof Error?error.message:String(error)}`);}
    }
  }

  private registerOriginalDrums(){
    const make=(kind:'kick'|'snare'|'hat')=>(time:number,params:Record<string,any>,ended:()=>void)=>{
      const context=this.context!, output=context.createGain(), nodes:AudioNode[]=[output], sources:AudioScheduledSourceNode[]=[];
      const length=clamp(Number(params.decay??params.release??(kind==='kick'?.35:.18)),.025,4);
      const attack=clamp(Number(params.attack??.001),.001,.5);
      const finish=time+attack+length+.015;
      const addTone=(frequency:number,gain:number)=>{
        const osc=context.createOscillator(),env=context.createGain();nodes.push(osc,env);sources.push(osc);
        osc.type=kind==='kick'?'sine':'triangle';osc.frequency.setValueAtTime(frequency,time);
        if(kind==='kick')osc.frequency.exponentialRampToValueAtTime(Math.max(30,frequency/3),time+.075);
        env.gain.setValueAtTime(0,time);env.gain.linearRampToValueAtTime(gain,time+attack);env.gain.exponentialRampToValueAtTime(.0001,finish);
        osc.connect(env).connect(output);osc.start(time);osc.stop(finish);
      };
      if(kind==='kick')addTone(params.freq??(params.note?S.midiToFreq(typeof params.note==='number'?params.note:S.noteToMidi(params.note)):150),.85);
      else{
        const buffer=context.createBuffer(1,Math.ceil((finish-time)*context.sampleRate),context.sampleRate),data=buffer.getChannelData(0);
        // A fixed seed makes the starting sound reproducible without borrowed samples.
        let seed=8171;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;data[i]=(seed>>>0)/2147483648-1;}
        const noise=context.createBufferSource(),filter=context.createBiquadFilter(),env=context.createGain();noise.buffer=buffer;filter.type=kind==='hat'?'highpass':'bandpass';filter.frequency.value=kind==='hat'?7000:2200;filter.Q.value=.6;
        env.gain.setValueAtTime(0,time);env.gain.linearRampToValueAtTime(kind==='hat'?.35:.65,time+attack);env.gain.exponentialRampToValueAtTime(.0001,finish);
        noise.connect(filter).connect(env).connect(output);nodes.push(noise,filter,env);sources.push(noise);noise.start(time);noise.stop(finish);
        if(kind==='snare')addTone(185,.18);
      }
      sources[0].onended=()=>{nodes.forEach(node=>node.disconnect());ended();};
      return {node:output,nodes:{source:sources},stop:(at:number)=>sources.forEach(source=>{try{source.stop(at);}catch{/* already ended */}})};
    };
    S.registerSound('studio_kick',make('kick'),{type:'synth',prebake:true});
    S.registerSound('studio_snare',make('snare'),{type:'synth',prebake:true});
    S.registerSound('studio_hat',make('hat'),{type:'synth',prebake:true});
  }

  private build(song:Compilation,mix:MixOptions,exportEnd?:number):BuiltSong {
    if(song.errors.some(error=>error.severity!=='warning'))throw new Error(song.errors.filter(error=>error.severity!=='warning').map(error=>`Line ${error.line}: ${error.message}`).join('\n'));
    const bindings:Record<string,any>={true:true,false:false,pi:Math.PI,abs:Math.abs,min:Math.min,max:Math.max,round:Math.round,floor:Math.floor,ceil:Math.ceil,sqrt:Math.sqrt};
    const functions:Record<string,any>={...S,am:S.tremolo,perlin2:S.perlin.toBipolar(),polymeterSteps:(steps:number,...patterns:Pattern[])=>S._polymeterListSteps(steps,...patterns.map(pattern=>[pattern,pattern._steps??1]))};
    const allowed=new Set(catalogue.filter(command=>command.category!=='connections'&&command.kind!=='visual'&&command.native&&!['samples','soundAlias','hush','setcpm','setcps'].includes(command.native)).map(command=>command.native!));
    for(const name of ['mini','pure','stack','cat','slowcat','fastcat','note','sound','run','irand'])allowed.add(name);
    for(const name of allowed){const entry=functions[name];if(typeof entry==='function'||entry?._Pattern)bindings[name]=entry;}
    const definitions=new Map(song.definitions.map(def=>[def.value.replace(/^(['"])(.*)\1$/,'$2'),def]));
    const aliases=new Map<string,string>();
    const resolving=new Set<string>();
    const resolve=(name:string):any=>{
      if(Object.hasOwn(bindings,name)&&!definitions.has(name))return bindings[name];
      const def=definitions.get(name);if(!def)throw new Error(`Unknown pattern, change, or signal: ${name}.`);
      if(resolving.has(name))throw new Error(`The definition ${name} refers back to itself.`);
      resolving.add(name);
      for(const child of def.children)for(const match of child.value.matchAll(/\$([\w-]+)/g))if(definitions.has(match[1])&&!Object.hasOwn(bindings,match[1]))bindings[match[1]]=resolve(match[1]);
      const result=def.name==='change'?((pattern:Pattern)=>applyStatements(def.children,pattern)):applyStatements(def.children,S.pure({}));
      resolving.delete(name);bindings[name]=result;return result;
    };
    const value=(raw:string):any=>{
      raw=raw.trim();
      if(!raw)return undefined;
      if(/^\$[\w-]+$/.test(raw))return resolve(raw.slice(1));
      if(/^-?(?:\d+\.?\d*|\.\d+)\s*(%|seconds?|secs?|s|hz|bpm|bars?)?$/i.test(raw)){const n=parseFloat(raw);return raw.endsWith('%')?n/100:n;}
      if(/^(['"]).*\1$/.test(raw))return raw.slice(1,-1);
      if(/\$[\w-]+|^[\w]+\s*\(|^\[.*\]$|^[-\d.]+\s*[-+*/]\s*[-\d.]+$/.test(raw)){
        for(const match of raw.matchAll(/\$([\w-]+)/g))bindings[match[1]]=resolve(match[1]);
        return evaluateExpression(raw,bindings);
      }
      return raw.replace(/\brest\b/gi,'~');
    };
    const attachEvents=(left:Pattern,right:Pattern):Pattern=>{
      // Musical sequences supply their own starts. Continuous controls keep
      // sampling the existing notes, rather than removing their starts.
      const discrete=right.filterHaps((hap:any)=>!!hap.whole);
      const continuous=right.filterHaps((hap:any)=>!hap.whole);
      const combined=S.stack(left.set.mix(discrete),left.set(continuous));
      combined._steps=left.set.mix(right)._steps;
      return combined;
    };
    const applyStatements=(commands:Statement[],initial:Pattern):Pattern=>{
      let pattern=initial;
      for(const command of commands){
        const native=command.native||command.name;
        try{
          if(command.name==='use'){
            const name=command.value.replace(/^\$/,'').replace(/^(['"])(.*)\1$/,'$2'),definition=definitions.get(name);
            const chosen=resolve(name);
            pattern=definition?.name==='pattern'?applyStatements(definition.children,pattern):typeof chosen==='function'?chosen(pattern):chosen;continue;
          }
          if(command.name==='show'||(command.spec?.category==='visuals'&&native!=='color'))continue;
          if(command.spec?.category==='connections')throw new Error('MIDI and OSC connections are planned for a later release.');
          if(command.name==='play'){pattern=attachEvents(pattern,S.sound(value(command.value)));continue;}
          if(native==='samples'){
            const name=soundName(command.value.replace(/^(['"])(.*)\1$/,'$2'));
            if(!this.assets.some(asset=>soundName(asset.name)===name||soundName(asset.id)===name))throw new Error('Upload this sample in the Sound Library first.');
            pattern=attachEvents(pattern,S.sound(name));continue;
          }
          if(command.name==='math'){
            const expression=command.value;pattern=pattern.fmap((x:any)=>evaluateExpression(expression,{...bindings,x}));continue;
          }
          if(['filterWhen','filterValues','fmap','withValue','func'].includes(native)&&!command.children.length){
            const expression=command.value;pattern=pattern[native]((x:any)=>evaluateExpression(expression,{...bindings,x,cycle:+x}));continue;
          }
          const args=splitArguments(command.value).map((raw,index)=>{
            if(native==='when'&&index===0){
              if(/\b(cycle|x)\b/.test(raw))return S.signal((time:number)=>{
                const cycle=Math.floor(+time);
                return !!evaluateExpression(raw,{...bindings,x:cycle,cycle});
              }).segment(1);
              if(raw==='true'||raw==='false')return raw==='true';
            }
            return command.spec?.kind==='transform'&&definitions.has(raw)?resolve(raw):value(raw);
          });
          if(native==='soundAlias'){
            if(args.length!==2||typeof args[0]!=='string'||typeof args[1]!=='string')throw new Error('Write the original sound, then its new name. Example: sound alias: triangle, soft-tone');
            const original=soundName(args[0]),alias=soundName(args[1]);
            if(!S.soundMap.get()[original]&&!this.presetMap.has(original))throw new Error(`Sound ${original} is not loaded.`);
            if(this.reservedSounds.has(alias)||this.presetMap.has(alias)||this.assets.some(asset=>soundName(asset.name)===alias))throw new Error('Choose an alias name that is not already used.');
            if(aliases.has(alias)&&aliases.get(alias)!==original)throw new Error('This alias already names a different sound. Choose another name.');
            aliases.set(alias,original);continue;
          }
          if(command.children.length){
            if(['stack','cat','slowcat','fastcat','sequence','seq','choose','chooseCycles','randcat','polymeter','polymeterSteps','polyrhythm','arrange'].includes(native)){
              const patterns=command.children.map(child=>applyStatements(child.name==='pattern'?child.children:[child],pattern));
              if(typeof functions[native]!=='function')throw new Error(`The runtime does not provide ${native}.`);
              pattern=functions[native](...args,...patterns);continue;
            }
            const callback=(p:Pattern)=>applyStatements(command.children,p?._Pattern?p:S.pure(p));
            if(command.name==='layer'||native==='superimpose')pattern=pattern.superimpose(callback);
            else if(typeof pattern[native]==='function')pattern=pattern[native](...args,callback);
            else throw new Error(`The runtime does not provide ${native} as a track change.`);
            continue;
          }
          if(command.spec?.kind==='signal'){
            const signal=functions[native];pattern=typeof signal==='function'?signal(...args):signal;
            if(!pattern?._Pattern)throw new Error(`${command.name} must create a musical pattern.`);continue;
          }
          if(['setcpm','setcps'].includes(native))throw new Error('Set the song pace with tempo: at the left edge.');
          if(['sound','s','note','n','freq','chord'].includes(native)&&args[0]!==undefined)pattern=attachEvents(pattern,functions[native](...args));
          else if(typeof pattern[native]==='function')pattern=pattern[native](...args);
          else if(native==='am')pattern=pattern.tremolo(...args);
          else if(typeof functions[native]==='function')pattern=functions[native](...args);
          else if(functions[native]?._Pattern)pattern=functions[native];
          else throw new Error(`The runtime does not provide ${command.name}.`);
          if(native==='bank')pattern=pattern.fmap((event:any)=>({...event,_studioBankLine:command.line}));
        }catch(error){throw new Error(`Line ${command.line}, ${command.name}: ${error instanceof Error?error.message:String(error)}`);}
      }
      return pattern;
    };
    for(const name of definitions.keys())resolve(name);
    const tracks=new Map<string,Pattern>();
    const defaultsByPreset=new Map<SoundPreset,Record<string,any>>();
    for(const preset of this.presetMap.values())if(!defaultsByPreset.has(preset))defaultsByPreset.set(preset,this.presetSettings(preset));
    for(const [index,track]of song.tracks.entries()){
      const noteLine=track.commands.find(command=>['note','n','chord'].includes(command.native||'')||command.name==='play')?.line??track.commands.find(command=>command.native==='sound')?.line??track.line;
      let pattern=applyStatements(track.commands,S.pure({}));
      pattern=pattern.fmap((rawEvent:any)=>{
        const event:Record<string,any>=rawEvent&&Object.getPrototypeOf(rawEvent)===Object.prototype?rawEvent:{note:typeof rawEvent==='string'?rawEvent:+rawEvent};
        const written=soundName(String(event.s??'triangle')),original=aliases.get(written)??written;
        const preset=this.presetMap.get(original);
        const defaults:Record<string,any>=preset?{...defaultsByPreset.get(preset)}:{};
        if(preset&&['kick','snare'].includes(preset.kind))defaults.note=preset.kind==='kick'?50:62;
        const built={...defaults,...event};
        if(preset?.advanced?.transpose){const note=built.note??(preset.kind==='bass'?36:60);built.note=(typeof note==='number'?note:S.noteToMidi(note))+Number(preset.advanced.transpose);}
        built.s=event.bank?original:preset?defaults.s:({bd:'studio_kick',sd:'studio_snare',hh:'studio_hat',hat:'studio_hat',kick:'studio_kick',snare:'studio_snare',saw:'sawtooth',tri:'triangle'} as Record<string,string>)[original]||original;
        // Source tags are carried through transformations and queried by visuals.
        built._studioTrack=track.id;built._studioLine=noteLine;built._studioSound=written;
        built.orbit=event.orbit??index;
        return built;
      });
      if(mix.muted.has(track.id)||(mix.solo.size&&!mix.solo.has(track.id)))pattern=S.silence;
      tracks.set(track.name,pattern);
    }
    const timePattern=(tempo:number)=>S.pure({cps:tempo/(song.beatsPerBar*60),_studioClock:true}).onTrigger(()=>{},true);
    let visual:Pattern,pattern:Pattern;
    const end=exportEnd??song.totalBars;
    if(song.sections.length){
      const pieces=song.sections.map(section=>{
        const start=section.startBar-1,finish=start+section.bars;
        const selected=S.stack(...section.tracks.map(name=>tracks.get(name)||S.silence)).late(start).filterWhen((cycle:any)=>+cycle>=start&&+cycle<finish);
        const clock=timePattern(section.tempo).filterWhen((cycle:any)=>+cycle>=start&&+cycle<finish);
        return {selected,clock};
      });
      visual=S.stack(...pieces.map(piece=>piece.selected));pattern=S.stack(visual,...pieces.map(piece=>piece.clock));
    }else{visual=S.stack(...tracks.values());pattern=S.stack(visual,timePattern(song.tempo));}
    if(end!==null&&end!==undefined){pattern=pattern.filterWhen((cycle:any)=>+cycle<end);visual=visual.filterWhen((cycle:any)=>+cycle<end);}
    if(exportEnd===undefined&&mix.loopStart&&mix.loopEnd){
      const start=mix.loopStart-1,length=mix.loopEnd-mix.loopStart+1;
      // ribbon repeats precisely the selected arc and resets its local phase.
      pattern=pattern.ribbon(start,length);visual=visual.ribbon(start,length);
    }
    // Check finite songs in short slices; rendering still checks every later event.
    const previewEnd=Math.min(end??4,256);
    for(let start=0;start<previewEnd;start++)for(const hap of visual.queryArc(start,Math.min(start+1,previewEnd)))this.validateSound(hap.value);
    return {pattern,visual};
  }

  async play(compilation:Compilation,mix:MixOptions):Promise<void>{
    if(this.exportRunning)throw new Error('Wait for export to finish or cancel it.');
    const request=++this.playbackGeneration;
    await this.initialize();this.checkPlayback(request);
    await this.context!.resume();this.checkPlayback(request);
    await this.prepareSounds(compilation.source);this.checkPlayback(request);
    const built=this.build(compilation,mix);
    await this.withPlayback(request,async()=>{
      this.stopPlayback(false);this.active=compilation;this.mix=mix;this.built=built;this.updateMaster();
      this.renderError=undefined;
      this.runtime.setCps(compilation.tempo/(compilation.beatsPerBar*60));
      try{
        await this.runtime.setPattern(built.pattern,false);this.checkPlayback(request);
        await this.runtime.start();this.checkPlayback(request);
        this.startedAt=this.runtime.scheduler.seconds_at_cps_change+this.runtime.scheduler.latency;
        if(!Number.isFinite(this.startedAt))this.startedAt=this.context!.currentTime+.1;
        this.live={bar:1,seconds:0,playing:true,levels:[0,0]};this.emit();
      }catch(error){this.stopPlayback(false);throw error;}
    });
  }

  async apply(compilation:Compilation,mix:MixOptions):Promise<number>{
    if(this.exportRunning)throw new Error('Wait for export to finish or cancel it.');
    const request=++this.playbackGeneration;
    await this.initialize();this.checkPlayback(request);
    await this.prepareSounds(compilation.source);this.checkPlayback(request);
    if(!this.live.playing){await this.play(compilation,mix);return 1;}
    const built=this.build(compilation,mix);
    return this.withPlayback(request,async()=>{
      const scheduler=this.runtime.scheduler;
      const boundary=Math.floor(Math.max(+scheduler.lastEnd,+scheduler.now()))+1;
      const old=this.built!;
      const merged={pattern:S.stack(old.pattern.filterWhen((cycle:any)=>+cycle<boundary),built.pattern.filterWhen((cycle:any)=>+cycle>=boundary)),visual:S.stack(old.visual.filterWhen((cycle:any)=>+cycle<boundary),built.visual.filterWhen((cycle:any)=>+cycle>=boundary))};
      try{
        await this.runtime.setPattern(merged.pattern,false);this.checkPlayback(request);
        this.built=merged;this.pending={bar:boundary+1,compilation,built,mix};this.live.pendingBar=boundary+1;this.emit();return boundary+1;
      }catch(error){this.stopPlayback(false);throw error;}
    });
  }

  stop():void {
    if(this.exportRunning)return;
    this.stopPlayback();
  }

  private stopPlayback(invalidate=true):void {
    this.cancelKitPreview();
    if(invalidate)++this.playbackGeneration;
    this.runtime?.stop();this.pending=undefined;
    if(this.runtime){S.resetGlobalEffects();this.connectMonitor();}
    this.live={bar:1,seconds:0,playing:false,levels:[0,0]};this.emit();
  }

  setMix(mix:MixOptions):void {
    if(this.exportRunning){this.deferredMix=structuredClone(mix);return;}
    this.mix=mix;this.updateMaster();
    if(this.active&&this.live.playing&&!this.exportRunning){
      const current=this.build(this.active,mix);
      if(this.pending){
        const boundary=this.pending.bar-1,next=this.build(this.pending.compilation,mix);this.pending.built=next;this.pending.mix=mix;
        this.built={pattern:S.stack(current.pattern.filterWhen((cycle:any)=>+cycle<boundary),next.pattern.filterWhen((cycle:any)=>+cycle>=boundary)),visual:S.stack(current.visual.filterWhen((cycle:any)=>+cycle<boundary),next.visual.filterWhen((cycle:any)=>+cycle>=boundary))};
      }else this.built=current;
      this.runtime.setPattern(this.built.pattern,false);
    }
  }

  async previewPreset(preset:SoundPreset,pianoVolume?:number):Promise<void>{
    await this.initialize();await this.context!.resume();
    const note=preset.kind==='bass'?'C2':preset.kind==='pad'?'C4':'C4';
    const values:Record<string,any>={...this.presetSettings(preset),note:preset.advanced?.note??note,orbit:32};
    if(pianoVolume!==undefined)values.gain=Math.min(.9,Number(values.gain??.3)*3)*clamp(pianoVolume);
    if(preset.advanced?.transpose)values.note=S.noteToMidi(values.note)+Number(preset.advanced.transpose);
    await S.superdough(values,this.context!.currentTime+.025,preset.kind==='pad'?1:.3,.5,0);
  }

  async previewInstrument(id:string,note?:string,pianoVolume?:number):Promise<void>{
    if(this.exportRunning)throw new Error('Wait for export to finish or cancel it.');
    await this.initialize();await this.context!.resume();await this.loadInstrument(id);
    if(this.exportRunning)throw new Error('Wait for export to finish or cancel it.');
    const pitch=note??BUILTIN_INSTRUMENTS.find(item=>item.id===id)?.previewNote??'C4';
    const midi=S.noteToMidi(pitch),levels=this.instrumentPreviewLevels.get(id)??[];
    const nearest=levels.reduce<{note:number;gain:number}|undefined>((best,item)=>!best||Math.abs(item.note-midi)<Math.abs(best.note-midi)?item:best,undefined);
    const gain=pianoVolume===undefined?.6:(nearest?.gain??.6)*clamp(pianoVolume);
    await S.superdough({s:id,note:pitch,gain,attack:.005,release:.15,orbit:32},this.context!.currentTime+.025,.8,.5,0);
  }

  private cancelKitPreview(){
    ++this.kitPreviewGeneration;
    this.kitPreviewTimers.forEach(timer=>clearTimeout(timer));this.kitPreviewTimers=[];
  }

  async previewKit(id:string):Promise<void>{
    if(this.exportRunning)throw new Error('Wait for export to finish or cancel it.');
    const kit=BUILTIN_KITS.find(item=>item.id===id);
    if(!kit)throw new Error('This drum kit is not available.');
    this.cancelKitPreview();const generation=this.kitPreviewGeneration;
    await this.initialize();await this.context!.resume();
    await Promise.all(kit.tracks.map(track=>this.loadInstrument(track.sound)));
    if(generation!==this.kitPreviewGeneration||this.exportRunning)return;
    for(const track of kit.tracks){
      const pattern=S.note(track.notes.replace(/\brest\b/g,'~')).s(track.sound).gain(track.volume??.35);
      for(const hap of pattern.queryArc(0,1).filter((event:any)=>event.hasOnset())){
        const timer=setTimeout(()=>{
          if(generation!==this.kitPreviewGeneration||this.exportRunning)return;
          void S.superdough({...hap.value,attack:.001,release:.15,orbit:32},this.context!.currentTime+.015,Math.max(.08,(+hap.whole.end-+hap.whole.begin)*2),.5,0).catch((error:Error)=>this.onError?.(error));
        },Math.max(0,+hap.whole.begin*2000));this.kitPreviewTimers.push(timer);
      }
    }
  }

  getEvents(startCycle:number,endCycle:number):VisualEvent[]{
    if(!this.built||endCycle<=startCycle)return [];
    try{return this.built.visual.queryArc(startCycle,endCycle).filter((hap:any)=>hap.whole&&hap.value.s).map((hap:any)=>{
      const note=hap.value.note;let midi:number|null=null;
      if(note!==undefined){midi=typeof note==='number'?note:S.noteToMidi(note);if(!Number.isFinite(midi))midi=null;}
      return {start:+hap.whole.begin,end:+hap.whole.end,note:midi,sound:String(hap.value._studioSound??hap.value.s),track:String(hap.value._studioTrack),line:Number(hap.value._studioLine),color:typeof hap.value.color==='string'?hap.value.color:undefined};
    });}catch{return [];}
  }

  private tick(){
    if(!this.runtime)return;
    const cycle=Math.max(0,+this.runtime.scheduler.now());
    if(this.live.playing){
      this.live.bar=cycle+1;this.live.seconds=Math.max(0,this.context!.currentTime-this.startedAt);
      if(this.pending&&cycle>=this.pending.bar-1){const pending=this.pending;this.active=pending.compilation;this.mix=pending.mix;this.built={pattern:pending.built.pattern,visual:this.built!.visual};this.runtime.setPattern(pending.built.pattern,false);this.pending=undefined;this.live.pendingBar=undefined;this.updateMaster();}
      if(!this.exportRunning&&this.active?.totalBars!==null&&this.active?.totalBars!==undefined&&!this.mix.loopStart&&cycle>=this.active.totalBars){this.runtime.pause();this.live.playing=false;this.live.bar=this.active.totalBars+1;this.live.seconds=this.active.totalSeconds??this.live.seconds;}
    }
    if(this.monitor){const data=new Float32Array(this.monitor.fftSize);this.monitor.getFloatTimeDomainData(data);let peak=0;for(const v of data)peak=Math.max(peak,Math.abs(v));this.live.levels=[peak,peak];}
    this.emit();
  }
  private emit(){this.onState?.({...this.live});}

  async exportAudio(options:ExportOptions):Promise<{blob:Blob;duration:number}>{
    const {startBar,endBar,tailSeconds,signal}=options;
    const compilation=structuredClone(options.compilation),mix=structuredClone(options.mix);
    if(this.exportRunning)throw new Error('An export is already running.');
    if(startBar<1||endBar<=startBar-1||!Number.isInteger(startBar)||!Number.isFinite(endBar))throw new Error('Choose a valid bar range or a positive duration.');
    if(compilation.totalBars!==null&&endBar>compilation.totalBars)throw new Error('The export ends beyond the song.');
    const checkAbort=()=>{if(signal.aborted)throw new DOMException('Export canceled.','AbortError');if(this.exportRunning&&this.renderError)throw this.renderError;};
    checkAbort();
    await this.initialize();checkAbort();
    await this.context!.resume();checkAbort();
    await this.prepareSounds(compilation.source);checkAbort();
    const key=JSON.stringify({source:compilation.source,presets:this.presets,samples:this.assets.map(a=>[a.id,a.name,a.blob.size,a.rootNote]),master:mix.master,muted:[...mix.muted].sort(),solo:[...mix.solo].sort(),startBar,endBar,tailSeconds});
    const duration=secondsAtBar(compilation,endBar)-secondsAtBar(compilation,startBar-1)+Math.max(0,tailSeconds);
    const previous={active:this.active,mix:structuredClone(this.mix),playing:this.live.playing};
    this.renderError=undefined;this.exportRunning=true;++this.playbackGeneration;
    try{
      await this.playbackTail;checkAbort();
      let pcm=this.cache?.key===key?this.cache.pcm:undefined;
      if(!pcm){
        this.stopPlayback();this.mix=mix;this.updateMaster();this.active=compilation;
        const built=this.build(compilation,{...mix,loopStart:undefined,loopEnd:undefined},endBar);this.built=built;
        const context=this.context!;
        if(!this.captureLoaded){await context.audioWorklet.addModule(captureUrl);this.captureLoaded=true;}
        checkAbort();
        const capture=new AudioWorkletNode(context,'studio-capture',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[2],channelCount:2,channelCountMode:'explicit'});
        const chunks:[Float32Array[],Float32Array[]]=[[],[]];
        S.getSuperdoughAudioController().output.destinationGain.connect(capture);capture.connect(context.destination);
        const until=secondsAtBar(compilation,endBar)+Math.max(0,tailSeconds);
        let progressTimer:number|undefined;
        try{
          const completed=new Promise<void>((resolve,reject)=>{
            this.rejectCapture=reject;
            capture.port.onmessage=({data})=>{if(data.type==='pcm'){chunks[0].push(data.left);chunks[1].push(data.right);}if(data.type==='done')resolve();};
            signal.addEventListener('abort',()=>{capture.port.postMessage({type:'cancel'});reject(new DOMException('Export canceled.','AbortError'));},{once:true});
          });
          // Observe cancellation immediately, including while start is still pending.
          void completed.catch(()=>{});
          checkAbort();
          this.runtime.setCps(compilation.tempo/(compilation.beatsPerBar*60));
          await this.runtime.setPattern(built.pattern,false);checkAbort();
          await this.runtime.start();checkAbort();
          const start=this.runtime.scheduler.seconds_at_cps_change+this.runtime.scheduler.latency;
          this.startedAt=start;
          capture.port.postMessage({type:'start',startFrame:Math.round((start+secondsAtBar(compilation,startBar-1))*context.sampleRate),endFrame:Math.round((start+until)*context.sampleRate)});
          this.live.playing=true;this.emit();
          progressTimer=window.setInterval(()=>options.onProgress(clamp((context.currentTime-start)/until)*.9,startBar>1?'Playing the song, including the lead-in…':'Recording your song…'),100);
          await completed;
          checkAbort();
          const expected=Math.round(duration*context.sampleRate),left=new Float32Array(expected),right=new Float32Array(expected);
          for(let c=0;c<2;c++){let offset=0;for(const chunk of chunks[c]){const count=Math.min(chunk.length,expected-offset);if(count>0)(c?right:left).set(chunk.subarray(0,count),offset);offset+=count;}}
          pcm={left,right,sampleRate:context.sampleRate};this.cache={key,pcm};
        }finally{
          this.rejectCapture=undefined;
          if(progressTimer)clearInterval(progressTimer);capture.port.onmessage=null;capture.port.postMessage({type:'cancel'});
          try{S.getSuperdoughAudioController().output.destinationGain.disconnect(capture);}catch{/* graph already reset */}
          capture.disconnect();this.stopPlayback();
        }
      }else options.onProgress(.9,'Using the same captured performance…');
      if(signal.aborted)throw new DOMException('Export canceled.','AbortError');
      options.onProgress(.92,options.format==='wav'?'Creating WAV…':'Creating MP3…');
      const blob=options.format==='wav'?new Blob([encodeWav(pcm.left,pcm.right,pcm.sampleRate)],{type:'audio/wav'}):await this.encodeMp3(pcm,options);
      options.onProgress(1,'Export ready');return {blob,duration};
    }finally{
      this.exportRunning=false;const resumeMix=this.deferredMix??previous.mix;this.deferredMix=undefined;this.mix=resumeMix;this.updateMaster();
      if(previous.active){this.active=previous.active;this.built=this.build(previous.active,resumeMix);}
      if(previous.playing&&previous.active&&!signal.aborted&&!this.renderError)await this.play(previous.active,resumeMix);
    }
  }

  private encodeMp3(pcm:PCM,options:ExportOptions):Promise<Blob>{
    return new Promise((resolve,reject)=>{
      const worker=new Worker(new URL('./encoder.worker.ts',import.meta.url),{type:'module'});
      const cleanup=()=>{worker.terminate();options.signal.removeEventListener('abort',abort);};
      const abort=()=>{cleanup();reject(new DOMException('Export canceled.','AbortError'));};
      options.signal.addEventListener('abort',abort,{once:true});
      worker.onmessage=({data})=>{if(data.type==='progress')options.onProgress(.92+data.fraction*.08,'Creating MP3…');else if(data.type==='done'){cleanup();resolve(data.blob);}else if(data.type==='error'){cleanup();reject(new Error(data.message));}};
      worker.onerror=(event)=>{cleanup();reject(new Error(event.message));};
      // Copy rather than transfer so both formats can reuse exactly this performance.
      worker.postMessage(pcm);
    });
  }
}
