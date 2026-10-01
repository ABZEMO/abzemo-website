export function createExecutionState({id,goal,maxSteps=8}={}) {
  return {id:id||crypto.randomUUID(),goal,status:"running",step:0,maxSteps,events:[],results:[]};
}
export function recordExecutionEvent(state,event) {
  state.events.push({timestamp:new Date().toISOString(),...event});
  state.step=Math.max(state.step,event.step||state.step); return state;
}
export function finishExecution(state,status){state.status=status;return state;}