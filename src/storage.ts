import {zipSync, unzipSync, strToU8, strFromU8} from 'fflate';
import type {Project, SampleAsset, SoundPreset} from './types';

export const MAX_SAMPLE_BYTES = 64 * 1024 * 1024;
export const MAX_BUNDLE_BYTES = 256 * 1024 * 1024;
const MAX_ASSET = MAX_SAMPLE_BYTES;
const MAX_BUNDLE = MAX_BUNDLE_BYTES;
const MAX_JSON = 4 * 1024 * 1024;
const safeId = /^[a-zA-Z0-9_-]{1,120}$/;
let database: Promise<IDBDatabase> | undefined;

/** The project keeps sample originals, rather than temporary browser blob URLs. */
export async function openStore(): Promise<void> {
  if (!database) database = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(new Error('This browser cannot save projects locally. Download a project backup.')); return; }
    const request = indexedDB.open('plain-music-studio', 1);
    request.onupgradeneeded = () => {
      for (const name of ['projects', 'samples', 'settings']) request.result.createObjectStore(name, {keyPath:'id'});
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'));
    request.onblocked = () => reject(new Error('Close another Studio tab so local storage can open.'));
  });
  try { await database; } catch (error) { database = undefined; throw error; }
}

async function transaction<T>(store: string, mode: IDBTransactionMode, operation: (object: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  await openStore();
  const db = await database!;
  return new Promise((resolve,reject) => {
    const tx = db.transaction(store, mode);
    const request = operation(tx.objectStore(store));
    let result: T;
    request.onsuccess = () => { result = request.result; };
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error ?? request.error ?? new Error('Local save failed. Download a backup and check browser storage.'));
    tx.onabort = () => reject(tx.error ?? new Error('Local save was cancelled.'));
  });
}

export const getProjects = async ():Promise<Project[]> => (await transaction('projects','readonly',s=>s.getAll()) as Project[]).sort((a,b)=>b.modified-a.modified);
export async function saveProject(project:Project):Promise<void> { validateProject(project); const snapshot=structuredClone(project); await transaction('projects','readwrite',s=>s.put(snapshot)); }
export async function deleteProject(id:string):Promise<void> { assertId(id); await transaction('projects','readwrite',s=>s.delete(id)); }
export const getSamples = async ():Promise<SampleAsset[]> => await transaction('samples','readonly',s=>s.getAll()) as SampleAsset[];
export async function saveSample(sample:SampleAsset):Promise<void> { validateSample(sample); const snapshot=structuredClone(sample); await transaction('samples','readwrite',s=>s.put(snapshot)); }
export async function deleteSample(id:string):Promise<void> { assertId(id); await transaction('samples','readwrite',s=>s.delete(id)); }
export async function getLibraryPresets():Promise<SoundPreset[]> { const value = await transaction('settings','readonly',s=>s.get('presets')); return value?.presets ?? []; }
export async function saveLibraryPresets(presets:SoundPreset[]):Promise<void> { validatePresets(presets); const snapshot=structuredClone(presets); await transaction('settings','readwrite',s=>s.put({id:'presets',presets:snapshot})); }

/** Atomically adds a new project and new audio originals. Reused samples must already exist. */
export async function saveImportedProject(project:Project,newSamples:SampleAsset[]):Promise<void> {
  validateProject(project); newSamples.forEach(validateSample);
  assert(new Set(newSamples.map(s=>s.id)).size===newSamples.length,'Duplicate imported sample ID.');
  assert(newSamples.every(s=>project.sampleIds.includes(s.id)),'Imported audio is not used by this project.');
  const snapshot=structuredClone(project),assets=structuredClone(newSamples);
  await openStore(); const db=await database!;
  await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction(['projects','samples'],'readwrite'); let problem:Error|undefined;
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(problem??tx.error??new Error('Could not import project.'));
    tx.onabort=()=>reject(problem??tx.error??new Error('Import was cancelled; no project or samples were saved.'));
    const originals=tx.objectStore('samples'); const supplied=new Set(assets.map(s=>s.id));
    for(const id of snapshot.sampleIds)if(!supplied.has(id)){
      const check=originals.get(id);check.onsuccess=()=>{if(!check.result){problem=new Error(`Missing sample: ${id}. Nothing was imported.`);tx.abort();}};
    }
    // add protects existing records if another tab creates an ID during import.
    for(const sample of assets)originals.add(sample);
    tx.objectStore('projects').add(snapshot);
  });
}

