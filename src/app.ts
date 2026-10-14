import './styles.css';
import './theme.css';
import {mountDesigner} from './designer-ui';
import {mountStudioPiano} from './studio-piano';
import {designerCode,normalizeDesignerPreset,type DesignerMode} from './designer';
import {explainTerms} from './helpTerms';
import {commands,categories,resolveCommand} from './catalog';
import {compile,tidy,durationForRange,describeDuration,stripComment} from './language';
import {createEditor,colorForSound,setSoundColors,parseSliderNumber} from './editor';
import {AudioEngine,DEFAULT_PRESETS} from './audio';
import {BUILTIN_INSTRUMENTS,BUILTIN_KITS,type BuiltinInstrument} from './instruments';
import {openStore,getProjects,saveProject,deleteProject,getSamples,saveSample,deleteSample,getLibraryPresets,saveLibraryPresets,exportProject,importProject,saveImportedProject} from './storage';
import {writingGuide,EXAMPLES,escapeHtml} from './guides';
import {mountTheory} from './theory';
import {getCommandPractice} from './commandPractice';
import type {Compilation,Project,SoundPreset,SampleAsset,MixOptions,CommandSpec} from './types';

const $ = <T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const esc=escapeHtml;
const uid=()=>crypto.randomUUID();
const STARTER = `tempo: 120 bpm

// A drum part made with our own sounds
track: drums
  play: kick rest snare rest
  volume: 45%

// Your melody, twice as fast
track: melody
  sound: triangle
  notes: B4 B5 E2 F3
  faster: 2
  volume: 22%
  reverb: 15%

track: bass
  sound: sine
  notes: B2 rest E2 rest
  volume: 30%

arrange:
  section: intro
    bars: 4
    tracks: drums
  section: together
    bars: 8
    tracks: drums melody bass

show: piano roll`;
let project:Project={version:1,id:uid(),name:'My first song',source:STARTER,presets:structuredClone(DEFAULT_PRESETS),sampleIds:[],sliders:[],views:['piano roll'],modified:Date.now()};
let compilation:Compilation=compile(project.source);
let samples:SampleAsset[]=[], library:SoundPreset[]=structuredClone(DEFAULT_PRESETS),projects:Project[]=[];
let page='studio',paneOpen=localStorage.getItem('plainMusic.pane')!=='closed',currentLine=1,saveTimer:ReturnType<typeof setTimeout>,applyTimer:ReturnType<typeof setTimeout>,toastTimer:ReturnType<typeof setTimeout>;
let mix:MixOptions={master:.75,muted:new Set(),solo:new Set()};
let selectedSectionLine=0;
let guideQuery='',guideCategory='',guideScroll=0,playbackError='';
let selectedView='piano roll',visualTrack='all',loopOn=false,job:AbortController|null=null;
let designer:SoundPreset=structuredClone(DEFAULT_PRESETS[0]);
let designerUI:ReturnType<typeof mountDesigner>|undefined,designerPreviewTimer:ReturnType<typeof setTimeout>|undefined;
let designerPreviewGeneration=0;
const engine=new AudioEngine();
let editor:ReturnType<typeof createEditor>;
let studioPiano:ReturnType<typeof mountStudioPiano>|undefined;
let studioAuditions:{note:string;until:number}[]=[];

$('app').innerHTML=`
<header class='topbar'>
 <div class='brand'><div class='brand-icon'>♫</div><div>Music Coding<small>Your ideas, in sound</small></div></div>
 <nav class='nav' aria-label='Main navigation'>
  <button data-page='studio' class='active' aria-current='page'>Studio</button><button data-page='designer'>Sound Designer</button><button data-page='library'>Sound Library</button><button data-page='projects'>My Projects</button><button data-page='guide'>Command Guide</button><button data-page='writing'>Writing Guide</button><button data-page='theory'>Music Theory</button>
 </nav>
 <div class='top-actions'><span class='local-badge'>● On your computer</span><button id='commands-toggle' aria-expanded='${paneOpen}'>☰ Commands</button></div>
</header>
<main class='workspace'>
 <section id='page-studio' class='tab-page'>
  <div class='page-heading'><div><div class='eyebrow'>Make something you can hear</div><input id='project-name' class='project-title' aria-label='Song name' maxlength='200' value='My first song'><p>Write a little. Listen. Make it yours.</p></div><div class='save-state'><i></i><span id='save-label'>Opening your studio…</span></div></div>
  <div id='main-grid' class='main-grid'>
   <div class='studio-column'>
    <div class='transport'>
     <button id='play' class='primary play-button'>▶ Play</button><button id='stop'>■ Stop</button><button id='apply'>Apply changes</button>
     <span class='transport-divider'></span><div class='transport-time'><span id='position'>Bar 001 · 0:00</span><small id='playback-state'>Ready when you are</small></div>
     <div class='master'><label for='master-volume'>Master</label><input id='master-volume' type='range' min='0' max='100' value='75' aria-label='Master volume'><span id='master-value' class='meter-label'>75%</span><div id='meter' class='meter' aria-label='Output level meter'>${Array.from({length:10},(_,i)=>`<span style='--h:${5+i*1.3}px'></span>`).join('')}</div></div>
     <button id='export-wav'>Export WAV</button><button id='export-mp3'>Export MP3</button>
    </div>
    <div id='sections' class='section-strip'></div>
    <div class='studio-writing-grid'><div class='editor-card'>
     <div class='editor-heading'><div class='file-label'><span>⌘</span> song.music <span id='edited-marker' class='badge' hidden>Edits pending</span></div><div class='editor-tools'><button id='undo' title='Undo (Ctrl+Z)'>↶ Undo</button><button id='redo' title='Redo (Ctrl+Shift+Z)'>↷ Redo</button><button id='tidy'>Tidy code</button><button id='restore'>Restore working version</button><button id='add-slider'>＋ Slider</button><button id='note-toggle' aria-expanded='false' aria-controls='note-helper'>♩ Notes</button></div></div>
     <div id='editor' class='editor-host'></div>
     <div id='errors' class='errors' role='status'></div>
     <div id='note-helper' class='note-helper' hidden><div class='note-settings'><label>Octave <select id='note-octave'><option>2</option><option>3</option><option selected>4</option><option>5</option><option>6</option></select></label><label>Scale <select id='note-scale'><option value='all'>All notes</option><option value='C major'>C major</option><option value='B minor'>B minor</option><option value='E minor'>E minor</option></select></label><span class='muted'>Click or press Space to hear. Double-click or press Enter to insert.</span></div><div id='piano-keys' class='piano-keys'></div></div>
     <div class='editor-footer'><span id='line-position'>Ln 1 · 29 lines</span><span><strong>Tab</strong> indent · <strong>Shift + Tab</strong> outdent · <strong>Enter</strong> continues your track</span></div>
    </div>
    <aside id='studio-piano' aria-label='Virtual piano and piano roll'></aside></div>
    <div id='tracks' class='track-strip'></div>
    <div class='visual-card'><div class='visual-heading'><h3>See your music</h3><div id='view-tabs' class='view-tabs'></div><select id='visual-track' aria-label='Visual track' style='font-size:10px;padding:4px 7px'><option value='all'>All tracks</option></select></div><canvas id='visual-canvas' aria-label='Music visualization'></canvas><div class='visual-footer'><span id='visual-caption'>Notes move through the piano roll as your music plays.</span><div class='loop-controls'><button id='loop-toggle' aria-pressed='false'>↻ Loop bars</button><input id='loop-start' type='number' min='1' value='1' aria-label='Loop start bar'><span>to</span><input id='loop-end' type='number' min='1' value='4' aria-label='Loop end bar'></div></div></div>
    <div class='status-bar'><span id='status' class='status' role='status'>Your studio is ready.</span><span id='song-length'>12 bars · 0:24</span></div>
    <div id='legend' class='category-legend'></div>
   </div>
   <aside id='command-pane' class='command-pane' aria-label='Command reference'><div class='pane-heading'><h2>Commands</h2><button id='pane-close' class='ghost' aria-label='Close command pane'>×</button></div><input id='command-search' class='command-search' placeholder='Search a command, alias, or idea…' aria-label='Search commands'><div id='command-list' class='command-list'></div><div class='pane-footer'>Click a command for an example. Every color has a purpose.</div></aside>
  </div>
 </section>
 <section id='page-designer' class='tab-page page' hidden></section>
 <section id='page-library' class='tab-page page' hidden></section>
 <section id='page-projects' class='tab-page page' hidden></section>
 <section id='page-guide' class='tab-page page' hidden></section>
 <section id='page-writing' class='tab-page page' hidden></section>
 <section id='page-theory' class='tab-page page' hidden></section>
 <div class='workspace-bottom'><span>Made for listening, learning, and making. · <a href='/source.zip' download>App source</a> · <a href='/licenses/index.html' target='_blank' rel='noopener'>Licenses</a></span><span class='shortcuts'>Ctrl + Enter to play / apply · Esc to stop</span></div>
</main>
<dialog id='export-dialog' class='modal'><div class='modal-head'><h2>Export your song</h2><button id='export-close' class='ghost' aria-label='Close export'>×</button></div><div class='modal-body'><div class='export-total'><div><small>Total song</small><strong id='export-total-bars'></strong></div><div style='text-align:right'><small>Total time</small><strong id='export-total-time'></strong></div></div><div class='form-row'><label>What to export<select id='export-mode'><option value='whole'>Whole song</option><option value='bars'>Selected bars</option><option value='minutes'>Chosen length</option></select></label><label>Format<select id='export-format'><option value='wav'>WAV · full quality</option><option value='mp3'>MP3 · smaller file</option></select></label></div><div id='export-bars-row' class='form-row'><label>Start bar<input id='export-start' type='number' min='1' step='1' value='1'></label><label>End bar, included<input id='export-end' type='number' min='1' step='1' value='12'></label></div><div id='export-minutes-row' class='form-row' hidden><label>Minutes<input id='export-minutes' type='number' min='0.01' step='0.1' value='1'></label></div><div class='form-row'><label>Effect tail<select id='export-tail-mode'><option value='include'>Include the fading sound</option><option value='cut'>Cut at the ending</option></select></label><label>Extra seconds<input id='export-tail' type='number' min='0' max='30' step='0.1' value='3'></label></div><p class='muted' style='font-size:11px'>Export plays through the required music on your computer. Your samples and effects are included. Keep this tab open.</p><div class='export-summary'><span>Selected music: <strong id='export-selection-time'>0:24</strong></span><span>Final file: <strong id='export-final-time'>0:27</strong></span></div><div id='export-problem' class='error-text'></div><div id='export-progress' class='export-progress'><progress id='export-progress-bar' max='1' value='0'></progress><p id='export-progress-text'></p></div></div><div class='modal-actions'><button id='export-cancel'>Cancel</button><button id='export-go' class='primary'>Export WAV</button></div></dialog>
<dialog id='help-dialog' class='modal'><div class='modal-head'><h2 id='help-title'>Command</h2><button id='help-close' class='ghost' aria-label='Close command help'>×</button></div><div id='help-body' class='modal-body help-content'></div><div class='modal-actions'><button id='help-insert'>Insert command</button><button id='help-guide' class='primary'>Open Command Guide</button></div></dialog>
<div id='toast' class='toast' hidden role='status'></div>
<input id='sample-files' type='file' accept='audio/*,.wav,.mp3,.ogg,.flac,.aif,.aiff,.m4a' multiple hidden><input id='project-file' type='file' accept='.zip' hidden>
`;

