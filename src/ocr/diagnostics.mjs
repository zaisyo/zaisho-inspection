// Dependency-free OCR diagnostic functions. No network or persistent storage.
export function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
export function normalizeRect(rect){
 const x=clamp(Number(rect.x),0,1),y=clamp(Number(rect.y),0,1);
 if(!Number.isFinite(x+y+Number(rect.w)+Number(rect.h)))throw Error('ROI must contain finite numbers');
 const w=clamp(Number(rect.w),0,1-x),h=clamp(Number(rect.h),0,1-y);
 if(w<=0||h<=0)throw Error('ROI must have a positive area');
 return {x,y,w,h};
}
export function pixelRect(rect,width,height){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)throw Error('Invalid image dimensions');
 const r=normalizeRect(rect);
 const x=Math.min(width-1,Math.floor(r.x*width)),y=Math.min(height-1,Math.floor(r.y*height));
 const right=Math.max(x+1,Math.min(width,Math.ceil((r.x+r.w)*width)));
 const bottom=Math.max(y+1,Math.min(height,Math.ceil((r.y+r.h)*height)));
 return {x,y,w:right-x,h:bottom-y};
}
export function partCandidates(s){
 const m=String(s??'').normalize('NFKC').toUpperCase().replace(/[‐‑–—－]/g,'-').match(/[A-Z0-9][A-Z0-9._\/-]{3,35}/g)||[];
 return [...new Set(m.filter(x=>/[A-Z]/.test(x)&&/[0-9]/.test(x)))];
}
export function candidateStatus(text,expected=[]){
 const matches=partCandidates(text);
 const set=new Set(expected.map(x=>String(x).normalize('NFKC').toUpperCase()));
 const exact=matches.filter(x=>set.has(x));
 return {matches,exact,reviewRequired:true,reason:!matches.length?'NO_CANDIDATE':exact.length>1?'MULTIPLE_MATCHES':exact.length===1?'EXACT_CANDIDATE':'UNMATCHED'};
}
export function makeTimings(){const marks={};return {start(key){marks[key]=performance.now()},end(key){if(marks[key]===undefined)throw Error('Missing mark '+key);const ms=performance.now()-marks[key];delete marks[key];return Math.round(ms*10)/10}}}
export async function renderRegion(file,rect,{maxEdge=2200,gray=false}={}){
 if(!globalThis.createImageBitmap)throw Error('createImageBitmap not supported');
 const image=await createImageBitmap(file);
 try {
  const crop=pixelRect(rect,image.width,image.height),scale=Math.min(2,maxEdge/Math.max(crop.w,crop.h));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(crop.w*scale));canvas.height=Math.max(1,Math.round(crop.h*scale));
  const ctx=canvas.getContext('2d',{willReadFrequently:gray});
  if(!ctx)throw Error('Canvas 2D unavailable');
  ctx.drawImage(image,crop.x,crop.y,crop.w,crop.h,0,0,canvas.width,canvas.height);
  if(gray){const v=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<v.data.length;i+=4){const g=Math.round(.299*v.data[i]+.587*v.data[i+1]+.114*v.data[i+2]);v.data[i]=g;v.data[i+1]=g;v.data[i+2]=g}ctx.putImageData(v,0,0)}
  return {canvas,crop,source:{width:image.width,height:image.height},output:{width:canvas.width,height:canvas.height}};
 } finally {image.close()}
}
