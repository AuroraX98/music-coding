import {resolveCommand} from './catalog';
import type {SoundPreset} from './types';

export type DesignerMode='notes'|'chords'|'bass'|'drums';
export interface DesignerRecipe {id:string;title:string;description:string;preset:SoundPreset;}
export interface DesignerControl {key:string;label:string;group:string;min:number;max:number;step:number;help:string;}
const clamp=(value:number,min=0,max=1)=>Math.max(min,Math.min(max,value));
const cutoff=(preset:SoundPreset)=>100+Math.pow(clamp(preset.brightness),2)*17900;
const preset=(id:string,kind:SoundPreset['kind'],waveform:string,volume:number,brightness:number,attack:number,length:number,space:number,advanced?:SoundPreset['advanced']):SoundPreset=>({id,name:id,kind,waveform,volume,brightness,attack,length,space,...(advanced?{advanced}:{})});

// Keep the original five values unchanged so existing saved sounds retain their starting points.
export const DESIGNER_RECIPES:DesignerRecipe[]=[
  {id:'kick',title:'Kick',description:'A deep synthesized drum with a quick pitch drop.',preset:preset('kick','kick','sine',.7,.35,.001,.35,0)},
  {id:'snare',title:'Snare',description:'A short burst of noise with a low drum tone underneath.',preset:preset('snare','snare','noise',.55,.7,.001,.18,.08)},
  {id:'bass',title:'Bass',description:'A sawtooth tone softened by a lowpass filter. Try it in the low register.',preset:preset('bass','bass','sawtooth',.35,.25,.005,.2,0)},
  {id:'lead',title:'Lead',description:'A clear square-wave tone for a melody.',preset:preset('lead','lead','square',.3,.65,.01,.15,.12)},
  {id:'pad',title:'Pad',description:'A triangle tone that rises gently and fades slowly.',preset:preset('pad','pad','triangle',.3,.45,.4,.8,.25)},
  {id:'bell',title:'Bell',description:'A bright synthesized bell with a ringing, fading tone.',preset:preset('bell','lead','sine',.24,.82,.002,1.3,.18,{fm:3,fmh:2.76,decay:1.1,sustain:0,release:1.3})},
  {id:'pluck',title:'Pluck',description:'A quick bright start that fades like a plucked string.',preset:preset('pluck','lead','triangle',.28,.65,.002,.25,.1,{decay:.18,sustain:.05,release:.12,lpenv:2,lpdecay:.15})},
  {id:'organ',title:'Organ',description:'A steady tone with several harmonics, inspired by an electric organ.',preset:preset('organ','lead','sine',.22,.7,.008,.08,.15,{fm:.35,fmh:2,decay:.05,sustain:.9,release:.08})},
  {id:'keys',title:'Soft keys',description:'A rounded synthesized keyboard sound with a gentle fading body.',preset:preset('keys','lead','triangle',.25,.48,.008,.45,.18,{fm:.7,fmh:2,decay:.4,sustain:.22,release:.25})},
  {id:'strings',title:'Strings',description:'A slow sawtooth swell inspired by held string notes; this is synthesis, not a recording.',preset:preset('strings','pad','sawtooth',.18,.4,.35,.7,.28,{decay:.3,sustain:.75,release:.8,vib:4.5,vibmod:.08})},
  {id:'brass',title:'Brass',description:'A firm sawtooth tone with a filter that opens at the start, inspired by brass.',preset:preset('brass','lead','sawtooth',.2,.38,.06,.25,.1,{decay:.2,sustain:.65,release:.2,lpenv:2,lpattack:.06,lpdecay:.18,lpsustain:.4})},
  {id:'hat',title:'Hi-hat',description:'A short, bright synthesized noise tick for a steady rhythm.',preset:preset('hat','lead','studio_hat',.3,.95,.001,.055,0,{decay:.055,sustain:0,release:.03})},
  {id:'clap',title:'Clap-like noise',description:'A sharp filtered noise burst inspired by a clap, without a recorded handclap sample.',preset:preset('clap','lead','white',.23,.8,.001,.12,.1,{bpf:1800,bpq:1,decay:.1,sustain:0,release:.05})},
  {id:'tom',title:'Tom',description:'A low sine tone with a falling pitch, inspired by a tom drum.',preset:preset('tom','lead','sine',.35,.5,.002,.28,.06,{penv:12,pdecay:.08,decay:.28,sustain:0,release:.1,transpose:-12})},
];