function toast(message:string){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true;},5000);}
function status(message:string){$('status').textContent=message;}
engine.onError=error=>{++playbackRequest;clearTimeout(applyTimer);playbackError=error.message;editor.playing([]);status('Playback stopped: '+error.message);toast(error.message);};
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function syncPane(){ $('command-pane').hidden=!paneOpen;$('main-grid').classList.toggle('pane-closed',!paneOpen);$('commands-toggle').classList.toggle('active',paneOpen);$('commands-toggle').setAttribute('aria-expanded',String(paneOpen));localStorage.setItem('plainMusic.pane',paneOpen?'open':'closed');}
function matches(c:CommandSpec,q:string){return !q||[c.name,c.native,...c.aliases,c.description,...(c.notes||[]),c.category].join(' ').toLowerCase().includes(q.toLowerCase());}
function renderCommands(){const q=$<HTMLInputElement>('command-search').value.trim();$('command-list').innerHTML=categories.map(cat=>{const group=commands.filter(c=>c.category===cat.id&&matches(c,q));if(!group.length)return '';return `<section class='command-group'><h3 style='color:${cat.color}'>${esc(cat.title)}</h3>${group.map(c=>`<button class='command-row' data-command='${esc(c.name)}'><span class='names'><strong style='color:${cat.color}'>${esc(c.name)}:</strong><span class='alias'>${esc(c.aliases.slice(0,2).map(x=>x+':').join(' / '))}</span></span><p>${esc(c.description)}</p></button>`).join('')}</section>`;}).join('')||'<div class=\"empty\">No matching commands. Try a Strudel name or a word such as echo.</div>'; }
function termHelp(text:string){const definitions=explainTerms(text);return definitions.length?'<div class="term-help">'+definitions.map(text=>'<small>'+esc(text)+'</small>').join('')+'</div>':'';}
function commandNotes(command:CommandSpec){return command.notes?.length?`<aside class='command-notes'><strong>How to use it</strong><ul>${command.notes.map(note=>`<li>${esc(note)}</li>`).join('')}</ul></aside>`:'';}
let helpSpec:CommandSpec|undefined;
function commandPracticeBlock(c:CommandSpec){const p=getCommandPractice(c);return `<section class='command-practice'><h4>${p.available?'Complete practice song':'Practice a supported alternative'}</h4><p>${esc(p.instruction)}</p>${p.prerequisite?`<p class='doc-notice'>Before you start: ${esc(p.prerequisite)}</p>`:''}<pre>${esc(p.source)}</pre><p>Read from top to bottom: the first lines set up the song. Each indented group belongs to its track. Press Play, then try the change above.</p><button data-command-practice='${esc(c.name)}'>${p.available?'Open practice song':'Open alternative song'}</button></section>`;}
function openHelp(name:string){helpSpec=resolveCommand(name);if(!helpSpec)return;const c=helpSpec;const cat=categories.find(x=>x.id===c.category);$('help-title').textContent=c.name+':';$('help-body').innerHTML=`<div class='eyebrow' style='color:${cat?.color}'>${esc(cat?.title||'Command')}</div><p>${esc(c.description)}</p>${commandNotes(c)}${termHelp([c.description,...(c.notes||[])].join(" "))}<p style='font-size:11px'>Short names: ${esc(c.aliases.length?c.aliases.map(x=>x+':').join(', '):'Use the full name')}<br>Strudel: ${esc(c.native||'App instruction')}</p><pre>${esc(c.example)}</pre>${commandPracticeBlock(c)}${c.slider?`<p class='doc-notice'>Click the number in your code, then + Slider. The slider changes the number and applies valid music at the next available bar.</p>`:''}${c.category==='connections'?'<p class=\"doc-notice\">External connections are a later extension. This version plays music inside the browser.</p>':''}`;($('help-insert') as HTMLButtonElement).disabled=c.kind==='later';$('help-insert').textContent=c.kind==='later'?'Not available':'Insert command';($('help-dialog') as HTMLDialogElement).showModal();}
function renderReference(query=guideQuery){ $('page-guide').innerHTML=`<div class='page-heading'><div><div class='eyebrow'>A little help, always close by</div><h1>Command Guide</h1><p>Read what each command does, what it needs, and an example.</p></div><span class='badge'>${commands.length} commands & helpers</span></div><div class='page-toolbar'><input id='reference-search' placeholder='Search full names, short names, or Strudel names…' aria-label='Search full command guide' value='${esc(query)}'></div><div class='guide-columns'><nav class='guide-nav'>${categories.map(c=>`<button data-category='${c.id}' aria-current='${guideCategory===c.id?'location':'false'}' style='color:${c.color}'>${esc(c.title)}</button>`).join('')}</nav><div id='reference-results'></div></div><p class='footer-note'>Examples use our language. The matching Strudel function is shown for reference.</p>`;renderReferenceResults(query);$('reference-search').addEventListener('input',()=>renderReferenceResults($<HTMLInputElement>('reference-search').value));}
function renderReferenceResults(query:string){guideQuery=query;$('reference-results').innerHTML=categories.map(cat=>{const group=commands.filter(c=>c.category===cat.id&&matches(c,query));return group.length?`<section class='reference-section' id='category-${cat.id}'><h2 style='color:${cat.color}'>${esc(cat.title)}</h2>${group.map(c=>`<article class='reference-command'><h3 style='color:${cat.color}'>${esc(c.name)}: <small>${esc(c.aliases.slice(0,5).map(x=>x+':').join(' · '))}</small></h3><p>${esc(c.description)}</p>${commandNotes(c)}${termHelp([c.description,...(c.notes||[])].join(" "))}<pre>${esc(c.example)}</pre>${commandPracticeBlock(c)}<div class='reference-meta'><span>Strudel: ${esc(c.native||'Studio instruction')}</span><button data-insert='${esc(c.name)}' ${c.kind==='later'?'disabled':''}>${c.kind==='later'?'Not available':'Insert command'}</button></div></article>`).join('')}</section>`:'';}).join('')||'<div class=\"empty\">No matching commands.</div>';}
function insertCommand(spec:CommandSpec){if(spec.kind==='later'){toast(spec.description);return;}navigate('studio');if(spec.kind==='symbol'){toast('Use this symbol inside notes: or play:. Its guide example shows where.');return;}const current=editor.view.state.doc.lineAt(editor.view.state.selection.main.head);const indentation=current.text.match(/^ */)?.[0]||'';const rows=spec.example.split('\n');const first=rows.findIndex(x=>x.trim().startsWith(spec.name+':'));if(first<0){editor.append('\n\n'+spec.example+'\n');return;}const depth=rows[first].match(/^ */)?.[0].length||0;let last=first+1;while(last<rows.length&&(rows[last].trim()===''||(rows[last].match(/^ */)?.[0].length||0)>depth))last++;const snippet=rows.slice(first,last).join('\n').replace(new RegExp('^ {0,'+depth+'}','gm'),'');if(['track','arrange','pattern','change','signal','tempo','beats per bar','show'].includes(spec.name))editor.append('\n\n'+snippet+'\n');else{const pos=current.text.trim()?current.to:current.from;editor.view.dispatch({changes:{from:pos,insert:(current.text.trim()?'\n':'')+snippet.split('\n').map(x=>(indentation||'  ')+x).join('\n')},scrollIntoView:true});editor.view.focus();}}
function renderWriting(){$('page-writing').innerHTML=`<div class='page-heading'><div><div class='eyebrow'>Start small. Build a song.</div><h1>Writing Guide</h1><p>See where each line belongs, then try it yourself.</p></div></div><div class='page-card writing-guide'>${writingGuide}</div>`;}
function renderTheory(){const container=$('page-theory');if(container.dataset.ready)return;mountTheory(container,async practice=>{await save();await loadProject({version:1,id:uid(),name:practice.title+' · theory practice',source:practice.source,presets:structuredClone(DEFAULT_PRESETS),sampleIds:[],sliders:[],views:['piano roll'],modified:Date.now()},false);});container.dataset.ready='true';}
function navigate(name:string){if(page==='designer'&&name!=='designer'){designerUI?.destroy();designerUI=undefined;stopDesignerPreview();}if(page==='guide')guideScroll=window.scrollY;page=name;document.querySelectorAll<HTMLElement>('.tab-page').forEach(el=>el.hidden=el.id!=='page-'+name);document.querySelectorAll<HTMLElement>('[data-page]').forEach(el=>{el.classList.toggle('active',el.dataset.page===name);if(el.dataset.page===name)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});if(name==='designer')renderDesigner();if(name==='library')renderLibrary();if(name==='projects')renderProjects();if(name==='guide'){renderReference();requestAnimationFrame(()=>{if(page==='guide')window.scrollTo(0,guideScroll);});}if(name==='writing')renderWriting();if(name==='theory')renderTheory();}
function sampleReferenced(source:string,name:string){const escaped=name.replace(/[.*+?^\${}()|[\]\\]/g,'\\$&');return new RegExp('(^|[^a-zA-Z0-9_-])'+escaped+'($|[^a-zA-Z0-9_-])','i').test(source.split('\n').map(stripComment).join('\n'));}
function normalizeSoundReference(name:string){return name.trim().toLowerCase().replace(/\s+/g,'_');}
function remapSoundReferences(source:string,replacements:Map<string,string>){
  if(!replacements.size)return source;
  const escaped=[...replacements.keys()].sort((a,b)=>b.length-a.length).map(name=>name.replace(/[.*+?^\${}()|[\]\\]/g,'\\$&'));
  const pattern=new RegExp('(^|[^a-zA-Z0-9_-])('+escaped.join('|')+')(?=$|[^a-zA-Z0-9_-])','gi');
  const lookup=new Map([...replacements].map(([from,to])=>[from.toLowerCase(),to]));
  return source.split('\n').map(line=>{
    const content=stripComment(line),colon=content.indexOf(':');
    const command=resolveCommand(content.slice(0,colon).trim());
    if(colon<0||!['sound','samples','soundAlias'].includes(command?.native||''))return line;
    const value=content.slice(colon+1).replace(pattern,(_match,before,name)=>before+lookup.get(name.toLowerCase()));
    return content.slice(0,colon+1)+value+line.slice(content.length);
  }).join('\n');
}
function projectSamples(){return samples.filter(s=>[project.source,project.workingSource||''].some(source=>sampleReferenced(source,s.name)||sampleReferenced(source,s.id)));}
async function configureSounds(){setSoundColors([...BUILTIN_INSTRUMENTS.map(x=>({name:x.id})),...project.presets.map(x=>({name:x.name})),...samples]);editor.refresh();engine.setSounds(project.presets,samples);refreshStudioPianoSounds();}
async function save(){try{clearTimeout(saveTimer);project.modified=Date.now();project.source=editor.getSource();project.sampleIds=projectSamples().map(s=>s.id);const snapshot=structuredClone(project);await saveProject(snapshot);if(project.id===snapshot.id){localStorage.setItem('plainMusic.current',snapshot.id);$('save-label').textContent='Saved on this computer';}}catch(e){$('save-label').textContent='Save failed';toast('Could not save: '+String(e));throw e;}}
function scheduleSave(){clearTimeout(saveTimer);$('save-label').textContent='Saving…';saveTimer=setTimeout(()=>void save().catch(()=>{}),500);}
function changed(source:string,kind:'code'|'slider'){project.source=source;const previousViews=compilation.views.join();compilation=compile(source);if(compilation.views.length&&previousViews!==compilation.views.join()){selectedView=compilation.views[0];project.views=[selectedView];renderViewTabs();}editor.errors(compilation.errors);$('line-position').textContent=`Ln ${currentLine} · ${source.split('\n').length} lines`;$('edited-marker').hidden=false;renderErrors();renderTracks();renderSections();renderLength();scheduleSave();if(kind==='slider'&&engine.state.playing&&!compilation.errors.length&&!job){clearTimeout(applyTimer);applyTimer=setTimeout(()=>void applyChanges(),90);}}
function renderErrors(){const el=$('errors');el.classList.toggle('visible',compilation.errors.length>0);el.innerHTML=compilation.errors.map(d=>`<button data-line='${d.line}'>Line ${d.line}: ${esc(d.message)}</button>`).join('');}
function renderTracks(){const ids=new Set(compilation.tracks.map(t=>t.id));mix.muted=new Set([...mix.muted].filter(x=>ids.has(x)));mix.solo=new Set([...mix.solo].filter(x=>ids.has(x)));$('tracks').innerHTML=compilation.tracks.map(t=>`<div class='track-chip'><span class='dot' style='background:${colorForSound(t.name)}'></span><button data-track-line='${t.line}' class='ghost' style='font-size:11px;padding:0'>${esc(t.name)}</button><button data-mute='${esc(t.id)}' class='${mix.muted.has(t.id)?'active':''}' title='Mute ${esc(t.name)}' aria-label='Mute ${esc(t.name)}' aria-pressed='${mix.muted.has(t.id)}'>M</button><button data-solo='${esc(t.id)}' class='${mix.solo.has(t.id)?'active':''}' title='Solo ${esc(t.name)}' aria-label='Solo ${esc(t.name)}' aria-pressed='${mix.solo.has(t.id)}'>S</button></div>`).join('');const select=$<HTMLSelectElement>('visual-track');select.innerHTML='<option value=\"all\">All tracks</option>'+compilation.tracks.map(t=>`<option value='${esc(t.id)}'>${esc(t.name)}</option>`).join('');select.value=ids.has(visualTrack)?visualTrack:'all';}
function selectSectionLine(line:number){const section=compilation.sections.find(s=>s.line===line);selectedSectionLine=section?.line||0;if(section){$<HTMLInputElement>('loop-start').value=String(section.startBar);$<HTMLInputElement>('loop-end').value=String(section.startBar+section.bars-1);}renderSections();}
function renderSections(){if(!compilation.sections.some(s=>s.line===selectedSectionLine))selectedSectionLine=0;$('sections').innerHTML=compilation.sections.map(s=>`<button class='section-pill ${s.line===selectedSectionLine?'active':''}' data-section='${s.line}' aria-label='Export ${esc(s.name)}, bars ${s.startBar} to ${s.startBar+s.bars-1}' aria-pressed='${s.line===selectedSectionLine}'>Export ${esc(s.name)}<span>bars ${s.startBar}–${s.startBar+s.bars-1}</span></button>`).join('');}
function renderLength(){const text=compilation.errors.length?'Fix errors to calculate song length':compilation.totalBars===null?'Repeating · choose an export length':`${compilation.totalBars} bars · ${describeDuration(compilation.totalSeconds||0)} total`;$('song-length').textContent=text;}
let playbackRequest=0;
async function play(){
  if(job)return;
  if(compilation.errors.length){toast('Fix the marked lines before playing.');editor.gotoLine(compilation.errors[0].line);return;}
  const song=compilation,source=song.source,projectId=project.id,request=++playbackRequest;
  const current=()=>request===playbackRequest&&project.id===projectId&&!job;
  try{
    setLoop();const playbackMix={...mix,muted:new Set(mix.muted),solo:new Set(mix.solo)};
    playbackError='';status('Preparing your sounds…');await configureSounds();if(!current())return;
    await engine.play(song,playbackMix);if(!current())return;
    project.workingSource=source;$('edited-marker').hidden=project.source===source;
    status('Playing. Change one thing and listen.');scheduleSave();
  }catch(e){if(!current()||(e instanceof Error&&e.name==='AbortError'))return;playbackError=e instanceof Error?e.message:String(e);status('Playback could not start: '+playbackError);toast(playbackError);}
}
async function applyChanges(){
  if(job)return;
  if(compilation.errors.length){toast('Your current music keeps playing. Fix the marked lines before applying.');return;}
  if(!engine.state.playing){await play();return;}
  const song=compilation,source=song.source,projectId=project.id,request=++playbackRequest;
  const current=()=>request===playbackRequest&&project.id===projectId&&!job;
  try{
    setLoop();const playbackMix={...mix,muted:new Set(mix.muted),solo:new Set(mix.solo)};
    await configureSounds();if(!current())return;
    const bar=await engine.apply(song,playbackMix);if(!current())return;
    status(`Changes queued for bar ${Math.ceil(Number(bar)||engine.state.bar)}.`);
    project.workingSource=source;$('edited-marker').hidden=project.source===source;scheduleSave();
  }catch(e){if(!current()||(e instanceof Error&&e.name==='AbortError'))return;toast(String(e));}
}
function stop(){if(job)return;++designerPreviewGeneration;clearTimeout(designerPreviewTimer);++playbackRequest;clearTimeout(applyTimer);engine.stop();playbackError='';editor.playing([]);status('Stopped. Your code is saved.');}
function setLoop(){if(loopOn){const a=Number($<HTMLInputElement>('loop-start').value),b=Number($<HTMLInputElement>('loop-end').value);if(!Number.isInteger(a)||!Number.isInteger(b)||a<1||b<a||(compilation.totalBars!==null&&b>compilation.totalBars)){throw new Error('Choose valid loop bars inside your song.');}mix.loopStart=a;mix.loopEnd=b;}else{delete mix.loopStart;delete mix.loopEnd;}}
function exportTime(seconds:number){const tenths=Math.round(seconds*10),whole=Math.floor(tenths/10);return Math.floor(whole/60)+':'+String(whole%60).padStart(2,'0')+(tenths%10?'.'+tenths%10:'');}
function renderViewTabs(){const captions:Record<string,string>={'piano roll':'Each block is a note. Higher blocks have a higher pitch.','punchcard':'Each row is a track. Blocks show when its sounds play.','spiral':'Follow the dots as the repeating pattern moves through time.','pitch wheel':'Notes light up around a circle of twelve pitches.','waveform':'See the shape of the sound you are hearing.','spectrum':'See how much low and high sound is in your music.'};$('visual-caption').textContent=captions[selectedView]||'';const views=['piano roll','punchcard','spiral','pitch wheel','waveform','spectrum'];$('view-tabs').innerHTML=views.map(v=>`<button data-view='${v}' aria-pressed='${selectedView===v}' class='${selectedView===v?'active':''}'>${v}</button>`).join('');}
function refreshStudioPianoSounds(){const all=[...library,...project.presets];const unique=new Map(all.map(p=>[p.id,p]));studioPiano?.setSounds([...BUILTIN_INSTRUMENTS.map(p=>({id:p.id,name:p.name})),...[...unique.values()].map(p=>({id:p.id,name:p.name}))]);}
async function auditionStudioNote(note:string,soundId:string,pianoVolume=.75){
 if(job)throw new Error('Finish or cancel the export before trying piano notes.');
 if(BUILTIN_INSTRUMENTS.some(p=>p.id===soundId)){await engine.previewInstrument(soundId,note,pianoVolume);studioAuditions.push({note,until:performance.now()+600});return;}
 const saved=[...project.presets,...library].find(p=>p.id===soundId);
 const preset:SoundPreset=saved?structuredClone(saved):{...structuredClone(DEFAULT_PRESETS[3]),name:'piano-preview',kind:'lead',waveform:'triangle',volume:.3,space:0,length:.3,advanced:{}};
 preset.advanced={...preset.advanced,note};await engine.previewPreset(preset,pianoVolume);
 const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],match=note.match(/^([A-G]#?)(-?\d+)$/)!;
 const pitch=(Number(match[2])+1)*12+names.indexOf(match[1])+Number(preset.advanced.transpose||0),rounded=Math.round(pitch);
 const heard=names[((rounded%12)+12)%12]+(Math.floor(rounded/12)-1);
 studioAuditions.push({note:heard,until:performance.now()+(preset.kind==='pad'?1000:300)});
}
function renderKeys(){const keys=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];const octave=$<HTMLSelectElement>('note-octave').value;const scale=$<HTMLSelectElement>('note-scale').value;const scales:Record<string,number[]>={'C major':[0,2,4,5,7,9,11],'B minor':[11,1,2,4,6,7,9],'E minor':[4,6,7,9,11,0,2]};$('piano-keys').innerHTML=keys.map((n,i)=>`<button data-note='${n+octave}' class='${n.includes('#')?'black':''} ${scale==='all'||scales[scale]?.includes(i)?'in-scale':''}' aria-label='${n+octave}: Space to hear, Enter to insert'>${n}</button>`).join('');}
async function previewNote(note:string){try{const p={...DEFAULT_PRESETS.find(p=>p.kind==='lead')!,name:'preview-note',waveform:'triangle',advanced:{note},volume:.3,space:0,length:.3};await engine.previewPreset(p);}catch(e){toast(String(e));}}

