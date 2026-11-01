// CSV/TSV intake parsing with strict validation. No network/storage side effects.
const normalize=v=>String(v??'').normalize('NFKC').trim();
const CODE_PATTERN=/^[A-Z0-9][A-Z0-9._\/-]{1,79}$/;
export function parseDelimited(text,delimiter=','){
 if(delimiter!==','&&delimiter!=='\t')throw Error('Unsupported delimiter');
 const input=String(text??'').replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<input.length;i++){const c=input[i];
  if(c==='"'){if(quoted&&input[i+1]==='"'){cell+='"';i++}else if(quoted){quoted=false}else if(!cell){quoted=true}else throw Error('Unexpected quote');}
  else if(c===delimiter&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';if(c==='\r'&&input[i+1]==='\n')i++;}
  else cell+=c;
 }
 if(quoted)throw Error('Unclosed CSV quote');
 row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
const aliases={part:['品番','商品コード','品番コード','part','partno','partnumber','sku'],qty:['数量','予定数量','個数','qty','quantity'],name:['商品名','品名','name'],management:['管理no','管理番号','management'],caseNo:['件管no','件名管理no','案件管理番号','caseno']};
function key(s){return normalize(s).toLowerCase().replace(/[.\s_-]/g,'')}
export function parseIntake(text,{delimiter,skipInvalid=false}={}){
 const rows=parseDelimited(text,delimiter??(String(text).split(/\r?\n/,1)[0].includes('\t')?'\t':','));
 if(!rows.length)return {items:[],errors:[],headers:[]};
 const headers=rows[0].map(key);
 const col={};for(const [name,names] of Object.entries(aliases)){col[name]=headers.findIndex(h=>names.some(n=>key(n)===h))}
 if(col.part<0||col.qty<0)throw Error('Header must contain 品番 and 数量 columns');
 const items=[],errors=[],seen=new Set();
 for(let i=1;i<rows.length;i++){
  const r=rows[i],val=name=>col[name]<0?'':normalize(r[col[name]]);
  const part=val('part').toUpperCase(),q=val('qty');
  const qty=Number(q);
  const problems=[];
  if(!CODE_PATTERN.test(part))problems.push('INVALID_PART');
  if(!/^\d+$/.test(q)||!Number.isSafeInteger(qty)||qty<1||qty>999999)problems.push('INVALID_QTY');
  const management=val('management').toUpperCase(),caseNo=val('caseNo').toUpperCase();
  const duplicateKey=part+'|'+management+'|'+caseNo;
  if(seen.has(duplicateKey))problems.push('DUPLICATE_ROW');
  if(problems.length){errors.push({row:i+1,part,reasons:problems});continue}
  seen.add(duplicateKey);
  items.push({id:'import-'+i,part,qty,done:0,name:val('name'),management,caseNo});
 }
 return {items:errors.length&&!skipInvalid?[]:items,errors,headers:rows[0]};
}
export function checkScan(items,part,amount=1){
 const code=normalize(part).toUpperCase();
 if(!Number.isSafeInteger(amount)||amount<1)return {status:'INVALID_AMOUNT'};
 const matches=items.filter(x=>normalize(x.part).toUpperCase()===code);
 if(!matches.length)return {status:'UNREGISTERED'};
 if(matches.length>1)return {status:'AMBIGUOUS',matchingIds:matches.map(x=>x.id)};
 const x=matches[0];if(!Number.isSafeInteger(x.qty)||!Number.isSafeInteger(x.done)||x.done<0)return {status:'INVALID_STATE'};
 if(x.done+amount>x.qty)return {status:'OVER_QUANTITY',remaining:x.qty-x.done};
 return {status:'READY_TO_CONFIRM',itemId:x.id,remaining:x.qty-x.done,amount,requiresUserConfirmation:true};
}
