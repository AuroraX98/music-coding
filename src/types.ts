export type CategoryId = 'sounds'|'samples'|'notes'|'timing'|'structure'|'effects'|'variation'|'math'|'visuals'|'connections';
export interface CommandSpec {name:string; aliases:string[]; native:string|null; category:CategoryId; description:string; notes?:string[]; example:string; kind?:string; slider?:{min:number;max:number;step:number;unit?:string;scale?:'log'|'linear'};}
export interface Statement {name:string; native:string|null; value:string; line:number; children:Statement[]; spec?:CommandSpec;}
export interface TrackSpec {id:string; name:string; line:number; endLine:number; commands:Statement[];}
export interface SectionSpec {name:string; bars:number; tracks:string[]; line:number; startBar:number; tempo:number;}
export interface Diagnostic {line:number; message:string; severity?:'error'|'warning';}
export interface Compilation {source:string; tempo:number; beatsPerBar:number; tracks:TrackSpec[]; sections:SectionSpec[]; views:string[]; definitions:Statement[]; statements:Statement[]; errors:Diagnostic[]; totalBars:number|null; totalSeconds:number|null;}
export type SoundKind='kick'|'snare'|'bass'|'lead'|'pad';
export interface SoundPreset {id:string; name:string; kind:SoundKind; waveform:string; volume:number; brightness:number; attack:number; length:number; space:number; advanced?:Record<string,number|string>;}
export interface SampleAsset {id:string; name:string; blob:Blob; rootNote?:string; color?:string;}
export interface Project {version:1; id:string; name:string; source:string; presets:SoundPreset[]; sampleIds:string[]; sliders:number[]; views:string[]; modified:number; workingSource?:string;}
export interface MixOptions {master:number; muted:Set<string>; solo:Set<string>; loopStart?:number; loopEnd?:number;}
export interface LiveState {bar:number; seconds:number; playing:boolean; levels:[number,number]; pendingBar?:number;}
export interface VisualEvent {start:number; end:number; note:number|null; sound:string; track:string; line:number; color?:string;}
export interface ExportOptions {compilation:Compilation; mix:MixOptions; startBar:number; endBar:number; tailSeconds:number; format:'wav'|'mp3'; onProgress:(fraction:number,label:string)=>void; signal:AbortSignal;}
