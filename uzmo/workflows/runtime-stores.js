import {createDurableJobStore} from "./durable-store.js";
import {createDurableWorkflowStore} from "./durable-workflow-store.js";
import {createJobStore} from "./job-store.js";
import {createWorkflowStore} from "./store.js";
export function createRuntimeStores(env){
 const durable=Boolean(env?.UZMO_DB);
 return {durable,workflows:durable?createDurableWorkflowStore(env):createWorkflowStore(),jobs:durable?createDurableJobStore(env):createJobStore()};
}
