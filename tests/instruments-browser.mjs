import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const base=process.env.STUDIO_BASE_URL||'http://127.0.0.1:5174';
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report={passed:[],errors:[],instruments:[]};
const song='tempo: 120 bpm\n\ntrack: existing-music\n  sound: sine\n  notes: C2 rest G2 rest\n  volume: 12%\n\narrange:\n  section: together\n    bars: 8\n    tracks: existing-music';
const boot=async(context)=>{const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(base);await page.waitForFunction(()=>window.studioDiagnostics);return page;};
const setSource=async(page,source)=>{await page.locator('[data-page="studio"]').click();await page.locator('.cm-content').focus();await page.keyboard.press('Control+A');await page.keyboard.insertText(source);await page.waitForFunction(s=>window.studioDiagnostics.project.source===s,source);};
const sound=page=>page.waitForFunction(()=>Math.max(...window.studioDiagnostics.audio.levels)>.0001,null,{timeout:10000});
const quiet=page=>page.waitForFunction(()=>Math.max(...window.studioDiagnostics.audio.levels)<.00001,null,{timeout:10000});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await boot(context);
 page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text());});
 await page.locator('[data-page="library"]').click();
 const instruments=await page.locator('[data-preview-instrument]').evaluateAll(buttons=>buttons.map(b=>({id:b.dataset.previewInstrument,name:b.closest('article').querySelector('h3').textContent})));
 assert.ok(instruments.length>=4,'Includes a useful selection of recorded instruments');
 for(const instrument of instruments){
  await quiet(page);await page.locator(`[data-preview-instrument="${instrument.id}"]`).click();await sound(page);
  report.instruments.push({...instrument,peak:await page.evaluate(()=>Math.max(...window.studioDiagnostics.audio.levels))});
  await setSource(page,song);await page.locator('[data-page="library"]').click();await page.locator(`[data-use-instrument="${instrument.id}"]`).click();
  await page.locator('.studio-piano-panel').waitFor({state:'visible'});
  const state=await page.evaluate(()=>window.studioDiagnostics),name=instrument.id.replace(/^vcsl_/,'').replace(/_/g,'-');
  assert.deepEqual(state.compilation.errors,[]);assert.ok(state.project.source.includes('sound: '+instrument.id));assert.ok(state.project.source.includes('tracks: existing-music '+name));assert.ok(state.compilation.tracks.includes(name));
  await page.locator('#play').click();await page.waitForFunction(()=>window.studioDiagnostics.audio.playing);await sound(page);await page.locator('#stop').click();
  await page.locator('[data-page="library"]').click();
 }
 report.passed.push('Every Listen button produces a nonzero audio signal; every example compiles, joins the arrangement, and starts playing.');
 await setSource(page,song);await page.locator('#play').click();await page.waitForFunction(()=>window.studioDiagnostics.audio.playing&&window.studioDiagnostics.audio.seconds>.3);
 for(const instrument of instruments){await page.locator('#sp-sound').selectOption(instrument.id);const seconds=await page.evaluate(()=>window.studioDiagnostics.audio.seconds);await page.locator('[data-studio-note="E4"]').click();await page.waitForFunction(()=>document.querySelector('#sp-status').textContent.includes('Played E4'));await page.waitForFunction(t=>window.studioDiagnostics.audio.seconds>t+.15,seconds);assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),song);assert.equal(await page.evaluate(()=>window.studioDiagnostics.audio.playing),true);}
 await page.locator('#stop').click();report.passed.push('Every built-in instrument can be auditioned on the Studio piano while the song keeps playing and its code stays unchanged.');
 await context.close();
 const delayContext=await browser.newContext(),delayed=await boot(delayContext);let release;const gate=new Promise(resolve=>{release=resolve;});let intercepted=0;
 await delayed.route(/\.(?:wav|ogg|mp3|flac)(?:\?|$)/i,async route=>{intercepted++;await gate;await route.continue();});
 await delayed.locator('[data-page="library"]').click();const button=delayed.locator('[data-preview-instrument]').first();await button.click();
 await delayed.waitForFunction(()=>Array.from(document.querySelectorAll('[data-preview-instrument]')).some(b=>b.disabled&&b.textContent==='Loading…'));
 await new Promise(resolve=>setTimeout(resolve,350));assert.ok(intercepted>0,'Audio fetch was intercepted');assert.equal(await button.isDisabled(),true);assert.equal(await delayed.evaluate(()=>Math.max(...window.studioDiagnostics.audio.levels)),0);release();await sound(delayed);await button.waitFor({state:'visible'});assert.equal(await button.isDisabled(),false);await delayContext.close();
 report.passed.push('A fresh instrument waits for delayed recordings, shows Loading, and becomes audible once loading finishes.');
 const failedContext=await browser.newContext(),failed=await boot(failedContext);
 const audioPattern=/\.(?:wav|ogg|mp3|flac)(?:\?|$)/i;
 await failed.route(audioPattern,route=>route.fulfill({status:404,body:'Missing sample for test'}));await failed.locator('[data-page="library"]').click();await failed.locator('[data-preview-instrument]').first().click();
 await failed.waitForFunction(()=>document.body.textContent.includes('Could not load')&&document.body.textContent.includes('Check your connection'));
 assert.equal(await failed.locator('[data-preview-instrument]').first().isDisabled(),false);assert.equal(await failed.evaluate(()=>window.studioDiagnostics.audio.playing),false);
 await failed.unroute(audioPattern);await failed.locator('[data-preview-instrument]').first().click();await sound(failed);await failedContext.close();report.passed.push('A missing recording reports a clear error, restores the Listen button, and successfully retries after the file becomes available.');
 assert.deepEqual(report.errors,[]);report.success=true;console.log(JSON.stringify(report,null,2));
}catch(error){report.failure=error.stack;process.exitCode=1;console.error(error);}
finally{await mkdir('.qa',{recursive:true});await writeFile('.qa/instruments-browser-results.json',JSON.stringify(report,null,2));await browser.close();}
