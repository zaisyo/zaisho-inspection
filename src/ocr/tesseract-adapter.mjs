// Convert Tesseract.js block-level OCR output into layout words.
// Tesseract.js v5 may omit blocks unless explicitly requested.
// Never synthesize coordinates from plain text.
export function collectOcrWords(data){
 const out=[];
 const add=w=>{const b=w?.bbox;if(typeof w?.text!=='string'||!b)return;
  if(!['x0','y0','x1','y1'].every(k=>Number.isFinite(b[k])))return;
  if(b.x1<=b.x0||b.y1<=b.y0)return;
  out.push({text:w.text,bbox:{x0:b.x0,y0:b.y0,x1:b.x1,y1:b.y1}})};
 const blocks=Array.isArray(data?.blocks)?data.blocks:[];
 for(const block of blocks)for(const para of block.paragraphs||[])for(const line of para.lines||[])for(const word of line.words||[])add(word);
 if(!out.length&&Array.isArray(data?.words))for(const w of data.words)add(w);
 return out;
}
