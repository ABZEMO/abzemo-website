export function matchesEvent(trigger,event={}) {
 if(trigger?.type!=="event") return false;
 const expected=trigger.event||trigger.name;
 return Boolean(expected)&&expected===event.type;
}
export function verifyWebhookSecret(request,expected) {
 if(!expected) return true;
 return request.headers.get("X-UZMO-Webhook-Secret")===expected;
}
