const buckets=new Map();

export async function rateLimit(key,{limit=30,windowMs=60000,env}={}) {
  if (env?.UZMO_DB) {
    const bucket=Math.floor(Date.now()/windowMs);
    const id=String(key||"anonymous")+":"+bucket;
    const now=new Date().toISOString();
    const row=await env.UZMO_DB.prepare(
      "INSERT INTO uzmo_rate_limits (bucket_key,bucket_start,count,updated_at) VALUES (?,?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1,updated_at=excluded.updated_at RETURNING count"
    ).bind(id,bucket,now).first();
    const count=Number(row?.count||0);
    const retryAfterMs=(bucket+1)*windowMs-Date.now();
    return {allowed:count<=limit,remaining:Math.max(0,limit-count),retryAfterMs:Math.max(0,retryAfterMs)};
  }
  const now=Date.now(),entry=buckets.get(key);
  if(!entry||now-entry.start>=windowMs){buckets.set(key,{start:now,count:1});return {allowed:true,remaining:limit-1};}
  entry.count+=1;return {allowed:entry.count<=limit,remaining:Math.max(0,limit-entry.count),retryAfterMs:Math.max(0,windowMs-(now-entry.start))};
}
