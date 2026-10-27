import test from 'node:test';
import assert from 'node:assert/strict';
import {availableAI,customerAsk,memoryPrompt,retrieveMemories,MEMORY_MODEL} from '../lib/customer/ai.mjs';

const env={AI_ENABLED:'true',AI_PROVIDER:'groq',GROQ_API_KEY:'fake-test-key',AI_ALLOWED_EMAILS:'owner@example.test'};
const user={email:'owner@example.test'};
const page={id:'page-1',title:'Goa trip',date:'2026-10-20',body:'I went to Goa with Mira. We took the morning train.',ai_allowed:true};
function database({consent=true,entries=[page],quotaError=null}={}){
 const calls=[];
 const client={from(table){calls.push(['from',table]);const result=table==='schema_consent_choices'?{enabled:consent}:table==='schema_profiles'?{ai_consent:consent,status:'active'}:entries;const chain={select(){return chain;},eq(key,value){calls.push(['eq',table,key,value]);return chain;},order(){return chain;},async maybeSingle(){return {data:result};},async limit(){return {data:result};}};return chain;},async rpc(name){calls.push(['rpc',name]);return {error:quotaError};}};
 return {client,calls};
}

test('standalone AI requires Groq, an approved account and an explicit enable flag; OpenAI is never a fallback',()=>{
 assert.equal(availableAI(env,user.email),true);
 for(const change of [{AI_ENABLED:'false'},{AI_PROVIDER:'openai'},{GROQ_API_KEY:''},{AI_ALLOWED_EMAILS:'other@example.test'}])assert.equal(availableAI({...env,...change},user.email),false);
 assert.equal(availableAI({...env,GROQ_API_KEY:'',OPENAI_API_KEY:'paid-key',OPENAI_MODEL:'paid-model'},user.email),false);
});

test('memory retrieval excludes forbidden pages and ungrounded archive questions',()=>{
 const entries=[page,{...page,id:'private',ai_allowed:false,body:'Goa secret'}];
 assert.deepEqual(retrieveMemories(entries,'Who came to Goa?','archive').map(x=>x.id),['page-1']);
 assert.deepEqual(retrieveMemories(entries,'Paris holiday','archive'),[]);
 assert.equal(retrieveMemories([{...page,title:'दिल्ली की यादें',body:'माया के साथ पुरानी दिल्ली गया था।'}],'दिल्ली में कौन साथ था?','archive')[0]?.id,'page-1');
});

test('multilingual input is bounded without losing the question or citation numbering',()=>{
 const question='कौन साथ था?';
 const memories=Array.from({length:8},(_,i)=>({...page,id:'page-'+i,body:'यादें '.repeat(800)}));
 const p=memoryPrompt(memories,question,'reflect');
 assert.equal(p.question,question);
 assert.ok(new TextEncoder().encode(JSON.stringify(p)).length<=5000);
 assert.ok(p.memories.length>0);
 assert.deepEqual(p.memories.map(x=>x.number),p.memories.map((_,i)=>i+1));
});

test('disabled consent prevents retrieval, quota reservation and provider transmission',async()=>{
 const db=database({consent:false});let requests=0;
 await assert.rejects(customerAsk(db.client,env,user,{question:'Goa'},{request:async()=>{requests++;}}),e=>e.status===403);
 assert.equal(requests,0);
 assert.equal(db.calls.some(x=>x[0]==='from'&&x[1]==='schema_entries'),false);
 assert.equal(db.calls.some(x=>x[0]==='rpc'),false);
});

test('no matching page returns a truthful answer without using the free provider or quota',async()=>{
 const db=database();let requests=0;
 const response=await customerAsk(db.client,env,user,{question:'Paris holiday'},{request:async()=>{requests++;}});
 assert.deepEqual((await response.json()).sources,[]);
 assert.equal(requests,0);
 assert.equal(db.calls.some(x=>x[0]==='rpc'),false);
});

test('a provider reply uses the Groq endpoint and only permitted text, final answer and source references',async()=>{
 const db=database({entries:[page,{...page,id:'secret',ai_allowed:false,body:'PRIVATE_SECRET'}]});
 let seen;
 const response=await customerAsk(db.client,env,user,{question:'Who came to Goa?'},{request:async(url,options)=>{seen={url,options,body:JSON.parse(options.body)};return Response.json({choices:[{finish_reason:'stop',message:{content:'You went with Mira. 【1】',reasoning:'PRIVATE_REASONING'}}]});}});
 const data=await response.json();
 assert.equal(seen.url,'https://api.groq.com/openai/v1/chat/completions');
 assert.equal(seen.body.model,MEMORY_MODEL);
 assert.equal(seen.body.include_reasoning,false);
 assert.equal(seen.body.max_completion_tokens,1500);
 assert.equal(seen.body.messages.length,2);
 assert.equal(seen.options.body.includes('PRIVATE_SECRET'),false);
 assert.equal(JSON.stringify(data).includes('PRIVATE_REASONING'),false);
 assert.deepEqual(data.sources,[{id:'page-1',title:page.title,date:page.date,number:1}]);
 assert.equal(data.answer,'You went with Mira. [1]');
 assert.ok(db.calls.some(x=>x[0]==='eq'&&x[2]==='ai_allowed'&&x[3]===true));
});

test('free-tier rate limiting is reported once with no retry or paid-provider fallback',async()=>{
 const db=database();let calls=0;
 await assert.rejects(customerAsk(db.client,env,user,{question:'Goa'},{request:async()=>{calls++;return new Response('provider internal details',{status:429});}}),e=>e.status===429&&/free AI service/.test(e.message)&&!e.message.includes('internal details'));
 assert.equal(calls,1);
});

test('quota failure stops before sending any journal text',async()=>{
 const db=database({quotaError:{code:'PT429'}});let calls=0;
 await assert.rejects(customerAsk(db.client,env,user,{question:'Goa'},{request:async()=>{calls++;}}),e=>e.status===429);
 assert.equal(calls,0);
});

test('empty or truncated responses are not presented as complete answers',async()=>{
 for(const message of [{finish_reason:'length',message:{content:'You went with'}},{finish_reason:'stop',message:{reasoning:'internal only'}}]){
  const db=database();await assert.rejects(customerAsk(db.client,env,user,{question:'Goa'},{request:async()=>Response.json({choices:[message]})}),e=>e.status===503);
 }
});
