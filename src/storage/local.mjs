// Local-only persistence layer. Future UI integration requires explicit user action.
export const SCHEMA_VERSION=1;
export function validateSnapshot(snapshot){
 if(!snapshot||snapshot.schemaVersion!==SCHEMA_VERSION||!Array.isArray(snapshot.items)||!Array.isArray(snapshot.history))throw Error('Unsupported or corrupt snapshot');
 if(snapshot.items.length>10000||snapshot.history.length>100000)throw Error('Snapshot exceeds limits');
 const ids=new Set();
 const items=snapshot.items.map(x=>{
  if(!x||typeof x.id!=='string'||!x.id||ids.has(x.id))throw Error('Invalid or duplicate ID');
  ids.add(x.id);
  if(typeof x.part!=='string'||!x.part.trim()||x.part.length>80)throw Error('Invalid part');
  if(!Number.isSafeInteger(x.qty)||!Number.isSafeInteger(x.done)||x.qty<1||x.done<0||x.done>x.qty)throw Error('Invalid quantities');
  return {id:x.id,part:x.part,qty:x.qty,done:x.done,name:String(x.name??'').slice(0,300),management:String(x.management??'').slice(0,100),caseNo:String(x.caseNo??'').slice(0,100)};
 });
 const history=snapshot.history.map(x=>{
  if(!x||typeof x!=='object'||typeof x.eventId!=='string'||typeof x.itemId!=='string'||!ids.has(x.itemId))throw Error('Invalid event');
  if(!['CONFIRM','UNDO'].includes(x.type)||typeof x.at!=='string')throw Error('Invalid event fields');
  return {eventId:x.eventId,itemId:x.itemId,type:x.type,at:x.at,rawCode:String(x.rawCode??'').slice(0,500),inputMethod:String(x.inputMethod??'').slice(0,40)};
 });
 return {schemaVersion:SCHEMA_VERSION,items,history};
}
export function createSnapshot(items,history=[]){return validateSnapshot({schemaVersion:SCHEMA_VERSION,items,history})}
export function parseBackup(json){if(typeof json!=='string'||json.length>20_000_000)throw Error('Backup too large');return validateSnapshot(JSON.parse(json))}
export function exportBackup(snapshot){return JSON.stringify(validateSnapshot(snapshot),null,2)}
const DB_NAME='zaisho-inspection-development',STORE='snapshots';
export function openLocalDatabase(indexedDBProvider=globalThis.indexedDB){
 if(!indexedDBProvider) return Promise.reject(Error('IndexedDB unavailable'));
 return new Promise((resolve,reject)=>{
  const req=indexedDBProvider.open(DB_NAME,SCHEMA_VERSION);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error??Error('IndexedDB open failed'));
 });
}
export async function saveLocal(snapshot){
 const clean=validateSnapshot(snapshot),db=await openLocalDatabase();
 try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(clean,'active');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error??Error('Save failed'));tx.onabort=()=>reject(tx.error??Error('Save aborted'))})}
 finally{db.close()}
}
export async function loadLocal(){
 const db=await openLocalDatabase();
 try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get('active');req.onsuccess=()=>{try{resolve(req.result?validateSnapshot(req.result):null)}catch(e){reject(e)}};req.onerror=()=>reject(req.error??Error('Read failed'))})}
 finally{db.close()}
}
