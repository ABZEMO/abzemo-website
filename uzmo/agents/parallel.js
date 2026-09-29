export async function runParallelDelegations(tasks=[], { concurrency = 3 } = {}) {
  const results=new Array(tasks.length); let cursor=0;
  async function worker(){ while(true){ const index=cursor++; if(index>=tasks.length)return;
    try{results[index]={status:"completed",result:await tasks[index]()};}
    catch(error){results[index]={status:"failed",error:error.message||"Delegated task failed"};}
  }}
  await Promise.all(Array.from({length:Math.min(concurrency,tasks.length)},worker)); return results;
}