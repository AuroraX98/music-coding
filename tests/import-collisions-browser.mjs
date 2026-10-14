import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {zipSync,strToU8} from 'fflate';
const {chromium}=await import(pathToFileURL(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const wave=(pitch)=>{const b=Buffer.alloc(9644);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(48000,24);b.writeUInt32LE(96000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(9600,40);for(let i=0;i<4800;i++)b.writeInt16LE(Math.round(Math.sin(i*pitch)*8000),44+i*2);return b;};
const bytes=[wave(.12),wave(.17),wave(.23),wave(.29)];
const source='tempo: 120 bpm\ntrack: recordings\n  play: foo foo-2 id-a s\n  attack: 0.01 s // foo must stay in this comment\n  volume: 20%';
const project={version:1,id:'collision-project',name:'Collision check',source,workingSource:source,modified:Date.now(),presets:[],sampleIds:['id-a','s'],sliders:[],views:['piano roll']};
const assets=[{id:'id-a',name:'foo',rootNote:'C4',mime:'audio/wav',path:'samples/id-a.audio',size:bytes[1].length},{id:'s',name:'foo-2',rootNote:'E4',mime:'audio/wav',path:'samples/s.audio',size:bytes[2].length}];
const files={'project.json':strToU8(JSON.stringify({format:'plain-music-studio',version:1,project,assets})),[assets[0].path]:bytes[1],[assets[1].path]:bytes[2]};
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const ctx=await browser.newContext();const page=await ctx.newPage();const report={passed:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
try{
  await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.studioDiagnostics&&document.querySelector('#save-label').textContent.includes('Saved'));
  await page.locator('[data-page="library"]').click();await page.locator('#sample-files').setInputFiles({name:'foo.wav',mimeType:'audio/wav',buffer:bytes[0]});await page.waitForFunction(()=>window.studioDiagnostics.sampleCount===1);
  await page.locator('#project-file').setInputFiles({name:'collision.music.zip',mimeType:'application/zip',buffer:Buffer.from(zipSync(files,{level:0}))});await page.waitForFunction(()=>window.studioDiagnostics.project.name==='Collision check (imported)');
  const result=await page.evaluate(async()=>{const store=await import('/src/storage.ts');return{project:(await store.getProjects()).find(p=>p.id===localStorage.getItem('plainMusic.current')),samples:await Promise.all((await store.getSamples()).map(async s=>({...s,blob:undefined,hash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',await s.blob.arrayBuffer()))].map(n=>n.toString(16).padStart(2,'0')).join('')})))};});
  const a=result.samples.find(s=>s.name==='foo-3'),b=result.samples.find(s=>s.name==='foo-2');assert.ok(a&&b);assert.notEqual(a.id,b.id);assert.equal(a.rootNote,'C4');assert.equal(b.rootNote,'E4');
  assert.equal(a.hash,createHash('sha256').update(bytes[1]).digest('hex'));assert.equal(b.hash,createHash('sha256').update(bytes[2]).digest('hex'));
  const expected=source.replace('play: foo foo-2 id-a s','play: foo-3 foo-2 '+a.id+' '+b.id);assert.equal(result.project.source,expected);assert.equal(result.project.workingSource,expected);assert.ok(result.project.source.includes('attack: 0.01 s // foo must stay in this comment'));
  assert.equal(result.project.sampleIds.length,2);assert.equal(result.samples.length,3);
  report.passed.push('Import reserves all incoming names before renaming: foo becomes foo-3 while foo-2 remains distinct. Both source versions remap once, sample IDs remap, units/comments stay exact, and original audio hashes/root notes match.');
  await page.reload();await page.waitForFunction(()=>window.studioDiagnostics?.project.name==='Collision check (imported)');assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),expected);report.passed.push('Remapped project survives browser reload.');assert.deepEqual(report.errors,[]);
}catch(e){report.failure=e.stack;process.exitCode=1;}finally{await browser.close();await mkdir('.qa',{recursive:true});await writeFile('.qa/import-collision-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
