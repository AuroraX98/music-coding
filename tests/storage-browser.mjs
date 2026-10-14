import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {unzipSync,strFromU8} from 'fflate';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const output=path.resolve('.qa');await mkdir(output,{recursive:true});
const wave=Buffer.alloc(44+9600);const text=(offset,value)=>wave.write(value,offset,'ascii');text(0,'RIFF');wave.writeUInt32LE(wave.length-8,4);text(8,'WAVE');text(12,'fmt ');wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(48000,24);wave.writeUInt32LE(96000,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);text(36,'data');wave.writeUInt32LE(9600,40);for(let i=0;i<4800;i++)wave.writeInt16LE(Math.round(Math.sin(i*.12)*8000),44+i*2);
const originalHash=createHash('sha256').update(wave).digest('hex');
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const report={passed:[],failures:[],pageErrors:[],blockedExternal:[],originalHash};
let lastPage;
async function context(){const ctx=await browser.newContext({acceptDownloads:true});await ctx.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='127.0.0.1'||['blob:','data:'].includes(url.protocol))return route.continue();report.blockedExternal.push(route.request().url());return route.abort();});const page=await ctx.newPage();lastPage=page;page.on('pageerror',error=>report.pageErrors.push(error.message));await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.studioDiagnostics&&document.querySelector('#save-label').textContent==='Saved on this computer');return{ctx,page};}
async function data(page){return page.evaluate(async()=>{const store=await import('/src/storage.ts');const projects=await store.getProjects();const samples=await store.getSamples();const hashes=await Promise.all(samples.map(async sample=>{const hash=await crypto.subtle.digest('SHA-256',await sample.blob.arrayBuffer());return{id:sample.id,name:sample.name,rootNote:sample.rootNote,color:sample.color,size:sample.blob.size,type:sample.blob.type,hash:[...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('')};}));return{projects,samples:hashes,current:localStorage.getItem('plainMusic.current'),diagnostics:window.studioDiagnostics};});}
async function replaceSource(page,source){await page.locator('.cm-content').click();await page.keyboard.press('Control+A');await page.keyboard.insertText(source);await page.waitForFunction(value=>window.studioDiagnostics.project.source===value,source);}
const source='tempo: 120 bpm\n\ntrack: recording\n  sound: storage-fixture\n  notes: C4 E4 G4 E4\n  volume: 30%\n\ntrack: designed\n  sound: qa-soft-pad\n  notes: C3 G3\n\narrange:\n  section: song\n    bars: 4\n    tracks: recording designed\n\nshow: piano roll';
try{
  const first=await context();const page=first.page;
  await page.locator('[data-page="library"]').click();
  await page.locator('#sample-files').setInputFiles({name:'storage-fixture.wav',mimeType:'audio/wav',buffer:wave});
  await page.waitForFunction(()=>window.studioDiagnostics.sampleCount===1);
  await page.locator('[data-root]').fill('C4');await page.locator('[data-root]').dispatchEvent('change');
  await page.locator('[data-use-sample]').click();
  await page.waitForFunction(()=>window.studioDiagnostics.project.source.includes('storage-fixture'));
  await page.locator('[data-page="designer"]').click();await page.locator('[data-kind="pad"]').click();await page.locator('#design-name').fill('qa-soft-pad');
  await page.locator('#design-volume').evaluate(el=>{el.value='.37';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#design-save').click();await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Saved qa-soft-pad'));
  await page.locator('[data-page="studio"]').click();await replaceSource(page,source);await page.locator('#project-name').fill('Storage verification song');
  await page.locator('[data-page="projects"]').click();await page.waitForFunction(()=>document.querySelector('[data-backup-project]'));
  const before=await data(page);const original=before.projects.find(p=>p.id===before.current);assert.ok(original);assert.equal(original.source,source);assert.equal(before.samples[0].hash,originalHash);assert.equal(before.samples[0].rootNote,'C4');assert.equal(original.sampleIds.length,1);assert.equal(original.presets.find(p=>p.name==='qa-soft-pad').volume,.37);
  const downloadWait=page.waitForEvent('download');await page.locator(`[data-backup-project="${original.id}"]`).click();const download=await downloadWait;const backup=path.join(output,'storage-song.music.zip');await download.saveAs(backup);
  const zip=unzipSync(new Uint8Array(await readFile(backup)));const metadata=JSON.parse(strFromU8(zip['project.json']));assert.equal(metadata.project.source,source);assert.equal(metadata.assets.length,1);assert.equal(createHash('sha256').update(zip[metadata.assets[0].path]).digest('hex'),originalHash);report.passed.push('Original audio upload and UI Use retain exact audio bytes and root note; downloaded ZIP contains exact source, preset and originals.');
  const fresh=await context();await fresh.page.locator('#project-file').setInputFiles(backup);await fresh.page.waitForFunction(()=>window.studioDiagnostics.project.name==='Storage verification song (imported)');
  const imported=await data(fresh.page);const restored=imported.projects.find(p=>p.id===imported.current);assert.equal(restored.source,source);assert.equal(imported.samples[0].hash,originalHash);assert.equal(imported.samples[0].rootNote,'C4');assert.equal(restored.presets.find(p=>p.name==='qa-soft-pad').volume,.37);assert.notEqual(restored.id,original.id);
  await fresh.page.reload();await fresh.page.waitForFunction(()=>window.studioDiagnostics?.project.name==='Storage verification song (imported)'&&document.querySelector('#save-label').textContent==='Saved on this computer');const afterReload=await data(fresh.page);assert.equal(afterReload.diagnostics.project.source,source);assert.equal(afterReload.samples[0].hash,originalHash);assert.equal(afterReload.projects.find(p=>p.id===afterReload.current).presets.find(p=>p.name==='qa-soft-pad').volume,.37);report.passed.push('Fresh browser import creates a distinct project; page reload restores exact source, original audio bytes/root note, and designed preset.');
  // Open the project screen first, then perform a rapid rename/code edit and switch.
  await fresh.page.locator('[data-page="projects"]').click();await fresh.page.locator('#new-project').click();await fresh.page.waitForFunction(id=>window.studioDiagnostics.project.name==='Untitled song'&&localStorage.getItem('plainMusic.current')!==id,restored.id);
  const scratch=await data(fresh.page);const scratchId=scratch.current;await fresh.page.locator('[data-page="projects"]').click();await fresh.page.waitForFunction(()=>document.querySelectorAll('[data-open-project]').length>=3);await fresh.page.locator('[data-page="studio"]').click();
  const latest='tempo: 133 bpm\n\ntrack: latest\n  sound: triangle\n  notes: F4 A4 C5\n  volume: 19%';await replaceSource(fresh.page,latest);await fresh.page.locator('#project-name').fill('Latest edit before switch');
  // Navigation forces saving, and then opening the old project must preserve these edits.
  await fresh.page.locator('[data-page="projects"]').click();await fresh.page.locator(`[data-open-project="${restored.id}"]`).click();await fresh.page.waitForFunction(()=>window.studioDiagnostics.project.name==='Storage verification song (imported)');
  const switched=await data(fresh.page);const savedLatest=switched.projects.find(p=>p.id===scratchId);assert.equal(savedLatest.name,'Latest edit before switch');assert.equal(savedLatest.source,latest);assert.equal(switched.current,restored.id);report.passed.push('Rapid code edit and rename followed by project switch preserve the latest source and name, and current-project ID matches the opened project.');
  const atomic=await fresh.page.evaluate(async()=>{
    const store=await import('/src/storage.ts');const projects=await store.getProjects();const samples=await store.getSamples();const base=projects[0];const old=samples[0];const result=[];
    for(const kind of ['sample-collision','project-collision','missing-reference']){
      const asset={id:crypto.randomUUID(),name:'atomic-'+kind,blob:new Blob([new Uint8Array([1,2,3,4])],{type:'audio/wav'})};
      const project={...structuredClone(base),id:kind==='project-collision'?base.id:crypto.randomUUID(),sampleIds:kind==='sample-collision'?[asset.id,old.id]:kind==='missing-reference'?[asset.id,'missing-id']:[asset.id]};
      const additions=kind==='sample-collision'?[asset,{...old,blob:new Blob([new Uint8Array([9,9,9,9])],{type:'audio/wav'})}]:[asset];
      let rejected=false;try{await store.saveImportedProject(project,additions);}catch{rejected=true;}
      const nextProjects=await store.getProjects(),nextSamples=await store.getSamples();
      const original=nextSamples.find(s=>s.id===old.id);const oldBytes=new Uint8Array(await old.blob.arrayBuffer()),nowBytes=new Uint8Array(await original.blob.arrayBuffer());
      result.push({kind,rejected,projectCountUnchanged:nextProjects.length===projects.length,sampleCountUnchanged:nextSamples.length===samples.length,newAssetAbsent:!nextSamples.some(s=>s.id===asset.id),originalPreserved:oldBytes.length===nowBytes.length&&oldBytes.every((n,i)=>n===nowBytes[i])});
    }
    return result;
  });
  for(const item of atomic)for(const [key,value]of Object.entries(item))if(key!=='kind')assert.equal(value,true,`${item.kind}: ${key}`);report.atomic=atomic;report.passed.push('Real IndexedDB atomic import rolls back new assets and projects on sample collision, project collision, and missing reused sample; original bytes remain unchanged.');
  report.projectsAfter=switched.projects.length;report.sampleBytes=wave.length;
  await first.ctx.close();await fresh.ctx.close();
}catch(error){report.failures.push({message:error.message,stack:error.stack});if(lastPage){report.failureState=await lastPage.evaluate(()=>({toast:document.querySelector('#toast').textContent,status:document.querySelector('#status').textContent,diagnostics:window.studioDiagnostics})).catch(()=>({}));await lastPage.screenshot({path:path.join(output,'storage-browser-failure.png'),fullPage:true}).catch(()=>{});}process.exitCode=1;}finally{await browser.close();await writeFile(path.join(output,'storage-browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
