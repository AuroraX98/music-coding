import {readFile,readdir,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {zipSync,strToU8} from 'fflate';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files={};
const topLevel=['README.md','COMMAND-COVERAGE.md','index.html','package.json','pnpm-lock.yaml','pnpm-workspace.yaml','tsconfig.json','vite.config.ts','Start Studio.cmd','Start Studio.ps1','Stop Studio.cmd','Stop Studio.ps1','server.mjs','LICENSE','LICENSE-SCOPE.md','.gitignore'];
const forbidden=/(?:^|\/)(?:node_modules|dist|\.qa|\.git|private|user-data|uploads|backups|\.env(?:\.[^/]*)?)(?:\/|$)/i;
async function add(relative){
  const normalized=relative.replaceAll('\\','/');
  if(forbidden.test(normalized)||normalized==='public/source.zip'||/\.(?:zip|wav|mp3|flac|ogg|aiff|m4a|log)$/i.test(normalized))return;
  const absolute=path.resolve(root,relative);
  if(!absolute.startsWith(root+path.sep))throw new Error('Source path escaped the workspace.');
  let info;try{info=await stat(absolute);}catch{return;}
  if(!info.isFile())return;
  // Explicit directory allowlist excludes user data even if another folder appears later.
  if(info.size>4*1024*1024)throw new Error(`Unexpected large source file: ${normalized}`);
  files[normalized]=new Uint8Array(await readFile(absolute));
}
async function walk(relative){
  let entries;try{entries=await readdir(path.join(root,relative),{withFileTypes:true});}catch{return;}
  for(const entry of entries){if(entry.isSymbolicLink())continue;const next=path.join(relative,entry.name);if(forbidden.test(next.replaceAll('\\','/')))continue;if(entry.isDirectory())await walk(next);else await add(next);}
}
for(const file of topLevel)await add(file);
for(const dir of ['src','tests','scripts','public/licenses','public/instruments'])await walk(dir);
await add('public/capture-worklet.js');
await add('public/favicon.svg');
files['SOURCE-NOTE.txt']=strToU8('Music Coding source snapshot. Original Music Coding contributions are MIT licensed; see LICENSE-SCOPE.md for exclusions and combined distribution requirements. Third-party software retains its own licenses, including AGPL components. This archive contains application source, tests, build instructions, lockfile, and preserved dependency notices. It contains no browser projects, uploaded recordings, node_modules, distribution build, or verification captures. Nothing runs when the archive is downloaded. Install the pinned dependencies to build; their original sources and licenses are listed in public/licenses/packages.json. Regenerate with node scripts/source-archive.mjs after source changes.\n');
await writeFile(path.join(root,'public','source.zip'),zipSync(files,{level:6}));
console.log(`Source snapshot: ${Object.keys(files).length} files in public/source.zip.`);
