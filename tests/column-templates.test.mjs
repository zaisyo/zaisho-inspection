import {test} from 'node:test';import assert from 'node:assert/strict';
import {validateTemplate,saveTemplate,findTemplate,readTemplates} from '../src/ocr/column-templates.mjs';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)}};
test('save and recall manufacturer columns',()=>{const s=memory();saveTemplate({name:'メーカーA',part:[.1,.4],qty:[.7,.9]},s);assert.deepEqual(findTemplate('メーカーA',s).qty,[.7,.9])});
test('reject overlapping columns',()=>assert.throws(()=>validateTemplate({name:'wrong',part:[.1,.8],qty:[.7,.9]})));
test('reject invalid ratios',()=>assert.throws(()=>validateTemplate({name:'wrong',part:[-.1,.4],qty:[.7,.9]})));
test('updates same template without duplication',()=>{const s=memory();saveTemplate({name:'A',part:[0,.4],qty:[.6,.9]},s);saveTemplate({name:'A',part:[0,.3],qty:[.8,.9]},s);assert.equal(readTemplates(s).length,1)});
