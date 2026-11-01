import {test} from 'node:test';import assert from 'node:assert/strict';
import {makeBenchmarkRecord,benchmarkCsv} from '../src/ocr/benchmark.mjs';
const timings={decodeMs:20,initMs:130,recognizeMs:2200,totalMs:2350};
test('metrics calculate precision and recall',()=>{const r=makeBenchmarkRecord({timings,recognizedRows:4,reviewRows:2,expectedRows:5,correctRows:3,mode:'layout',edge:2200});assert.equal(r.precision,.75);assert.equal(r.recall,.6)});
test('zero denominator is null',()=>{const r=makeBenchmarkRecord({timings,recognizedRows:0,reviewRows:0,expectedRows:0,correctRows:0,mode:'text',edge:1200});assert.equal(r.precision,null)});
test('invalid counts fail closed',()=>assert.throws(()=>makeBenchmarkRecord({timings,recognizedRows:1,reviewRows:0,expectedRows:1,correctRows:2,mode:'layout',edge:2200})));
test('CSV exports metrics only',()=>{const r=makeBenchmarkRecord({timings,recognizedRows:1,reviewRows:0,expectedRows:1,correctRows:1,mode:'text',edge:1200});const c=benchmarkCsv([r]);assert.ok(c.includes('再現率'));assert.ok(!c.includes('品番'))});

test('preset is included in CSV',()=>{const r=makeBenchmarkRecord({timings,recognizedRows:1,reviewRows:0,expectedRows:1,correctRows:1,mode:'text',edge:1600});assert.ok(benchmarkCsv([r]).includes('1600,text'))});