function stopDesignerPreview(){++designerPreviewGeneration;clearTimeout(designerPreviewTimer);engine.stop();}
async function previewDesigner(preset:SoundPreset,mode:DesignerMode,repeat:boolean,note?:string){
 if(job)throw new Error('Finish or cancel the export before previewing a sound.');
 stop();const generation=++designerPreviewGeneration;
 let code=designerCode(preset,mode);
 if(note)code=code.replace(/^  notes:.*$/m,'  notes: '+note+' rest rest rest');
 const track=code.match(/^track: (.+)$/m)![1];
 const ending=repeat?'':'\n\narrange:\n  section: preview\n    bars: 1\n    tracks: '+track;
 const song=compile('tempo: 100 bpm\n\n'+code+ending);
 if(song.errors.length)throw new Error(song.errors[0].message);
 await configureSounds();if(generation!==designerPreviewGeneration)return;
 await engine.play(song,{master:mix.master,muted:new Set(),solo:new Set()});
 if(generation!==designerPreviewGeneration)return;
 // A one-bar arrangement pauses new notes while allowing release and effect tails to finish.
}
function renderDesigner(){designerUI?.destroy();designerUI=mountDesigner($('page-designer'),designer,{
 onChange:p=>{designer=p;},onPreview:previewDesigner,onStop:stopDesignerPreview,
 onNote:(p,note)=>previewDesigner(p,'notes',false,note),
 onSave:async p=>{designer=p;await saveDesigner();},
 onInsert:async(p,mode)=>{stopDesignerPreview();designer=p;insertDesignerCode(p,mode);await save();}
});}
function insertDesignerCode(preset:SoundPreset,mode:DesignerMode){
 insertTrackBlock(designerCode(preset,mode));
}
function insertTrackBlock(block:string){
 const usedNames=new Set(compilation.tracks.map(track=>track.name)),names:string[]=[];
 block=block.replace(/^track: (.+)$/gm,(_line,base:string)=>{let name=base,index=2;while(usedNames.has(name))name=base+'-'+index++;usedNames.add(name);names.push(name);return 'track: '+name;});
 if(!names.length)throw new Error('The example needs at least one track.');
 let source=editor.getSource(),sectionName='';
 const arrangement=compilation.statements.find(s=>s.name==='arrange');
 if(arrangement){const section=arrangement.children.find(s=>s.line===selectedSectionLine)||arrangement.children[0];const tracks=section?.children.find(s=>s.name==='tracks');if(tracks){const lines=source.split('\n'),line=lines[tracks.line-1],comment=line.indexOf('//'),code=comment<0?line:line.slice(0,comment);lines[tracks.line-1]=code.trimEnd()+' '+names.join(' ')+(comment<0?'':' '+line.slice(comment));source=lines.join('\n');sectionName=section.value;}}
 editor.setSource(source+'\n\n'+block+'\n');navigate('studio');editor.gotoLine(editor.getSource().split('\n').findIndex(line=>line==='track: '+names[0])+1);
 toast(sectionName?'Added full sound code to section '+sectionName+'. Press Play to hear it.':'Added full sound code. Press Play to hear it.');
}
function instrumentExample(instrument:BuiltinInstrument){
 const name=instrument.id.replace(/^(vcsl|vsco|karoryfer)_/, '').replace(/_/g,'-');
 return 'track: '+name+'\n  // '+instrument.name+' · CC0 recording; see included credits\n  sound: '+instrument.id+'\n  notes: '+(instrument.exampleNotes||'C4 E4 G4 E4')+'\n  volume: 35%\n  reverb: '+(instrument.category?.toLowerCase()==='drums'?'0%':'10%');
}
function kitExample(kit:typeof BUILTIN_KITS[number]){
 return kit.tracks.map(track=>'track: '+kit.id.replace(/_/g,'-')+'-'+track.sound.replace(/^(vcsl|vsco|karoryfer)_/, '').replace(/_/g,'-')+'\n  // '+kit.name+' · CC0 recording; see included credits\n  sound: '+track.sound+'\n  notes: '+track.notes+'\n  volume: '+Math.round((track.volume??.35)*100)+'%\n  reverb: 0%').join('\n\n');
}
async function saveDesigner(){
 const name=designer.name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-|-$/g,'');
 if(!name)throw new Error('Give your sound a name, such as my-bass.');
 if(samples.some(s=>s.name===name))throw new Error('That name belongs to a sample. Choose another sound name.');
 const preset={...normalizeDesignerPreset(designer),id:uid(),name};const existing=library.findIndex(p=>p.name===name);
 if(existing>=0)library[existing]=preset;else library.push(preset);
 const local=project.presets.findIndex(p=>p.name===name);if(local>=0)project.presets[local]=preset;else project.presets.push(preset);
 designer=preset;await saveLibraryPresets(library);await configureSounds();await save();toast('Saved '+name+' as an editable instrument.');
}
function renderLibrary(){const filter=$<HTMLInputElement>('library-search')?.value||'';$('page-library').innerHTML=`<div class='page-heading'><div><div class='eyebrow'>Every sound has a home</div><h1>Sound Library</h1><p>Real instruments, your original sounds, and uploaded recordings, ready for any song.</p></div><button id='open-designer' class='primary'>＋ Design a sound</button></div><p>Included instruments and drum kits use recordings shared under <a href='https://creativecommons.org/publicdomain/zero/1.0/' target='_blank' rel='noopener noreferrer'>CC0</a>. You can use them in songs and share them with your app. See the <a href='licenses/' target='_blank' rel='noopener noreferrer'>included sources and credits</a>. Copyright rules for recordings you upload may differ.</p><div id='drop-zone' class='upload-area'><h3>Bring your own recording</h3><p>Drop audio files here, or choose files. WAV, MP3, and browser-readable audio · up to 64 MB per file.</p><button id='upload-samples'>Upload samples</button></div><div class='page-toolbar'><input id='library-search' placeholder='Search names or types, like guitar, strings, bass, or drums…' value='${esc(filter)}' aria-label='Search sounds'><span class='badge'>${BUILTIN_INSTRUMENTS.length} instruments · ${BUILTIN_KITS.length} drum kits · ${library.length} sounds · ${samples.length} samples</span></div><div id='library-items' class='library-grid'></div>`;renderLibraryItems(filter);const dz=$('drop-zone');dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('dragover');});dz.addEventListener('dragleave',()=>dz.classList.remove('dragover'));dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('dragover');void uploadFiles([...((e as DragEvent).dataTransfer?.files||[])]);});$('library-search').addEventListener('input',()=>renderLibraryItems($<HTMLInputElement>('library-search').value));}
function renderLibraryItems(filter=''){const q=filter.toLowerCase();$('library-items').innerHTML=[...BUILTIN_KITS.filter(p=>[p.name,p.description,p.id,'drums kit percussion'].join(' ').toLowerCase().includes(q)).map(p=>`<article class='library-item'><div class='kind'>● Drum kit · CC0</div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><small>${p.tracks.length} sounds played together · Listen plays one bar</small><div class='item-actions'><button data-preview-kit='${esc(p.id)}' aria-label='Listen to ${esc(p.name)}'>▶ Listen</button><button data-use-kit='${esc(p.id)}'>Insert example</button></div><details><summary>See code example</summary><pre style='white-space:pre-wrap;overflow-wrap:anywhere'><code>${esc(kitExample(p))}</code></pre></details></article>`),...BUILTIN_INSTRUMENTS.filter(p=>[p.name,p.description,p.id,p.category].join(' ').toLowerCase().includes(q)).map(p=>`<article class='library-item'><div class='kind' style='color:${colorForSound(p.id)}'>● ${esc(p.category||'Recorded instrument')} · CC0</div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><small>${Object.keys(p.samples).length} ${p.category?.toLowerCase()==='drums'?'recordings':'recorded notes'} · included with the app</small><div class='item-actions'><button data-preview-instrument='${esc(p.id)}' aria-label='Listen to ${esc(p.name)}'>▶ Listen</button><button data-use-instrument='${esc(p.id)}'>Insert example</button></div><details><summary>See code example</summary><pre style='white-space:pre-wrap;overflow-wrap:anywhere'><code>${esc(instrumentExample(p))}</code></pre></details></article>`),...library.filter(p=>[p.name,p.kind].join(' ').includes(q)).map(p=>`<article class='library-item'><div class='kind' style='color:${colorForSound(p.name)}'>● ${p.kind} · original synthesis</div><h3>${esc(p.name)}</h3><small>Reusable sound · ${Math.round(p.volume*100)}% volume</small><div class='item-actions'><button data-preview-preset='${esc(p.id)}'>▶ Preview</button><button data-edit-preset='${esc(p.id)}'>Edit</button><button data-use-preset='${esc(p.id)}'>Use</button></div></article>`),...samples.filter(s=>s.name.includes(q)).map(s=>`<article class='library-item'><div class='kind' style='color:${s.color||colorForSound(s.name)}'>● Uploaded sample</div><h3>${esc(s.name)}</h3><small>${(s.blob.size/1024/1024).toFixed(2)} MB · saved locally</small><div class='item-actions'><button data-preview-sample='${esc(s.id)}'>▶ Preview</button><button data-use-sample='${esc(s.id)}'>Use</button><button data-delete-sample='${esc(s.id)}' class='danger'>Delete</button></div><div class='form-row'><label>Original note (optional)<input class='upload-root' data-root='${esc(s.id)}' placeholder='C4' value='${esc(s.rootNote||'')}' aria-label='Original note for ${esc(s.name)}'></label></div></article>`)].join('')||'<div class=\"empty\">No matching sounds. Try another name.</div>';}
async function uploadFiles(files:File[]){for(const file of files){try{if(file.size>64*1024*1024)throw new Error('This file is larger than 64 MB. Try a shorter recording.');status('Reading '+file.name+'…');await engine.initialize();await engine.context!.decodeAudioData(await file.arrayBuffer());let name=file.name.replace(/\.[^.]+$/,'').toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-|-$/g,'').slice(0,180)||'my-sample';const base=name;let i=2;while(samples.some(s=>s.name.toLowerCase()===name)||[...DEFAULT_PRESETS,...library,...project.presets].some(p=>p.name.toLowerCase()===name||p.id.toLowerCase()===name)||engine.isReservedSoundName(name)){name=base+'-'+i++;}const asset:SampleAsset={id:uid(),name,blob:file,color:colorForSound(name)};await saveSample(asset);samples.push(asset);toast('Added '+name+' to your library.');}catch(e){toast(`${file.name}: ${String(e)}`);}}await configureSounds();status('Your sound library is ready.');if(page==='library')renderLibrary();}
async function previewSample(sample:SampleAsset){await engine.initialize();const buffer=await engine.context!.decodeAudioData(await sample.blob.arrayBuffer());const source=engine.context!.createBufferSource(),gain=engine.context!.createGain();source.buffer=buffer;gain.gain.value=.5;source.connect(gain).connect(engine.context!.destination);source.start();source.stop(engine.context!.currentTime+Math.min(buffer.duration,8));}
function addTrack(name:string,sample=false){navigate('studio');let track=name+'-part',i=2;while(compilation.tracks.some(t=>t.name===track))track=name+'-part-'+i++;const block=sample?'  play: '+name+' rest '+name+' rest':'  sound: '+name+'\n  notes: C4 E4 G4 E4';editor.append('\n\ntrack: '+track+'\n'+block+'\n  volume: 30%\n');if(compilation.sections.length)toast('Track added. Add '+track+' to a section’s tracks: line to hear it in your arrangement.');}
async function loadProject(p:Project,preserveCurrent=true){if(preserveCurrent)await save();stop();selectedSectionLine=0;clearTimeout(saveTimer);project=structuredClone(p);project.presets=project.presets?.length?project.presets:structuredClone(DEFAULT_PRESETS);$<HTMLInputElement>('project-name').value=project.name;mix.muted.clear();mix.solo.clear();loopOn=false;delete mix.loopStart;delete mix.loopEnd;$('loop-toggle').classList.remove('active');$('loop-toggle').setAttribute('aria-pressed','false');editor.setSource(project.source,true);editor.setSliders(project.sliders||[]);selectedView=project.views?.[0]||compilation.views[0]||'piano roll';renderViewTabs();await configureSounds();navigate('studio');await save();toast('Opened '+project.name);}
async function importBundle(file:File){
  await save();await engine.initialize();
  const data=await importProject(file);
  const incomingOwners=new Map<string,string>();
  for(const asset of data.samples){
    if(!normalizeSoundReference(asset.name))throw new Error('An imported sample has an empty sound name.');
    for(const alias of [asset.name,asset.id]){
      const key=normalizeSoundReference(alias),owner=incomingOwners.get(key);
      if(owner&&owner!==asset.id)throw new Error('Imported samples have ambiguous sound names or IDs. Rename them in the original project and download a new backup.');
      incomingOwners.set(key,asset.id);
    }
  }
  const presetNames=new Set([...DEFAULT_PRESETS,...library,...data.project.presets].flatMap(p=>[normalizeSoundReference(p.name),normalizeSoundReference(p.id)]));
  const localOccupied=new Set([...samples.flatMap(s=>[normalizeSoundReference(s.name),normalizeSoundReference(s.id)]),...presetNames]);
  const occupied=new Set([...localOccupied,...incomingOwners.keys()]);
  const usedIds=new Set([...(await getProjects()).map(p=>p.id),...samples.map(s=>s.id),...data.samples.map(s=>s.id),...data.project.presets.map(p=>p.id)]);
  const newId=()=>{let id=uid();while(usedIds.has(id)||occupied.has(normalizeSoundReference(id))||engine.isReservedSoundName(id))id=uid();usedIds.add(id);occupied.add(normalizeSoundReference(id));return id;};
  data.project.id=newId();data.project.name=data.project.name.slice(0,189)+' (imported)';
  const additions:SampleAsset[]=[],remapped:string[]=[],replacements=new Map<string,string>();
  const record=(previous:string,next:string)=>{
    for(const alias of new Set([previous,normalizeSoundReference(previous)])){
      const prior=replacements.get(alias);
      if(prior!==undefined&&prior!==next)throw new Error('Imported samples have ambiguous sound references. Nothing was imported.');
      replacements.set(alias,next);
    }
  };
  for(const asset of data.samples){
    const oldName=asset.name,oldId=asset.id;
    let reuse:SampleAsset|undefined;
    if(!presetNames.has(normalizeSoundReference(oldName))&&!engine.isReservedSoundName(oldName)){
      const candidates=samples.filter(s=>s.name===oldName&&s.rootNote===asset.rootNote&&s.blob.type===asset.blob.type&&s.blob.size===asset.blob.size);
      const right=new Uint8Array(await asset.blob.arrayBuffer());
      for(const candidate of candidates){
        const left=new Uint8Array(await candidate.blob.arrayBuffer());
        if(left.every((value,index)=>value===right[index])){reuse=candidate;break;}
      }
    }
    if(reuse){
      record(oldName,reuse.name);if(normalizeSoundReference(oldId)!==normalizeSoundReference(oldName))record(oldId,reuse.id);remapped.push(reuse.id);continue;
    }
    if(localOccupied.has(normalizeSoundReference(oldName))||engine.isReservedSoundName(oldName)){
      let suffix=2;const withSuffix=(n:number)=>oldName.slice(0,199-String(n).length)+'-'+n;let candidate=withSuffix(suffix);
      while(occupied.has(normalizeSoundReference(candidate))||engine.isReservedSoundName(candidate))candidate=withSuffix(++suffix);
      asset.name=candidate;
    }
    occupied.add(normalizeSoundReference(asset.name));
    asset.id=newId();
    record(oldName,asset.name);if(normalizeSoundReference(oldId)!==normalizeSoundReference(oldName))record(oldId,asset.id);
    additions.push(asset);remapped.push(asset.id);
  }
  data.project.source=remapSoundReferences(data.project.source,replacements);
  if(data.project.workingSource!==undefined)data.project.workingSource=remapSoundReferences(data.project.workingSource,replacements);
  data.project.sampleIds=[...new Set(remapped)];
  await saveImportedProject(data.project,additions);
  samples.push(...additions);await loadProject(data.project,false);
  toast('Imported a copy with its original recordings.');
}
async function renderProjects(){await save();projects=await getProjects();$('page-projects').innerHTML=`<div class='page-heading'><div><div class='eyebrow'>Keep your ideas close</div><h1>My Projects</h1><p>Saved on this browser. Download a bundle to keep a separate backup.</p></div><div class='item-actions'><button id='import-project'>Import bundle</button><button id='new-project' class='primary'>＋ New song</button></div></div><div class='project-grid'>${projects.map(p=>`<article class='project-item'><div class='kind' style='font-size:9px;color:#a087b0'>MUSIC PROJECT</div><h3 style='margin-top:12px'>${esc(p.name)}</h3><div class='date'>Updated ${new Date(p.modified).toLocaleString()}</div><div class='item-actions'><button data-open-project='${p.id}' class='primary'>Open</button><button data-backup-project='${p.id}'>Download bundle</button><button data-delete-project='${p.id}' class='danger'>Delete</button></div></article>`).join('')||'<div class=\"empty\">Your saved songs will appear here.</div>'}</div><p class='footer-note'>A project bundle includes its code, sound definitions, and the uploaded recordings it uses.</p>`;}

