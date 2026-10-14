import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import('playwright').catch(()=>import(pathToFileURL(path.join(process.env.USERPROFILE||process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href));
const browser=await chromium.launch({executablePath:process.env.STUDIO_BROWSER_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage();const report={errors:[],exports:[]};page.on('pageerror',e=>report.errors.push(e.message));
try{
  await page.goto((process.env.STUDIO_BASE_URL||'http://127.0.0.1:5174')+'/tests/audio-browser.html');await page.waitForFunction(()=>window.audioTest);
  report.exports=await page.evaluate(async()=>{
    const {AudioEngine,DEFAULT_PRESETS,compile}=window.audioTest;
    const engine=new AudioEngine(),mix={master:.55,muted:new Set(),solo:new Set()};engine.setSounds(DEFAULT_PRESETS,[]);
    const tracks={piano:'track: piano\n  sound: vcsl_piano\n  notes: C4 E4 G4 C5\n  volume: 65%',harp:'track: harp\n  sound: vcsl_harp\n  notes: C4 G4 C5 G4\n  volume: 35%',sax:'track: sax\n  sound: vcsl_sax\n  notes: C3 E3 G3 C4\n  volume: 30%',drums:'track: drums\n  play: kick rest snare rest\n  volume: 25%'};
    const results=[];
    try{
      for(const names of [['piano'],['harp'],['sax'],['piano','harp','sax','drums']]){
        const source='tempo: 240 bpm\n'+names.map(n=>tracks[n]).join('\n')+'\narrange:\n  section: check\n    bars: 1\n    tracks: '+names.join(' ');
        const compilation=compile(source);if(compilation.errors.length)throw new Error(JSON.stringify(compilation.errors));
        const wav=await engine.exportAudio({compilation,mix,startBar:1,endBar:1,tailSeconds:0,format:'wav',signal:new AbortController().signal,onProgress(){}});
        const bytes=await wav.blob.arrayBuffer();const decoded=await engine.context.decodeAudioData(bytes.slice(0));
        let peak=0,sum=0,nonzero=0;for(let ch=0;ch<decoded.numberOfChannels;ch++){const data=decoded.getChannelData(ch);for(const v of data){if(!Number.isFinite(v))throw new Error('Nonfinite PCM');peak=Math.max(peak,Math.abs(v));sum+=v*v;if(Math.abs(v)>.00001)nonzero++;}}
        const rms=Math.sqrt(sum/(decoded.length*decoded.numberOfChannels));if(peak<.001||rms<.00005||nonzero<100)throw new Error(names+': silent exported sound');
        if(!Number.isFinite(wav.duration)||Math.abs(wav.duration-1)>1e-6||Math.abs(decoded.duration-1)>1/decoded.sampleRate)throw new Error('Wrong export duration');
        results.push({tracks:names,seconds:wav.duration,decodedSeconds:decoded.duration,bytes:bytes.byteLength,peak,rms,nonzero});
      }
    }finally{engine.stop();}
    return results;
  });assert.equal(report.exports.length,4);assert.deepEqual(report.errors,[]);report.passed=true;
}catch(e){report.failure=e.stack;process.exitCode=1;}finally{await browser.close();await mkdir('.qa',{recursive:true});await writeFile('.qa/instrument-export-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
