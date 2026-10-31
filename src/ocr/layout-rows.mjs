// Layout-aware OCR row pairing. Input is OCR word boxes in image pixels.
// Deliberately fail-closed when column geometry, row proximity or quantity is ambiguous.
const normalize=s=>String(s??'').normalize('NFKC').trim();
const partRe=/^[A-Z0-9][A-Z0-9._\/-]{3,79}$/;
const qtyRe=/^(\d{1,6})(?:個|枚|本|箱|梱|台|袋|束|セット|ケース)?$/;
export function extractLayoutRows(words,{partColumn,quantityColumn,rowTolerance=0.65}={}){
 if(!Array.isArray(words))throw Error('words must be array');
 for(const c of [partColumn,quantityColumn])if(!Array.isArray(c)||c.length!==2||!c.every(Number.isFinite)||c[0]>=c[1])throw Error('Explicit part and quantity column bounds are required');
 if(partColumn[1]>quantityColumn[0])throw Error('Columns must not overlap');
 const clean=words.filter(w=>w&&typeof w.text==='string'&&w.bbox&&['x0','y0','x1','y1'].every(k=>Number.isFinite(w.bbox[k]))).map(w=>({
  text:normalize(w.text),x:(w.bbox.x0+w.bbox.x1)/2,y:(w.bbox.y0+w.bbox.y1)/2,h:Math.max(1,w.bbox.y1-w.bbox.y0)
 })).filter(w=>w.text);
 const candidates=[],review=[];
 for(const p of clean.filter(w=>w.x>=partColumn[0]&&w.x<partColumn[1]&&partRe.test(w.text.toUpperCase())&&/[A-Z]/i.test(w.text)&&/\d/.test(w.text))){
  const near=clean.filter(w=>w.x>=quantityColumn[0]&&w.x<quantityColumn[1]&&Math.abs(w.y-p.y)<=Math.max(w.h,p.h)*rowTolerance);
  const quantities=near.filter(w=>qtyRe.test(w.text)&&+w.text.match(/^\d+/)[0]>0);
  if(quantities.length!==1){review.push({part:p.text,rowY:p.y,reason:quantities.length?'AMBIGUOUS_QUANTITY':'NO_QUANTITY'});continue}
  candidates.push({part:p.text.toUpperCase(),qty:+quantities[0].text.match(/^\d+/)[0],rowY:p.y,reviewRequired:true});
 }
 const used=new Set();for(const c of candidates){const k=c.rowY.toFixed(0);if(used.has(k))review.push({part:c.part,rowY:c.rowY,reason:'DUPLICATE_ROW_POSITION'});used.add(k)}
 return {candidates:candidates.filter(c=>!review.some(r=>r.rowY===c.rowY)),review,requiresOriginalReview:true};
}
