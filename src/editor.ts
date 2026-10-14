import {EditorState, StateEffect, StateField, Transaction, Compartment} from '@codemirror/state';
import {EditorView, Decoration, WidgetType, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, type DecorationSet} from '@codemirror/view';
import {history, historyKeymap, defaultKeymap, indentMore, indentLess, undo, redo, isolateHistory} from '@codemirror/commands';
import {autocompletion} from '@codemirror/autocomplete';
import {setDiagnostics} from '@codemirror/lint';
import {commands, categories, resolveCommand} from './catalog';
import type {Diagnostic} from './types';
import {canOwnChildren} from './language';

export interface EditorCallbacks {change:(source:string,kind:'code'|'slider')=>void; selection:(line:number)=>void; help:(name:string)=>void; sliders:(lines:number[])=>void;}
const refresh = StateEffect.define<void>();
const sliderEdit = Transaction.userEvent.of('input.type.slider');
const palette = new Map(categories.map(c=>[c.id,c.color]));
const soundColors = new Map<string,string>();
export function colorForSound(name:string) {if(soundColors.has(name))return soundColors.get(name)!;let hash=0;for(const c of name)hash=((hash<<5)-hash+c.charCodeAt(0))|0;return `hsl(${Math.abs(hash)%360} 60% 72%)`;}
export function setSoundColors(items:{name:string;color?:string}[]) {soundColors.clear();for(const x of items)soundColors.set(x.name,x.color||colorForSound(x.name));}

