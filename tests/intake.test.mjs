import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseDelimited,parseIntake,checkScan} from '../src/intake/intake.mjs';
test('quoted CSV fields and commas',()=>assert.deepEqual(parseDelimited('品番,数量,品名\nAB-12,2,"ドア,白"'),[['品番','数量','品名'],['AB-12','2','ドア,白']]));
test('normalizes BOM, fullwidth code and qty',()=>{
 const x=parseIntake('\uFEFF品番,数量,品名\nＡＢ－１２,２,床材');assert.equal(x.errors.length,0);assert.equal(x.items[0].part,'AB-12');assert.equal(x.items[0].qty,2);
});
test('tab-separated intake',()=>{const x=parseIntake('品番\t予定数量\nCD34\t3');assert.equal(x.items[0].qty,3)});
test('rejects invalid quantity without silently importing partial lines',()=>{const x=parseIntake('品番,数量\nAB12,2\nCD13,0');assert.equal(x.items.length,0);assert.equal(x.errors[0].row,3)});
test('duplicate key is rejected to prevent ambiguous scans',()=>{const x=parseIntake('品番,数量\nAB12,2\nAB12,3');assert.equal(x.items.length,0);assert.ok(x.errors[0].reasons.includes('DUPLICATE_ROW'))});
test('scan quantity overrun blocked',()=>{
 const items=[{id:'a',part:'AB12',qty:2,done:2}];assert.equal(checkScan(items,'AB12').status,'OVER_QUANTITY');
});
test('unknown code not allowed to confirm',()=>assert.equal(checkScan([], 'AB12').status,'UNREGISTERED'));
test('duplicate entries require manual disambiguation',()=>assert.equal(checkScan([{id:'a',part:'AB12',qty:1,done:0},{id:'b',part:'AB12',qty:1,done:0}],'AB12').status,'AMBIGUOUS'));
test('matched scan requires user confirmation',()=>assert.equal(checkScan([{id:'a',part:'AB12',qty:2,done:0}],'AB12').requiresUserConfirmation,true));
