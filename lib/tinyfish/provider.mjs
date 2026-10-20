import {EVENT_GOAL, parsePublicUrl, parsePublicFacts} from './context.mjs';

const BASE='https://agent.tinyfish.ai/v1';
export const RUN_LIMITS=Object.freeze({max_steps:12,max_duration_seconds:120});

// This boundary accepts a URL only. Private journal contents cannot enter its request.
export async function startEventResearch(url,key,{request=fetch}={}){
 const response=await request(BASE+'/automation/run-async',{
  method:'POST',headers:{'Content-Type':'application/json','X-API-Key':key},
  body:JSON.stringify({url:parsePublicUrl(url),goal:EVENT_GOAL,browser_profile:'lite',
   api_integration:'schema-kritical-2026',agent_config:RUN_LIMITS}),
  signal:AbortSignal.timeout(15000)
 });
 if(!response.ok)throw new Error('TinyFish could not start this request. Check the provider configuration.');
 const run=await response.json();const id=run.run_id??run.runId;
 if(typeof id!=='string'||! /^[\w-]{6,150}$/.test(id))throw new Error('TinyFish did not return a valid run ID.');
 return id;
}

export async function readEventResearch(runId,sourceUrl,key,{request=fetch,now=()=>new Date()}={}){
 if(! /^[\w-]{6,150}$/.test(runId))throw new Error('Invalid research session');
 const response=await request(BASE+'/runs/'+encodeURIComponent(runId),{
  headers:{'X-API-Key':key},signal:AbortSignal.timeout(12000)
 });
 if(!response.ok)throw new Error('Could not check TinyFish status.');
 const run=await response.json();const status=String(run.status??'RUNNING').toUpperCase();
 if(['FAILED','CANCELLED'].includes(status))return {status,error:'TinyFish could not read this event page. Your journal draft is unchanged.'};
 if(status!=='COMPLETED')return {status:'RUNNING'};
 const facts=parsePublicFacts(run.result??run.resultJson,parsePublicUrl(sourceUrl));
 return {status,facts:{...facts,fetchedAt:now().toISOString()}};
}
