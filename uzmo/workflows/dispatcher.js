import {createJob} from "./jobs.js";
import {matchesEvent,verifyWebhookSecret} from "./events.js";
export function createTriggerDispatcher({jobStore,workflowStore}){
 return {
  dispatchEvent(event){
   const jobs=[];
   for(const workflow of workflowStore.list()){
    if(workflow.enabled&&matchesEvent(workflow.trigger,event)) jobs.push(jobStore.put(createJob({workflowId:workflow.id,input:{event}})));
   }
   return jobs;
  },
  dispatchWebhook(workflow,request,secret){
   if(!verifyWebhookSecret(request,secret)) throw new Error("Invalid webhook secret.");
   return jobStore.put(createJob({workflowId:workflow.id,input:{webhook:{method:request.method,headers:Object.fromEntries(request.headers),body:null}}}));
  }
 };
}