function openExport(format:'wav'|'mp3',sectionLine?:number){if(compilation.errors.length){toast('Fix the marked code before exporting.');return;}$<HTMLSelectElement>('export-format').value=format;$<HTMLSelectElement>('export-mode').value=compilation.totalBars===null?'bars':'whole';$<HTMLInputElement>('export-start').value='1';$<HTMLInputElement>('export-end').value=String(compilation.totalBars||16);if(sectionLine){const s=compilation.sections.find(s=>s.line===sectionLine);if(s){$<HTMLSelectElement>('export-mode').value='bars';$<HTMLInputElement>('export-start').value=String(s.startBar);$<HTMLInputElement>('export-end').value=String(s.startBar+s.bars-1);}}$('export-progress').classList.remove('visible');$('export-problem').textContent='';updateExport();($('export-dialog') as HTMLDialogElement).showModal();}
function exportRange(){const mode=$<HTMLSelectElement>('export-mode').value;let start=Number($<HTMLInputElement>('export-start').value),end=Number($<HTMLInputElement>('export-end').value);if(mode==='whole'){start=1;end=compilation.totalBars||16;}if(mode==='minutes'){const seconds=Number($<HTMLInputElement>('export-minutes').value)*60;if(!(seconds>0&&Number.isFinite(seconds)))throw new Error('Choose a positive number of minutes.');start=1;end=seconds*compilation.tempo/(60*compilation.beatsPerBar);if(compilation.sections.length)throw new Error('For an arranged song, select its musical bars.');}if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || (mode === 'minutes' ? end <= 0 : end < start)) {
  throw new Error(mode === 'minutes' ? 'Choose a positive export duration.' : 'End bar must be at or after a positive start bar.');
}if(mode!=='minutes'&&(!Number.isInteger(start)||!Number.isInteger(end)))throw new Error('Bar numbers must be whole numbers.');if(compilation.totalBars!==null&&end>compilation.totalBars)throw new Error('The range ends beyond the song.');const seconds=mode==='minutes'?Number($<HTMLInputElement>('export-minutes').value)*60:durationForRange(compilation,start,end);const tail=$<HTMLSelectElement>('export-tail-mode').value==='cut'?0:Number($<HTMLInputElement>('export-tail').value);if(!Number.isFinite(tail)||tail<0||tail>30)throw new Error('Effect tail must be between 0 and 30 seconds.');return{start,end,seconds,tail};}
function updateExport(){const mode=$<HTMLSelectElement>('export-mode').value;$('export-total-bars').textContent=compilation.totalBars===null?'Repeating':compilation.totalBars+' bars';$('export-total-time').textContent=compilation.totalSeconds===null?'Choose a length':describeDuration(compilation.totalSeconds);$('export-bars-row').hidden=mode!=='bars';$('export-minutes-row').hidden=mode!=='minutes';$<HTMLInputElement>('export-tail').disabled=$<HTMLSelectElement>('export-tail-mode').value==='cut';$<HTMLOptionElement>('export-mode').querySelector<HTMLOptionElement>('option[value=whole]')!.disabled=compilation.totalBars===null;$<HTMLOptionElement>('export-mode').querySelector<HTMLOptionElement>('option[value=minutes]')!.disabled=compilation.sections.length>0;$('export-go').textContent='Export '+$<HTMLSelectElement>('export-format').value.toUpperCase();try{const r=exportRange();$('export-selection-time').textContent=exportTime(r.seconds);$('export-final-time').textContent=exportTime(r.seconds+r.tail);$('export-problem').textContent='';$<HTMLButtonElement>('export-go').disabled=!!job;}catch(e){$('export-problem').textContent=String(e);$<HTMLButtonElement>('export-go').disabled=true;}}
async function runExport(){if(job)return;let r;try{r=exportRange();}catch(e){toast(String(e));return;}const controller=new AbortController();job=controller;document.body.classList.add('exporting');editor.view.dom.inert=true;$('export-progress').classList.add('visible');$<HTMLButtonElement>('export-go').disabled=true;$<HTMLButtonElement>('export-close').disabled=true;$('export-dialog').querySelectorAll<HTMLInputElement|HTMLSelectElement>('input,select').forEach(el=>el.disabled=true);try{await configureSounds();const format=$<HTMLSelectElement>('export-format').value as 'wav'|'mp3';const output=await engine.exportAudio({compilation:structuredClone(compilation),mix:{...mix,muted:new Set(mix.muted),solo:new Set(mix.solo),loopStart:undefined,loopEnd:undefined},startBar:r.start,endBar:r.end,tailSeconds:r.tail,format,onProgress(fraction,label){$<HTMLProgressElement>('export-progress-bar').value=fraction;$('export-progress-text').textContent=label;},signal:controller.signal});download(output.blob,project.name.replace(/[^\w -]/g,'')+'.'+format);status('Exported '+format.toUpperCase()+'. Your song is ready to keep.');toast('Your '+format.toUpperCase()+' download is ready.');($('export-dialog') as HTMLDialogElement).close();}catch(e){if(controller.signal.aborted){status('Export cancelled.');$('export-progress-text').textContent='Export cancelled.';}else{$('export-problem').textContent=String(e);toast('Export could not finish: '+String(e));}}finally{job=null;document.body.classList.remove('exporting');editor.view.dom.inert=false;$<HTMLButtonElement>('export-close').disabled=false;$('export-dialog').querySelectorAll<HTMLInputElement|HTMLSelectElement>('input,select').forEach(el=>el.disabled=false);updateExport();}}