export function parseSliderNumber(text: string): { value: number; unit?: string; comment?: string } | null {
  // Keep the accepted units aligned with scalar() in language.ts.
  const match = text.match(/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(%|bpm|hz|seconds?|secs?|s|bars?|beats?)?\s*(\/\/.*)?\s*$/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? { value, unit: match[2], comment: match[3] } : null;
}

type SliderSchema = { min: number; max: number; step: number; unit?: string; scale?: string };
type SliderDOMState = {
  line: number;
  value: number;
  suffix: string;
  schema: SliderSchema;
  move: (line: number, value: number, first: boolean, last: boolean) => void;
  min: number;
  max: number;
  logarithmic: boolean;
  dragging: boolean;
  started: boolean;
  lastInput: string;
  cleanup?: () => void;
};
const sliderDOMStates = new WeakMap<HTMLElement, SliderDOMState>();

class SliderWidget extends WidgetType {
  constructor(
    readonly line: number,
    readonly label: string,
    readonly value: number,
    readonly suffix: string,
    readonly schema: SliderSchema,
    readonly move: (line: number, value: number, first: boolean, last: boolean) => void
  ) { super(); }

  eq(other: SliderWidget) {
    return other.line === this.line && other.label === this.label && other.value === this.value &&
      other.suffix === this.suffix && other.move === this.move &&
      other.schema.min === this.schema.min && other.schema.max === this.schema.max &&
      other.schema.step === this.schema.step && other.schema.unit === this.schema.unit &&
      other.schema.scale === this.schema.scale;
  }

  private update(el: HTMLElement) {
    const input = el.querySelector<HTMLInputElement>('input')!;
    const output = el.querySelector('output')!;
    const label = el.querySelector('span')!;
    const state = sliderDOMStates.get(el)!;
    Object.assign(state, {
      line: this.line, value: this.value, suffix: this.suffix, schema: this.schema, move: this.move,
      min: Math.min(this.schema.min, this.value), max: Math.max(this.schema.max, this.value)
    });
    state.logarithmic = this.schema.scale === 'log' && state.min > 0 && state.max > state.min;
    label.textContent = this.label;
    input.setAttribute('aria-label', `${this.label}, line ${this.line}`);
    input.min = state.logarithmic ? '0' : String(state.min);
    input.max = state.logarithmic ? '1000' : String(state.max);
    input.step = state.logarithmic ? '1' : String(state.schema.step);
    input.value = String(state.logarithmic
      ? 1000 * Math.log(state.value / state.min) / Math.log(state.max / state.min)
      : state.value);
    state.lastInput = input.value;
    output.textContent = `${state.value}${state.suffix}`;
  }

  updateDOM(el: HTMLElement) {
    if (!sliderDOMStates.has(el) || !el.querySelector('input') || !el.querySelector('output') || !el.querySelector('span')) return false;
    this.update(el);
    return true;
  }

  toDOM() {
    const el = document.createElement('div');
    el.className = 'code-slider';
    const label = document.createElement('label');
    const text = document.createElement('span');
    const input = document.createElement('input');
    input.type = 'range';
    const output = document.createElement('output');
    label.append(text, input);
    el.append(label, output);
    const state: SliderDOMState = {
      line: this.line, value: this.value, suffix: this.suffix, schema: this.schema, move: this.move,
      min: 0, max: 1, logarithmic: false, dragging: false, started: false, lastInput: ''
    };
    sliderDOMStates.set(el, state);
    this.update(el);
    const get = () => state.logarithmic
      ? Number(Math.exp(Math.log(state.min) + Number(input.value) / 1000 * Math.log(state.max / state.min)).toFixed(2))
      : Number(input.value);
    const apply = () => {
      if (input.value === state.lastInput) return;
      state.lastInput = input.value;
      const value = get();
      if (!Number.isFinite(value) || value === state.value) return;
      const first = !state.started;
      if (state.dragging) state.started = true;
      state.move(state.line, value, state.dragging ? first : true, !state.dragging);
    };
    let pointerId: number | null = null;
    const finish = () => {
      if (!state.dragging) return;
      apply();
      const hadChanges = state.started;
      state.dragging = false;
      state.started = false;
      pointerId = null;
      state.cleanup?.();
      if (hadChanges) state.move(state.line, state.value, false, true);
    };
    const released = (event: PointerEvent) => {
      if (event.pointerId === pointerId) finish();
    };
    const doc = el.ownerDocument;
    const window = doc.defaultView;
    state.cleanup = () => {
      doc.removeEventListener('pointerup', released, true);
      doc.removeEventListener('pointercancel', released, true);
      window?.removeEventListener('blur', finish);
    };
    input.addEventListener('pointerdown', event => {
      if (event.button !== 0 || state.dragging) return;
      state.dragging = true;
      state.started = false;
      pointerId = event.pointerId;
      doc.addEventListener('pointerup', released, true);
      doc.addEventListener('pointercancel', released, true);
      window?.addEventListener('blur', finish);
    });
    input.addEventListener('input', apply);
    input.addEventListener('change', () => {
      apply();
      finish();
    });
    return el;
  }

  destroy(el: HTMLElement) {
    sliderDOMStates.get(el)?.cleanup?.();
    sliderDOMStates.delete(el);
  }

  ignoreEvent() { return true; }
}

export function createEditor(parent:HTMLElement,source:string,callbacks:EditorCallbacks) {
 const historySlot=new Compartment();
 const playingLines=StateEffect.define<number[]>();
 const playingField=StateField.define<DecorationSet>({create:()=>Decoration.none,update(value,tr){for(const effect of tr.effects)if(effect.is(playingLines))return Decoration.set([...new Set(effect.value)].filter(n=>n>0&&n<=tr.state.doc.lines).map(n=>Decoration.line({class:'code-playing-line'}).range(tr.state.doc.line(n).from)),true);return tr.docChanged?Decoration.none:value;},provide:f=>EditorView.decorations.from(f)});
 let sliderLines=new Set<number>();let dragTime=0;let changing=false;let currentSource=source;
 function moveSlider(line: number, value: number, first: boolean, last: boolean) {
  if (!Number.isFinite(value) || line < 1 || line > view.state.doc.lines) return;
  const text = view.state.doc.line(line);
  const match = text.text.match(/^(\s*[^:]+:\s*)([+-]?(?:\d+(?:\.\d*)?|\.\d+))([\s\S]*)$/);
  if (!match) return;
  if (Number(match[2]) === value) {
    // Close the drag without adding an identical document change to undo history.
    if (last && !first) view.dispatch({ annotations: isolateHistory.of('after') });
    return;
  }
  if (first) dragTime = Date.now();
  const from = text.from + match[1].length;
  const boundary = first && last ? 'full' : first ? 'before' : last ? 'after' : undefined;
  view.dispatch({
    changes: { from, to: from + match[2].length, insert: String(value) },
    annotations: [sliderEdit, Transaction.time.of(dragTime), ...(boundary ? [isolateHistory.of(boundary)] : [])]
  });
}
 function decorations(state:EditorState):DecorationSet {const marks: any[]=[];for(let n=1;n<=state.doc.lines;n++){const line=state.doc.line(n);const match=line.text.match(/^(\s*)([^:]+):/);if(match){const spec=resolveCommand(match[2].trim());if(spec){marks.push(Decoration.mark({class:'code-command',attributes:{style:`color:${palette.get(spec.category)||'#8be0b9'}`}}).range(line.from+match[1].length,line.from+match[1].length+match[2].length));}const start=match[0].length;const value=line.text.slice(start);const token=/\/\/.*$|(?:\b[A-Ga-g][#b]?\d\b)|(?:-?(?:\d+(?:\.\d*)?|\.\d+)(?:%|\b))|(?:"[^"\n]*"|'[^'\n]*')|(?:[A-Za-z][A-Za-z0-9_-]*)/g;let item:RegExpExecArray|null;while((item=token.exec(value))){const t=item[0];let cls='',style='';if(t.startsWith('//'))cls='code-comment';else if(/^[A-Ga-g][#b]?\d$/.test(t))cls='code-note';else if(/^-?[\d.]/.test(t))cls='code-number';else if(t==='rest')cls='code-rest';else if((spec?.name==='sound'||spec?.name==='play')&&!/^(seconds|bpm|hz|bars)$/i.test(t)){cls='code-sound';style=`color:${colorForSound(t)}`;}else cls='code-value';marks.push(Decoration.mark({class:cls,attributes:style?{style}:{}}).range(line.from+start+item.index,line.from+start+item.index+t.length));if(cls==='code-comment')break;}
 const numeric=parseSliderNumber(value);if(sliderLines.has(n)&&spec?.slider&&numeric){let schema={...spec.slider};if(numeric.unit==='%')schema={min:0,max:100,step:1,unit:'%'};marks.push(Decoration.widget({widget:new SliderWidget(n,spec.name,numeric.value,numeric.unit?' '+numeric.unit:'',schema,moveSlider),block:true,side:1}).range(line.to));}
 }else if(line.text.trim().startsWith('//'))marks.push(Decoration.mark({class:'code-comment'}).range(line.from,line.to));}return Decoration.set(marks,true);}
 const field=StateField.define<DecorationSet>({create:decorations,update(value,tr){return tr.docChanged||tr.effects.some(e=>e.is(refresh))?decorations(tr.state):value;},provide:f=>EditorView.decorations.from(f)});
 function enter(v:EditorView){const range=v.state.selection.main;if(!range.empty)return false;const line=v.state.doc.lineAt(range.head);const before=line.text.slice(0,range.head-line.from);const indent=before.match(/^ */)?.[0]||'';let next=indent;const spec=resolveCommand(before.match(/^\s*([^:]+):/)?.[1]||'');const block=!!spec&&canOwnChildren({name:spec.name,native:spec.native,value:'',line:line.number,children:[],spec});if(!before.trim()&&indent.length>=2){v.dispatch({changes:{from:line.from,to:range.head,insert:'\n'+indent.slice(2)},selection:{anchor:line.from+1+indent.length-2},annotations:Transaction.userEvent.of('input')});return true;}if(block)next+='  ';v.dispatch(v.state.replaceSelection('\n'+next),{scrollIntoView:true,annotations:Transaction.userEvent.of('input')});return true;}
 const view=new EditorView({parent,state:EditorState.create({doc:source,extensions:[lineNumbers({domEventHandlers:{mousedown(v,line,event){event.preventDefault();v.dispatch({selection:{anchor:line.from},scrollIntoView:true});v.focus();return true;}}}),historySlot.of(history()),playingField,drawSelection(),highlightActiveLine(),highlightActiveLineGutter(),EditorState.tabSize.of(2),field,EditorView.lineWrapping,keymap.of([{key:'Enter',run:enter},{key:'Tab',run:indentMore},{key:'Shift-Tab',run:indentLess},...historyKeymap,...defaultKeymap]),autocompletion({activateOnTyping:true,override:[context=>{const line=context.state.doc.lineAt(context.pos);const word=context.matchBefore(/[\w ]*/);if(!word||!/^\s*[\w ]*$/.test(line.text.slice(0,context.pos-line.from)))return null;return{from:line.from+(line.text.match(/^\s*/)?.[0].length||0),options:commands.filter(c=>c.category!=='connections').map(c=>({label:c.name,type:'keyword',detail:c.aliases.length?c.aliases.map(a=>a+':').join(' · '):undefined,info:c.description,apply:c.name+': '}))};}]}),EditorView.domEventHandlers({dblclick(event,v){const pos=v.posAtCoords({x:event.clientX,y:event.clientY});if(pos!==null){const line=v.state.doc.lineAt(pos);const name=line.text.match(/^\s*([^:]+):/)?.[1];if(name)callbacks.help(name);}return false;}}),EditorView.updateListener.of(update=>{if(update.docChanged&&!changing){if(sliderLines.size){const mapped=new Set<number>();for(const n of sliderLines){if(n<=update.startState.doc.lines){const p=update.changes.mapPos(update.startState.doc.line(n).from);mapped.add(update.state.doc.lineAt(p).number);}}sliderLines=mapped;queueMicrotask(()=>{view.dispatch({effects:refresh.of()});callbacks.sliders([...sliderLines]);});}currentSource=update.state.doc.toString();callbacks.change(currentSource,update.transactions.some(t=>t.isUserEvent('input.type.slider'))?'slider':'code');}if(update.selectionSet||update.docChanged)callbacks.selection(update.state.doc.lineAt(update.state.selection.main.head).number);}),EditorView.theme({'&':{height:'100%',fontSize:'14px',backgroundColor:'#1d2420',color:'#edf5f1'},'.cm-scroller':{fontFamily:'"Cascadia Code",Consolas,monospace',overflow:'auto'},'.cm-content':{padding:'18px 0'},'.cm-line':{paddingLeft:'14px'},'.cm-gutters':{background:'#202723',color:'#b4c4bb',borderRight:'1px solid #46574f'},'.cm-activeLine':{background:'#29372f'},'.cm-activeLineGutter':{background:'#304e3d',color:'#aaf0cd'},'.cm-selectionBackground':{background:'#416a53 !important'},'.cm-cursor':{borderLeftColor:'#8be0b9'},'.cm-focused':{outline:'none'}},{dark:true})]})});
 return {view,getSource:()=>view.state.doc.toString(),setSource(text:string,resetHistory=false){changing=true;view.dispatch({changes:{from:0,to:view.state.doc.length,insert:text},annotations:isolateHistory.of('full')});if(resetHistory){view.dispatch({effects:historySlot.reconfigure([])});view.dispatch({effects:historySlot.reconfigure(history())});}changing=false;currentSource=text;callbacks.change(text,'code');},gotoLine(n:number){const line=view.state.doc.line(Math.max(1,Math.min(n,view.state.doc.lines)));view.dispatch({selection:{anchor:line.from},effects:EditorView.scrollIntoView(line.from,{y:'center'})});view.focus();},addSlider(n?:number){const line=n||view.state.doc.lineAt(view.state.selection.main.head).number;if(sliderLines.has(line))sliderLines.delete(line);else sliderLines.add(line);view.dispatch({effects:refresh.of()});callbacks.sliders([...sliderLines]);},setSliders(lines:number[]){sliderLines=new Set(lines);view.dispatch({effects:refresh.of()});},refresh(){view.dispatch({effects:refresh.of()});},playing(lines:number[]){view.dispatch({effects:playingLines.of(lines)});},append(text:string){const start=view.state.doc.length;view.dispatch({changes:{from:start,insert:text},selection:{anchor:start+text.length},scrollIntoView:true,annotations:Transaction.userEvent.of('input')});view.focus();},errors(items:Diagnostic[]){view.dispatch(setDiagnostics(view.state,items.map(d=>{const line=view.state.doc.line(Math.max(1,Math.min(d.line,view.state.doc.lines)));return {from:line.from,to:line.to,severity:d.severity||'error',message:d.message};})));},undo:()=>undo(view),redo:()=>redo(view),insert(text:string){view.dispatch(view.state.replaceSelection(text),{annotations:Transaction.userEvent.of('input')});view.focus();}};
}
