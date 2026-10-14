import test from 'node:test';
import assert from 'node:assert/strict';
import {zipSync,unzipSync,strToU8,strFromU8} from 'fflate';
import {exportProject,importProject} from '../src/storage.ts';
import {EXAMPLES} from '../src/guides.ts';
import type {Project,SampleAsset} from '../src/types.ts';

const project:Project={version:1,id:'example-song',name:'My saved song',source:EXAMPLES[3].source,presets:[{id:'my-pad',name:'Warm pad',kind:'pad',waveform:'triangle',volume:0.3,brightness:1500,attack:0.2,length:2,space:0.4,advanced:{detune:8}}],sampleIds:['my-sample'],sliders:[6],views:['piano roll'],modified:123,workingSource:EXAMPLES[0].source};
const sample:SampleAsset={id:'my-sample',name:'My recording',blob:new Blob([new Uint8Array([82,73,70,70,0,0,0,0])],{type:'audio/wav'}),rootNote:'C4',color:'#7c3aed'};
async function altered(change:(files:Record<string,Uint8Array>)=>void):Promise<Blob> {const original=await exportProject(project,[sample]);const files=unzipSync(new Uint8Array(await original.arrayBuffer()));change(files);return new Blob([zipSync(files) as Uint8Array<ArrayBuffer>]);}

test('a project backup restores original audio bytes, code, presets, controls, and metadata',async()=>{
  const original=await exportProject(project,[sample]); const restored=await importProject(original);
  assert.deepEqual(restored.project,project); assert.equal(restored.samples.length,1);
  const asset=restored.samples[0]; assert.equal(asset.rootNote,'C4');assert.equal(asset.color,'#7c3aed');assert.equal(asset.blob.type,'audio/wav');
  assert.deepEqual(new Uint8Array(await asset.blob.arrayBuffer()),new Uint8Array(await sample.blob.arrayBuffer()));
});
test('backup includes only the samples used by a project',async()=>{
  const result=await exportProject(project,[sample,{...sample,id:'unused'}]);
  const files=unzipSync(new Uint8Array(await result.arrayBuffer()));assert.deepEqual(Object.keys(files).sort(),['project.json','samples/my-sample.audio']);
});
test('missing audio fails loudly rather than creating an incomplete backup',async()=>{
  await assert.rejects(exportProject(project,[]),/Missing sample/);
  await assert.rejects(importProject(await altered(files=>{delete files['samples/my-sample.audio'];})),/missing or damaged/);
});
test('import refuses unexpected files and paths',async()=>{
  await assert.rejects(importProject(await altered(files=>{files['../escape.js']=strToU8('alert(1)');})),/unsafe path/);
  await assert.rejects(importProject(await altered(files=>{files['samples/unlisted.audio']=new Uint8Array([1]);})),/unlisted sample/);
});
test('import rejects unsupported versions and mismatched sample lengths',async()=>{
  await assert.rejects(importProject(await altered(files=>{const metadata=JSON.parse(strFromU8(files['project.json']));metadata.version=2;files['project.json']=strToU8(JSON.stringify(metadata));})),/supported/);
  await assert.rejects(importProject(await altered(files=>{files['samples/my-sample.audio']=new Uint8Array([1,2]);})),/missing or damaged/);
});
test('empty libraries still round-trip and imported IDs and presets are checked',async()=>{
  const bare:Project={...project,sampleIds:[]};const bundle=await exportProject(bare,[]);assert.deepEqual((await importProject(bundle)).project,bare);
  await assert.rejects(exportProject({...project,id:'../bad'},[sample]),/Invalid project/);
  await assert.rejects(exportProject({...project,presets:[{...project.presets[0],volume:NaN}]},[sample]),/Invalid sound control/);
});
