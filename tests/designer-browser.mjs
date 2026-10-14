import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report={passed:[],errors:[],theme:[]};
try {
  const context=await browser.newContext({viewport:{width:1440,height:1050}});
  const page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(process.env.STUDIO_BASE_URL||'http://127.0.0.1:5174');
  await page.waitForFunction(()=>window.studioDiagnostics);
  await page.evaluate(async()=>{
    const audioUrl=performance.getEntriesByType('resource').map(entry=>entry.name).find(url=>new URL(url).pathname==='/src/audio.ts');
    if(!audioUrl)return;
    const {AudioEngine}=await import(audioUrl);
    const original=AudioEngine.prototype.play;
    window.designerPlayCalls=[];
    AudioEngine.prototype.play=async function(compilation,mix){window.designerPlayCalls.push(compilation.source);return original.call(this,compilation,mix);};
  });
  const hasSourceHooks=await page.evaluate(()=>Boolean(window.designerPlayCalls));report.sourceHooks=hasSourceHooks;
  const existing='tempo: 111 bpm\n\n// Keep this existing musical idea.\ntrack: my-original\n  sound: sine\n  notes: C2 rest G2 rest\n  volume: 15%';
  await page.locator('.cm-content').focus();await page.keyboard.press('Control+A');await page.keyboard.insertText(existing);
  await page.locator('[data-page="designer"]').click();
  assert.ok(await page.locator('[data-designer-recipe]').count()>=14);
  assert.ok(await page.locator('[data-designer-control]').count()>=17);
  const setControl=async(key,value)=>page.locator(`[data-designer-control="${key}"]`).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));},value);
  const code=()=>page.locator('#ds-code').innerText();
  await page.locator('[data-designer-recipe="bell"]').click();
  const startingCode=await code();
  await setControl('attack',.25);
  assert.notEqual(await code(),startingCode);
  assert.ok(await page.locator('.designer-code-changed').count()>0);
  await page.locator('#ds-undo').click();assert.equal(await code(),startingCode);
  await setControl('attack',.25);
  await setControl('advanced.sustain',.35);
  await setControl('advanced.cutoff',2600);
  await setControl('advanced.lpenv',1.4);
  await setControl('advanced.delay',.18);
  await setControl('advanced.delaytime',.24);
  await setControl('space',.12);
  await setControl('volume',.18);
  await page.locator('#ds-name').fill('qa-bell-shape');
  const editedCode=await code();
  await page.locator('#ds-original').click();
  await page.waitForFunction(()=>window.studioDiagnostics.audio.playing);
  assert.equal(await code(),editedCode);
  if(hasSourceHooks)assert.match(await page.evaluate(()=>window.designerPlayCalls.at(-1)),/attack: 0\.002/);
  await page.locator('#ds-stop').click();await page.waitForFunction(()=>!window.studioDiagnostics.audio.playing);
  await page.locator('#ds-preview').click();
  await page.waitForFunction(()=>window.studioDiagnostics.audio.playing);
  if(hasSourceHooks)assert.match(await page.evaluate(()=>window.designerPlayCalls.at(-1)),/attack: 0\.25/);
  await page.waitForFunction(()=>!window.studioDiagnostics.audio.playing,{},{timeout:8000});
  report.passed.push('Fourteen recipes, richer controls, changed code highlights, one-step Undo, original comparison preserves edits, and single preview stops.');

  await page.locator('#ds-repeat').check();await page.locator('#ds-preview').click();
  await page.waitForFunction(()=>window.studioDiagnostics.audio.playing);
  await page.waitForTimeout(2900);assert.equal(await page.evaluate(()=>window.studioDiagnostics.audio.playing),true);
  await setControl('volume',.17);
  await page.waitForFunction(()=>document.querySelector('#ds-message').textContent.includes('updated sound'));
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.audio.playing),true);
  if(hasSourceHooks)assert.match(await page.evaluate(()=>window.designerPlayCalls.at(-1)),/volume: (17%|0\.17)/);
  await setControl('volume',.18);await page.waitForFunction(()=>document.querySelector('#ds-message').textContent.includes('updated sound'));
  await page.locator('[data-page="library"]').click();await page.waitForFunction(()=>!window.studioDiagnostics.audio.playing);
  await page.locator('[data-page="designer"]').click();
  assert.equal(await code(),editedCode);
  report.passed.push('Repeat continues beyond one preview and stops when leaving the designer; edited settings survive navigation.');

  await page.locator('[data-designer-note="C4"]').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.studioDiagnostics.audio.playing);
  await page.waitForFunction(()=>document.querySelector('[data-designer-note="C4"]').classList.contains('designer-key-playing'));
  assert.equal(await page.locator('[data-designer-roll-note="C4"] .designer-note-playing').innerText(),'C4');
  assert.equal(await page.locator('#ds-last-note').innerText(),'C4');
  assert.match(await page.locator('[data-designer-note="C4"]').getAttribute('class'),/designer-key-latest/);
  if(hasSourceHooks){const keyPlayback=await page.evaluate(()=>window.designerPlayCalls.at(-1));assert.match(keyPlayback,/notes: C4 rest rest rest/);assert.match(keyPlayback,/attack: 0\.25/);}
  await page.locator('[data-designer-note="E4"]').focus();await page.keyboard.press('Space');
  await page.waitForFunction(()=>document.querySelector('#ds-last-note').textContent==='E4');
  assert.equal(await page.locator('#ds-recent-notes').innerText(),'notes: C4 E4');
  assert.equal(await page.locator('#ds-note-roll .designer-note-block').count(),2);
  assert.equal(await page.locator('#ds-note-roll .designer-note-latest').innerText(),'E4');
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),existing);
  await page.locator('#ds-stop').click();
  await page.locator('#ds-mode').selectOption('chords');await page.locator('#ds-preview').click();
  await page.waitForFunction(()=>document.querySelectorAll('.designer-key-playing').length>=3);
  assert.ok(await page.locator('.designer-note-playing').count()>=3);
  await page.locator('#ds-stop').click();assert.equal(await page.locator('.designer-note-playing').count(),0);
  report.passed.push('Virtual piano uses the current sound, supports Enter and Space, labels the latest key, shows note history, and preserves song code.');

  await page.locator('#ds-save').click();
  await page.waitForFunction(()=>document.querySelector('#ds-message').textContent.includes('Sound saved'));
  const saved=await page.evaluate(()=>new Promise((resolve,reject)=>{const open=indexedDB.open('plain-music-studio',1);open.onerror=()=>reject(open.error);open.onsuccess=()=>{const db=open.result,request=db.transaction('settings').objectStore('settings').get('presets');request.onsuccess=()=>{resolve(request.result.presets.find(p=>p.name==='qa-bell-shape'));db.close();};request.onerror=()=>reject(request.error);};}));
  assert.equal(saved.attack,.25);assert.equal(saved.advanced.sustain,.35);assert.equal(saved.advanced.cutoff,2600);assert.equal(saved.advanced.lpenv,1.4);assert.equal(saved.advanced.delay,.18);assert.equal(saved.advanced.delaytime,.24);assert.equal(saved.space,.12);assert.equal(saved.volume,.18);
  await page.locator('#ds-mode').selectOption('chords');
  const insertedCode=(await code()).trim();
  await page.locator('#ds-insert').click();await page.waitForFunction(()=>!document.querySelector('#page-studio').hidden);
  const source=await page.evaluate(()=>window.studioDiagnostics.project.source);
  assert.ok(source.startsWith(existing+'\n\n'));
  assert.ok(source.includes(insertedCode));
  assert.deepEqual(await page.evaluate(()=>window.studioDiagnostics.compilation.errors),[]);
  await page.reload();await page.waitForFunction(()=>window.studioDiagnostics?.project.source.includes('qa-bell-shape'));
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),source);
  report.passed.push('Saved preset retains changed controls; full chord track insertion retains every generated setting and existing code; the song survives reload.');

  const arranged=existing+'\n\narrange:\n  section: intro\n    bars: 4\n    tracks: my-original // keep this comment\n  section: full\n    bars: 8\n    tracks: my-original';
  await page.locator('.cm-content').focus();await page.keyboard.press('Control+A');await page.keyboard.insertText(arranged);
  await page.locator('[data-page="designer"]').click();await page.locator('[data-designer-recipe="pluck"]').click();
  const arrangementCode=(await code()).trim();const addedName=arrangementCode.match(/^track: (.+)$/m)[1];
  await page.locator('#ds-insert').click();await page.waitForFunction(()=>!document.querySelector('#page-studio').hidden);
  const expected=arranged.replace('tracks: my-original // keep this comment',`tracks: my-original ${addedName} // keep this comment`);
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),expected+'\n\n'+arrangementCode+'\n');
  assert.deepEqual(await page.evaluate(()=>window.studioDiagnostics.compilation.errors),[]);
  report.passed.push('Insertion into an arranged song adds the new track to the first section and preserves all original lines, other sections, and comments.');

  for(const destination of ['studio','designer','library','projects','guide','writing','theory']){
    await page.locator(`[data-page="${destination}"]`).click();
    const theme=await page.evaluate(()=>{
      const white=[];
      for(const el of document.querySelectorAll('body *')){
        if(!el.getClientRects().length)continue;
        const css=getComputedStyle(el),rgb=css.backgroundColor.match(/[\d.]+/g)?.map(Number);
        if(rgb&&rgb.length>=3&&(rgb.length===3||rgb[3]>.8)&&rgb.slice(0,3).every(n=>n>220))white.push(el.tagName+'.'+String(el.className).slice(0,80));
      }
      return {background:getComputedStyle(document.body).backgroundColor,accent:getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),whiteSurfaces:white,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.equal(theme.background,'rgb(23, 27, 26)');assert.equal(theme.accent,'#8be0b9');assert.deepEqual(theme.whiteSurfaces,[]);assert.equal(theme.overflow,false);report.theme.push({page:destination,...theme});
  }
  await page.locator('[data-page="designer"]').click();
  await page.locator('[data-designer-note="C4"]').click();await page.locator('[data-designer-note="E4"]').click();await page.locator('[data-designer-note="G4"]').click();await page.locator('#ds-stop').click();
  await page.setViewportSize({width:1024,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await mkdir('.qa',{recursive:true});await page.screenshot({path:'.qa/designer-charcoal-mint.png',fullPage:true});
  assert.deepEqual(report.errors,[]);report.success=true;
  console.log(JSON.stringify(report,null,2));
}catch(error){report.failure=error.stack;process.exitCode=1;console.error(error);}
finally{await mkdir('.qa',{recursive:true});await writeFile('.qa/designer-browser-results.json',JSON.stringify(report,null,2));await browser.close();}
