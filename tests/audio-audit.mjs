import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try{
  const page=await browser.newPage();await page.goto((process.env.STUDIO_BASE_URL||'http://127.0.0.1:5173')+'/tests/audio-browser.html');await page.waitForFunction(()=>window.audioTest);
  const result=await page.evaluate(async()=>{
    const {AudioEngine,DEFAULT_PRESETS,compile,commands,EXAMPLES}=window.audioTest;
    const engine=new AudioEngine();await engine.initialize();
    const buffer=new ArrayBuffer(44+960),v=new DataView(buffer);const text=(offset,string)=>{for(let i=0;i<string.length;i++)v.setUint8(offset+i,string.charCodeAt(i));};text(0,'RIFF');v.setUint32(4,996,true);text(8,'WAVE');text(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,48000,true);v.setUint32(28,96000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,960,true);for(let i=0;i<480;i++)v.setInt16(44+i*2,Math.sin(i*.1)*8000,true);
    engine.setSounds(DEFAULT_PRESETS,[{id:'fixture-sample',name:'my-sample',blob:new Blob([buffer],{type:'audio/wav'})}]);await engine.prepareSounds();
    const mix={master:.5,muted:new Set(),solo:new Set()},out={examples:[],categories:{},failures:[]};
    for(const example of EXAMPLES){try{const song=compile(example.source);engine.build(song,mix).visual.queryArc(0,4);out.examples.push({name:example.name,passed:true});}catch(error){out.examples.push({name:example.name,error:error.message});}}
    const rootNames=new Set(['tempo','beats per bar','track','arrange','section','bars','tracks','pattern','change','use','show','setcpm','setcps']);
    for(const command of commands){
      if(command.kind==='symbol'||command.kind==='later'||rootNames.has(command.name))continue;
      const source=/^track:/m.test(command.example)?command.example:'track: demo\n  sound: triangle\n  notes: C4 E4 G4 E4\n'+command.example.split('\n').map(line=>'  '+line).join('\n');
      const category=out.categories[command.category]??={passed:0,failed:0};
      try{const song=compile(source);engine.build(song,mix).visual.queryArc(0,4);category.passed++;}catch(error){category.failed++;out.failures.push({command:command.name,native:command.native,example:command.example,error:error.message});}
    }
    engine.stop();return out;
  });
  console.log(JSON.stringify(result,null,2));
  if(result.failures.length||result.examples.some(example=>!example.passed))process.exitCode=1;
}finally{await browser.close();}
