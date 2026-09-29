const MINUTES_PER_DAY=24*60;
function matchesField(value,field,min,max){
 field=String(field||"*");
 return field.split(",").some(part=>{
  const [base,stepText]=part.split("/");
  const step=Math.max(1,Number(stepText)||1);
  if(base==="*")return value>=min&&value<=max&&(value-min)%step===0;
  if(base.includes("-")){
   const [a,z]=base.split("-").map(Number);return Number.isFinite(a)&&Number.isFinite(z)&&value>=a&&value<=z&&(value-a)%step===0;
  }
  const n=Number(base);return Number.isFinite(n)&&value===n;
 });
}
function cronMatches(date,fields){
 if(fields.length!==5)return false;
 const [minute,hour,dom,month,dow]=fields;
 const dayOk=matchesField(date.getUTCDate(),dom,1,31);
 const dowOk=matchesField(date.getUTCDay(),dow,0,6);
 return matchesField(date.getUTCMinutes(),minute,0,59)&&matchesField(date.getUTCHours(),hour,0,23)&&matchesField(date.getUTCMonth()+1,month,1,12)&&(dom==="*"||dow==="*" ? dayOk&&dowOk : dayOk||dowOk);
}
function nextCronRun(cron,now){
 const fields=String(cron||"").trim().split(/\s+/);
 if(fields.length!==5)return null;
 const cursor=new Date(now);cursor.setUTCSeconds(0,0);cursor.setUTCMinutes(cursor.getUTCMinutes()+1);
 for(let i=0;i<MINUTES_PER_DAY*366;i++){if(cronMatches(cursor,fields))return cursor.toISOString();cursor.setUTCMinutes(cursor.getUTCMinutes()+1);}
 return null;
}
export function nextRunAt(trigger,now=new Date()){
 if(!trigger||trigger.type!=="schedule")return null;
 const everyMinutes=Number(trigger.everyMinutes);
 if(Number.isFinite(everyMinutes)&&everyMinutes>0)return new Date(now.getTime()+everyMinutes*60000).toISOString();
 if(trigger.cron)return nextCronRun(trigger.cron,now);
 return null;
}
export function validateSchedule(trigger){
 if(!trigger||trigger.type!=="schedule")return {valid:true};
 if(!trigger.cron&&!(Number(trigger.everyMinutes)>0))return {valid:false,error:"Schedule requires cron or everyMinutes."};
 if(trigger.cron&&!nextCronRun(trigger.cron,new Date("2026-01-01T00:00:00Z")))return {valid:false,error:"Invalid or unsupported cron expression."};
 return {valid:true};
}
