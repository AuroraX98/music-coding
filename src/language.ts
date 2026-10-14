import {resolveCommand} from './catalog';
import type {Compilation, Diagnostic, Statement, TrackSpec} from './types';

const definitionNames=new Set(['pattern','change','signal']);
const roots=new Set(['tempo','beats per bar','track','arrange','pattern','change','signal','show','setcpm','setcps']);
const viewNames:Record<string,string>={'pianoroll':'piano roll','piano roll':'piano roll','punchcard':'punchcard','spiral':'spiral','pitchwheel':'pitch wheel','pitch wheel':'pitch wheel','scope':'waveform','waveform':'waveform','spectrum':'spectrum'};
export function stripComment(text:string):string {
  let quote='';let escaped=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];if(escaped){escaped=false;continue;}if(c==='\\'){escaped=true;continue;}
    if(quote){if(c===quote)quote='';}else if(['"',"'",'`'].includes(c))quote=c;else if(c==='/'&&text[i+1]==='/')return text.slice(0,i);
  }return text;
}
export function scalar(value:string):number|null {
  const m=value.trim().match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(%|bpm|hz|seconds?|secs?|s|bars?|beats?)?$/i);
  if(!m)return null;const n=Number(m[1]);return Number.isFinite(n)?(m[2]==='%'?n/100:n):null;
}
function textValue(value:string){const v=value.trim();return /^(["'`]).*\1$/.test(v)?v.slice(1,-1):v;}
function trackNames(value:string):string[]{return (value.match(/"[^"]+"|'[^']+'|[^,\s]+/g)??[]).map(textValue);}
function walk(statements:Statement[],fn:(s:Statement)=>void){for(const s of statements){fn(s);walk(s.children,fn);}}
export function canOwnChildren(command:Statement|string){const s=typeof command==='string'?resolveCommand(command):command.spec;const name=typeof command==='string'?s?.name:command.name;const native=typeof command==='string'?s?.native:command.native;return s?.kind==='block'||s?.kind==='transform'||['arrange','signal','seq','cat','stack','stepcat','polymeter','polymeterSteps','choose','chooseCycles','layer','pick','pickmod','inhabit','squeeze','zip','stepalt','tour'].includes(native??name??'');}

export function compile(source:string):Compilation {
  const errors:Diagnostic[]=[];const statements:Statement[]=[];const levels:{depth:number;statement:Statement}[]=[];
  const lines=source.replace(/\r\n?/g,'\n').split('\n');
  const issue=(line:number,message:string)=>errors.push({line,message,severity:'error'});
  for(let i=0;i<lines.length;i++){
    const raw=lines[i];const content=stripComment(raw);if(!content.trim())continue;
    const indent=content.match(/^\s*/)?.[0]??'';
    if(indent.includes('\t')){issue(i+1,'Use two spaces for indentation. Press Tab in the editor to add them.');continue;}
    if(indent.length%2){issue(i+1,'Indent each level with exactly two spaces.');continue;}
    const depth=indent.length/2;const match=content.trim().match(/^([^:]+):\s*(.*)$/);
    if(!match){issue(i+1,'Write a command, then a colon, then its value. Example: volume: 30%');continue;}
    const spec=resolveCommand(match[1]);if(!spec){issue(i+1,`Unknown command “${match[1].trim()}”. Search the Commands pane for a name.`);continue;}
    if(spec.kind==='symbol'){issue(i+1,'This symbol belongs inside a pattern value. Use a named command at the start of a line.');continue;}
    const statement:Statement={name:spec.name,native:spec.native,value:match[2].trim(),line:i+1,children:[],spec};
    while(levels.length&&levels.at(-1)!.depth>=depth)levels.pop();
    if(depth===0)statements.push(statement);
    else {
      const parent=levels.at(-1);
      if(!parent||parent.depth!==depth-1){issue(i+1,'This indentation skips a level. Add only two spaces beneath its parent.');continue;}
      if(!canOwnChildren(parent.statement)){issue(i+1,`“${parent.statement.name}:” takes a value on its own line. Align this command with it.`);continue;}
      parent.statement.children.push(statement);
    }
    levels.push({depth,statement});
    if(spec.kind==='later')issue(i+1,spec.category==='connections'?'External MIDI and OSC connections are planned for a later release.':`“${spec.name}:” is not available in this app. ${spec.description}`);
    const optionalValue=canOwnChildren(statement)&&spec.kind!=='block';
    if(!statement.value&&!optionalValue&&!['flag','signal','visual','transform'].includes(spec.kind??'')&&!['arrange','signal'].includes(statement.name))issue(i+1,`Add a value after “${statement.name}:”.`);
  }
  const compilation:Compilation={source,tempo:120,beatsPerBar:4,tracks:[],sections:[],views:[],definitions:[],statements,errors,totalBars:null,totalSeconds:null};
  for(const s of statements)if(!roots.has(s.name))issue(s.line,`Put “${s.name}:” inside a track, pattern, change, or signal block.`);
  const beatStatements=statements.filter(s=>s.name==='beats per bar');
  if(beatStatements.length>1)issue(beatStatements[1].line,'Set beats per bar once at the top of your song.');
  if(beatStatements[0]){const n=scalar(beatStatements[0].value);if(n===null||n<1||!Number.isInteger(n))issue(beatStatements[0].line,'Beats per bar must be a positive whole number.');else compilation.beatsPerBar=n;}
  const tempoStatements=statements.filter(s=>['tempo','setcpm','setcps'].includes(s.name));
  if(tempoStatements.length>1)issue(tempoStatements[1].line,'Set the starting tempo once. Sections can have their own tempo.');
  if(tempoStatements[0]){const s=tempoStatements[0];const n=scalar(s.value);if(n===null||n<=0)issue(s.line,'Tempo must be a number greater than zero.');else compilation.tempo=n*(s.name==='setcpm'?compilation.beatsPerBar:s.name==='setcps'?60*compilation.beatsPerBar:1);}
  const seenTracks=new Set<string>();
  for(const s of statements.filter(s=>s.name==='track')){
    const name=textValue(s.value);if(!name)continue;
    if(seenTracks.has(name)){issue(s.line,`A track named “${name}” already exists. Give this track a different name.`);continue;}seenTracks.add(name);
    let endLine=s.line;walk(s.children,c=>{endLine=Math.max(endLine,c.line);if(['track','arrange','section','bars','tracks','tempo','beats per bar','change'].includes(c.name))issue(c.line,`“${c.name}:” does not belong inside a track.`);});
    for(const c of s.children)if(c.name==='pattern')issue(c.line,'Define reusable patterns at the left edge, or place inline patterns inside a combining command such as stack:.');
    compilation.tracks.push({id:name,name,line:s.line,endLine,commands:s.children});
    if(!s.children.length)issue(s.line,'Add indented sound and note commands beneath this track.');
  }
  if(!compilation.tracks.length)issue(1,'Start a musical part with track: melody, then indent its sound and notes.');
  const seenDefinitions=new Set<string>();
  for(const s of statements.filter(s=>definitionNames.has(s.name))){
    const name=textValue(s.value);if(!name){issue(s.line,'Give this definition a name.');continue;}
    if(seenDefinitions.has(name))issue(s.line,`A definition named “${name}” already exists.`);else {seenDefinitions.add(name);compilation.definitions.push(s);}
    if(!s.children.length)issue(s.line,'Add indented commands beneath this definition.');
    walk(s.children,c=>{if(['track','arrange','section','bars','tracks','tempo','beats per bar','setcpm','setcps','change','signal'].includes(c.name))issue(c.line,`“${c.name}:” does not belong inside a ${s.name} definition.`);});
    for(const c of s.children)if(c.name==='pattern')issue(c.line,'Define reusable patterns at the left edge, or place inline patterns inside a combining command such as stack:.');
  }
  walk(statements,s=>{
    if(s.name==='use'&&!seenDefinitions.has(textValue(s.value)))issue(s.line,`No pattern or change named “${textValue(s.value)}” exists.`);
    for(const ref of s.value.matchAll(/\$([A-Za-z_][\w-]*)/g))if(!seenDefinitions.has(ref[1]))issue(s.line,`No signal or pattern named “${ref[1]}” exists.`);
    if(s.spec?.kind==='transform'&&!s.children.length){
      const identifier=s.value.match(/^\$?([A-Za-z_][\w-]*)$/)?.[1];
      const callbackRef=s.value.match(/(?:^|,)\s*\$([A-Za-z_][\w-]*)\s*$/)?.[1];
      if(!identifier&&!callbackRef)issue(s.line,`Indent the commands to change beneath “${s.name}:”.`);
      if(identifier&&!seenDefinitions.has(identifier))issue(s.line,`No change named “${identifier}” exists.`);
    }
    if(['faster','slower'].includes(s.name)){const n=scalar(s.value);if(n!==null&&n<=0)issue(s.line,'Pattern speed must be greater than zero.');}
  });
  const definitionMap=new Map(compilation.definitions.map(s=>[textValue(s.value),s]));
  function checkCycle(name:string,path:string[]){
    const s=definitionMap.get(name);if(!s)return;
    if(path.includes(name)){issue(s.line,`Definitions form a loop: ${[...path,name].join(' → ')}. Remove one reference.`);return;}
    walk(s.children,c=>{if(c.name==='use')checkCycle(textValue(c.value),[...path,name]);for(const ref of c.value.matchAll(/\$([A-Za-z_][\w-]*)/g))checkCycle(ref[1],[...path,name]);});
  }
  for(const name of definitionMap.keys())checkCycle(name,[]);
  walk(statements,s=>{if(s.name==='show'){const key=textValue(s.value).toLowerCase().replace(/^_/,'').replace(/\(\)$/,'');if(!viewNames[key])issue(s.line,'Choose piano roll, punchcard, spiral, pitch wheel, waveform, or spectrum.');else if(!compilation.views.includes(viewNames[key]))compilation.views.push(viewNames[key]);}else if(s.spec?.kind==='visual'&&s.native&&viewNames[s.native]&&!compilation.views.includes(viewNames[s.native]))compilation.views.push(viewNames[s.native]);});
  if(!compilation.views.length)compilation.views.push('piano roll');
  const arrangements=statements.filter(s=>s.name==='arrange');if(arrangements.length>1)issue(arrangements[1].line,'Use one arrange block for the song.');
  if(arrangements[0]){
    let startBar=1;let seconds=0;let tempo=compilation.tempo;const sectionNames=new Set<string>();
    for(const s of arrangements[0].children){
      if(s.name!=='section'){issue(s.line,'Start each arranged part with section: and indent bars: and tracks: beneath it.');continue;}
      const name=textValue(s.value);if(sectionNames.has(name))issue(s.line,'Give each section a different name.');sectionNames.add(name);
      for(const c of s.children)if(!['bars','tracks','tempo'].includes(c.name))issue(c.line,'A section accepts bars:, tracks:, and an optional tempo:.');
      for(const key of ['bars','tracks','tempo']){const repeated=s.children.filter(c=>c.name===key);if(repeated.length>1)issue(repeated[1].line,`Use “${key}:” once in each section.`);}
      const barsLine=s.children.find(c=>c.name==='bars');const bars=barsLine?scalar(barsLine.value):null;
      if(bars===null||bars<1||!Number.isInteger(bars)){issue(barsLine?.line??s.line,'Set this section’s length with bars: and a positive whole number.');continue;}
      const tempoLine=s.children.find(c=>c.name==='tempo');if(tempoLine){const n=scalar(tempoLine.value);if(n===null||n<=0)issue(tempoLine.line,'Section tempo must be greater than zero.');else tempo=n;}
      const selection=s.children.find(c=>c.name==='tracks');const selected=selection?trackNames(selection.value):compilation.tracks.map(t=>t.id);
      for(const name of selected)if(!seenTracks.has(name))issue(selection?.line??s.line,`No track named “${name}” exists.`);
      compilation.sections.push({name,bars,tracks:[...new Set(selected)],line:s.line,startBar,tempo});startBar+=bars;seconds+=bars*compilation.beatsPerBar*60/tempo;
    }
    if(!compilation.sections.length)issue(arrangements[0].line,'Add at least one section beneath arrange:.');
    compilation.totalBars=startBar-1;compilation.totalSeconds=seconds;
  }
  return compilation;
}

export function durationForRange(compilation:Compilation,startBar:number,endBar:number):number {
  if(!Number.isInteger(startBar)||!Number.isInteger(endBar)||startBar<1||endBar<startBar)throw new RangeError('Choose whole bars with the final bar at or after the first.');
  if(compilation.totalBars!==null&&endBar>compilation.totalBars)throw new RangeError('The export ends after the song’s final bar.');
  if(!compilation.sections.length)return(endBar-startBar+1)*compilation.beatsPerBar*60/compilation.tempo;
  return compilation.sections.reduce((seconds,s)=>{const count=Math.max(0,Math.min(endBar,s.startBar+s.bars-1)-Math.max(startBar,s.startBar)+1);return seconds+count*compilation.beatsPerBar*60/s.tempo;},0);
}
export function describeDuration(seconds:number):string {
  if(!Number.isFinite(seconds)||seconds<0)return 'Repeating';const rounded=Math.round(seconds);return `${Math.floor(rounded/60)}:${String(rounded%60).padStart(2,'0')}`;
}
export function tidy(source:string):string {
  // Invalid indentation has more than one possible meaning. Ask the author to fix it first.
  if(compile(source).errors.length)return source;
  return source.replace(/\r\n?/g,'\n').split('\n').map(line=>{
    const indent=line.match(/^ */)?.[0]??'';if(!line.trim())return '';
    const content=stripComment(line);const comment=line.slice(content.length);if(!content.trim())return indent+comment.trim();
    const colon=content.indexOf(':');return indent+content.trim().slice(0,content.trim().indexOf(':')).trim()+':'+(content.slice(colon+1).trim()?' '+content.slice(colon+1).trim():'')+(comment?' '+comment.trim():'');
  }).join('\n');
}
