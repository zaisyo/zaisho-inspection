// Aggregate OCR attempt metrics without retaining recognized content or filenames.
export function summarizeAttempts(events){
 if(!Array.isArray(events))throw Error('Events must be an array');
 const valid=events.filter(x=>x&&['success','failure'].includes(x.status)&&Number.isFinite(x.elapsedMs)&&x.elapsedMs>=0);
 const successes=valid.filter(x=>x.status==='success'),failures=valid.length-successes.length;
 const avg=arr=>arr.length?Math.round(arr.reduce((s,x)=>s+x.elapsedMs,0)/arr.length):null;
 return {attempts:valid.length,successes:successes.length,failures,failureRate:valid.length?failures/valid.length:null,firstSuccessMs:successes[0]?.elapsedMs??null,laterAvgMs:avg(successes.slice(1)),overallAvgMs:avg(successes)};
}
export function attemptsCsv(events){
 const header='回数,結果,合計ms,初期化ms,認識ms';
 const rows=events.map((x,i)=>[i+1,x.status,Math.round(x.elapsedMs),Math.round(x.initMs??0),Math.round(x.recognizeMs??0)].join(','));
 return '\uFEFF'+[header,...rows].join('\r\n');
}
