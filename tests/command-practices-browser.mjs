import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try{
  const page=await browser.newPage();await page.goto((process.env.STUDIO_BASE_URL||'http://127.0.0.1:5173')+'/tests/audio-browser.html');await page.waitForFunction(()=>window.audioTest);
  const result=await page.evaluate(async()=>{
    const {AudioEngine,DEFAULT_PRESETS,compile,commands,Strudel:S}=window.audioTest;
    const {getCommandPractice}=await import('/src/commandPractice.ts');
    const engine=new AudioEngine();await engine.initialize();
    const count=48000,buffer=new ArrayBuffer(44+count*2),v=new DataView(buffer),text=(offset,string)=>{for(let i=0;i<string.length;i++)v.setUint8(offset+i,string.charCodeAt(i));};
    text(0,'RIFF');v.setUint32(4,36+count*2,true);text(8,'WAVE');text(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,48000,true);v.setUint32(28,96000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,count*2,true);for(let i=0;i<count;i++)v.setInt16(44+i*2,Math.sin(i*.03)*(1-i/count)*8000,true);
    engine.setSounds(DEFAULT_PRESETS,[{id:'practice-fixture',name:'my-sample',blob:new Blob([buffer],{type:'audio/wav'})}]);await engine.prepareSounds();
    const mix={master:.4,muted:new Set(),solo:new Set()},failures=[],empty=[],nonfinite=[];let passed=0;
    for(const command of commands){const practice=getCommandPractice(command);try{
      if(!practice.title||!practice.instruction||!/^track:/m.test(practice.source))throw Error('Missing complete practice content');
      const compilation=compile(practice.source);if(compilation.errors.some(e=>e.severity!=='warning'))throw Error(JSON.stringify(compilation.errors));
      const built=engine.build(compilation,mix),events=built.visual.queryArc(0,8).filter(h=>h.hasOnset());
      if(!events.length&&!['silence','hush'].includes(command.name))empty.push(command.name);
      for(const hap of events){const e=hap.value;for(const key of ['freq','gain','cutoff'])if(e[key]!==undefined&&!Number.isFinite(Number(e[key])))nonfinite.push({name:command.name,key,value:e[key]});if(e.note!==undefined&&!Number.isFinite(typeof e.note==='number'?e.note:S.noteToMidi(e.note)))nonfinite.push({name:command.name,key:'note',value:e.note});}
      // Exercise the real renderer as well as event generation. This is a quiet,
      // short validation trigger, not a listening test of every combination.
      if(events[0])await S.superdough({...events[0].value,gain:.001},engine.context.currentTime+.025,.06,.5,0);
      passed++;
    }catch(error){failures.push({name:command.name,error:error.message,source:practice.source});}}
    engine.stop();return {count:commands.length,passed,failures,empty,nonfinite};
  });
  console.log(JSON.stringify(result,null,2));if(result.failures.length||result.empty.length||result.nonfinite.length)process.exitCode=1;
}finally{await browser.close();}
