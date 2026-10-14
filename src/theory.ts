import {foundationLessons} from './theory-foundations';
import {harmonyLessons} from './theory-harmony';
import {compositionLessons} from './theory-composition';
import {escapeHtml as esc} from './guides';

export interface TheoryQuestion {prompt:string;options:string[];answer:number;explanation:string;}
export interface TheoryPractice {title:string;instruction:string;listenFor:string;source:string;}
export interface TheoryLesson {id:string;title:string;summary:string;body:string;questions:TheoryQuestion[];practice:TheoryPractice;}
export const theoryLessons:TheoryLesson[]=[...foundationLessons,...harmonyLessons,...compositionLessons];
const progressKey='plainMusic.theoryPractice.v1';
type Progress={version:1;topic:string;solved:Record<string,boolean>;missed:Record<string,boolean>};

export function mountTheory(container:HTMLElement,openPractice:(practice:TheoryPractice)=>Promise<void>){
 let progress:Progress={version:1,topic:theoryLessons[0].id,solved:{},missed:{}};
 let storageProblem=false;
 try{const raw=JSON.parse(localStorage.getItem(progressKey)||'null');if(raw?.version===1&&raw.solved&&typeof raw.solved==='object'&&!Array.isArray(raw.solved)&&raw.missed&&typeof raw.missed==='object'&&!Array.isArray(raw.missed)){progress={version:1,topic:String(raw.topic),solved:raw.solved,missed:raw.missed};}}catch{storageProblem=true;}
 let selected=theoryLessons.find(l=>l.id===progress.topic)||theoryLessons[0],query='',index=0,review=false,choice:number|null=null,feedback='',busy=false;
 let order=selected.questions.map((_,i)=>i);
 const optionOrders=new Map<string,number[]>();
 const shuffled=(values:number[])=>{const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;};
 const optionOrder=(qi:number)=>{const id=`${selected.id}:${qi}`;if(!optionOrders.has(id))optionOrders.set(id,shuffled(selected.questions[qi].options.map((_,i)=>i)));return optionOrders.get(id)!;};
 const key=(i:number)=>`${selected.id}:${i}`;
 const persist=()=>{progress.topic=selected.id;try{localStorage.setItem(progressKey,JSON.stringify(progress));storageProblem=false;}catch{storageProblem=true;}};
 const count=(lesson:TheoryLesson)=>lesson.questions.filter((_,i)=>progress.solved[`${lesson.id}:${i}`]).length;
 const saveNote=()=>storageProblem?'Progress cannot be saved in this browser right now. You can still practise.':'Progress stays in this browser. A new website address or browser has separate progress.';
 container.innerHTML=`<div class='page-heading'><div><div class='eyebrow'>Understand it. Hear it. Try it.</div><h1>Music Theory</h1><p>A beginner path from the first beat to building a song.</p></div><span class='badge'>${theoryLessons.length} topics · ${theoryLessons.reduce((n,l)=>n+l.questions.length,0)} exercises</span></div><p class='theory-intro'>Start at the beginning or choose a topic. These lessons focus mainly on the note system used in Western tonal music. Other musical traditions use different systems, and creative choices depend on style and the sound you want.</p><div class='theory-layout'><aside class='theory-menu'><label for='theory-search'>Find a topic</label><input id='theory-search' type='search' placeholder='Try chords, rhythm, or bass'><nav id='theory-topics' aria-label='Music theory topics'></nav><p id='theory-storage' class='theory-storage'></p></aside><div id='theory-content'></div></div>`;
 const nav=container.querySelector<HTMLElement>('#theory-topics')!,content=container.querySelector<HTMLElement>('#theory-content')!;
 function renderNav(){const matches=theoryLessons.filter(l=>`${l.title} ${l.summary} ${l.body.replace(/<[^>]*>/g,' ')}`.toLowerCase().includes(query.toLowerCase()));nav.innerHTML=matches.length?matches.map(l=>`<button data-theory-topic='${l.id}' ${l.id===selected.id?"aria-current='page'":''}><span>${esc(l.title)}</span><small>${count(l)} / ${l.questions.length} answered correctly</small></button>`).join(''):'<p>No matching topics. Try a shorter word or clear the search.</p>';container.querySelector('#theory-storage')!.textContent=saveNote();}
 function renderLesson(){const p=selected.practice;content.innerHTML=`<article class='theory-lesson page-card'><div class='eyebrow'>Topic ${theoryLessons.indexOf(selected)+1} of ${theoryLessons.length}</div><h2 id='theory-title' tabindex='-1'>${esc(selected.title)}</h2><p class='theory-summary'>${esc(selected.summary)}</p><div class='theory-body'>${selected.body}</div></article><section class='theory-coding page-card' aria-labelledby='theory-code-title'><div class='eyebrow'>Try it with code</div><h2 id='theory-code-title'>${esc(p.title)}</h2><p>${esc(p.instruction)}</p><pre>${esc(p.source)}</pre><p><strong>Listen for:</strong> ${esc(p.listenFor)}</p><button data-theory-open class='primary'>Open practice song</button><p class='theory-storage'>Your current song is saved first. This opens a separate practice project.</p><p id='theory-open-status' role='status'></p></section><section id='theory-practice' class='theory-practice page-card' aria-labelledby='theory-practice-title'></section><div class='theory-next'><button data-theory-prev ${theoryLessons.indexOf(selected)===0?'disabled':''}>Previous topic</button><button data-theory-next ${theoryLessons.indexOf(selected)===theoryLessons.length-1?'disabled':''}>Next topic</button></div>`;renderPractice();renderNav();}
 function renderPractice(){const panel=container.querySelector<HTMLElement>('#theory-practice')!;const missed=selected.questions.filter((_,i)=>progress.missed[key(i)]).length;
  const head=`<h2 id='theory-practice-title'>Practise this topic</h2><p>${count(selected)} of ${selected.questions.length} answered correctly. ${missed} marked for another try.</p><div class='theory-practice-actions'><button data-theory-restart>Practise all again</button><button data-theory-review ${missed?'':'disabled'}>Review missed questions</button></div>`;
  if(index>=order.length){panel.innerHTML=head+`<h3 tabindex='-1' id='theory-question-title'>${review?'Review finished':'You reached the end of this set'}</h3><p>Try the coding activity, revisit an explanation, or practise again. A correct answer is a useful check, not proof that you will remember it forever.</p>`;return;}
  const qi=order[index],q=selected.questions[qi];panel.innerHTML=head+`<p class='eyebrow'>${review?'Review':'Question'} ${index+1} of ${order.length}</p><h3 id='theory-question-title' tabindex='-1'>${esc(q.prompt)}</h3><div class='theory-options' role='group' aria-labelledby='theory-question-title'>${optionOrder(qi).map(i=>`<button data-theory-answer='${i}' aria-pressed='${choice===i}' class='${choice===i?(i===q.answer?'answer-right':'answer-retry'):''}'>${esc(q.options[i])}</button>`).join('')}</div><div id='theory-feedback' role='status' class='theory-feedback'>${feedback?`<strong>${choice===q.answer?'Correct.':'Not quite—try again.'}</strong> ${esc(feedback)}`:''}</div><button data-theory-question-next ${choice===q.answer?'':'disabled'}>${index===order.length-1?'Finish this set':'Next question'}</button>`;
 }
 const focusQuestion=()=>container.querySelector<HTMLElement>('#theory-question-title')?.focus({preventScroll:true});
 function select(lesson:TheoryLesson){selected=lesson;index=0;review=false;choice=null;feedback='';order=lesson.questions.map((_,i)=>i);persist();renderLesson();container.querySelector<HTMLElement>('#theory-title')?.focus();}
 container.querySelector<HTMLInputElement>('#theory-search')!.addEventListener('input',event=>{query=(event.target as HTMLInputElement).value;renderNav();});
 container.addEventListener('click',async event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button||button.disabled)return;const d=button.dataset;
  if(d.theoryTopic){const lesson=theoryLessons.find(l=>l.id===d.theoryTopic);if(lesson)select(lesson);}
  else if(d.theoryAnswer!==undefined&&index<order.length){const qi=order[index],q=selected.questions[qi];choice=Number(d.theoryAnswer);feedback=q.explanation;if(choice===q.answer){progress.solved[key(qi)]=true;if(review)delete progress.missed[key(qi)];}else progress.missed[key(qi)]=true;persist();renderPractice();renderNav();container.querySelector<HTMLElement>(`[data-theory-answer='${choice}']`)?.focus({preventScroll:true});}
  else if(d.theoryQuestionNext!==undefined){index++;choice=null;feedback='';renderPractice();focusQuestion();}
  else if(d.theoryRestart!==undefined||d.theoryReview!==undefined){review=d.theoryReview!==undefined;order=selected.questions.map((_,i)=>i).filter(i=>!review||progress.missed[key(i)]);index=0;choice=null;feedback='';renderPractice();focusQuestion();}
  else if(d.theoryPrev!==undefined||d.theoryNext!==undefined){const next=theoryLessons[theoryLessons.indexOf(selected)+(d.theoryNext!==undefined?1:-1)];if(next)select(next);}
  else if(d.theoryOpen!==undefined&&!busy){busy=true;button.disabled=true;const status=container.querySelector<HTMLElement>('#theory-open-status')!;status.textContent='Saving your current song…';try{await openPractice(selected.practice);status.textContent='Practice song opened.';}catch(error){status.textContent=`Could not open practice: ${error instanceof Error?error.message:String(error)}`;}finally{busy=false;button.disabled=false;}}
 });
 renderLesson();
}
