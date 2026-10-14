import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report={passed:[],errors:[],layouts:[]};
try{
  const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(process.env.STUDIO_BASE_URL||'http://127.0.0.1:5174');await page.waitForFunction(()=>window.studioDiagnostics);
  assert.equal(await page.title(),'Music Coding');assert.match(await page.locator('.brand').innerText(),/Music Coding/);
  await page.locator('.studio-piano-panel').waitFor({state:'visible'});
  const before=await page.evaluate(()=>window.studioDiagnostics.project.source);
  assert.equal(await page.locator('#sp-insert').isDisabled(),true);
  await page.locator('[data-studio-note="C4"]').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[data-studio-note="C4"]').classList.contains('studio-piano-key-playing'));
  assert.equal(await page.locator('#sp-last-note').innerText(),'C4');
  assert.equal(await page.locator('[data-studio-roll-note="C4"] .studio-piano-playing-block').innerText(),'C4');
  assert.equal(await page.locator('#sp-history').innerText(),'notes: C4');
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),before);
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.audio.playing),false);
  await page.locator('[data-studio-note="E4"]').focus();await page.keyboard.press('Space');
  await page.waitForFunction(()=>document.querySelector('#sp-last-note').textContent==='E4');
  assert.equal(await page.locator('#sp-history').innerText(),'notes: C4 E4');
  assert.equal(await page.locator('#sp-roll .studio-piano-block').count(),2);
  await page.waitForFunction(()=>document.querySelectorAll('.studio-piano-key-playing').length===0);
  assert.match(await page.locator('[data-studio-note="E4"]').getAttribute('class'),/studio-piano-key-latest/);
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),before);
  report.passed.push('Studio piano is visible immediately; Enter and Space audition notes with latest/history/active pitch display and no source changes.');

  await page.locator('[data-page="designer"]').click();await page.locator('[data-designer-recipe="bell"]').click();
  await page.locator('#ds-name').fill('qa-studio-bell');await page.locator('#ds-save').click();
  await page.waitForFunction(()=>document.querySelector('#ds-message').textContent.includes('Sound saved'));
  await page.locator('[data-page="studio"]').click();
  const savedOption=page.locator('#sp-sound option').filter({hasText:'qa-studio-bell'});assert.equal(await savedOption.count(),1);
  await page.locator('#sp-sound').selectOption(await savedOption.getAttribute('value'));
  await page.locator('[data-studio-note="G4"]').click();
  await page.waitForFunction(()=>document.querySelector('#sp-status').textContent.includes('Played G4'));
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),before);
  report.passed.push('A newly saved designed sound appears in the Studio piano selector and auditions successfully without editing the song.');

  const source='tempo: 120 bpm\n\ntrack: continuing-song\n  sound: sine\n  notes: C2 rest G2 rest\n  volume: 12%\n\ntrack: editable-melody\n  sound: triangle\n  notes: C4 E4\n  volume: 15%';
  await page.locator('.cm-content').focus();await page.keyboard.press('Control+A');await page.keyboard.insertText(source);
  await page.locator('#play').click();await page.waitForFunction(()=>window.studioDiagnostics.audio.playing&&window.studioDiagnostics.audio.seconds>.3);
  const seconds=await page.evaluate(()=>window.studioDiagnostics.audio.seconds);
  await page.locator('[data-studio-note="C4"]').click();
  await page.waitForFunction(()=>document.querySelector('#sp-status').textContent.includes('Played C4'));
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.audio.playing),true);
  await page.waitForFunction(t=>window.studioDiagnostics.audio.seconds>t+.4,seconds);
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),source);
  await page.locator('#stop').click();
  report.passed.push('The song continues playing and its timeline advances while a saved sound is auditioned on the Studio piano.');

  await page.locator('.cm-line').filter({hasText:/^\s*notes: C4 E4$/}).click();
  await page.keyboard.press('End');await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowLeft');
  await page.locator('[data-studio-note="G4"]').click();
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),source);
  await page.locator('#sp-insert').click();
  assert.equal(await page.evaluate(()=>window.studioDiagnostics.project.source),source.replace('notes: C4 E4','notes: C4 G4 E4'));
  assert.deepEqual(await page.evaluate(()=>window.studioDiagnostics.compilation.errors),[]);
  report.passed.push('Explicit Insert adds the last auditioned note at the remembered editor caret; audition itself never inserts.');

  const labelColors=()=>page.locator('[data-track-line]').evaluateAll(elements=>elements.map(el=>getComputedStyle(el).color));
  assert.ok((await labelColors()).every(color=>color==='rgb(255, 255, 255)'));
  await page.locator('[data-mute]').first().click();await page.locator('[data-solo]').first().click();
  assert.ok((await labelColors()).every(color=>color==='rgb(255, 255, 255)'));
  await mkdir('.qa',{recursive:true});
  for(const width of [1440,1024]){
    await page.setViewportSize({width,height:1050});
    const layout=await page.evaluate(()=>{const editor=document.querySelector('.editor-card').getBoundingClientRect(),piano=document.querySelector('.studio-piano-panel').getBoundingClientRect();return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,editor:{x:editor.x,y:editor.y,width:editor.width,height:editor.height},piano:{x:piano.x,y:piano.y,width:piano.width,height:piano.height}};});
    assert.equal(layout.overflow,false);assert.ok(layout.piano.x>=layout.editor.x+layout.editor.width-2,'Piano should be beside the editor');assert.ok(Math.abs(layout.piano.y-layout.editor.y)<5,'Piano and editor should align at the top');
    report.layouts.push(layout);await page.screenshot({path:`.qa/studio-piano-${width}.png`,fullPage:true});
  }
  await page.locator('#sp-clear').click();assert.equal(await page.locator('#sp-roll .studio-piano-block').count(),0);assert.equal(await page.locator('#sp-insert').isDisabled(),true);
  assert.deepEqual(report.errors,[]);report.passed.push('Editor and piano stay side by side at 1440 and 1024 pixels without page overflow; white track labels survive mute/solo updates.');report.success=true;
  console.log(JSON.stringify(report,null,2));
}catch(error){report.failure=error.stack;process.exitCode=1;console.error(error);}
finally{await mkdir('.qa',{recursive:true});await writeFile('.qa/studio-piano-browser-results.json',JSON.stringify(report,null,2));await browser.close();}
