import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const pages=['diagnostics/ocr-lab.html','diagnostics/intake-lab.html'];
let failed=false;
for(const path of pages){
 const html=readFileSync(path,'utf8');
 const scripts=[...html.matchAll(/<script\b[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/g)];
 if(!scripts.length){console.error('Missing module script',path);failed=true;continue;}
 for(const [i,match] of scripts.entries()){
  const result=spawnSync(process.execPath,['--input-type=module','--check'],{input:match[1],encoding:'utf8'});
  if(result.status){failed=true;console.error(path,i,result.stderr)}
  else console.log('Syntax OK:',path,i);
 }
}
if(failed)process.exitCode=1;
