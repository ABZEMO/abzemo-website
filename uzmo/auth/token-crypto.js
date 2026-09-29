const encoder=new TextEncoder();
const decoder=new TextDecoder();

function bytesFromBase64(value){
  const binary=atob(value.replace(/-/g,"+").replace(/_/g,"/"));
  return Uint8Array.from(binary,c=>c.charCodeAt(0));
}
function base64(bytes){
  let binary=""; for(const b of bytes) binary+=String.fromCharCode(b); return btoa(binary).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/g,"");
}
async function key(env){
  if(!env?.UZMO_TOKEN_ENCRYPTION_KEY) throw new Error("UZMO_TOKEN_ENCRYPTION_KEY is not configured.");
  const raw=bytesFromBase64(env.UZMO_TOKEN_ENCRYPTION_KEY);
  if(raw.length!==32) throw new Error("UZMO_TOKEN_ENCRYPTION_KEY must be a base64url-encoded 32-byte key.");
  return crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt","decrypt"]);
}
export async function encryptSecret(env,value){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(env),encoder.encode(value));
  return JSON.stringify({v:1,iv:base(iv),data:base(new Uint8Array(encrypted))});
}
export async function decryptSecret(env,payload){
  const item=typeof payload==="string"?JSON.parse(payload):payload;
  const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytesFromBase64(item.iv)},await key(env),bytesFromBase64(item.data));
  return decoder.decode(plain);
}