export const DESIGNER_CONTROLS:DesignerControl[]=[
  {key:'volume',label:'Volume',group:'Level',min:0,max:1,step:.01,help:'How loud each note is before the song’s Master volume.'},
  {key:'advanced.pan',label:'Stereo position',group:'Level',min:0,max:1,step:.01,help:'Zero places sound on the left, 0.5 in the center, and 1 on the right. Stereo speakers or headphones make this easier to hear.'},
  {key:'advanced.transpose',label:'Tuning (semitones)',group:'Pitch and tone',min:-24,max:24,step:1,help:'Move the played notes up or down. Twelve semitones make one octave.'},
  {key:'advanced.fm',label:'FM amount',group:'Pitch and tone',min:0,max:10,step:.05,help:'Rapidly change an oscillator’s pitch to add brighter or metallic tones. This applies to supported pitched synthesizers.'},
  {key:'advanced.fmh',label:'FM frequency ratio',group:'Pitch and tone',min:.1,max:8,step:.05,help:'Choose the modifying oscillator’s frequency relative to the note. Set FM amount above zero to hear it.'},
  {key:'advanced.noise',label:'Added noise',group:'Pitch and tone',min:0,max:1,step:.01,help:'Mix noise into a supported oscillator tone. Synthesized drum recipes already make their own noise.'},
  {key:'advanced.distort',label:'Distortion',group:'Pitch and tone',min:0,max:2,step:.02,help:'Change the waveform to add a rougher tone. The perceived loudness can change too.'},
  {key:'advanced.vib',label:'Vibrato speed (Hz)',group:'Pitch movement',min:0,max:12,step:.1,help:'How many times each second the pitch moves up and down. Zero turns vibrato off.'},
  {key:'advanced.vibmod',label:'Vibrato depth (semitones)',group:'Pitch movement',min:0,max:2,step:.01,help:'How far vibrato moves the pitch. Set Vibrato speed above zero to hear it.'},
  {key:'attack',label:'Attack (seconds)',group:'Note shape',min:0,max:2,step:.005,help:'How long the sound takes to rise at the start of a note.'},
  {key:'advanced.decay',label:'Decay (seconds)',group:'Note shape',min:0,max:4,step:.01,help:'How long the level takes to fall from its first peak toward sustain.'},
  {key:'advanced.sustain',label:'Sustain level',group:'Note shape',min:0,max:1,step:.01,help:'The level kept while a note is held. This is a level, not a time.'},
  {key:'advanced.release',label:'Release (seconds)',group:'Note shape',min:0,max:4,step:.01,help:'How long the sound fades after its held part ends. Some drums end sooner.'},
  {key:'advanced.cutoff',label:'Lowpass cutoff (Hz)',group:'Tone and filter',min:20,max:20000,step:10,help:'Lower values remove more high frequencies and make the sound darker.'},
  {key:'advanced.lpq',label:'Filter resonance',group:'Tone and filter',min:0,max:12,step:.1,help:'Emphasizes frequencies near the lowpass cutoff. Start with a small amount.'},
  {key:'advanced.lpenv',label:'Filter movement amount',group:'Filter movement',min:-4,max:4,step:.1,help:'How much the lowpass cutoff changes during each note. Zero turns this movement off.'},
  {key:'advanced.lpattack',label:'Filter rise (seconds)',group:'Filter movement',min:0,max:2,step:.01,help:'How long the filter movement takes to reach its peak.'},
  {key:'advanced.lpdecay',label:'Filter fall (seconds)',group:'Filter movement',min:0,max:4,step:.01,help:'How long the filter movement takes to fall toward its held level.'},
  {key:'advanced.lpsustain',label:'Filter held level',group:'Filter movement',min:0,max:1,step:.01,help:'How much filter movement remains while a note is held.'},
  {key:'advanced.lprelease',label:'Filter release (seconds)',group:'Filter movement',min:0,max:4,step:.01,help:'How long the filter movement fades after the held part of a note ends.'},
  {key:'advanced.delay',label:'Echo amount',group:'Echo',min:0,max:.8,step:.01,help:'How much delayed sound is mixed with the original.'},
  {key:'advanced.delaytime',label:'Echo spacing (seconds)',group:'Echo',min:.02,max:1.5,step:.01,help:'The time between echoes. Set Echo amount above zero to hear them.'},
  {key:'advanced.delayfeedback',label:'Echo repeats',group:'Echo',min:0,max:.85,step:.01,help:'How much of each echo feeds the next one. Larger amounts repeat for longer.'},
  {key:'space',label:'Reverb amount',group:'Room',min:0,max:.8,step:.01,help:'Mix in a room-like tail behind the sound.'},
  {key:'advanced.roomsize',label:'Room size',group:'Room',min:.1,max:8,step:.1,help:'Changes the reverb’s space. Set Reverb amount above zero to hear it.'},
];

