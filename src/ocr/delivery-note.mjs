// Conservative delivery-note line parser. Only same-line part/quantity associations.
// Does not infer missing quantities or silently import uncertain rows.
const norm=s=>String(s??'').normalize('NFKC').trim();
const partRe=/^[A-Z0-9][A-Z0-9._\/-]{3,79}$/;
const qtyRe=/^(\d{1,6})(?:個|枚|本|箱|梱|台|袋|束|セット|ケース)?$/;
const heading=/^(?:品番|品名|商品名|数量|摘要|明細|単価|金額|合計|小計|税額|納品書|ページ|NO\.?|備考)/i;
export function parseDeliveryLines(text){
 const accepted=[],review=[],ignored=[];
 const lines=norm(text).split(/\r?\n/);
 for(let i=0;i<lines.length;i++){
  const raw=norm(lines[i]);if(!raw)continue;
  if(heading.test(raw)){ignored.push({line:i+1,raw,reason:'HEADING'});continue}
  const cells=raw.split(/[\t ,，　]+/).filter(Boolean);
  const matches=[];
  for(let p=0;p<cells.length;p++){
   const part=cells[p].toUpperCase();
   if(!partRe.test(part)||!/[A-Z]/.test(part)||!/[0-9]/.test(part))continue;
   for(let q=p+1;q<Math.min(cells.length,p+5);q++){
    const m=cells[q].match(qtyRe);if(!m)continue;
    const quantity=Number(m[1]);
    if(Number.isSafeInteger(quantity)&&quantity>0&&quantity<=999999)matches.push({part,qty:quantity,partIndex:p,qtyIndex:q});
   }
  }
  // Multiple possible pairs or a trailing number could be price; request review rather than guess.
  if(matches.length!==1){review.push({line:i+1,raw,reason:matches.length?'AMBIGUOUS_PAIRS':'NO_UNIQUE_PAIR'});continue}
  const m=matches[0];
  // Quantity must be adjacent to the part, or the next token may be a Japanese product name.
  const gap=cells.slice(m.partIndex+1,m.qtyIndex);
  if(gap.length>1||gap.some(x=>/^\d/.test(x))){review.push({line:i+1,raw,reason:'UNSAFE_COLUMN_LAYOUT'});continue}
  accepted.push({line:i+1,part:m.part,qty:m.qty,name:gap.join(' '),raw,reviewRequired:true});
 }
 return {accepted,review,ignored,totalLines:lines.length};
}
export function deliveryRowsToCsv(rows){
 const csvCell=v=>{const x=String(v??'');const safe=/^[=+@-]/.test(x)?"'"+x:x;return '"'+safe.replaceAll('"','""')+'"'};
 return '\uFEFF'+[['品番','数量','商品名','原文行'],...rows.map(r=>[r.part,r.qty,r.name,r.line])].map(r=>r.map(csvCell).join(',')).join('\r\n');
}
