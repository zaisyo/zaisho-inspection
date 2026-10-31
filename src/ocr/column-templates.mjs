// Manufacturer-specific column templates (normalized X ranges only).
const KEY='zaisho-delivery-column-templates-v1';
const validRange=r=>Array.isArray(r)&&r.length===2&&r.every(Number.isFinite)&&r[0]>=0&&r[1]<=1&&r[1]-r[0]>=.01;
export function validateTemplate(t){
 if(!t||typeof t.name!=='string'||!t.name.trim()||t.name.length>80)throw Error('Invalid template name');
 if(!validRange(t.part)||!validRange(t.qty))throw Error('Invalid column range');
 if(t.part[1]>t.qty[0])throw Error('Columns must not overlap or reverse');
 return {name:t.name.trim(),part:[...t.part],qty:[...t.qty],version:1};
}
export function readTemplates(storage=globalThis.localStorage){
 try{const value=JSON.parse(storage?.getItem(KEY)||'[]');return Array.isArray(value)?value.map(validateTemplate):[]}catch{return []}
}
export function saveTemplate(t,storage=globalThis.localStorage){
 const next=validateTemplate(t),all=readTemplates(storage).filter(x=>x.name!==next.name);
 if(all.length>=30)throw Error('Template limit reached');
 all.push(next);storage.setItem(KEY,JSON.stringify(all));return all;
}
export function removeTemplate(name,storage=globalThis.localStorage){
 const all=readTemplates(storage).filter(x=>x.name!==name);storage.setItem(KEY,JSON.stringify(all));return all;
}
export function findTemplate(name,storage=globalThis.localStorage){return readTemplates(storage).find(x=>x.name===name)||null}