// Echo spacing is the engine's 3/16 of a bar at the designer preview's 100 BPM.
const advancedDefaults:Record<string,number>={transpose:0,fm:0,fmh:1,noise:0,distort:0,pan:.5,vib:0,vibmod:.5,lpq:1,lpenv:0,lpattack:.005,lpdecay:.14,lpsustain:0,lprelease:.1,delay:0,delaytime:.45,delayfeedback:.5,roomsize:2};
export function getDesignerValue(preset:SoundPreset,key:string):number {
  const advanced=preset.advanced??{};
  if(key==='volume')return Number(advanced.gain??advanced.volume??preset.volume);
  if(key==='attack')return Number(advanced.attack??preset.attack);
  if(key==='space')return Number(advanced.room??advanced.reverb??preset.space);
  if(key==='brightness')return preset.brightness;
  if(key==='length')return preset.length;
  const field=key.replace(/^advanced\./,'');
  if(field==='cutoff')return Number(advanced.cutoff??advanced.lpf??cutoff(preset));
  if(advanced[field]!==undefined)return Number(advanced[field]);
  if(field==='decay'||field==='release')return preset.length;
  if(field==='sustain')return preset.kind==='pad'?.7:.45;
  return advancedDefaults[field]??0;
}

export function setDesignerValue(preset:SoundPreset,key:string,value:number):SoundPreset {
  if(!Number.isFinite(value))return structuredClone(preset);
  const result=structuredClone(preset),spec=DESIGNER_CONTROLS.find(control=>control.key===key);
  if(spec)value=clamp(value,spec.min,spec.max);
  result.advanced={...result.advanced};
  if(key.startsWith('advanced.')){
    const field=key.slice(9);
    if(field==='cutoff'){delete result.advanced.cutoff;delete result.advanced.lpf;}
    result.advanced[field]=value;
  }else if(['volume','attack','space','brightness','length'].includes(key)){
    (result as unknown as Record<string,unknown>)[key]=value;
    const overrides:Record<string,string[]>={volume:['gain','volume'],attack:['attack'],space:['room','reverb'],brightness:['cutoff','lpf'],length:['decay','release']};
    for(const field of overrides[key])delete result.advanced[field];
  }
  return result;
}

export type DesignerFilter='lowpass'|'highpass'|'bandpass';
export function setDesignerFilter(preset:SoundPreset,type:DesignerFilter,frequency:number):SoundPreset {
  const result=structuredClone(preset),advanced={...result.advanced};
  for(const key of ['cutoff','lpf','hpf','hcutoff','bpf','bandf'])delete advanced[key];
  advanced.cutoff=type==='lowpass'?clamp(frequency,20,20000):20000;
  if(type==='highpass')advanced.hpf=clamp(frequency,20,20000);
  if(type==='bandpass')advanced.bpf=clamp(frequency,20,20000);
  result.advanced=advanced;return result;
}

