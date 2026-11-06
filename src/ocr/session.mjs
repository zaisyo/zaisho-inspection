// Serial OCR session controller with safe recovery after engine failures.
export function createOcrSession({create,dispose}){
 if(typeof create!=='function'||typeof dispose!=='function')throw Error('Callbacks required');
 let worker=null,inflight=null,closed=false;
 async function obtain(){if(closed)throw Error('Session closed');if(worker)return worker;worker=await create();return worker}
 return {
  async run(input){if(closed)throw Error('Session closed');if(inflight)throw Error('OCR already running');
   const task=(async()=>{try{const w=await obtain();return await w.recognize(input)}catch(e){const bad=worker;worker=null;if(bad)try{await dispose(bad)}catch{}throw e}})();
   inflight=task;try{return await task}finally{if(inflight===task)inflight=null}
  },
  async warmup(){if(inflight)throw Error('OCR already running');return obtain()},
  async reset(){if(inflight)throw Error('OCR already running');const w=worker;worker=null;if(w)await dispose(w)},
  get busy(){return Boolean(inflight)}
 };
}