editor=createEditor($('editor'),project.source,{change:changed,selection(line){currentLine=line;selectSectionLine(line);$('line-position').textContent=`Ln ${line} · ${editor.view.state.doc.lines} lines`;},help:openHelp,sliders(lines){project.sliders=lines;scheduleSave();}});
$('legend').innerHTML=categories.filter(c=>c.id!=='connections').map(c=>`<span><i style='background:${c.color}'></i>${esc(c.title)}</span>`).join('');
studioPiano=mountStudioPiano($('studio-piano'),{onNote:auditionStudioNote,onInsert:note=>editor.insert(note+' ')});refreshStudioPianoSounds();
syncPane();renderCommands();renderTracks();renderSections();renderLength();renderViewTabs();renderKeys();
$('commands-toggle').onclick=()=>{paneOpen=!paneOpen;syncPane();};$('pane-close').onclick=()=>{paneOpen=false;syncPane();};$('command-search').oninput=renderCommands;
$('play').onclick=()=>void play();$('stop').onclick=stop;$('apply').onclick=()=>void applyChanges();$('undo').onclick=()=>editor.undo();$('redo').onclick=()=>editor.redo();$('tidy').onclick=()=>{try{editor.setSource(tidy(editor.getSource()));toast('Spacing is tidy. Your command order is preserved.');}catch(e){toast(String(e));}};$('restore').onclick=()=>{if(project.workingSource){editor.setSource(project.workingSource);toast('Restored the last version that played successfully.');}else toast('Play a valid song first to keep a working version.');};$('add-slider').onclick=()=>{const text=editor.view.state.doc.line(currentLine).text;const colon=text.indexOf(':');const spec=resolveCommand(text.slice(0,colon).trim());if(colon<0||!spec?.slider||!parseSliderNumber(text.slice(colon+1))){toast('Choose a command with one number, such as volume: 30%, then add its slider.');return;}editor.addSlider(currentLine);};
$('project-name').oninput=()=>{project.name=$<HTMLInputElement>('project-name').value||'Untitled song';scheduleSave();};
$('master-volume').oninput=()=>{mix.master=Number($<HTMLInputElement>('master-volume').value)/100;$('master-value').textContent=Math.round(mix.master*100)+'%';engine.setMix(mix);};
$('export-wav').onclick=()=>openExport('wav',selectedSectionLine);$('export-mp3').onclick=()=>openExport('mp3',selectedSectionLine);$('export-close').onclick=()=>($('export-dialog') as HTMLDialogElement).close();$('export-cancel').onclick=()=>{if(job)job.abort();else($('export-dialog') as HTMLDialogElement).close();};$('export-go').onclick=()=>void runExport();['export-mode','export-format','export-start','export-end','export-minutes','export-tail-mode','export-tail'].forEach(id=>$(id).addEventListener('input',updateExport));
$('export-dialog').addEventListener('cancel',e=>{if(job){e.preventDefault();job.abort();}});
$('help-close').onclick=()=>($('help-dialog') as HTMLDialogElement).close();$('help-insert').onclick=()=>{($('help-dialog') as HTMLDialogElement).close();if(helpSpec)insertCommand(helpSpec);};$('help-guide').onclick=()=>{($('help-dialog') as HTMLDialogElement).close();navigate('guide');if(helpSpec){$<HTMLInputElement>('reference-search').value=helpSpec.name;renderReferenceResults(helpSpec.name);}};
$('note-toggle').onclick=()=>{$('note-helper').hidden=!$('note-helper').hidden;$('note-toggle').setAttribute('aria-expanded',String(!$('note-helper').hidden));};$('note-octave').onchange=renderKeys;$('note-scale').onchange=renderKeys;
$('visual-track').onchange=()=>visualTrack=$<HTMLSelectElement>('visual-track').value;
$('loop-toggle').onclick=()=>{loopOn=!loopOn;try{setLoop();$('loop-toggle').classList.toggle('active',loopOn);$('loop-toggle').setAttribute('aria-pressed',String(loopOn));engine.setMix(mix);status(loopOn?'Looping selected bars.':'Playing the song arrangement.');}catch(e){loopOn=false;setLoop();$('loop-toggle').classList.remove('active');$('loop-toggle').setAttribute('aria-pressed','false');engine.setMix(mix);toast(String(e));}};['loop-start','loop-end'].forEach(id=>$(id).addEventListener('change',()=>{if(loopOn){try{setLoop();engine.setMix(mix);}catch(e){toast(String(e));}}}));
$('sample-files').addEventListener('change',()=>{const input=$<HTMLInputElement>('sample-files');void uploadFiles([...input.files||[]]);input.value='';});
$('project-file').addEventListener('change',async()=>{const input=$<HTMLInputElement>('project-file');const file=input.files?.[0];if(!file)return;try{await importBundle(file);}catch(e){toast('Could not import: '+String(e));}input.value='';});
document.addEventListener('click',async e=>{const target=(e.target as HTMLElement).closest<HTMLElement>('button');if(!target)return;const d=target.dataset;try{
 if(d.page){navigate(d.page);return;}if(d.command){openHelp(d.command);return;}if(d.category){guideCategory=d.category;document.querySelectorAll<HTMLElement>('[data-category]').forEach(el=>el.setAttribute('aria-current',el.dataset.category===guideCategory?'location':'false'));$('category-'+d.category)?.scrollIntoView({behavior:'smooth',block:'start'});return;}if(d.insert){const c=resolveCommand(d.insert);if(c)insertCommand(c);return;}
 if(d.commandPractice){const c=resolveCommand(d.commandPractice);if(c){target.setAttribute('disabled','');try{const practice=getCommandPractice(c);await save();($('help-dialog') as HTMLDialogElement).close();await loadProject({version:1,id:uid(),name:c.name+' · command practice',source:practice.source,presets:structuredClone(DEFAULT_PRESETS),sampleIds:[],sliders:[],views:['piano roll'],modified:Date.now()},false);}finally{target.removeAttribute('disabled');}}return;}
 if(d.line||d.trackLine){editor.gotoLine(Number(d.line||d.trackLine));return;}if(d.mute||d.solo){const set=d.mute?mix.muted:mix.solo;const id=(d.mute||d.solo)!;if(set.has(id))set.delete(id);else set.add(id);engine.setMix(mix);renderTracks();return;}
 if(d.section){const s=compilation.sections.find(s=>s.line===Number(d.section));if(s){editor.gotoLine(s.line);$<HTMLInputElement>('loop-start').value=String(s.startBar);$<HTMLInputElement>('loop-end').value=String(s.startBar+s.bars-1);openExport('wav',s.line);}return;}
 if(d.view){selectedView=d.view;project.views=[selectedView];renderViewTabs();scheduleSave();return;}
 if(d.note){await previewNote(d.note);return;}
 if(d.kind){designer=structuredClone(DEFAULT_PRESETS.find(p=>p.kind===d.kind)!);renderDesigner();return;}
 if(d.example!==undefined){const example=EXAMPLES[Number(d.example)];if(example){await save();await loadProject({version:1,id:uid(),name:example.name+' · practice',source:example.source,presets:structuredClone(DEFAULT_PRESETS),sampleIds:[],sliders:[],views:['piano roll'],modified:Date.now()});}return;}
 if(d.previewInstrument){if(job)throw new Error('Finish or cancel the export before trying an instrument.');const label=target.textContent;target.setAttribute('disabled','');target.textContent='Loading…';try{await engine.previewInstrument(d.previewInstrument,BUILTIN_INSTRUMENTS.find(p=>p.id===d.previewInstrument)?.previewNote||'C4');status('Playing '+(BUILTIN_INSTRUMENTS.find(p=>p.id===d.previewInstrument)?.name||'instrument')+'.');}finally{target.removeAttribute('disabled');target.textContent=label;}return;}
 if(d.previewKit){if(job)throw new Error('Finish or cancel the export before trying a kit.');const label=target.textContent;target.setAttribute('disabled','');target.textContent='Loading…';try{await engine.previewKit(d.previewKit);status('Playing '+(BUILTIN_KITS.find(p=>p.id===d.previewKit)?.name||'drum kit')+'.');}finally{target.removeAttribute('disabled');target.textContent=label;}return;}
 if(d.useKit){if(job)throw new Error('Finish or cancel the export before adding a kit.');const kit=BUILTIN_KITS.find(p=>p.id===d.useKit);if(kit){stop();insertTrackBlock(kitExample(kit));await save();}return;}
 if(d.useInstrument){if(job)throw new Error('Finish or cancel the export before adding an instrument.');const instrument=BUILTIN_INSTRUMENTS.find(p=>p.id===d.useInstrument);if(instrument){stop();insertTrackBlock(instrumentExample(instrument));await save();}return;}
 if(d.previewPreset){const p=library.find(p=>p.id===d.previewPreset);if(p)await engine.previewPreset(p);return;}
 if(d.editPreset){const p=library.find(p=>p.id===d.editPreset);if(p){designer=structuredClone(p);navigate('designer');}return;}
 if(d.usePreset){const p=library.find(p=>p.id===d.usePreset);if(p){stop();insertDesignerCode(p,p.kind==='kick'||p.kind==='snare'?'drums':p.kind==='bass'?'bass':'notes');await save();}return;}
 if(d.previewSample){const s=samples.find(s=>s.id===d.previewSample);if(s)await previewSample(s);return;}
 if(d.useSample){const s=samples.find(s=>s.id===d.useSample);if(s){addTrack(s.name,true);}return;}
 if(d.deleteSample){const s=samples.find(s=>s.id===d.deleteSample);if(s){const used=(await getProjects()).some(p=>[p.source,p.workingSource||''].some(source=>sampleReferenced(source,s.name)||sampleReferenced(source,s.id)));if(used){toast('This sample is in a saved song or its working version. Play the updated song before deleting it.');return;}if(!window.confirm('Delete sample “'+s.name+'” from this browser? This cannot be undone.'))return;await deleteSample(s.id);samples=samples.filter(x=>x.id!==s.id);renderLibrary();}return;}
 if(d.openProject){const p=projects.find(p=>p.id===d.openProject);if(p)await loadProject(p);return;}
 if(d.backupProject){await save();const p=(await getProjects()).find(p=>p.id===d.backupProject);if(p)download(await exportProject(p,samples),p.name+'.music.zip');return;}
 if(d.deleteProject){const target=d.deleteProject;const saved=projects.find(p=>p.id===target);if(!saved||!window.confirm('Delete project “'+saved.name+'” from this browser? This cannot be undone. Download a bundle first if you want to keep it.'))return;if(target===project.id){clearTimeout(saveTimer);const other=(await getProjects()).find(p=>p.id!==target);await loadProject(other||{version:1,id:uid(),name:'Untitled song',source:EXAMPLES[0].source,presets:structuredClone(DEFAULT_PRESETS),sampleIds:[],sliders:[],views:['piano roll'],modified:Date.now()},false);}await deleteProject(target);await renderProjects();return;}
 switch(target.id){case 'open-designer':navigate('designer');break;case 'upload-samples':$<HTMLInputElement>('sample-files').click();break;case 'import-project':$<HTMLInputElement>('project-file').click();break;case 'new-project':await save();await loadProject({version:1,id:uid(),name:'Untitled song',source:'tempo: 120 bpm\n\ntrack: melody\n  sound: triangle\n  notes: C4 E4 G4 E4\n  volume: 30%\n',presets:structuredClone(DEFAULT_PRESETS),sampleIds:[],sliders:[],views:['piano roll'],modified:Date.now()});break;}
 }catch(error){toast(String(error));}});
