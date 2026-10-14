import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const context=await browser.newContext();const page=await context.newPage();const report={browser:'Chrome',cases:[],errors:[],outsideRequests:[]};
await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1'||['blob:','data:'].includes(u.protocol))return route.continue();report.outsideRequests.push(u.href);return route.abort();});
page.on('pageerror',e=>report.errors.push(e.message));
await page.addInitScript(()=>{
  window.drumStarts=[];
  const create=AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator=function(...args){const osc=create.apply(this,args),start=osc.start;osc.start=function(...times){window.drumStarts.push({type:osc.type,time:times[0]});return start.apply(osc,times);};return osc;};
});
try{
  await page.goto(process.env.STUDIO_BASE_URL||'http://127.0.0.1:5173');await page.waitForFunction(()=>window.studioDiagnostics);
  for(const sequence of ['kick rest snare rest','snare rest kick rest']){
    const source='tempo: 150 bpm\n\n// A drum part made with our own sounds\ntrack: drums\n  play: '+sequence+'\n  volume: 45%\n  faster: 4\n\nshow: piano roll';
    await page.locator('.cm-content').evaluate(el=>el.focus());await page.keyboard.press('Control+A');await page.locator('.cm-content').evaluate((el,text)=>{const data=new DataTransfer();data.setData('text/plain',text);el.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));},source);await page.waitForFunction(s=>window.studioDiagnostics.project.source===s,source);
    await page.evaluate(()=>window.drumStarts=[]);await page.locator('#play').click();await page.waitForFunction(()=>window.studioDiagnostics.audio.playing);await page.waitForTimeout(1850);await page.locator('#stop').click();
    const starts=await page.evaluate(()=>{const all=window.drumStarts.sort((a,b)=>a.time-b.time),begin=all[0]?.time;return all.filter(x=>x.time<begin+1.6-.00001).map(x=>({sound:x.type==='sine'?'kick':x.type==='triangle'?'snare':x.type,seconds:Math.round((x.time-begin)*1000000)/1000000}));});
    assert.equal(starts.length,8);const order=sequence.startsWith('kick')?['kick','snare']:['snare','kick'];starts.forEach((s,i)=>{assert.equal(s.sound,order[i%2]);assert.equal(s.seconds,i/5);});report.cases.push({sequence,starts});
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.outsideRequests,[]);report.passed=true;
}catch(e){report.failure=e.stack;process.exitCode=1;}finally{await browser.close();await mkdir('.qa',{recursive:true});await writeFile('.qa/mixed-sounds-production-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
