import test from 'node:test';
import assert from 'node:assert/strict';
import {startEventResearch,readEventResearch} from '../lib/tinyfish/provider.mjs';
import {createReviewedDraft} from '../lib/tinyfish/context.mjs';

test('provider start sends only the public URL and bounded task, never private payload fields',async()=>{
 let sent;
 const id=await startEventResearch('https://us.pycon.org/2026/','test-provider-key',{request:async(url,options)=>{sent={url,...options};return Response.json({run_id:'run_123456'});}});
 assert.equal(id,'run_123456');const body=JSON.parse(sent.body);
 assert.equal(body.agent_config.max_steps,12);assert.equal(body.agent_config.max_duration_seconds,120);
 assert.deepEqual(Object.keys(body).sort(),['agent_config','api_integration','browser_profile','goal','url']);
 assert.equal(body.url,'https://us.pycon.org/2026/');
});
test('completed provider facts carry retrieval time and create only the selected draft fields',async()=>{
 const out=await readEventResearch('run_123456','https://us.pycon.org/2026/','test-provider-key',{
  request:async()=>Response.json({status:'COMPLETED',result:{title:'PyCon US 2026',date:'May 13 - May 19, 2026',venue:'Long Beach',lineup:['Tutorials'],privateNotes:'untrusted'}}),
  now:()=>new Date('2026-10-20T09:00:00Z')});
 assert.equal(out.facts.fetchedAt,'2026-10-20T09:00:00.000Z');assert.equal(out.facts.privateNotes,undefined);
 const draft=createReviewedDraft(out.facts,['venue'],{entryDate:'2026-10-20'});
 assert.equal(draft.title,'A day worth keeping');assert.equal(draft.date,'2026-10-20');
 assert.match(draft.body,/Venue: Long Beach/);assert.match(draft.body,/Retrieved: 2026-10-20/);
 assert.doesNotMatch(draft.body,/Event title:|Event date:|Tutorials|untrusted/);
 const dated=createReviewedDraft(out.facts,['date'],{entryDate:'2026-10-20'});
 assert.equal(dated.date,'2026-10-20');assert.match(dated.body,/Event date: May 13/);
 assert.throws(()=>createReviewedDraft(out.facts,[]));
});
test('pending and failed runs never manufacture facts and upstream failures stay failures',async()=>{
 for(const status of ['PENDING','FAILED','CANCELLED']){
  const out=await readEventResearch('run_123456','https://us.pycon.org/2026/','key',{request:async()=>Response.json({status})});
  assert.equal(out.facts,undefined);
 }
 await assert.rejects(startEventResearch('https://us.pycon.org/2026/','key',{request:async()=>new Response('',{status:403})}));
});
