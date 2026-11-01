// Run: node scripts/baseline_audit.mjs
// Dependency-free source audit for the current single-file prototype.
// Reports architectural risks without claiming OCR accuracy is measured.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const file = resolve(process.cwd(), 'index.html');
const html = readFileSync(file, 'utf8');
const checks = [
  ['barcode scanner', /BarcodeDetector|Html5Qrcode/.test(html)],
  ['OCR worker', /Tesseract\.createWorker/.test(html)],
  ['preprocess', /preprocessLabel/.test(html)],
  ['CSV export', /\.csv|text\/csv|csv/.test(html)],
  ['local storage', /localStorage/.test(html)],
  ['review before OCR registration', /labelRegister/.test(html) && /confirm\(/.test(html)],
];
for (const [name, ok] of checks) console.log((ok?'OK  ':'MISSING ')+name);
if(checks.some(([,ok])=>!ok)) process.exitCode=1;
console.log('Source characters:', html.length);
console.log('Note: structural checks only; camera/OCR accuracy need physical-device testing.');
