import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {parseArgs} from 'node:util';
import {createInterface} from 'node:readline/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {startEventResearch,readEventResearch} from '../lib/tinyfish/provider.mjs';
import {parsePublicFacts,createReviewedDraft,parsePublicUrl} from '../lib/tinyfish/context.mjs';

const fields=['title','date','venue','lineup','description'];
async function main(){
 const {values}=parseArgs({options:{url:{type:'string'},fields:{type:'string'},example:{type:'boolean',default:false},'out-dir':{type:'string'},help:{type:'boolean'}}});
 if(values.help){console.log('pnpm demo:tinyfish --url https://event.org/ --fields title,venue\nSet TINYFISH_API_KEY for a live run. Use --example for the recorded provider result.\nWithout --fields, select facts interactively. Drafts save under .demo/memories/.');return;}
 if(values.example&&values.url)throw new Error('Choose either --example or --url.');
 let selected=values.fields?.split(',').map(x=>x.trim()).filter(Boolean);
 if(selected&&(!selected.length||selected.some(x=>!fields.includes(x))))throw new Error('Choose fields from: '+fields.join(', '));
 if(!selected&&!process.stdin.isTTY)throw new Error('Use --fields to approve specific facts in non-interactive mode.');
 let facts,runId,mode;
 if(values.example){
  const example=JSON.parse(await readFile(new URL('../evidence/tinyfish-live-provider.json',import.meta.url),'utf8'));
  mode='recorded';runId=example.run_id;
  facts={...parsePublicFacts(example.result,example.result.sourceUrl),fetchedAt:example.retrieved_on};
  console.log('RECORDED TINYFISH RESULT — no live request or credit use.');
 }else{
  if(!values.url)throw new Error('Supply --url for live research, or --example to replay the recorded result.');
  const url=parsePublicUrl(values.url),key=process.env.TINYFISH_API_KEY;
  if(!key)throw new Error('Set TINYFISH_API_KEY in your local environment before a live run.');
  mode='live';console.log('Researching '+url+' (120-second provider time limit).');
  runId=await startEventResearch(url,key);
  console.log('TinyFish run ID: '+runId);
  const deadline=Date.now()+150000;
  while(Date.now()<deadline){
   const result=await readEventResearch(runId,url,key);
   if(result.status==='COMPLETED'){facts=result.facts;break;}
   if(result.status==='FAILED'||result.status==='CANCELLED')throw new Error(result.error);
   await delay(2000);
  }
  if(!facts)throw new Error('The run has not completed. Run ID: '+runId+'. No draft was saved and no second run was started.');
 }
 console.log('\nReturned public facts:\n'+JSON.stringify(facts,null,2));
 if(!selected){
  if(!process.stdin.isTTY)throw new Error('Use --fields to approve specific facts in non-interactive mode.');
  const prompt=createInterface({input:process.stdin,output:process.stdout});
  try{selected=(await prompt.question('\nApprove fields (comma-separated '+fields.join(', ')+'): ')).split(',').map(x=>x.trim()).filter(Boolean);}finally{prompt.close();}
  if(selected.some(x=>!fields.includes(x)))throw new Error('Unknown field. No draft was saved.');
 }
 const draft=createReviewedDraft(facts,selected);
 const folder=path.resolve(values['out-dir']??'.demo/memories');await mkdir(folder,{recursive:true});
 const file=path.join(folder,randomUUID()+'.json');
 const record={researchMode:mode,runId,approvedFields:selected,draft};
 await writeFile(file,JSON.stringify(record,null,2)+'\n',{flag:'wx',mode:0o600});
 const reopened=JSON.parse(await readFile(file,'utf8'));
 if(reopened.draft.body!==draft.body)throw new Error('The saved draft could not be reopened correctly.');
 console.log('\nApproved: '+selected.join(', ')+'\nSaved and reopened: '+file+'\n\n'+reopened.draft.body);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
