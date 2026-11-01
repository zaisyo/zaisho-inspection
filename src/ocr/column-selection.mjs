// Convert a horizontal drag on a resized image into OCR canvas column coordinates.
export function columnPixels(startRatio,endRatio,canvasWidth){
 if(!Number.isSafeInteger(canvasWidth)||canvasWidth<2)throw Error('Invalid OCR canvas width');
 if(!Number.isFinite(startRatio)||!Number.isFinite(endRatio))throw Error('Invalid column selection');
 const a=Math.max(0,Math.min(1,Math.min(startRatio,endRatio)));
 const b=Math.max(0,Math.min(1,Math.max(startRatio,endRatio)));
 if((b-a)*canvasWidth<3)throw Error('Drag a wider column');
 return [Math.floor(a*canvasWidth),Math.min(canvasWidth,Math.ceil(b*canvasWidth))];
}
export function displayRatio(clientX,rect){
 if(!Number.isFinite(clientX)||!rect||!Number.isFinite(rect.left)||!Number.isFinite(rect.width)||rect.width<=0)throw Error('Invalid display rectangle');
 return Math.max(0,Math.min(1,(clientX-rect.left)/rect.width));
}
