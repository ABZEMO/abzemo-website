const ALLOWED_ORIGINS=new Set(["https://abzemo.com","https://www.abzemo.com","https://abzemo.github.io",...(process.env.ABZEMO_ALLOWED_ORIGINS||"").split(",").map(x=>x.trim()).filter(Boolean)]);
const OPENAI_API_KEY=process.env.OPENAI_API_KEY;
const MODEL=process.env.OPENAI_SEARCH_MODEL||"gpt-6-luna";
const MAX_QUERY_LENGTH=1000;
const PAGES=[
{title:"Home",url:"/",keywords:"ABZEMO building what's next AI automation business solutions global company",snippet:"ABZEMO is building technology-led business solutions, with AI automation as its first major vision."},
{title:"About ABZEMO",url:"/about.html",keywords:"about company brand business technology",snippet:"Learn about ABZEMO, its direction, approach and broader business vision."},
{title:"Mission",url:"/mission.html",keywords:"mission purpose businesses transformation",snippet:"ABZEMO's mission and the principles guiding its work."},
{title:"Vision",url:"/vision.html",keywords:"vision future AI automation agentic AI",snippet:"ABZEMO's future-facing vision for intelligent technology and business transformation."},
{title:"Director's Note",url:"/director-note.html",keywords:"director leadership note founder",snippet:"A leadership perspective on ABZEMO's direction and ambitions."},
{title:"Solutions",url:"/solutions.html",keywords:"solutions AI automation agents business automation ERP finance sales workflows",snippet:"Explore ABZEMO solution areas including AI automation, agents and business workflows."},
{title:"Industries",url:"/industries.html",keywords:"industries education healthcare pharmaceuticals logistics manufacturing energy retail mobility real estate",snippet:"Explore the industries ABZEMO is designed to support with technology and automation."},
{title:"ABZEMO AI",url:"/abzemo-ai.html",keywords:"ABZEMO AI agents agentic AI automation multilingual business solutions",snippet:"ABZEMO AI is a dedicated branch focused on AI automation, AI agents, agentic AI and business solutions."},
{title:"Ventures",url:"/ventures.html",keywords:"ventures products future companies technology",snippet:"Explore ABZEMO's venture direction and future technology initiatives."},
{title:"Contact",url:"/contact.html",keywords:"contact email business enquiry",snippet:"Contact ABZEMO for business enquiries and collaboration."},
{title:"Privacy Policy",url:"/privacy.html",keywords:"privacy data policy",snippet:"ABZEMO privacy and data handling information."},
{title:"Terms & Conditions",url:"/terms.html",keywords:"terms conditions legal",snippet:"ABZEMO terms and conditions."}];
function send(res,body,status,origin){const allowed=ALLOWED_ORIGINS.has(origin)?origin:"https://abzemo.com";const headers={"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":allowed,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"};if(res?.status)return res.status(status).setHeader("Content-Type",headers["Content-Type"]).setHeader("Access-Control-Allow-Origin",headers["Access-Control-Allow-Origin"]).setHeader("Access-Control-Allow-Methods",headers["Access-Control-Allow-Methods"]).setHeader("Access-Control-Allow-Headers","Content-Type").setHeader("Vary","Origin").json(body);return new Response(JSON.stringify(body),{status,headers})}
function rank(q){const words=q.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2);return PAGES.map(p=>{const h=(p.title+" "+p.keywords+" "+p.snippet).toLowerCase();let score=h.includes(q.toLowerCase())?100:0;for(const w of words)if(h.includes(w))score+=8;return {...p,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,6)}
function extract(d){if(typeof d?.output_text==="string")return d.output_text.trim();return (d?.output||[]).flatMap(x=>x?.content||[]).map(x=>x?.text).filter(Boolean).join("\n").trim()}
export default async function handler(req,res){
 const origin=req?.headers?.origin||"";
 if(req?.method==="OPTIONS")return send(res,{},204,origin);
 if(req?.method!=="POST")return send(res,{error:"Method not allowed"},405,origin);
 let body;try{body=typeof req.body==="string"?JSON.parse(req.body):(req.body||{})}catch(_){return send(res,{error:"Invalid JSON body"},400,origin)}
 const query=typeof body.query==="string"?body.query.trim().slice(0,MAX_QUERY_LENGTH):"";
 const language=typeof body.language==="string"?body.language.slice(0,20):"en";
 if(!query)return send(res,{error:"Query is required"},400,origin);
 const results=rank(query);
 if(!OPENAI_API_KEY)return send(res,{answer:"AI Search is not configured yet. Here are the most relevant ABZEMO sections.",results:results.map(({title,url,snippet})=>({title,url,snippet}))},200,origin);
 const context=results.map((p,i)=>(i+1)+". "+p.title+" | "+p.url+" | "+p.snippet).join("\n");
 const prompt=["You are ABZEMO AI Search, a separate website search and discovery layer. You are NOT the ABZEMO AI visitor sales assistant.","Answer only from the supplied ABZEMO website context. Never invent pages, products, clients, prices, capabilities, locations or claims.","Understand natural-language queries and answer concisely in the user's detected language when possible.","If the context is insufficient, say so clearly.","Detected user language: "+language,"User query: "+query,"Relevant ABZEMO website context:",context||"No direct page match."].join("\n\n");
 try{
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":"Bearer "+OPENAI_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,input:prompt,max_output_tokens:500})});
  const d=await r.json();if(!r.ok)throw new Error("provider");
  return send(res,{answer:extract(d)||"I found relevant ABZEMO sections below.",results:results.map(({title,url,snippet})=>({title,url,snippet}))},200,origin);
 }catch(_){return send(res,{answer:"AI Search could not complete the AI summary right now. Relevant ABZEMO sections are shown below.",results:results.map(({title,url,snippet})=>({title,url,snippet}))},200,origin)}
}