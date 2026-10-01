const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-6-luna";
function send(res, body, status = 200) {
  const headers = {"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};
  if (res && typeof res.status === "function") return res.status(status).setHeader("Content-Type",headers["Content-Type"]).setHeader("Access-Control-Allow-Origin","*").setHeader("Access-Control-Allow-Methods","POST, OPTIONS").setHeader("Access-Control-Allow-Headers","Content-Type").json(body);
  return new Response(JSON.stringify(body), {status,headers});
}
function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);
  return {};
}
export default async function handler(req,res) {
  if (req.method === "OPTIONS") return send(res,{},204);
  if (req.method !== "POST") return send(res,{error:"Method not allowed."},405);
  if (!OPENAI_API_KEY) return send(res,{error:"Translation service is not configured."},500);
  let body; try { body=parseBody(req); } catch (_) { return send(res,{error:"Invalid JSON."},400); }
  const target=typeof body.target_language==="string"?body.target_language.slice(0,20):"en";
  const texts=Array.isArray(body.texts)?body.texts.filter(x=>typeof x==="string"&&x.trim()).slice(0,160):[];
  if (!texts.length) return send(res,{translations:[]});
  const prompt=[
    "Translate website UI/content from English into the requested target language.",
    "Return exactly one translation for every input item, in the same order. Do not merge, omit, explain, summarize, or add items.",
    "Preserve meaning, professional tone, punctuation and numbers.",
    "Never translate brand names, product/venture names, URLs, email addresses, or the brand slogan.",
    "Protected terms: ABZEMO, ABZEMO AI, ABZEMO Medical, ABZEMO Trade, ABZEMO Fashions, ABZEMO Real Estate, ABZEMO Logistics, ABZEMO Finance, ABZEMO Smart Schooling, Building What's Next.",
    "Target language: "+target,
    "Input strings: "+JSON.stringify(texts)
  ].join("\n");
  try {
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":"Bearer "+OPENAI_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({
      model:MODEL,input:[{role:"user",content:prompt}],max_output_tokens:6000,
      text:{format:{type:"json_schema",name:"abzemo_translations",strict:true,schema:{type:"object",additionalProperties:false,properties:{translations:{type:"array",items:{type:"object",additionalProperties:false,properties:{source:{type:"string"},translation:{type:"string"}},required:["source","translation"]}}},required:["translations"]}}}
    })});
    if (!response.ok) { console.error("Translation provider error:",await response.text()); return send(res,{error:"Translation provider request failed."},502); }
    const data=await response.json();
    const raw=typeof data.output_text==="string" ? data.output_text.trim() : (Array.isArray(data.output) ? data.output.flatMap(item=>Array.isArray(item.content)?item.content:[]).map(part=>part&&typeof part.text==="string"?part.text:"").filter(Boolean).join("\n").trim() : "");
    if (!raw) return send(res,{error:"Translation provider returned no output."},502);
    const parsed=JSON.parse(raw);
    return send(res,{translations:Array.isArray(parsed.translations)?parsed.translations:[]});
  } catch (error) { console.error("Translation error:",error); return send(res,{error:"Translation failed."},502); }
}
