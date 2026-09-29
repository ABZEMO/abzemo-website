export function parseEveryMinutes(value){const n=Number(value);return Number.isFinite(n)&&n>0?Math.floor(n):null;}
export function nextIntervalRun(trigger,now=new Date()){const minutes=parseEveryMinutes(trigger?.everyMinutes);return minutes?new Date(now.getTime()+minutes*60000).toISOString():null;}
