import {test} from 'node:test';import assert from 'node:assert/strict';
import {dimensionsForEdge,chooseOcrPreset} from '../src/ocr/image-presets.mjs';
test('resizing preserves proportions',()=>assert.deepEqual(dimensionsForEdge(4000,2000,1200),{width:1200,height:600,scale:.3}));
test('small input is not enlarged',()=>assert.deepEqual(dimensionsForEdge(800,400,2200),{width:800,height:400,scale:1}));
test('rejects unsupported preset',()=>assert.throws(()=>dimensionsForEdge(4000,2000,500)));
test('defaults to 2200 before verified trials',()=>assert.equal(chooseOcrPreset([]),2200));
test('requires three correctly reviewed runs per preset',()=>assert.equal(chooseOcrPreset([{edge:1200,reviewed:true,expectedRows:2,correctRows:2,totalMs:500}]),2200));
test('selects fastest fully reviewed preset',()=>assert.equal(chooseOcrPreset([...[1,2,3].map(()=>({edge:1200,reviewed:true,expectedRows:2,correctRows:2,totalMs:500})),...[1,2,3].map(()=>({edge:2200,reviewed:true,expectedRows:2,correctRows:2,totalMs:1500}))]),1200));
