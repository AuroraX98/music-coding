import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try{
  const page=await browser.newPage();await page.goto((process.env.STUDIO_BASE_URL||'http://127.0.0.1:5173')+'/tests/audio-browser.html');await page.waitForFunction(()=>window.audioTest);
  const result=await page.evaluate(async()=>{
    const {AudioEngine,DEFAULT_PRESETS,compile,Strudel:S}=window.audioTest;
    const {DESIGNER_RECIPES,DESIGNER_CONTROLS,designerCode,getDesignerValue,setDesignerValue,setDesignerFilter,normalizeDesignerPreset}=await import('/src/designer.ts');
    const assert=(condition,message)=>{if(!condition)throw Error(message);};
    for(let i=0;i<5;i++)assert(JSON.stringify(DESIGNER_RECIPES[i].preset)===JSON.stringify(DEFAULT_PRESETS[i]),'Original preset changed: '+i);
    const engine=new AudioEngine();await engine.initialize();engine.setSounds(DEFAULT_PRESETS,[]);await engine.prepareSounds();
    const mix={master:.3,muted:new Set(),solo:new Set()},failures=[];let passed=0;
    const extra=structuredClone(DESIGNER_RECIPES[4].preset);
    extra.name='unsafe: name // comment\n#';
    extra.advanced={gain:.17,cutoff:789,attack:.08,decay:.15,sustain:.3,release:.42,room:.11,fm:2.5,fmh:3,vib:4,vibmod:.12,delay:.2,delaytime:.23,delayfeedback:.3,roomsize:2.2,pan:.4,transpose:7,note:'D4'};
    const presets=[...DESIGNER_RECIPES.map(r=>r.preset),extra,...['lowpass','highpass','bandpass'].map(type=>setDesignerFilter(extra,type,800))];
    for(const preset of presets)for(const mode of ['notes','chords','bass','drums']){
      try{
        const source=designerCode(preset,mode),compilation=compile(source);
        assert(!compilation.errors.some(e=>e.severity!=='warning'),JSON.stringify(compilation.errors));
        const events=engine.build(compilation,mix).visual.queryArc(0,2).filter(h=>h.hasOnset());assert(events.length>0,'No note starts');
        const visibleDefaults=Object.fromEntries(DESIGNER_CONTROLS.filter(c=>c.key.startsWith('advanced.')).map(c=>[c.key.slice(9),getDesignerValue({...preset,advanced:undefined},c.key)]));
        const expected=engine.presetSettings({...preset,advanced:{...visibleDefaults,...preset.advanced}});
        for(const control of DESIGNER_CONTROLS){const key=control.key.replace(/^advanced\./,'');const names={volume:'volume',space:'reverb',cutoff:'lowpass'};assert(source.includes('\n  '+(names[key]??key)+':'),`Visible setting ${key} missing from code`);}
        for(const event of events)for(const [key,value]of Object.entries(expected))if(!['note'].includes(key))assert(JSON.stringify(event.value[key])===JSON.stringify(value),`${key}: ${JSON.stringify(event.value[key])} != ${JSON.stringify(value)}`);
        const first=events[0].value.note,expectedMidi=(preset.advanced?.note!==undefined?S.noteToMidi(preset.advanced.note):mode==='bass'?36:mode==='drums'?(preset.kind==='kick'?50:preset.kind==='snare'?62:60):60)+Number(preset.advanced?.transpose??0);
        assert((typeof first==='number'?first:S.noteToMidi(first))===expectedMidi,'Wrong pitch or transpose');
        await S.superdough({...events[0].value,gain:.001},engine.context.currentTime+.02,.08,.5,0);passed++;
      }catch(error){failures.push({preset:preset.id,mode,error:error.message});}
    }
    const before=JSON.stringify(extra);
    for(const control of DESIGNER_CONTROLS){const edited=setDesignerValue(extra,control.key,control.min);assert(Number.isFinite(getDesignerValue(edited,control.key)),control.key+' not readable');assert(getDesignerValue(edited,control.key)===control.min,control.key+' not updated');}
    assert(JSON.stringify(extra)===before,'Editing changed the input preset');
    const legacy={...extra,id:'parity-tone',name:'parity-tone',advanced:{fmh:4,fm:'2:3',attack:.07,delay:.3,note:'D4',transpose:7}};
    const original=JSON.stringify(legacy),normalized=normalizeDesignerPreset(legacy);
    assert(JSON.stringify(legacy)===original,'Normalization changed the original saved preset');
    assert(normalized.advanced.delaytime===.45&&normalized.advanced.attack===.07,'Normalization lost echo default or attack override');
    engine.setSounds([normalized],[]);await engine.prepareSounds();
    const values=event=>Object.fromEntries(Object.entries(event).filter(([key])=>!key.startsWith('_studio')).map(([key,value])=>[key,key==='note'&&typeof value==='string'?S.noteToMidi(value):value]).sort(([a],[b])=>a.localeCompare(b)));
    for(const tempo of [60,180]){
      const generated=engine.build(compile(`tempo: ${tempo} bpm\n${designerCode(normalized)}`),mix).visual.queryArc(0,1)[0].value;
      const alias=engine.build(compile(`tempo: ${tempo} bpm\ntrack: alias\n  sound: parity-tone\n  notes: D4`),mix).visual.queryArc(0,1)[0].value;
      assert(JSON.stringify(values(generated))===JSON.stringify(values(alias)),`Saved alias/code controls differ at ${tempo} BPM: ${JSON.stringify(values(generated))} vs ${JSON.stringify(values(alias))}`);
      assert(alias.delaytime===.45&&generated.delaytime===.45,'Echo spacing changed with tempo');
      assert(alias.fmh===3,'Composite FM override order changed');
    }
    engine.stop();return {recipes:DESIGNER_RECIPES.length,passed,failures,originalDefaultsPreserved:true,controlEditsImmutable:true,normalizedAliasParityAtBpm:[60,180]};
  });
  console.log(JSON.stringify(result,null,2));if(result.failures.length)process.exitCode=1;
}finally{await browser.close();}

