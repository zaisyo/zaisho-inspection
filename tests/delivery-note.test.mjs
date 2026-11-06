import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseDeliveryLines,deliveryRowsToCsv} from '../src/ocr/delivery-note.mjs';
test('simple two-line note',()=>{const r=parseDeliveryLines('品番 数量\nPTEC39 2個\nAB-12 3本');assert.equal(r.accepted.length,2);assert.equal(r.accepted[1].qty,3);});
test('no cross-line part quantity attachment',()=>{const r=parseDeliveryLines('PTEC39\n2個');assert.equal(r.accepted.length,0);assert.equal(r.review.length,2)});
test('multiple possible quantity cells require review',()=>{const r=parseDeliveryLines('AB-12 3 12000');assert.equal(r.accepted.length,0);assert.equal(r.review[0].reason,'AMBIGUOUS_PAIRS')});
test('single unknown line never automatically accepted',()=>assert.equal(parseDeliveryLines('商品A のみ').accepted.length,0));
test('accepted rows remain review-required',()=>assert.equal(parseDeliveryLines('PTEC39 2個').accepted[0].reviewRequired,true));
test('CSV safeguards formula injection',()=>assert.ok(deliveryRowsToCsv([{part:'=cmd',qty:1,name:'',line:1}]).includes("'=cmd")));
