/* Stereo capture after the song's effects, gated against the audio sample clock. */
class StudioCapture extends AudioWorkletProcessor {
  constructor(){super();this.start=Infinity;this.end=Infinity;this.done=false;this.chunks=[[],[]];this.count=0;
    this.port.onmessage=({data})=>{if(data.type==='start'){this.start=data.startFrame;this.end=data.endFrame;this.done=false;this.chunks=[[],[]];this.count=0;}if(data.type==='cancel')this.done=true;};
  }
  process(inputs,outputs){
    // The silent output keeps the processor alive without duplicating the audible mix.
    for(const channel of outputs[0]||[])channel.fill(0);
    if(this.done||!Number.isFinite(this.start))return true;
    const channels=inputs[0]||[],size=outputs[0]?.[0]?.length||128;
    const begin=Math.max(0,this.start-currentFrame),end=Math.min(size,this.end-currentFrame);
    if(end>begin){for(let c=0;c<2;c++){const chunk=new Float32Array(end-begin);if(channels[c]||channels[0])chunk.set((channels[c]||channels[0]).subarray(begin,end));this.chunks[c].push(chunk);}this.count+=end-begin;}
    if(this.count>=8192||currentFrame+size>=this.end){if(this.count){const chunks=this.chunks.map(list=>{const out=new Float32Array(this.count);let i=0;for(const chunk of list){out.set(chunk,i);i+=chunk.length;}return out;});this.port.postMessage({type:'pcm',left:chunks[0],right:chunks[1]},chunks.map(c=>c.buffer));this.chunks=[[],[]];this.count=0;}if(currentFrame+size>=this.end){this.done=true;this.port.postMessage({type:'done'});}}
    return true;
  }
}
registerProcessor('studio-capture',StudioCapture);
