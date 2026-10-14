import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const context=await browser.newContext();const page=await context.newPage();await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.studioDiagnostics&&document.querySelector('#save-label').textContent==='Saved on this computer');
 const old=await page.evaluate(()=>localStorage.getItem('plainMusic.current'));await page.locator('[data-page="projects"]').click();await page.locator('#new-project').click();await page.waitForFunction(id=>window.studioDiagnostics.project.name==='Untitled song'&&localStorage.getItem('plainMusic.current')!==id,old);const scratch=await page.evaluate(()=>localStorage.getItem('plainMusic.current'));
 await page.locator('.cm-content').click();await page.keyboard.press('Control+A');const source='tempo: 133 bpm\n\ntrack: latest\n  sound: triangle\n  notes: F4 A4 C5\n  volume: 19%';await page.keyboard.insertText(source);await page.locator('#project-name').fill('Latest edit before switch');await page.locator('[data-page="projects"]').click();await page.locator(`[data-open-project="${old}"]`).click();await page.waitForFunction(()=>window.studioDiagnostics.project.name==='My first song');
 const result=await page.evaluate(async({scratch,old})=>{const store=await import('/src/storage.ts');const saved=(await store.getProjects()).find(p=>p.id===scratch);return{source:saved.source,name:saved.name,currentMatches:localStorage.getItem('plainMusic.current')===old};},{scratch,old});assert.equal(result.source,source);assert.equal(result.name,'Latest edit before switch');assert.equal(result.currentMatches,true);
 await page.reload();await page.waitForFunction(()=>window.studioDiagnostics?.project.name==='My first song');await page.locator('[data-page="projects"]').click();await page.locator(`[data-open-project="${scratch}"]`).click();await page.waitForFunction(()=>window.studioDiagnostics.project.name==='Latest edit before switch');assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),source);result.reloadAndReopenPreserved=true;
 await mkdir('.qa',{recursive:true});await writeFile('.qa/storage-save-browser-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await context.close();
}finally{await browser.close();}
