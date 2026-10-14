import {chromium} from 'file:///C:/Users/snizh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage();
const checks=[];
async function confirmClick(selector,accept){const handled=new Promise(resolve=>page.once('dialog',async dialog=>{await (accept?dialog.accept():dialog.dismiss());resolve();}));await page.locator(selector).click();await handled;}
try{
 await page.goto(process.env.STUDIO_BASE_URL||'http://127.0.0.1:5174');await page.waitForSelector('#save-label:has-text("Saved")');
 await page.locator('[data-page="guide"]').click();await page.locator('#reference-search').fill('echo');
 const category=page.locator('[data-category]').first();const categoryId=await category.getAttribute('data-category');await category.click();
 await page.locator('[data-page="library"]').click();await page.locator('[data-page="guide"]').click();
 assert.equal(await page.locator('#reference-search').inputValue(),'echo');assert.equal(await page.locator(`[data-category="${categoryId}"]`).getAttribute('aria-current'),'location');checks.push('Guide query and category survive leaving and returning');
 assert.equal(await page.locator('[data-page="guide"]').getAttribute('aria-current'),'page');
 await page.locator('[data-page="studio"]').click();await page.locator('#note-toggle').click();assert.equal(await page.locator('#note-toggle').getAttribute('aria-expanded'),'true');
 const before=await page.evaluate(()=>window.studioDiagnostics.project.source);await page.locator('[data-note="C4"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(100);
 assert.notEqual(await page.evaluate(()=>window.studioDiagnostics.project.source),before);checks.push('Keyboard Enter inserts a note');
 await page.locator('[data-mute]').first().click();assert.equal(await page.locator('[data-mute]').first().getAttribute('aria-pressed'),'true');assert.match(await page.locator('[data-mute]').first().getAttribute('aria-label'),/^Mute /);checks.push('Mute state and accessible name update');
 await page.locator('[data-page="projects"]').click();await page.locator('[data-delete-project]').first().waitFor();
 const originalId=await page.locator('[data-delete-project]').first().getAttribute('data-delete-project');
 await confirmClick(`[data-delete-project="${originalId}"]`,false);assert.equal(await page.locator(`[data-delete-project="${originalId}"]`).count(),1);checks.push('Cancel keeps active project');
 await confirmClick(`[data-delete-project="${originalId}"]`,true);await page.waitForFunction(id=>!document.querySelector(`[data-delete-project="${id}"]`),originalId);checks.push('Confirm deletes active project and opens replacement');
 await page.locator('[data-page="projects"]').click();await page.locator('#new-project').click();await page.locator('[data-page="projects"]').click();await page.waitForFunction(()=>document.querySelectorAll('[data-delete-project]').length===2);
 const current=await page.evaluate(()=>localStorage.getItem('plainMusic.current'));const other=await page.locator(`[data-delete-project]:not([data-delete-project="${current}"])`).getAttribute('data-delete-project');
 await confirmClick(`[data-delete-project="${other}"]`,false);assert.equal(await page.locator(`[data-delete-project="${other}"]`).count(),1);
 await confirmClick(`[data-delete-project="${other}"]`,true);await page.waitForFunction(id=>!document.querySelector(`[data-delete-project="${id}"]`),other);assert.equal(await page.evaluate(()=>localStorage.getItem('plainMusic.current')),current);checks.push('Cancel and confirm handle inactive project without switching current song');
 await page.evaluate(async()=>{const bytes=new ArrayBuffer(48),v=new DataView(bytes);const word=(offset,s)=>[...s].forEach((c,i)=>v.setUint8(offset+i,c.charCodeAt(0)));word(0,'RIFF');v.setUint32(4,40,true);word(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,16000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);word(36,'data');v.setUint32(40,4,true);await new Promise((resolve,reject)=>{const request=indexedDB.open('plain-music-studio',1);request.onsuccess=()=>{const db=request.result,tx=db.transaction('samples','readwrite');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);tx.objectStore('samples').put({id:'disposable-qa',name:'disposable-qa',blob:new Blob([bytes],{type:'audio/wav'}),created:Date.now()});};request.onerror=()=>reject(request.error);});});
 await page.reload();await page.waitForSelector('#save-label:has-text("Saved")');await page.locator('[data-page="library"]').click();await page.locator('[data-delete-sample="disposable-qa"]').waitFor();
 await confirmClick('[data-delete-sample="disposable-qa"]',false);assert.equal(await page.locator('[data-delete-sample="disposable-qa"]').count(),1);
 await confirmClick('[data-delete-sample="disposable-qa"]',true);await page.waitForFunction(()=>!document.querySelector('[data-delete-sample="disposable-qa"]'));checks.push('Unused sample cancel preserves data; confirm removes it');
 await writeFile('.qa/navigation-fixes-results-2026-10-13.json',JSON.stringify({passed:true,checks},null,2));console.log(checks.join('\n'));
}finally{await browser.close();}
