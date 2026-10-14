import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const result=[];
try {
 for(const name of ['unavailable bank','studio bank','late missing sound']){
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.audioPeak=0;const original=AnalyserNode.prototype.getFloatTimeDomainData;AnalyserNode.prototype.getFloatTimeDomainData=function(data){original.call(this,data);for(const n of data)window.audioPeak=Math.max(window.audioPeak,Math.abs(n));};});
  await page.goto(process.env.STUDIO_BASE_URL||'http://127.0.0.1:5174');await page.waitForFunction(()=>window.studioDiagnostics);
  const source=name==='studio bank'?'tempo: 600 bpm\ntrack: drums\n  play: kick snare hat snare\n  bank: studio':name==='unavailable bank'?'tempo: 600 bpm\ntrack: test\n  sound: sine\n  notes: C4*4\n  bank: my drums':'tempo: 600 bpm\ntrack: test\n  sound: <triangle triangle triangle triangle notloaded>\n  notes: C4';
  await page.locator('.cm-content').focus();await page.keyboard.press('Control+A');await page.keyboard.insertText(source);await page.locator('#play').click();
  if(name==='studio bank')await page.waitForFunction(()=>window.audioPeak>.001);
  else await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('not loaded')||document.querySelector('#status').textContent.includes('no loaded sound'));
  const state=await page.evaluate(()=>({playing:window.studioDiagnostics.audio.playing,status:document.querySelector('#status').textContent,peak:window.audioPeak}));
  assert.equal(state.playing,name==='studio bank');assert.deepEqual(errors,[]);
  if(name==='unavailable bank')assert.match(state.status,/Remove the bank command/);
  if(name==='late missing sound')assert.match(state.status,/Playback stopped:.*notloaded/);
  result.push({name,...state});await page.close();
 }
 console.log(JSON.stringify({passed:true,result},null,2));
}finally{await browser.close();}
