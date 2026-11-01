import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const root=process.argv[2]||'preview';
const required=['index.html','diagnostics/ocr-lab.html','diagnostics/intake-lab.html','diagnostics/delivery-note-lab.html','src/intake/intake.mjs','src/storage/local.mjs','src/ocr/diagnostics.mjs','src/ocr/delivery-note.mjs','src/ocr/layout-rows.mjs','src/ocr/tesseract-adapter.mjs','src/ocr/column-templates.mjs','src/ocr/benchmark.mjs','src/ocr/attempt-metrics.mjs','src/ocr/session.mjs','src/ocr/image-presets.mjs'];
let bad=false;
for(const path of required){if(!existsSync(join(root,path))){console.error('Missing preview dependency:',path);bad=true}}
for(const page of ['diagnostics/ocr-lab.html','diagnostics/intake-lab.html','diagnostics/delivery-note-lab.html']){
 const path=join(root,page);if(!existsSync(path))continue;
 const html=readFileSync(path,'utf8');
 for(const m of html.matchAll(/from\s+['"]([^'"]+\.mjs)['"]/g)){const target=join(root,'diagnostics',m[1]);if(!existsSync(target)){console.error('Broken module import:',page,m[1]);bad=true}}
}
if(bad)process.exitCode=1;else console.log('Preview package checked: files and module imports OK');