document.addEventListener('dblclick',e=>{const target=(e.target as HTMLElement).closest<HTMLElement>('[data-note]');if(target)editor.insert(target.dataset.note+' ');});
document.addEventListener('change',async e=>{const target=e.target as HTMLInputElement;try{if(target.dataset.root){const s=samples.find(s=>s.id===target.dataset.root);if(s){const note=target.value.trim();if(note&&!/^[A-Ga-g][#b]?-?\d$/.test(note)){toast('Use a note name such as C4 or F#3.');return;}s.rootNote=note||undefined;await saveSample(s);await configureSounds();}}}catch(error){toast(String(error));}});
document.addEventListener('keydown',e=>{const note=(e.target as HTMLElement).closest<HTMLElement>('[data-note]');if(note&&e.key==='Enter'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();if(!e.repeat)editor.insert(note.dataset.note+' ');return;}if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();if(page==='designer'){document.getElementById('ds-preview')?.click();}else void(engine.state.playing?applyChanges():play());}if(e.key==='Escape'&&!document.querySelector('dialog[open]')){if(page==='designer')document.getElementById('ds-stop')?.click();else stop();}});

const canvas=$<HTMLCanvasElement>('visual-canvas'),ctx=canvas.getContext('2d')!;
let lastUI=0;
function animate(now:number){requestAnimationFrame(animate);if(page==='designer'){const state=engine.state,current=Math.max(0,state.bar-1);const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];const notes=state.playing?engine.getEvents(Math.floor(current),Math.floor(current)+1).filter(e=>e.start<=current&&e.end>current&&e.note!==null).map(e=>{const n=Math.round(e.note!);return names[((n%12)+12)%12]+(Math.floor(n/12)-1);}):[];designerUI?.showPlayingNotes(notes);return;}if(page!=='studio')return;const pianoState=engine.state,pianoCycle=Math.max(0,pianoState.bar-1),pitchNames=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];studioAuditions=studioAuditions.filter(n=>n.until>now);const songNotes=pianoState.playing?engine.getEvents(Math.floor(pianoCycle),Math.floor(pianoCycle)+1).filter(e=>e.start<=pianoCycle&&e.end>pianoCycle&&e.note!==null).map(e=>{const n=Math.round(e.note!);return pitchNames[((n%12)+12)%12]+(Math.floor(n/12)-1);}):[];studioPiano?.showPlayingNotes([...songNotes,...studioAuditions.map(n=>n.note)]);const rect=canvas.getBoundingClientRect(),ratio=devicePixelRatio||1;const w=rect.width,h=rect.height;if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle='#202827';ctx.fillRect(0,0,w,h);const state=engine.state;const current=Math.max(0,state.bar-1);const first=Math.floor(current/4)*4;let events:any[]=[];try{events=engine.getEvents(first,first+4).filter(e=>visualTrack==='all'||e.track===visualTrack);}catch{}const left=43,right=w-15,top=15,bottom=h-25;ctx.font='9px system-ui';ctx.lineWidth=1;ctx.strokeStyle='#354540';ctx.fillStyle='#b2c6bd';
 if(selectedView==='waveform'||selectedView==='spectrum'){const analyser=engine.analyser;if(analyser){const values=new Uint8Array(analyser.frequencyBinCount);if(selectedView==='waveform'){analyser.getByteTimeDomainData(values);ctx.beginPath();ctx.strokeStyle='#80e8bd';ctx.lineWidth=1.5;for(let i=0;i<values.length;i++){const x=i/(values.length-1)*w,y=values[i]/255*h;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}else{analyser.getByteFrequencyData(values);for(let i=0;i<80;i++){const x=i/80*w,index=Math.floor(Math.pow(i/80,2)*values.length);const bh=values[index]/255*(h-25);ctx.fillStyle='hsl('+ (150+i*.25)+' 55% '+(75-i*.15)+'%)';ctx.fillRect(x,h-bh-12,w/80-2,bh);}}}else{ctx.fillText('Press Play to see your sound.',25,h/2);}}
 else if(selectedView==='spiral'||selectedView==='pitch wheel'){const cx=w/2,cy=h/2,r=Math.min(h*.36,w*.3);ctx.strokeStyle='#42564e';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();if(selectedView==='pitch wheel'){const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];for(let i=0;i<12;i++){const angle=i/12*Math.PI*2-Math.PI/2;ctx.fillText(names[i],cx+Math.cos(angle)*(r+15)-5,cy+Math.sin(angle)*(r+15)+3);}}for(const e of events){const angle=selectedView==='pitch wheel'?((e.note??60)%12)/12*Math.PI*2-Math.PI/2:(e.start-first)/4*Math.PI*6-Math.PI/2;const rad=selectedView==='pitch wheel'?r:r*(.35+.65*(e.start-first)/4);ctx.fillStyle=e.color&&CSS.supports('color',e.color)?e.color:colorForSound(e.sound||e.track);const active=state.playing&&e.start<=current&&e.end>current;ctx.globalAlpha=active?1:.35;ctx.beginPath();ctx.arc(cx+Math.cos(angle)*rad,cy+Math.sin(angle)*rad,active?6:3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
 else{const noteValues=events.map(e=>e.note).filter((n):n is number=>n!==null);const low=Math.min(48,...noteValues),high=Math.max(84,...noteValues);const trackNames=compilation.tracks.map(t=>t.id);const rows=selectedView==='punchcard'?Math.max(1,trackNames.length):12;for(let i=0;i<=rows;i++){const y=top+(bottom-top)*i/rows;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke();}for(let i=0;i<=16;i++){const x=left+(right-left)*i/16;ctx.strokeStyle=i%4===0?'#496257':'#303d38';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();if(i%4===0&&i<16)ctx.fillText('BAR '+String(first+i/4+1).padStart(2,'0'),x+4,h-8);}ctx.strokeStyle='#354540';for(let i=0;i<rows;i++){const label=selectedView==='punchcard'?(trackNames[i]||'').slice(0,7):String(Math.round(high-(high-low)*i/rows));ctx.fillStyle='#b2c6bd';ctx.fillText(label,7,top+(bottom-top)*(i+.5)/rows+3);}for(const e of events){const x=left+(e.start-first)/4*(right-left),ew=Math.max(4,(e.end-e.start)/4*(right-left)-2);const y=selectedView==='punchcard'?top+(Math.max(0,trackNames.indexOf(e.track))+.28)/rows*(bottom-top):top+(high-(e.note??low))/(high-low)*(bottom-top-9);const active=state.playing&&e.start<=current&&e.end>current;ctx.globalAlpha=active?1:.65;ctx.fillStyle=e.color&&CSS.supports('color',e.color)?e.color:colorForSound(e.sound||e.track);ctx.beginPath();ctx.roundRect(x,y,ew,selectedView==='punchcard'?Math.max(5,(bottom-top)/rows*.4):7,2);ctx.fill();}ctx.globalAlpha=1;if(state.playing){const x=left+(current-first)/4*(right-left);ctx.strokeStyle='#80e8bd';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();ctx.fillStyle='#80e8bd';ctx.beginPath();ctx.moveTo(x-4,top-7);ctx.lineTo(x+4,top-7);ctx.lineTo(x,top-1);ctx.fill();}}
 if(now-lastUI>110){lastUI=now;editor.playing(state.playing?events.filter(e=>e.start<=current&&e.end>current).map(e=>e.line):[]);$('position').textContent='Bar '+String(Math.floor(state.bar)||1).padStart(3,'0')+' · '+describeDuration(state.seconds||0);$('playback-state').textContent=state.pendingBar?'Changes at bar '+Math.ceil(state.pendingBar):state.playing?'Playing your song':playbackError?'Playback needs attention':'Ready when you are';$('play').classList.toggle('active',state.playing);const level=Math.max(...state.levels);$('meter').querySelectorAll('span').forEach((s,i)=>{s.classList.toggle('lit',level>i/12);s.classList.toggle('hot',level>.95&&i>7);});}
}
requestAnimationFrame(animate);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')void save().catch(()=>{});});
async function boot(){try{await openStore();samples=await getSamples();const savedLibrary=await getLibraryPresets();if(savedLibrary.length)library=savedLibrary;else await saveLibraryPresets(library);projects=await getProjects();const id=localStorage.getItem('plainMusic.current');const saved=projects.find(p=>p.id===id)||projects[0];if(saved){await loadProject(saved,false);}else await save();await configureSounds();$('save-label').textContent='Saved on this computer';status('Ready. Press Play to hear your first song.');}catch(e){$('save-label').textContent='Storage needs attention';toast(String(e));}}
void boot();
// A read-only view makes browser verification possible without changing the music.
Object.defineProperty(window,'studioDiagnostics',{get:()=>({project:{name:project.name,source:project.source},compilation:{errors:compilation.errors,totalBars:compilation.totalBars,totalSeconds:compilation.totalSeconds,tracks:compilation.tracks.map(t=>t.name)},audio:{...engine.state,context:engine.context?.state},sampleCount:samples.length,presetCount:library.length})});






