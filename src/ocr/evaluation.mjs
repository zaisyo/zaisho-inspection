// Pure functions for evaluating OCR results against manually verified ground truth.
import {partCandidates} from './diagnostics.mjs';
export const REASONS=Object.freeze({OK:'OK',EMPTY:'NO_CANDIDATE',MISREAD:'INCORRECT_CANDIDATE',AMBIGUOUS:'AMBIGUOUS_CANDIDATE',NOT_TESTED:'NOT_TESTED'});
export function evaluateRecognition(recognized,expectedPart){
 const expected=String(expectedPart??'').normalize('NFKC').trim().toUpperCase();
 if(!expected)return {status:REASONS.NOT_TESTED,exact:false,candidates:partCandidates(recognized)};
 const candidates=partCandidates(recognized);
 const exact=candidates.includes(expected);
 return {status:candidates.length===0?REASONS.EMPTY:exact?REASONS.OK:candidates.length>1?REASONS.AMBIGUOUS:REASONS.MISREAD,exact,candidates};
}
export function summarizeEvaluations(rows){
 if(!Array.isArray(rows))throw Error('Rows must be an array');
 const valid=rows.filter(x=>x&&x.status!==REASONS.NOT_TESTED);
 const total=valid.length,correct=valid.filter(x=>x.exact===true).length;
 return {total,correct,exactRate:total?correct/total:null,failures:valid.filter(x=>!x.exact).length};
}
export function safeDiagnosticExport(report,{includeRecognizedText=false}={}){
 if(!report||!Array.isArray(report.results))throw Error('Invalid report');
 return {
  version:2,
  createdAt:report.date,
  timingsMs:{...report.timingsMs},
  results:report.results.map(r=>({
   variant:r.variant,source:r.image,crop:r.crop,output:r.output,
   status:r.evaluation?.status??REASONS.NOT_TESTED,
   exact:r.evaluation?.exact??false,
   ...(includeRecognizedText?{text:r.text,candidates:r.candidate?.matches??[]}:{}),
  })),
 };
}
