import type {CommandSpec} from './types';

export interface CommandPractice {title:string;instruction:string;source:string;prerequisite?:string;available:boolean;}
const indent=(text:string)=>text.split('\n').map(line=>`  ${line}`).join('\n');
const song=(body:string,definitions='',settings='tempo: 100 bpm')=>`${settings}\n\n${definitions?definitions+'\n\n':''}track: melody\n${indent(body)}`;
const melody='sound: triangle\nnotes: C4 E4 G4 B4';
const quiet='volume: 0.18';
const sampleRequirement='Upload a recording in Sound Library and name it my-sample. A recording with changing sounds makes its different sections easier to hear.';

// Existing full examples may contain named definitions and several tracks.
// Add a gentle level to each track that does not already choose its own level.
function complete(source:string):string {
  const lines=source.split('\n'),out:string[]=[];
  let inTrack=false,hasVolume=false;
  const finish=()=>{if(inTrack&&!hasVolume)out.push('  '+quiet);};
  for(const line of lines){
    if(/^\S/.test(line)){finish();inTrack=/^track:/.test(line);hasVolume=false;}
    if(inTrack&&/^  (volume|gain|v):/.test(line))hasVolume=true;
    out.push(line);
  }
  finish();
  return (/^(tempo|setcpm|setcps):/m.test(source)?'':'tempo: 100 bpm\n\n')+out.join('\n');
}

const symbolCases:Record<string,{body:string;instruction:string;prerequisite?:string}>={
  '$:':{body:'play: kick rest snare rest',instruction:'Add a hat in place of the first rest. This track block is the app equivalent of a playable $: line.'},
  '_$:':{body:'play: kick rest snare rest',instruction:'Use this track’s Mute button, then unmute it. The app uses that button instead of a JavaScript _$: label.'},
  '" "':{body:'sound: triangle\nnotes: "C4 E4 G4 E4"',instruction:'Change E4 to F4 inside the quotation marks.'},
  "' '":{body:"sound: triangle\nnotes: 'C4 E4 G4 E4'",instruction:'Change G4 to A4 inside the quotation marks.'},
  'multiline text':{body:melody,instruction:'Change the last B4 to C5. In this editor, keep the notes value on one line; named pattern blocks organize longer music.'},
  '` `':{body:melody,instruction:'Change the last B4 to C5. This app uses ordinary command lines instead of a JavaScript multiline string.'},
  'function arguments':{body:melody+'\nvolume: max(0.1, 0.18)',instruction:'Change 0.18 inside max(0.1, 0.18) to 0.12. The function chooses the larger of its two arguments.'},
  '.':{body:melody+'\nfaster: 2',instruction:'Change faster: 2 to faster: 1. Separate command lines replace JavaScript dot chaining in this app.'},
  '[]':{body:'sound: triangle\nnotes: C4 [E4 G4] B4',instruction:'Remove G4 from the brackets. Listen to how the remaining E4 fills that whole group’s time.'},
  '<>':{body:'sound: triangle\nnotes: <C4 E4 G4>',instruction:'Change E4 to D4 inside the angle brackets. Listen across three bars.'},
  '*':{body:'play: kick*4',instruction:'Change kick*4 to kick*2. The same bar now contains two hits.'},
  '/':{body:'sound: triangle\nnotes: [C4 E4 G4 B4]/2',instruction:'Change /2 to /4. The note sequence takes twice as long to finish.'},
  '~ / -':{body:'play: kick ~ snare -',instruction:'Replace ~ with hat. The first silent step becomes a sound.'},
  ',':{body:'sound: triangle\nnotes: [C4,E4,G4] rest',instruction:'Remove ,G4 from the brackets. Two notes will remain in the chord.'},
  '!':{body:'sound: triangle\nnotes: C4!2 E4 G4',instruction:'Change !2 to !3. The extra C4 takes another equal share of the bar.'},
  '@':{body:'sound: triangle\nnotes: C4@2 E4 G4',instruction:'Change @2 to @3. C4 receives a larger share of the bar.'},
  '_':{body:'sound: triangle\nnotes: C4 _ E4 rest',instruction:'Replace _ with C4. The second step starts a fresh note instead of continuing the first.'},
  '?':{body:'play: hat*8?0.25',instruction:'Change ?0.25 to ?0.75. Listen for more missing hits over several bars.'},
  '{}':{body:'play: {kick snare,hat hat hat}',instruction:'Add one hat inside the second group. Compare how the groups line up over several bars.'},
  '%':{body:'play: {kick snare hat}%4',instruction:'Change %4 to %6. Six of the group’s steps now pass in each bar.'},
  '(3,8)':{body:'play: "kick(3,8)"',instruction:'Change (3,8) to (5,8). Five hits are spread across the same eight steps.'},
  ':':{body:'positions: 0 2 4 2\nscale: C:minor\nsound: triangle',instruction:'Change C:minor to C:major. The colon here joins a root note and scale name.'},
  '# / b':{body:'sound: triangle\nnotes: C4 C#4 D4 Db4',instruction:'Change C#4 to Db4. In this tuning, its pitch stays the same even though its spelling changes.'},
  'x':{body:'sound: triangle\nnotes: C4\nstruct: x ~ x ~',instruction:'Replace the first ~ with x. The rhythm now has one more active step.'},
  '^':{body:'sound: triangle\nnotes: C4 [^E4 G4]\npace: 4',instruction:'Remove ^ from the brackets. Compare how pace uses the pattern’s counted steps.'},
  '//':{body:melody+'\n// This sentence is a comment.',instruction:'Rewrite the comment after //. Changing that sentence does not change the music.'},
  '|':{body:'sound: triangle\nnotes: C4 | E4 | G4\nsegment: 4',instruction:'Change G4 to B4. The random choice can now choose B4 instead.'},
};