/** Freeze the designer's displayed defaults when the user explicitly saves a sound. */
export function normalizeDesignerPreset(preset:SoundPreset):SoundPreset {
  const result=structuredClone(preset),defaults:Record<string,number|string>={};
  const startingValues={...preset,advanced:undefined};
  for(const control of DESIGNER_CONTROLS)if(control.key.startsWith('advanced.'))defaults[control.key.slice(9)]=getDesignerValue(startingValues,control.key);
  // Reinsert saved keys in their original order: aliases and composite controls
  // can affect the same engine field, so their override order must not change.
  for(const [key,value]of Object.entries(preset.advanced??{})){delete defaults[key];defaults[key]=value;}
  result.advanced=defaults;return result;
}

const rawControlNames:Record<string,string>={gain:'volume',volume:'volume',cutoff:'lowpass',lpf:'lowpass',hcutoff:'highpass',hpf:'highpass',bandf:'bandpass',bpf:'bandpass',room:'reverb',reverb:'reverb',note:'notes',s:'sound',sound:'sound'};
const format=(value:number|string)=>typeof value==='number'?String(value):/^[\w. #:+<>[\]~*%/,-]+$/.test(value)?value:JSON.stringify(value);

/** A complete track whose controls use the same defaults and override order as AudioEngine.presetSettings. */
export function designerCode(preset:SoundPreset,mode:DesignerMode='notes'):string {
  const sound=preset.kind==='kick'?'studio_kick':preset.kind==='snare'?'studio_snare':preset.waveform;
  const settings=new Map<string,number|string>([['sound',sound],['volume',preset.volume],['lowpass',cutoff(preset)],['attack',preset.attack],['decay',preset.length],['release',preset.length],['reverb',preset.space],['sustain',preset.kind==='pad'?.7:.45]]);
  // Freeze every visible control into the code, including controls whose effect
  // is currently off. In particular, echo spacing stays in seconds when this
  // block is inserted into a song with a different tempo.
  const startingValues={...preset,advanced:undefined};
  for(const control of DESIGNER_CONTROLS){
    if(!control.key.startsWith('advanced.')||control.key==='advanced.transpose')continue;
    const key=control.key.slice(9),command=rawControlNames[key]??resolveCommand(key)?.name;
    if(command)settings.set(command,getDesignerValue(startingValues,control.key));
  }
  for(const [key,value]of Object.entries(preset.advanced??{})){
    if(key==='transpose'||key==='note')continue;
    const command=rawControlNames[key]??resolveCommand(key)?.name;
    if(!command)throw new Error(`Cannot write the saved setting “${key}” as a music command.`);
    // Move overrides to the end so composite settings such as fm retain their
    // original order relative to later individual controls such as fmh.
    settings.delete(command);settings.set(command,value);
  }
  const lines=[...settings].map(([command,value])=>`${command}: ${format(value)}`);
  const drumNote=preset.kind==='kick'?50:preset.kind==='snare'?62:60;
  const examples:Record<DesignerMode,string>={notes:'C4 E4 G4 E4',chords:'[C4,E4,G4] [A3,C4,E4]',bass:'C2 rest G2 rest',drums:`${drumNote} rest ${drumNote} ${drumNote}`};
  const note=preset.advanced?.note;
  lines.push(`notes: ${note!==undefined?format(note):mode==='chords'?JSON.stringify(examples[mode]):examples[mode]}`);
  lines.push(`transpose: ${format(preset.advanced?.transpose??0)}`);
  const name=preset.name.replace(/[^\p{L}\p{N}_ -]/gu,'').replace(/\s+/g,' ').trim()||'designed sound';
  return `track: ${name}\n${lines.map(line=>'  '+line).join('\n')}`;
}
