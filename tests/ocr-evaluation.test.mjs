import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluateRecognition,summarizeEvaluations,safeDiagnosticExport,REASONS} from '../src/ocr/evaluation.mjs';
test('exact match compares normalized human verified part',()=>{
 const x=evaluateRecognition('ＰＴＥＣ３９','PTEC39');
 assert.equal(x.exact,true);assert.equal(x.status,REASONS.OK);
});
test('a -5 OCR result fails closed',()=>{
 const x=evaluateRecognition('-5','PTEC39');
 assert.equal(x.exact,false);assert.equal(x.status,REASONS.EMPTY);
});
test('accuracy summary is not claimed for missing ground truth',()=>{
 assert.deepEqual(summarizeEvaluations([evaluateRecognition('ABCDE1','')]),{total:0,correct:0,exactRate:null,failures:0});
});
test('accuracy denominator excludes unlabeled samples',()=>{
 const result=summarizeEvaluations([evaluateRecognition('PTEC39','PTEC39'),evaluateRecognition('-5','PTEC39'),evaluateRecognition('X01','')]);
 assert.equal(result.total,2);assert.equal(result.exactRate,.5);
});
test('default export never includes OCR text',()=>{
 const input={date:'2026-10-31',timingsMs:{ocr:13},results:[{variant:'plain',text:'PRIVATE TEXT 123',candidate:{matches:['SECRET99']},image:{width:10,height:10},crop:{x:0,y:0,w:10,h:10},output:{width:10,height:10}}]};
 const out=safeDiagnosticExport(input);
 assert.equal(JSON.stringify(out).includes('PRIVATE'),false);
 assert.equal(JSON.stringify(out).includes('SECRET'),false);
 assert.equal(safeDiagnosticExport(input,{includeRecognizedText:true}).results[0].text,'PRIVATE TEXT 123');
});
