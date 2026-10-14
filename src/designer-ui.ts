import type {SoundPreset} from './types';
import {DESIGNER_RECIPES,DESIGNER_CONTROLS,designerCode,getDesignerValue,setDesignerValue,type DesignerMode} from './designer';
import {escapeHtml as esc} from './guides';

export interface DesignerCallbacks {
  onChange:(preset:SoundPreset)=>unknown;
  onPreview:(preset:SoundPreset,mode:DesignerMode,repeat:boolean)=>unknown;
  onStop:()=>unknown;
  onSave:(preset:SoundPreset)=>unknown;
  onInsert:(preset:SoundPreset,mode:DesignerMode)=>unknown;
  onNote:(preset:SoundPreset,note:string)=>unknown;
}

/** Keeps focus on controls while updating the envelope and generated code. */
export function mountDesigner(container:HTMLElement,initial:SoundPreset,callbacks:DesignerCallbacks){
  let draft=structuredClone(initial),original=structuredClone(initial),mode:DesignerMode='notes';
  let repeatingActive=false,repeatTimer:ReturnType<typeof setTimeout>|undefined,playingNotes:string[]=[],playingSignature='';
  let history:{preset:SoundPreset;original:SoundPreset;recipeId:string}[]=[],editKey='',recipeId='',octave=3,recent:string[]=[],operation=0,destroyed=false;
  const events=new AbortController();
  const find=<T extends HTMLElement=HTMLElement>(selector:string)=>container.querySelector<T>(selector)!;
  const format=(key:string,value:number)=>{
    if(['volume','space','brightness','advanced.sustain','advanced.lpsustain','advanced.delay','advanced.delayfeedback'].includes(key))return Math.round(value*100)+'%';
    if(key==='advanced.pan')return Math.round(value*100)+'% right';
    if(key==='advanced.vib')return value+' Hz';
    if(['advanced.transpose','advanced.vibmod'].includes(key))return value+' semitones';
    if(key==='advanced.cutoff')return Math.round(value)+' Hz';
    if(/attack|decay|release|delaytime|length/i.test(key))return Number(value.toFixed(3))+' s';
    return String(Number(value.toFixed(3)));
  };
  const message=(text:string)=>{if(!destroyed)find('#ds-message').textContent=text;};
  const remember=()=>{history.push({preset:structuredClone(draft),original:structuredClone(original),recipeId});if(history.length>50)history.shift();};
  const notify=()=>{try{Promise.resolve(callbacks.onChange(structuredClone(draft))).catch(error=>message('Could not save this draft: '+String(error)));}catch(error){message('Could not save this draft: '+String(error));}};
  const stop=()=>{operation++;repeatingActive=false;clearTimeout(repeatTimer);showPlayingNotes([]);try{Promise.resolve(callbacks.onStop()).catch(error=>message(String(error)));}catch(error){message(String(error));}};
  function adopt(preset:SoundPreset,resetOriginal=false){draft=structuredClone(preset);editKey='';if(resetOriginal)original=structuredClone(preset);syncControls();renderSound();notify();}
  const grouped=new Map<string,typeof DESIGNER_CONTROLS>();
  for(const control of DESIGNER_CONTROLS){const group=grouped.get(control.group)||[];grouped.set(control.group,[...group,control]);}
  const groupDescription=(group:string)=>/envelope|shape|volume/i.test(group)?'Shape how each note starts, settles, and fades.':/filter/i.test(group)?'Change brightness and movement within each note.':/echo|delay/i.test(group)?'Add repeats and choose how quickly they fade.':/reverb|space/i.test(group)?'Add a room-like fading sound.':'Move one control, then listen to the difference.';
  container.innerHTML=`<div class='page-heading'><div><div class='eyebrow'>Shape it, hear it, keep it</div><h1>Sound Designer</h1><p>Choose a starting sound. Change one thing and listen.</p></div></div>
  <section class='designer-recipes page-card' aria-labelledby='ds-recipes-title'><h2 id='ds-recipes-title'>Choose a starting sound</h2><p>Each choice starts a new version in the designer. Undo brings back your previous settings.</p><div class='designer-recipe-grid'>${DESIGNER_RECIPES.map(recipe=>`<button data-designer-recipe='${esc(recipe.id)}' aria-pressed='false'><strong>${esc(recipe.title)}</strong><span>${esc(recipe.description)}</span></button>`).join('')}</div></section>
  <section class='designer-preview page-card' aria-labelledby='ds-preview-title'><div><h2 id='ds-preview-title'>Listen to your changes</h2><p>Choose a short pattern, or play individual keys below.</p></div><div class='designer-preview-controls'><label for='ds-mode'>Preview pattern<select id='ds-mode'><option value='notes'>Notes</option><option value='chords'>Chords</option><option value='bass'>Bass line</option><option value='drums'>Drum rhythm</option></select></label><label class='designer-loop'><input id='ds-repeat' type='checkbox'>Repeat preview</label><button id='ds-preview' class='primary'>▶ Hear current sound</button><button id='ds-stop'>■ Stop</button><button id='ds-original'>Hear starting sound</button></div><p id='ds-message' class='designer-message' role='status'>Ready to listen. Start at a comfortable volume.</p></section>
  <section class='designer-piano-card page-card' aria-labelledby='ds-piano-title'><div class='designer-piano-heading'><div><h2 id='ds-piano-title'>Find notes by ear</h2><p>Click a key to hear your sound. With a keyboard, Tab to a key and press Enter or Space.</p></div><label for='ds-octave'>Lowest octave<select id='ds-octave'>${[1,2,3,4,5].map(n=>`<option value='${n}' ${n===octave?'selected':''}>${n} · C${n} to B${n+1}</option>`).join('')}</select></label></div><div id='ds-piano' class='designer-piano' role='group' aria-label='Two octave piano'></div><p class='designer-heard'>Last written note: <output id='ds-last-note' aria-live='polite'>None yet</output></p><p class='designer-now'>Sounding pitches: <output id='ds-playing-notes' aria-live='off'>None</output></p><div class='designer-note-history'><p>Recently played notes, oldest first:</p><code id='ds-recent-notes'>Play a key to see its name.</code><button id='ds-clear-notes'>Clear note list</button></div><p id='ds-tuning-note' class='designer-small-note'></p><div class='designer-roll-heading'><h3>Your played notes on a piano roll</h3><p>Earlier → Latest. Each block is one key press; spacing shows order, not timing or note length. The Now column shows pitches currently sounding.</p></div><div id='ds-note-roll' class='designer-note-roll' role='region' aria-label='Recently played notes on labeled pitch lanes' tabindex='0'></div><p class='designer-manual-note'>When you find notes you like, type them into a <code>notes:</code> line in the Studio. The keys play notes without adding them to your song.</p></section>
  <div class='designer-workbench'><div class='designer-controls-column'><section class='page-card designer-envelope-card' aria-labelledby='ds-envelope-title'><h2 id='ds-envelope-title'>How a note grows and fades</h2><p>Attack rises, decay settles, sustain holds a level, and release fades after the note ends.</p><div id='ds-envelope'></div></section><section class='page-card designer-waveform-card'><h2>Starting wave</h2><label for='ds-waveform'>Wave shape<select id='ds-waveform'></select></label><p id='ds-waveform-help'></p></section>${[...grouped].map(([group,controls])=>`<fieldset class='page-card designer-control-group'><legend>${esc(group)}</legend><p>${esc(groupDescription(group))}</p>${controls.map(control=>`<div class='designer-knob'><div class='designer-knob-heading'><label for='ds-control-${esc(control.key.replaceAll('.','-'))}'>${esc(control.label)}</label><output id='ds-output-${esc(control.key.replaceAll('.','-'))}'>${format(control.key,getDesignerValue(draft,control.key))}</output></div><input id='ds-control-${esc(control.key.replaceAll('.','-'))}' data-designer-control='${esc(control.key)}' type='range' min='${control.min}' max='${control.max}' step='${control.key==='advanced.cutoff'?0.01:/attack|decay|release|time|length/i.test(control.key)?Math.min(control.step,0.001):control.step}' value='${getDesignerValue(draft,control.key)}' aria-describedby='ds-help-${esc(control.key.replaceAll('.','-'))}'><p id='ds-help-${esc(control.key.replaceAll('.','-'))}'>${esc(control.help)}</p></div>`).join('')}</fieldset>`).join('')}</div>
  <aside class='designer-code-column page-card' aria-labelledby='ds-code-title'><h2 id='ds-code-title'>Your sound in code</h2><label for='ds-name'>Sound name<input id='ds-name' maxlength='120' value='${esc(draft.name)}'></label><p>This complete track plays your settings. Highlighted lines differ from the starting sound.</p><p id='ds-changed-summary' class='designer-changed-summary'></p><pre class='designer-generated-code'><code id='ds-code'></code></pre><div class='designer-code-actions'><button id='ds-undo' disabled>Undo last change</button><button id='ds-reset'>Reset to starting sound</button><button id='ds-copy'>Copy code</button><button id='ds-save'>Save sound</button><button id='ds-insert' class='primary'>Add track to song</button></div><p>Save sound keeps it in your library. Add track puts this sound and the selected pattern into your current song.</p></aside></div>`;

  function syncControls(){
    find<HTMLInputElement>('#ds-name').value=draft.name;syncWaveform();
    for(const control of DESIGNER_CONTROLS){const value=getDesignerValue(draft,control.key);find<HTMLInputElement>('#ds-control-'+control.key.replaceAll('.','-')).value=String(value);}
    container.querySelectorAll<HTMLButtonElement>('[data-designer-recipe]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.designerRecipe===recipeId)));
  }
  function syncWaveform(){const fixed=draft.kind==='kick'||draft.kind==='snare'||draft.waveform==='studio_hat';const waves=[...new Set(['sine','triangle','square','sawtooth','white','pink','brown',draft.waveform])];const select=find<HTMLSelectElement>('#ds-waveform');select.innerHTML=waves.map(w=>`<option value='${esc(w)}' ${draft.waveform===w?'selected':''}>${esc(w)}</option>`).join('');select.disabled=fixed;find('#ds-waveform-help').textContent=fixed?'This drum recipe uses its own sound source. Choose a pitched recipe such as Lead to change the wave shape.':'Choose the basic wave before its filters and effects. Sine is smooth; sawtooth and square are richer; white, pink, and brown are noise.';}
  function renderSound(){
    for(const control of DESIGNER_CONTROLS){const text=format(control.key,getDesignerValue(draft,control.key));find('#ds-output-'+control.key.replaceAll('.','-')).textContent=text;find('#ds-control-'+control.key.replaceAll('.','-')).setAttribute('aria-valuetext',text);}
    find<HTMLButtonElement>('#ds-undo').disabled=!history.length;
    const lines=designerCode(draft,mode).split('\n'),before=designerCode(original,mode).split('\n');let changed=0;
    find('#ds-code').innerHTML=lines.map((line,index)=>{const isChanged=line!==before[index];if(isChanged)changed++;return `<span class='designer-code-line${isChanged?' designer-code-changed':''}'${isChanged?" title='Changed from starting sound'":''}>${esc(line)||' '}</span>`;}).join('');
    find('#ds-changed-summary').textContent=changed?`${changed} ${changed===1?'line differs':'lines differ'} from the starting sound.`:'The code matches the starting sound.';
    const tuning=Number(draft.advanced?.transpose||0);find('#ds-tuning-note').textContent='Key names show the notes you play.'+(tuning?' This sound shifts them by '+tuning+' semitones; the heard pitch is transposed.':'')+(draft.advanced?.note!==undefined?' This saved sound has a fixed note setting ('+draft.advanced.note+'); remove that setting in its code to follow new notes.':'')+' Drums and noise may not have one clear pitch.';
    const attack=Math.max(0,getDesignerValue(draft,'attack')),decay=Math.max(0,getDesignerValue(draft,'advanced.decay')),sustain=Math.max(0,Math.min(1,getDesignerValue(draft,'advanced.sustain'))),release=Math.max(0,getDesignerValue(draft,'advanced.release'));
    const total=attack+decay+1+release,scale=440/Math.max(total,0.01),a=30+attack*scale,d=a+decay*scale,h=d+scale,y=145-sustain*110;
    find('#ds-envelope').innerHTML=`<svg class='designer-envelope' viewBox='0 0 500 175' role='img' aria-label='Volume envelope: attack ${attack} seconds, decay ${decay} seconds, sustain ${Math.round(sustain*100)} percent, release ${release} seconds. The held part is shown as one second.'><path d='M30 20 V145 H475' fill='none' stroke='var(--line)'/><path d='M30 145 L${a} 35 L${d} ${y} L${h} ${y} L470 145 Z' fill='var(--surface-alt)'/><path d='M30 145 L${a} 35 L${d} ${y} L${h} ${y} L470 145' fill='none' stroke='var(--purple)' stroke-width='3'/><path d='M${h} 25 V150' stroke='var(--muted)' stroke-dasharray='4 4'/><text x='${Math.min(405,Math.max(35,h-32))}' y='167'>Note ends</text><text x='4' y='19'>Level</text></svg><div class='designer-envelope-labels'><span><strong>Attack</strong>${attack} s</span><span><strong>Decay</strong>${decay} s</span><span><strong>Sustain</strong>${Math.round(sustain*100)}%</span><span><strong>Release</strong>${release} s</span></div><p class='designer-small-note'>The picture shows a one-second held part. Your note length decides how long the sound stays at the sustain level.</p>`;
  }
  function renderPiano(){
    const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],whiteIndex=[0,0,1,1,2,3,3,4,4,5,5,6];
    find('#ds-piano').innerHTML=[octave,octave+1].map(o=>`<div class='designer-piano-octave' role='group' aria-label='Octave ${o}'>${names.map((name,index)=>{const black=name.includes('#'),position=black?`left:${(whiteIndex[index]+1)*100/7-4.1}%;`:`left:${whiteIndex[index]*100/7}%;`;return `<button class='designer-piano-key ${black?'designer-black-key':'designer-white-key'}' style='${position}' data-designer-note='${name+o}' aria-label='Play ${name+o}'><span>${name+o}</span></button>`;}).join('')}</div>`).join('');
  }
  function renderNoteRoll(){
    const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const midi=(note:string)=>{const match=note.match(/^([A-G]#?)(-?\d+)$/)!;return (Number(match[2])+1)*12+names.indexOf(match[1]);};
    const numbers=recent.map(midi),sounding=playingNotes.map(midi),lowest=Math.min((octave+1)*12,...numbers,...sounding),highest=Math.max((octave+3)*12-1,...numbers,...sounding),last=recent.at(-1);
    const roll=find('#ds-note-roll');
    roll.innerHTML="<div class='designer-roll-header'><span>Pitch</span><span>Earlier → Latest</span><span>Now</span></div>"+Array.from({length:highest-lowest+1},(_,row)=>{const pitch=highest-row,note=names[pitch%12]+(Math.floor(pitch/12)-1);return `<div data-designer-roll-note='${note}' class='designer-roll-row ${playingNotes.includes(note)?'designer-roll-sounding':''} ${names[pitch%12].includes('#')?'designer-roll-black':''} ${note===last?'designer-roll-current':''}'><span class='designer-roll-label'>${note}</span>${Array.from({length:16},(_,column)=>`<span class='designer-roll-cell'>${numbers[column]===pitch?`<span class='designer-note-block ${column===numbers.length-1?'designer-note-latest':''}' title='${note}, key press ${column+1}'>${note}</span>`:''}</span>`).join('')}<span class='designer-roll-now'>${playingNotes.includes(note)?`<span class='designer-note-playing' title='${note} sounding now'>${note}</span>`:''}</span></div>`;}).join('');
    container.querySelectorAll<HTMLButtonElement>('[data-designer-note]').forEach(key=>{const latest=key.dataset.designerNote===last;key.classList.toggle('designer-key-latest',latest);key.classList.toggle('designer-key-playing',playingNotes.includes(key.dataset.designerNote!));key.setAttribute('aria-label','Play '+key.dataset.designerNote+(latest?', most recently played':''));});
    const current=roll.querySelector<HTMLElement>('.designer-roll-sounding')||roll.querySelector<HTMLElement>('.designer-roll-current');if(current)roll.scrollTop=Math.max(0,current.offsetTop-roll.clientHeight/2+current.offsetHeight/2);
  }
  function showPlayingNotes(notes:string[]){if(destroyed)return;const next=[...new Set(notes.filter(note=>{const match=note.match(/^([A-G]#?)(-?\d+)$/);if(!match)return false;const pitchClass=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].indexOf(match[1]),midi=(Number(match[2])+1)*12+pitchClass;return pitchClass>=0&&midi>=0&&midi<=127;}))].sort();const signature=next.join(' ');if(signature===playingSignature)return;playingSignature=signature;playingNotes=next;find('#ds-playing-notes').textContent=signature||'None';renderNoteRoll();}
  function updateRepeating(){if(!repeatingActive)return;clearTimeout(repeatTimer);repeatTimer=setTimeout(()=>{if(!repeatingActive||destroyed)return;void run(()=>callbacks.onPreview(structuredClone(draft),mode,true),'Updating repeating preview…','Repeating your updated sound.');},250);}
  async function run(action:()=>unknown,starting:string,finished:string){const request=++operation;message(starting);try{await action();if(!destroyed&&request===operation)message(finished);}catch(error){if(!destroyed&&request===operation)message(error instanceof Error?error.message:String(error));}}
  container.addEventListener('input',event=>{
    const target=event.target as HTMLInputElement,key=target.dataset.designerControl;
    if(key){if(editKey!==key){remember();editKey=key;}draft=setDesignerValue(draft,key,Number(target.value));renderSound();notify();updateRepeating();}
    if(target.id==='ds-name'){if(editKey!=='name'){remember();editKey='name';}draft={...draft,name:target.value};renderSound();notify();}
  },{signal:events.signal});
  container.addEventListener('change',event=>{
    const target=event.target as HTMLInputElement;editKey='';
    if(target.id==='ds-waveform'){remember();draft={...draft,waveform:target.value};renderSound();notify();updateRepeating();}
    if(target.id==='ds-mode'){stop();mode=target.value as DesignerMode;renderSound();message('Pattern changed. Press Hear current sound to listen.');}
    if(target.id==='ds-repeat'){stop();message(target.checked?'Repeat is ready. Press Hear current sound to start.':'Repeat off. Press Hear current sound for one pattern.');}
    if(target.id==='ds-octave'){octave=Number(target.value);renderPiano();renderNoteRoll();}
  },{signal:events.signal});
  container.addEventListener('click',event=>{
    const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button||button.disabled)return;
    const recipe=button.dataset.designerRecipe,note=button.dataset.designerNote;
    if(recipe){const chosen=DESIGNER_RECIPES.find(r=>r.id===recipe);if(chosen){stop();remember();recipeId=recipe;adopt(chosen.preset,true);message('Starting sound: '+chosen.title+'. Change one setting or play a key.');}return;}
    if(note){stop();recent=[...recent,note].slice(-16);find('#ds-last-note').textContent=note;renderNoteRoll();find('#ds-recent-notes').textContent='notes: '+recent.join(' ');void run(()=>callbacks.onNote(structuredClone(draft),note),'Playing '+note+'…','Played '+note+'. Type any notes you want to keep in the Studio.');return;}
    switch(button.id){
      case 'ds-stop':stop();message('Preview stopped.');break;
      case 'ds-preview':{const repeat=find<HTMLInputElement>('#ds-repeat').checked;repeatingActive=repeat;clearTimeout(repeatTimer);void run(()=>callbacks.onPreview(structuredClone(draft),mode,repeat),'Preparing preview…',repeat?'Preview repeats until you press Stop.':'Preview started. Press Stop to end it.');break;}
      case 'ds-original':stop();void run(()=>callbacks.onPreview(structuredClone(original),mode,false),'Preparing starting sound…','Playing the starting sound. Your current settings are still shown.');break;
      case 'ds-undo':{const previous=history.pop();if(previous){stop();original=previous.original;recipeId=previous.recipeId;adopt(previous.preset);message('Undid the last change.');}break;}
      case 'ds-reset':stop();remember();adopt(original);message('Restored the starting sound. Undo brings back your edits.');break;
      case 'ds-clear-notes':recent=[];find('#ds-recent-notes').textContent='Play a key to see its name.';find('#ds-last-note').textContent='None yet';renderNoteRoll();break;
      case 'ds-copy':void run(()=>navigator.clipboard.writeText(designerCode(draft,mode)),'Copying code…','Copied the complete track code.');break;
      case 'ds-save':void run(()=>callbacks.onSave(structuredClone(draft)),'Saving sound…','Sound saved in your library.');break;
      case 'ds-insert':stop();void run(()=>callbacks.onInsert(structuredClone(draft),mode),'Adding the track…','Track added to your song.');break;
    }
  },{signal:events.signal});
  syncWaveform();renderSound();renderPiano();renderNoteRoll();
  return {showPlayingNotes,stop(){stop();message('Preview stopped.');},destroy(){stop();destroyed=true;events.abort();},setPreset(preset:SoundPreset){stop();history=[];recipeId='';recent=[];original=structuredClone(preset);adopt(preset);find('#ds-recent-notes').textContent='Play a key to see its name.';find('#ds-last-note').textContent='None yet';renderNoteRoll();}};
}
