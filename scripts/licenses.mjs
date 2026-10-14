import {readdir,readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(root,'public','licenses');
await mkdir(target,{recursive:true});
await copyFile(path.join(root,'LICENSE'),path.join(target,'Music-Coding-LICENSE.txt'));
await writeFile(path.join(target,'LICENSE-SCOPE.md'),(await readFile(path.join(root,'LICENSE-SCOPE.md'),'utf8')).replaceAll('(LICENSE)','(Music-Coding-LICENSE.txt)').replaceAll('(public/licenses/','('));
const visited=new Set();const packages=[];
async function inspect(folder){
  let pkg;try{pkg=JSON.parse(await readFile(path.join(folder,'package.json'),'utf8'));}catch{return;}
  const key=`${pkg.name}@${pkg.version}`;if(visited.has(key))return;visited.add(key);
  const names=await readdir(folder);
  const license=names.find(name=>/^(license|licence|copying)(\.(txt|md))?$/i.test(name));
  let file;
  if(license){file=`${key.replace(/[^a-zA-Z0-9@._-]/g,'_')}.txt`;await copyFile(path.join(folder,license),path.join(target,file));}
  packages.push({name:pkg.name,version:pkg.version,license:pkg.license??'See upstream source',file,source:typeof pkg.repository==='string'?pkg.repository:pkg.repository?.url});
}
async function inspectModules(folder){
  let entries;try{entries=await readdir(folder,{withFileTypes:true});}catch{return;}
  for(const entry of entries){if(entry.name.startsWith('.'))continue;const location=path.join(folder,entry.name);if(entry.name.startsWith('@')){for(const scoped of await readdir(location))await inspect(path.join(location,scoped));}else await inspect(location);}
}
await inspectModules(path.join(root,'node_modules'));
try{for(const entry of await readdir(path.join(root,'node_modules','.pnpm')))await inspectModules(path.join(root,'node_modules','.pnpm',entry,'node_modules'));}catch{}
packages.sort((a,b)=>a.name.localeCompare(b.name));
await writeFile(path.join(target,'packages.json'),JSON.stringify(packages,null,2));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rows=packages.map(p=>`<tr><td>${escape(p.name)} ${escape(p.version)}</td><td>${p.file?`<a href="${escape(p.file)}">${escape(p.license)}</a>`:escape(p.license)}</td><td>${p.source?escape(p.source):'Installed package'}</td></tr>`).join('');
await writeFile(path.join(target,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Third-party licenses · Music Coding</title><style>body{font:16px/1.5 system-ui;max-width:1100px;margin:32px auto;padding:16px;color:#30203f}a{color:#6841b0}table{border-collapse:collapse;width:100%}th,td{padding:9px;border:1px solid #dfd4f0;text-align:left;overflow-wrap:anywhere}th{background:#f3edfc}</style><h1>Third-party licenses</h1><p>Original Music Coding contributions use the <a href="Music-Coding-LICENSE.txt">MIT license</a>. Read <a href="LICENSE-SCOPE.md">the license scope</a>: the combined application is not MIT-only.</p><p>These notices preserve installed dependency licenses. Strudel packages use GNU AGPL 3 or later. The MP3 encoder wrapper uses MIT; the embedded LAME library uses LGPL. See <a href="LAME-notice.txt">the LAME notice</a>. Music and uploaded samples remain yours subject to any source-sample rights.</p><table><thead><tr><th>Package</th><th>License text</th><th>Upstream source</th></tr></thead><tbody>${rows}</tbody></table></html>`);
console.log(`Preserved notices for ${packages.length} installed packages.`);