function assert(condition:unknown,message:string):asserts condition { if(!condition) throw new Error(message); }
function assertId(id:unknown):asserts id is string { assert(typeof id === 'string' && safeId.test(id),'Invalid project or sample ID.'); }
function validatePresets(presets:unknown):asserts presets is SoundPreset[] {
  assert(Array.isArray(presets) && presets.length <= 500,'Invalid sound presets.');
  const ids = new Set<string>();
  for (const preset of presets) {
    assert(preset && typeof preset === 'object','Invalid sound preset.'); assertId(preset.id);
    assert(!ids.has(preset.id),'Duplicate sound preset ID.'); ids.add(preset.id);
    assert(typeof preset.name === 'string' && preset.name.length <= 200,'Invalid sound name.');
    assert(['kick','snare','bass','lead','pad'].includes(preset.kind),'Invalid sound type.');
    assert(typeof preset.waveform === 'string' && preset.waveform.length <= 80,'Invalid waveform.');
    for(const key of ['volume','brightness','attack','length','space']) assert(typeof preset[key] === 'number' && Number.isFinite(preset[key]) && preset[key]>=0,'Invalid sound control.');
    if(preset.advanced !== undefined) {
      assert(preset.advanced && typeof preset.advanced === 'object' && !Array.isArray(preset.advanced),'Invalid advanced sound controls.');
      for(const [key,value] of Object.entries(preset.advanced)) assert(key.length<=80 && (typeof value==='string' && value.length<=200 || typeof value==='number' && Number.isFinite(value)),'Invalid advanced sound value.');
    }
  }
}
function validateProject(project:unknown):asserts project is Project {
  assert(project && typeof project==='object','This file has no project.'); const p=project as Project;
  assert(p.version===1,'This project version is not supported.'); assertId(p.id);
  assert(typeof p.name==='string' && p.name.length<=200,'Invalid project name.');
  assert(typeof p.source==='string' && p.source.length<=1024*1024,'Invalid or excessively large music code.');
  assert(p.workingSource===undefined || typeof p.workingSource==='string' && p.workingSource.length<=1024*1024,'Invalid working code.');
  assert(Number.isFinite(p.modified),'Invalid project date.'); validatePresets(p.presets);
  assert(Array.isArray(p.sampleIds) && p.sampleIds.length<=500,'Invalid sample list.'); p.sampleIds.forEach(assertId);
  assert(new Set(p.sampleIds).size===p.sampleIds.length,'Duplicate sample references.');
  assert(Array.isArray(p.sliders) && p.sliders.length<=10000 && p.sliders.every(n=>Number.isInteger(n)&&n>0),'Invalid slider lines.');
  assert(Array.isArray(p.views) && p.views.length<=100 && p.views.every(v=>typeof v==='string'&&v.length<=100),'Invalid music views.');
}
function validateSample(sample:SampleAsset):void {
  assertId(sample.id); assert(typeof sample.name==='string' && sample.name.length<=200,'Invalid sample name.');
  assert(sample.blob instanceof Blob && sample.blob.size>0 && sample.blob.size<=MAX_ASSET,'Samples must be between 1 byte and 64 MB.');
  assert(!sample.blob.type || sample.blob.type.startsWith('audio/') || sample.blob.type==='application/octet-stream','Sample must contain audio.');
  assert(sample.rootNote===undefined || /^[a-gA-G](?:#|b)?-?\d{1,2}$/.test(sample.rootNote),'Invalid original sample note.');
  assert(sample.color === undefined || typeof sample.color === 'string' && (
  /^#[0-9a-fA-F]{3,8}$/.test(sample.color) ||
  /^hsl\((?:[0-9]|[1-9][0-9]|[12][0-9]{2}|3[0-5][0-9]) 62% 34%\)$/.test(sample.color)
), 'Invalid sample color.');
}

export async function exportProject(project:Project,samples:SampleAsset[]):Promise<Blob> {
  validateProject(project);
  const files:Record<string,Uint8Array>={}; let total=0;
  const assets=[];
  for(const id of project.sampleIds) {
    const sample=samples.find(s=>s.id===id); assert(sample,`Missing sample: ${id}. Restore it before exporting your project.`); validateSample(sample);
    total+=sample.blob.size; assert(total<=MAX_BUNDLE,'This project is too large for a 256 MB project backup.');
    const path=`samples/${sample.id}.audio`; files[path]=new Uint8Array(await sample.blob.arrayBuffer());
    assets.push({id:sample.id,name:sample.name,rootNote:sample.rootNote,color:sample.color,mime:sample.blob.type,path,size:sample.blob.size});
  }
  const metadata=strToU8(JSON.stringify({format:'plain-music-studio',version:1,project,assets}));
  assert(metadata.byteLength<=MAX_JSON,'Project information is too large.'); files['project.json']=metadata;
  const zipped=zipSync(files,{level:0}); return new Blob([zipped as Uint8Array<ArrayBuffer>],{type:'application/zip'});
}

/** Reads data only. It never executes code from a backup or writes it to storage. */
export async function importProject(file:Blob):Promise<{project:Project,samples:SampleAsset[]}> {
  assert(file.size>0 && file.size<=MAX_BUNDLE+MAX_JSON,'Choose a project ZIP smaller than 260 MB.');
  let total=0; let count=0; const seen=new Set<string>();
  const files=unzipSync(new Uint8Array(await file.arrayBuffer()),{filter:entry=>{
    assert(++count<=502,'Project contains too many files.');
    assert(entry.name==='project.json' || /^samples\/[a-zA-Z0-9_-]{1,120}\.audio$/.test(entry.name),'Project contains an unexpected file or unsafe path.');
    assert(!seen.has(entry.name),'Duplicate file in project.'); seen.add(entry.name);
    assert(entry.originalSize<=(entry.name==='project.json'?MAX_JSON:MAX_ASSET),'A project file is too large.');
    total+=entry.originalSize; assert(total<=MAX_BUNDLE+MAX_JSON,'Unpacked project is too large.'); return true;
  }});
  assert(files['project.json'],'This ZIP has no project.json.');
  let data:any; try { data=JSON.parse(strFromU8(files['project.json'])); } catch {throw new Error('Project information is not valid JSON.');}
  assert(data.format==='plain-music-studio' && data.version===1,'This is not a supported Studio project.'); validateProject(data.project);
  assert(Array.isArray(data.assets) && data.assets.length===data.project.sampleIds.length,'Invalid sample inventory.');
  const ids=new Set<string>(); const samples:SampleAsset[]=[];
  for(const asset of data.assets) {
    assertId(asset.id); assert(!ids.has(asset.id) && data.project.sampleIds.includes(asset.id),'Invalid sample reference.'); ids.add(asset.id);
    assert(asset.path===`samples/${asset.id}.audio`,'Invalid sample file path.');
    const bytes=files[asset.path]; assert(bytes && bytes.byteLength===asset.size,'A sample is missing or damaged.');
    assert(typeof asset.mime==='string' && asset.mime.length<=100,'Invalid sample format.');
    const sample:SampleAsset={id:asset.id,name:asset.name,rootNote:asset.rootNote,color:asset.color,blob:new Blob([bytes as Uint8Array<ArrayBuffer>],{type:asset.mime})};
    validateSample(sample); samples.push(sample);
  }
  assert(Object.keys(files).length===samples.length+1,'Project contains unlisted sample files.');
  // Rebuild from the known fields: imported data cannot attach executable behavior.
  const p=data.project as Project;
  const project:Project={version:1,id:p.id,name:p.name,source:p.source,presets:p.presets,sampleIds:p.sampleIds,sliders:p.sliders,views:p.views,modified:p.modified,workingSource:p.workingSource};
  return {project,samples};
}
