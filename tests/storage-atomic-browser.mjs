import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
  const context=await browser.newContext();const page=await context.newPage();await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.studioDiagnostics&&document.querySelector('#save-label').textContent==='Saved on this computer');
  const result=await page.evaluate(async()=>{
    const store=await import('/src/storage.ts');const base=(await store.getProjects())[0];
    const original={id:'atomic-original',name:'atomic-original',blob:new Blob([new Uint8Array([82,73,70,70,1,2,3,4])],{type:'audio/wav'}),color:'#7042bf'};await store.saveSample(original);
    const baselineProjects=await store.getProjects(),baselineSamples=await store.getSamples();const result=[];
    for(const kind of ['sample-collision','project-collision','missing-reference']){
      const asset={id:crypto.randomUUID(),name:'atomic-'+kind,blob:new Blob([new Uint8Array([1,2,3,4])],{type:'audio/wav'})};
      const project={...structuredClone(base),id:kind==='project-collision'?base.id:crypto.randomUUID(),sampleIds:kind==='sample-collision'?[asset.id,original.id]:kind==='missing-reference'?[asset.id,'missing-id']:[asset.id]};
      const additions=kind==='sample-collision'?[asset,{...original,blob:new Blob([new Uint8Array([9,9,9,9])],{type:'audio/wav'})}]:[asset];
      let rejected=false,error='';try{await store.saveImportedProject(project,additions);}catch(e){rejected=true;error=e.message;}
      const projects=await store.getProjects(),samples=await store.getSamples();const restored=samples.find(s=>s.id===original.id);const bytes=new Uint8Array(await restored.blob.arrayBuffer());
      result.push({kind,error,rejected,projectCountUnchanged:projects.length===baselineProjects.length,sampleCountUnchanged:samples.length===baselineSamples.length,newAssetAbsent:!samples.some(s=>s.id===asset.id),originalPreserved:[82,73,70,70,1,2,3,4].every((n,i)=>n===bytes[i])&&bytes.length===8});
    }
    const validAsset={id:'atomic-valid-asset',name:'atomic-valid-asset',blob:new Blob([new Uint8Array([4,3,2,1])],{type:'audio/wav'})};const validProject={...structuredClone(base),id:'atomic-valid-project',sampleIds:[original.id,validAsset.id]};await store.saveImportedProject(validProject,[validAsset]);
    const projects=await store.getProjects(),samples=await store.getSamples();result.push({kind:'valid-commit',projectAndAssetPresent:projects.some(p=>p.id===validProject.id)&&samples.some(s=>s.id===validAsset.id)});return result;
  });
  for(const item of result)for(const [key,value]of Object.entries(item))if(!['kind','error'].includes(key))assert.equal(value,true,`${item.kind}: ${key}`);
  await mkdir('.qa',{recursive:true});await writeFile('.qa/storage-atomic-browser-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await context.close();
}finally{await browser.close();}
