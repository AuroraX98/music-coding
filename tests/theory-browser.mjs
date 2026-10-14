import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report={topics:0,questions:0,practiceProjects:0,errors:[]};
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}});page.on('pageerror',error=>report.errors.push(error.message));
 await page.goto((process.env.STUDIO_SOURCE_URL||'http://127.0.0.1:5174')+'/tests/audio-browser.html');
 const lessons=await page.evaluate(async()=>{const {theoryLessons}=await import('/src/theory.ts');return theoryLessons;});
 await page.goto(process.env.STUDIO_BASE_URL||'http://127.0.0.1:5174');await page.waitForFunction(()=>window.studioDiagnostics);await page.locator('[data-page="theory"]').click();
 assert.equal(await page.locator('[data-theory-topic]').count(),lessons.length);
 for(const lesson of lessons){
  assert.ok(lesson.questions.length>=10);await page.locator(`[data-theory-topic="${lesson.id}"]`).click();
  assert.equal(await page.locator('#theory-title').innerText(),lesson.title);
  for(const [i,q] of lesson.questions.entries()){
   assert.equal(await page.locator('#theory-question-title').innerText(),q.prompt);assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.answer>=0&&q.answer<q.options.length);
   if(i===0){await page.locator(`[data-theory-answer="${(q.answer+1)%q.options.length}"]`).click();assert.match(await page.locator('#theory-feedback').innerText(),/Not quite/);assert.equal(await page.locator('[data-theory-question-next]').isDisabled(),true);}
   await page.locator(`[data-theory-answer="${q.answer}"]`).click();assert.match(await page.locator('#theory-feedback').innerText(),/Correct/);await page.locator('[data-theory-question-next]').click();report.questions++;
  }
  assert.match(await page.locator('#theory-practice').innerText(),/reached the end/);
  await page.locator('[data-theory-review]').click();await page.locator(`[data-theory-answer="${lesson.questions[0].answer}"]`).click();await page.locator('[data-theory-question-next]').click();assert.match(await page.locator('#theory-practice').innerText(),/Review finished/);assert.equal(await page.locator('[data-theory-review]').isDisabled(),true);
  const previous=await page.evaluate(()=>localStorage.getItem('plainMusic.current'));await page.locator('[data-theory-open]').click();await page.waitForFunction(value=>window.studioDiagnostics.project.source===value,lesson.practice.source);await page.waitForFunction(id=>localStorage.getItem('plainMusic.current')!==id,previous);assert.deepEqual(await page.evaluate(()=>window.studioDiagnostics.compilation.errors),[]);report.practiceProjects++;
  await page.locator('[data-page="theory"]').click();report.topics++;
 }
 await page.reload();await page.locator('[data-page="theory"]').click();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('plainMusic.theoryPractice.v1')));assert.equal(Object.keys(saved.solved).length,report.questions);assert.equal(Object.keys(saved.missed).length,0);
 await page.locator('[data-page="projects"]').click();await page.waitForFunction(n=>document.querySelectorAll('[data-open-project]').length===n,lessons.length+1);assert.equal(await page.locator('[data-open-project]').count(),lessons.length+1);await page.locator('[data-page="theory"]').click();
 await page.locator('#theory-search').fill('no-such-topic-xyz');assert.match(await page.locator('#theory-topics').innerText(),/No matching/);await page.locator('#theory-search').fill('');
 await page.locator('[data-theory-topic]').first().click();await page.locator('[data-theory-restart]').click();await page.setViewportSize({width:1024,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await mkdir('.qa',{recursive:true});await page.screenshot({path:'.qa/theory-verified.png',fullPage:true});assert.deepEqual(report.errors,[]);report.passed=true;report.progressSurvivesReload=true;report.originalProjectPreserved=true;console.log(JSON.stringify(report,null,2));
}catch(error){report.failure=error.stack;process.exitCode=1;console.error(error);}finally{await mkdir('.qa',{recursive:true});await writeFile('.qa/theory-browser-results.json',JSON.stringify(report,null,2));await browser.close();}


