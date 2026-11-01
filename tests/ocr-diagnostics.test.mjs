import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRect,pixelRect,partCandidates,candidateStatus} from '../src/ocr/diagnostics.mjs';
test('crop is clamped safely',()=>{
 assert.deepEqual(pixelRect({x:.9,y:.8,w:.5,h:.5},1000,500),{x:900,y:400,w:100,h:100});
 assert.throws(()=>normalizeRect({x:.2,y:.2,w:0,h:.3}));
 assert.throws(()=>pixelRect({x:0,y:0,w:1,h:1},0,100));
});
test('OCR -5 is never a plausible product number',()=>{
 assert.deepEqual(partCandidates('-5'),[]);
 assert.equal(candidateStatus('-5',['PTEC39']).reason,'NO_CANDIDATE');
});
test('normalize fullwidth characters and preserve hyphens',()=>{
 assert.deepEqual(partCandidates('ＰＴＥＣ３９\nAB-12'),['PTEC39','AB-12']);
});
test('exact candidate still requires human confirmation',()=>{
 const result=candidateStatus('PTEC39',['PTEC39']);
 assert.equal(result.reason,'EXACT_CANDIDATE');
 assert.equal(result.reviewRequired,true);
});
test('different crop rectangles yield different coordinates',()=>{
 const a=pixelRect({x:0,y:0,w:.2,h:.2},1000,1000);
 const b=pixelRect({x:.3,y:.4,w:.2,h:.2},1000,1000);
 assert.notDeepEqual(a,b);
});
