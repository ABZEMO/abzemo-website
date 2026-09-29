import {createJob} from "./jobs.js";
import {matchesEvent,verifyWebhookSecret} from "./events.js";
export function createTriggerDispatcher({jobStore,workflowStore,orgId}){
 return {
  async dispatchEvent(event){
   const jobs=[];const workflows=await workflowStore.list(orgId);
   for(const workflow of workflows){if(workflow.enabled&&matchesEvent(workflow.trigger,event)){jobs.push(await jobStore.put(createJob({workflowId:workflow.id,input:{event,orgId}})));}}
   return jobs;
  },
  async dispatchWebhook(workflow,request,secret){
   if(!verifyWebhookSecret(request,secret))throw new Error("Invalid webhook secret.");
   return jobStore.put(createJob({workflowId:workflow.id,input:{webhook:{method:request.method,headers:Object.fromEntries(request.headers),body:null},orgId}}));
  }
 };
}