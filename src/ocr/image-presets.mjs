// Explicit OCR resize presets: measurements choose a preset, never silently degrade.
export const OCR_IMAGE_EDGES=Object.freeze([1200,1600,2200]);
export function dimensionsForEdge(width,height,edge){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||!OCR_IMAGE_EDGES.includes(edge))throw Error('Invalid OCR image dimensions or preset');
 const scale=Math.min(1,edge/Math.max(width,height));
 return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale)),scale};
}
export function chooseOcrPreset(records){
 const eligible=records.filter(x=>OCR_IMAGE_EDGES.includes(x.edge)&&x.reviewed===true&&x.expectedRows>0&&x.correctRows===x.expectedRows&&Number.isFinite(x.totalMs));
 if(!eligible.length)return 2200;
 const byEdge=OCR_IMAGE_EDGES.map(edge=>({edge,runs:eligible.filter(x=>x.edge===edge)})).filter(x=>x.runs.length>=3);
 if(!byEdge.length)return 2200;
 return byEdge.map(x=>({edge:x.edge,avg:x.runs.reduce((s,r)=>s+r.totalMs,0)/x.runs.length})).sort((a,b)=>a.avg-b.avg)[0].edge;
}
