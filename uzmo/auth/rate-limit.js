const buckets=new Map();
export function rateLimit(key,{limit=30,windowMs=60000}={}){
 const now=Date.now(),entry=buckets.get(key);
 if(!entry||now-entry.start>=windowMs){buckets.set(key,{start:now,count:1});return {allowed:true,remaining:limit-1};}
 entry.count+=1;return {allowed:entry.count<=limit,remaining:Math.max(0,limit-entry.count),retryAfterMs:Math.max(0,windowMs-(now-entry.start))};
}
