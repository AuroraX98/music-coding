import type {Compilation} from './types';

/** Musical duration uses bars and tempo, never the number of source lines. */
export function secondsAtBar(song:Compilation, cycle:number):number {
  if (!song.sections.length) return cycle * song.beatsPerBar * 60 / song.tempo;
  let seconds=0;
  for(const section of song.sections){
    const count=Math.min(section.bars,Math.max(0,cycle-(section.startBar-1)));
    seconds+=count*song.beatsPerBar*60/section.tempo;
  }
  if(song.totalBars!==null && cycle>song.totalBars){
    const tempo=song.sections.at(-1)!.tempo;
    seconds+=(cycle-song.totalBars)*song.beatsPerBar*60/tempo;
  }
  return seconds;
}

export function encodeWav(left:Float32Array,right:Float32Array,sampleRate:number):ArrayBuffer {
  if(left.length!==right.length) throw new Error('Both audio channels must have the same length.');
  const buffer=new ArrayBuffer(44+left.length*4), view=new DataView(buffer);
  const text=(offset:number,value:string)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
  text(0,'RIFF');view.setUint32(4,buffer.byteLength-8,true);text(8,'WAVE');text(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);
  view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);
  text(36,'data');view.setUint32(40,left.length*4,true);
  for(let i=0;i<left.length;i++)for(let c=0;c<2;c++){
    const value=Math.max(-1,Math.min(1,c?right[i]:left[i]));
    view.setInt16(44+i*4+c*2,Math.round(value*(value<0?32768:32767)),true);
  }
  return buffer;
}

type Binding=unknown;
/** A small arithmetic/function parser. It never evaluates JavaScript or accesses properties. */
export function evaluateExpression(source:string,bindings:Record<string,Binding>):any {
  const tokens=source.match(/\$[A-Za-z_][\w-]*|[A-Za-z_]\w*|(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|===|!==|==|!=|<=|>=|&&|\|\||\*\*|[-+*/%(),\[\]<>!]/gi)||[];
  if(tokens.join('').replace(/\s/g,'')!==source.replace(/\s/g,''))throw new Error('Use numbers, names, arithmetic, or documented function calls.');
  let at=0;
  const peek=()=>tokens[at];
  const consume=(token?:string)=>{const value=tokens[at++];if(token&&value!==token)throw new Error(`Expected ${token}.`);return value;};
  const precedence:Record<string,number>={'||':1,'&&':2,'==':3,'===':3,'!=':3,'!==':3,'<':4,'>':4,'<=':4,'>=':4,'+':5,'-':5,'*':6,'/':6,'%':6,'**':7};
  const binary=(operator:string,a:any,b:any):any=>{
    if(a?._Pattern){const name:Record<string,string>={'+':'add','-':'sub','*':'mul','/':'div','%':'mod','**':'pow','<':'lt','>':'gt','<=':'lte','>=':'gte','==':'eq','===':'eq','!=':'ne','!==':'ne','&&':'and','||':'or'};return a[name[operator]](b);}
    switch(operator){case '+':return a+b;case '-':return a-b;case '*':return a*b;case '/':return a/b;case '%':return a%b;case '**':return a**b;case '<':return a<b;case '>':return a>b;case '<=':return a<=b;case '>=':return a>=b;case '==':case '===':return a===b;case '!=':case '!==':return a!==b;case '&&':return a&&b;case '||':return a||b;default:throw new Error('Unknown operator.');}
  };
  const expression=(minimum=0):any=>{
    let value:any, token=consume();
    if(token==='-'||token==='+'||token==='!'){const a=expression(8);value=token==='-'?-a:token==='+'?+a:!a;}
    else if(token==='('){value=expression();consume(')');}
    else if(token==='['){value=[];while(peek()!==']'){value.push(expression());if(peek()!==',')break;consume(',');}consume(']');}
    else if(/^\d|^\.\d/.test(token||''))value=Number(token);
    else if(token?.startsWith('"')||token?.startsWith("'"))value=token.slice(1,-1).replace(/\\(['"\\])/g,'$1');
    else {
      const name=token?.replace(/^\$/,'');
      if(!name||!Object.hasOwn(bindings,name))throw new Error(`Unknown expression name: ${name||'(empty)'}.`);
      value=bindings[name];
      if(peek()==='('){consume('(');const args=[];while(peek()!==')'){args.push(expression());if(peek()!==',')break;consume(',');}consume(')');if(typeof value!=='function')throw new Error(`${name} is not a function.`);value=value(...args);}
    }
    while(precedence[peek()]!==undefined&&precedence[peek()]>=minimum){const operator=consume(),p=precedence[operator];value=binary(operator,value,expression(p+(operator==='**'?0:1)));}
    return value;
  };
  const result=expression();if(at!==tokens.length)throw new Error('Check the expression punctuation.');return result;
}

export function splitArguments(value:string):string[]{
  const result:string[]=[];let begin=0,depth=0,quote='';
  for(let i=0;i<value.length;i++){const c=value[i];if(quote){if(c===quote&&value[i-1]!=='\\')quote='';continue;}if(c==='"'||c==="'")quote=c;else if(c==='('||c==='['||c==='{')depth++;else if(c===')'||c===']'||c==='}')depth--;else if(c===','&&!depth){result.push(value.slice(begin,i).trim());begin=i+1;}}
  if(value.trim())result.push(value.slice(begin).trim());return result;
}
