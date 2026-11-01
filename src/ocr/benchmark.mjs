// Privacy-preserving OCR benchmark metrics. Excludes raw images and recognized text.
export function makeBenchmarkRecord({timings,recognizedRows,reviewRows,expectedRows,correctRows,mode,edge}){
 const t={};for(const k of ['decodeMs','initMs','recognizeMs','totalMs']){const n=timings?.[k];if(!Number.isFinite(n)||n<0||n>3600000)throw Error('Invalid timing '+k);t[k]=Math.round(n)}
 for(const n of [recognizedRows,reviewRows,expectedRows,correctRows])if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid count');
 if(correctRows>recognizedRows||correctRows>expectedRows)throw Error('Correct count exceeds row totals');
 if(typeof mode!=='string'||!['text','layout'].includes(mode))throw Error('Invalid mode');
 if(![1200,1600,2200].includes(edge))throw Error('Invalid image edge');
 return {schema:2,mode,edge,reviewed:true,totalMs:t.totalMs,timings:t,recognizedRows,reviewRows,expectedRows,correctRows,precision:recognizedRows?correctRows/recognizedRows:null,recall:expectedRows?correctRows/expectedRows:null};
}
export function benchmarkCsv(rows){
 const h=['最大辺px','方式','画像準備ms','初期化ms','認識ms','合計ms','候補行数','要確認行数','原本行数','正解行数','適合率','再現率'];
 const data=rows.map(r=>[r.edge,r.mode,r.timings.decodeMs,r.timings.initMs,r.timings.recognizeMs,r.timings.totalMs,r.recognizedRows,r.reviewRows,r.expectedRows,r.correctRows,r.precision??'',r.recall??'']);
 return '\uFEFF'+[h,...data].map(a=>a.join(',')).join('\r\n');
}
