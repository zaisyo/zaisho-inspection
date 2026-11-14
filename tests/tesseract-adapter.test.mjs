import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectOcrWords} from '../src/ocr/tesseract-adapter.mjs';
import {extractLayoutRows} from '../src/ocr/layout-rows.mjs';
const w=(text,x,y)=>({text,bbox:{x0:x,y0:y,x1:x+40,y1:y+20}});
test('Tesseract block hierarchy keeps word bounds',()=>{
 const result=collectOcrWords({blocks:[{paragraphs:[{lines:[{words:[w('AB12',30,100),w('2個',230,100)]}]}]}]});
 assert.equal(result.length,2);
 assert.equal(extractLayoutRows(result,{partColumn:[0,140],quantityColumn:[200,300]}).candidates[0].qty,2);
});
test('invalid boxes are discarded',()=>assert.equal(collectOcrWords({words:[{text:'AB12',bbox:{x0:3,y0:3,x1:1,y1:9}}]}).length,0));
test('no fake boxes from raw OCR text',()=>assert.deepEqual(collectOcrWords({text:'AB12 2個'}),[]));