function defaultInstruction(command:CommandSpec):string {
  if(command.kind==='transform')return `Change faster: 2 beneath ${command.name}: to faster: 3, then restore it to compare the transformed part.`;
  return `Remove the ${command.name}: line from this practice copy, then restore it. Compare the result with the command present and absent.`;
}

export function getCommandPractice(command:CommandSpec):CommandPractice {
  const name=command.name,native=command.native??name;
  const make=(source:string,instruction:string,prerequisite?:string,available=true):CommandPractice=>({title:`Try ${name}`,source:complete(source),instruction,prerequisite,available});
  const wrap=(body:string,instruction=defaultInstruction(command),definitions='',prerequisite?:string)=>make(song(body+( /^volume:/m.test(body)?'':'\n'+quiet),definitions),instruction,prerequisite);
  if(command.kind==='later'){
    const reason=`${name} is not available in this app. This example uses a supported alternative.`;
    if(native==='lfo')return make('signal: sweep\n  sine:\n  range: 300, 2000\ntrack: melody\n  sound: sawtooth\n  notes: C3\n  lowpass: $sweep','Change 2000 to 4000 in range to widen the filter movement.',reason,false);
    if(native==='arpWith')return make(song('sound: triangle\nchord: C\nvoicing:\narp: 0 1 2 1\n'+quiet),'Change arp: 0 1 2 1 to arp: 2 1 0 1.',reason,false);
    if(native==='markcss'||native==='log')return make(song(melody+'\ncolor: red\n'+quiet)+'\n\nshow: piano roll','Change color: red to color: blue and watch the music display.',reason,false);
    return make(song(melody+'\n'+quiet),'Change C4 to D4 and listen through the app’s built-in sound engine. This does not connect external MIDI or OSC equipment.',reason,false);
  }
  const symbol=symbolCases[name];
  if(symbol)return wrap(symbol.body,symbol.instruction,'',symbol.prerequisite);
  if(['tempo','setcpm','setcps','beats per bar'].includes(name)){
    const settings:Record<string,string>={tempo:'tempo: 100 bpm',setcpm:'setcpm: 25',setcps:'setcps: 0.5','beats per bar':'tempo: 100 bpm\nbeats per bar: 4'};
    const changes:Record<string,string>={tempo:'Change tempo: 100 bpm to tempo: 120 bpm.',setcpm:'Change setcpm: 25 to setcpm: 30.',setcps:'Change setcps: 0.5 to setcps: 1.','beats per bar':'Change beats per bar: 4 to beats per bar: 3. The same four notes now share three tempo beats.'};
    return make(song(melody+'\n'+quiet,'',settings[name]),changes[name]);
  }
  if(['arrange','section','bars','tracks'].includes(name))return make('tempo: 110 bpm\n\ntrack: melody\n  sound: triangle\n  notes: C4 E4 G4 E4\n  volume: 0.18\n\ntrack: bass\n  sound: sine\n  notes: C2 rest G2 rest\n  volume: 0.14\n\narrange:\n  section: intro\n    bars: 2\n    tracks: melody\n  section: together\n    bars: 4\n    tracks: melody bass',name==='tracks'?'Remove bass from the together section’s tracks line.':'Change the intro section from bars: 2 to bars: 4. The melody plays alone for two extra bars.');
  if(['pattern','use'].includes(name))return wrap('sound: triangle\nuse: theme','Change E4 to F4 inside pattern: theme. The track using theme will play the new note.','pattern: theme\n  notes: C4 E4 G4 E4');
  if(name==='change')return wrap('sound: sawtooth\nnotes: C3 E3 G3 E3\nuse: softer','Change lowpass: 700 Hz to lowpass: 2000 Hz inside the named change.','change: softer\n  lowpass: 700 Hz');
  if(name==='track')return make('track: melody\n  sound: triangle\n  notes: C4 E4 G4 E4\ntrack: bass\n  sound: sine\n  notes: C2 rest G2 rest','Change the bass track’s C2 to D2. The melody track keeps its own notes.');
  if(name==='sound alias')return wrap('sound alias: triangle, soft-tone\nsound: soft-tone\nnotes: C4 E4 G4 E4','Change triangle to sine in the sound alias line. The name soft-tone will now use sine.');
  if(native==='bank')return wrap('play: kick snare hat snare\nbank: studio','Change the hat to kick. The sound names come from the built-in studio bank.');
  if(native==='sound'||name==='play')return wrap(name==='play'?'play: kick rest snare rest':melody,name==='play'?'Replace the first rest with hat.':'Change sound: triangle to sound: sine.');
  if(native==='gain')return wrap(melody+'\nvolume: 0.18','Change volume: 0.18 to volume: 0.1.');
  if(native==='freq')return wrap('sound: sine\nfrequency: 220 330 440 330','Change 440 to 660 in the frequency line.');
  if(['n','scale','scaleTranspose','run'].includes(native)){
    const first=native==='run'?'run: 4':'positions: 0 2 4 2';
    return wrap(`${first}\nscale: C:minor${native==='scaleTranspose'?'\nscale transpose: 2':''}\nsound: triangle`,native==='scaleTranspose'?'Change scale transpose: 2 to scale transpose: 1.':native==='run'?'Change run: 4 to run: 8.':native==='n'?'Change positions: 0 2 4 2 to positions: 0 1 4 1.':'Change scale: C:minor to scale: C:major.');
  }
  if(['chord','voicing','dict','anchor','mode','rootNotes','arp'].includes(native)){
    let body='chord: C Am F G';
    if(native==='rootNotes')body+='\nroot notes: 2';
    else{
      if(native==='dict')body+='\ndict: triads';
      if(native==='anchor'||native==='mode')body+='\nanchor: C5\nmode: below';
      body+='\nvoicing:';
      if(native==='arp')body+='\narp: 0 1 2 1';
    }
    body+='\nsound: triangle';
    const change:Record<string,string>={chord:'Change Am to Dm in the chord line.',voicing:'Change the first chord from C to Cm and listen to its voiced notes.',dict:'Change dict: triads to dict: lefthand.',anchor:'Change anchor: C5 to anchor: C4.',mode:'Change mode: below to mode: above.',rootNotes:'Change root notes: 2 to root notes: 3.',arp:'Change arp: 0 1 2 1 to arp: 2 1 0 1.'};
    return wrap(body,change[native]);
  }
  if(command.category==='samples'||['ir','iresponse'].includes(native)){
    if(['ir','iresponse'].includes(native))return wrap('sound: triangle\nnotes: C4 rest G4 rest\nreverb: 0.25\niresponse: my-sample','Remove iresponse: my-sample to compare the default reverb.','',sampleRequirement+' For this example, choose a short impulse response recording.');
    const base=native==='samples'?'samples: my-sample':'sound: my-sample';
    const support=['loopBegin','loopEnd'].includes(native)?'\nloop: 1':'';
    const example=native==='samples'?'':`\n${command.example}`;
    const rhythm=native==='cut'?'\nfaster: 4':'';
    return wrap(base+support+example+rhythm,native==='samples'?'Add speed: 0.5 beneath samples to hear the recording at half speed.':native==='cut'?'Remove cut: 2. Listen for overlapping copies if your recording is longer than a quarter of a bar.':defaultInstruction(command),'',sampleRequirement);
  }
  if(['duckorbit','duckattack','duckdepth','orbit'].includes(native))return make('tempo: 100 bpm\n\ntrack: sustained\n  sound: sawtooth\n  notes: C3\n  sustain: 0.8\n  lowpass: 900 Hz\n  orbit: 2\n  volume: 0.12\n\ntrack: pulse\n  play: kick*4\n  orbit: 1\n  duckorbit: 2\n  duckattack: 0.2\n  duckdepth: 0.7\n  volume: 0.18',native==='duckdepth'?'Change duckdepth: 0.7 to duckdepth: 0.2.':native==='duckattack'?'Change duckattack: 0.2 to duckattack: 0.4.':native==='orbit'?'Change the sustained track’s orbit: 2 to orbit: 3. The ducking trigger still targets group 2, so it no longer lowers this track.':'Remove duckorbit: 2 from the pulse track, then restore it to compare the sustained sound’s level.');
  if(native==='binary'||native==='binaryN'||native==='invert'||native==='brand'||native==='brandBy'){
    const definition=native==='invert'?'binary: 5\ninvert:':native==='brand'?'brand:\nsegment: 8':native==='brandBy'?'brand by: 0.25\nsegment: 8':command.example;
    return wrap('play: hat\nstruct: $hits',native==='invert'?'Remove invert: from the hits signal to swap the active and silent steps.':native==='brandBy'?'Change brand by: 0.25 to brand by: 0.75.':native==='brand'?'Change segment: 8 to segment: 4.':'Change the number 5 in the binary command to 7.',`signal: hits\n${indent(definition)}`);
  }
  if(native==='as')return make('signal: pitches\n  run: 4\n  add: 60\ntrack: melody\n  use: pitches\n  as: note\n  sound: triangle','Change add: 60 to add: 72. The values assigned to note move up an octave.');
  if(native==='ratio')return wrap('sound: sine\nfrequency: mul(220, ratio(mini("1 3:2 2 3:2")))','Change 3:2 to 4:3 inside mini. This changes one frequency ratio.');
  if(command.category==='math'){
    if(native==='signal')return make(command.example,'Change the upper range limit from 2000 to 4000.');
    if(['add','sub','mul','div','round','floor','ceil','irand'].includes(native)){
      const initial=native==='irand'?command.example:['round','floor','ceil'].includes(native)?'sine:\nrange: 0, 7\nsegment: 4':'run: 4';
      const operation=native==='irand'?'':`\n${command.example}`;
      return wrap('sound: triangle\npositions: $steps\nscale: C:minor',native==='irand'?'Change irand: 2 to irand: 7.':defaultInstruction(command),`signal: steps\n${indent(initial+operation)}`);
    }
    const bipolar=/2$/.test(native),isRange=['range','rangex','range2'].includes(native);
    const source=isRange?(native==='range2'?'sine2:':'sine:'):native==='time'?'time:\ndiv: 8':command.example;
    const range=isRange?command.example:`${bipolar?'range2':'range'}: 300, 2400`;
    const instruction=native==='time'?'Change div: 8 to div: 16 and restart playback. The filter cutoff rises more slowly. This signal keeps increasing with elapsed bars rather than repeating.':native==='mousex'||native==='mousey'?'Move the pointer across the page while playing, then change the upper range limit from 2400 to 1200.':isRange?`Change the upper value in ${name}: from 2000 to 4000.`:'Change the upper range limit from 2400 to 1200. Listen to the filter movement.';
    return wrap('sound: sawtooth\nnotes: C3 E3 G3 E3\nlowpass: $motion',instruction,`signal: motion\n${indent(source+'\n'+range)}`);
  }
  if(['pick','pickmod','pickRestart','pickmodRestart','pickReset','pickmodReset','inhabit','inhabitmod'].includes(native))return make(`signal: choices\n  run: 2\n  ${name}: ["C4 E4", "G4 B4"]\ntrack: melody\n  sound: triangle\n  notes: $choices`,'Swap the two quoted patterns in the list. The same choice numbers now point to different notes.');
  if(native==='pickF'||native==='pickmodF')return wrap(melody+`\n${name}: ${native==='pickmodF'?'[rev, palindrome], mini("<0 1>")':'mini("<0 1>"), [rev, palindrome]'}`,'Change <0 1> to <1 0>. This swaps which change is selected on each bar.');
  if(native==='choose')return wrap('sound: triangle\nnotes: choose("C4", "E4", "G4")\nsegment: 4','Change G4 to B4 inside choose.');
  if(native==='wchoose'||native==='wchooseCycles')return wrap(`sound: triangle\nnotes: ${native}(["C4", 3], ["G4", 1])\nsegment: 4`,'Change the weight 3 after C4 to 1. Listen over several bars; random choices need not be evenly distributed in a short run.');
  if(['seq','cat','stack'].includes(native))return wrap(`sound: triangle\n${name}:\n  pattern: first\n    notes: C4 E4\n  pattern: second\n    notes: G4 B4`,'Change B4 in the second pattern to C5. Listen to where that pattern plays.');
  if(native==='tour')return wrap('sound: triangle\nnotes: C4 D4\ntour: "E4 F4", "G4 A4"\npace: 4','Change A4 in the tour line to B4.');
  if(['stepalt','stepcat'].includes(native))return make(`signal: tune\n  ${command.example}\ntrack: melody\n  sound: triangle\n  notes: $tune`,native==='stepcat'?'Change C5 to D5 in stepcat.':'Change one note name inside the named tune and listen to its place in the combined pattern.');
  if(['expand','contract','extend','take','drop','shrink','grow'].includes(native))return wrap(`sound: triangle\nnotes: C4 D4 E4 G4\n${command.example}\npace: 4`,defaultInstruction(command));
  if(command.kind==='visual'||name==='show')return make(song(melody+'\n'+quiet)+`\n\nshow: ${name==='show'?'piano roll':name}`,`Change show: ${name==='show'?'piano roll':name} to show: waveform. The display changes while the notes stay the same.`);
  if(/^track:/m.test(command.example))return make(command.example,native==='xfade'?'Change xfade: 0.5 to xfade: 0.2 while leaving , $other in place.':native==='chooseCycles'?'Change G4 to D4 inside pattern: second. Listen across several bars.':native==='squeeze'?'Change the second quoted pattern from G4 B4 to A4 C5.':native==='zip'?'Change G4 to F4 in the interleaved signal.':defaultInstruction(command));
  if(native==='silence'||native==='hush')return wrap(melody+'\n'+command.example,`Remove ${name}: to let this intentionally silent practice play, then restore it.`);
  let body=melody+'\n'+command.example;
  if(['cutoff','hcutoff','bandf','lpq','hpq','bpq','ftype','vowel','lpattack','lpdecay','lpsustain','lprelease','lpenv','phaser','phaserdepth','phasercenter','phasersweep'].includes(native))body=body.replace('sound: triangle','sound: sawtooth');
  let instruction=defaultInstruction(command);
  if(command.kind==='transform'&&!command.example.includes('faster: 2'))instruction=command.example.includes('rev:')?'Replace rev: beneath this command with transpose: 12.':command.example.includes('transpose: 12')?'Change transpose: 12 beneath this command to transpose: 7.':command.example.includes('volume: 50%')?'Change volume: 50% beneath this command to volume: 25%.':instruction;
  if(native==='color')instruction='Change color: red to color: blue and watch the piano roll.';
  if(native==='density')instruction='Change density: 0.1 to density: 0.5 and listen to the crackle sound.';
  if(native==='tremoloshape')instruction='Change tremoloshape: sine to tremoloshape: square.';
  return wrap(body,instruction);
}
