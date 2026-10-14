import {createEncoder} from 'wasm-media-encoders';
import mp3WasmUrl from 'wasm-media-encoders/wasm/mp3?url';

self.onmessage=async ({data}:{data:{left:Float32Array;right:Float32Array;sampleRate:number}})=>{
  try{
    const encoder=await createEncoder('audio/mpeg',mp3WasmUrl);
    encoder.configure({channels:2,sampleRate:data.sampleRate,bitrate:192});
    const chunks:Uint8Array<ArrayBuffer>[]=[];
    for(let offset=0;offset<data.left.length;offset+=11520){chunks.push(Uint8Array.from(encoder.encode([data.left.subarray(offset,offset+11520),data.right.subarray(offset,offset+11520)])));if(offset%115200===0)self.postMessage({type:'progress',fraction:offset/data.left.length});}
    chunks.push(Uint8Array.from(encoder.finalize()));
    self.postMessage({type:'done',blob:new Blob(chunks,{type:'audio/mpeg'})});
  }catch(error){self.postMessage({type:'error',message:error instanceof Error?error.message:String(error)});}
};
