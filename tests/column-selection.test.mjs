import {test} from 'node:test';import assert from 'node:assert/strict';
import {columnPixels,displayRatio} from '../src/ocr/column-selection.mjs';
test('display x coordinates map consistently',()=>{assert.equal(displayRatio(150,{left:50,width:200}),.5);assert.equal(displayRatio(20,{left:50,width:200}),0)});
test('column drags convert to canvas coordinates',()=>assert.deepEqual(columnPixels(.2,.4,2000),[400,800]));
test('reverse drag is accepted',()=>assert.deepEqual(columnPixels(.4,.2,2000),[400,800]));
test('invalid and zero-width drags are rejected',()=>{assert.throws(()=>columnPixels(.3,.3,2000));assert.throws(()=>columnPixels(.2,.4,0))});
