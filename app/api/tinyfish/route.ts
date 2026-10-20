import {getRequestContext} from '#schema-platform';
import {checkOrigin,json} from '@/lib/server/service.mjs';
import {parsePublicUrl, issueRunToken, verifyRunToken} from '@/lib/tinyfish/context.mjs';

import {startEventResearch,readEventResearch} from '@/lib/tinyfish/provider.mjs';

export const dynamic='force-dynamic';
const blocked=(message:string,status=400)=>json({error:message},status);

async function route(req:Request){
 let ctx:any;
 try{
  ctx=await getRequestContext(req);
  let userId:string|null=null;let userEmail:string|null=null;
  if(ctx.mode==='customer'){
    const {data,error}=await ctx.client.auth.getUser();
    if(!error&&data?.user?.email_confirmed_at){userId=data.user.id;userEmail=data.user.email??null;}
  }else {userId=ctx.user?.userId??null;userEmail=ctx.user?.email??null;}
  if(!userId)return blocked('Sign in to research an event.',401);
  if(ctx.mode!=='customer')return blocked('Use an isolated customer demo host for TinyFish.',503);
  if(ctx.env.TINYFISH_ENABLED!=='true'||!ctx.env.TINYFISH_API_KEY)return blocked('TinyFish is not configured for this copy yet.',503);
  // Hackathon-only allowlist keeps API spend bounded to authorized demo accounts.
  const allowed=String(ctx.env.TINYFISH_ALLOWED_EMAILS??'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!allowed.length)return blocked('Set TINYFISH_ALLOWED_EMAILS before enabling the demo.',503);
  if(!userEmail||!allowed.includes(userEmail.toLowerCase()))return blocked('TinyFish demo is limited to approved accounts.',403);
  const key=ctx.env.TINYFISH_API_KEY as string;
  if(req.method==='POST'){
    checkOrigin(req);
    if(Number(req.headers.get('content-length'))>3000)return blocked('Request too large.',413);
    let payload:any;try{payload=await req.json()}catch{return blocked('Invalid request body.');}
    const url=parsePublicUrl(payload?.url);
    if(JSON.stringify(payload).length>3000)return blocked('Request too large.',413);
    const {error:quotaError}=await ctx.client.rpc('schema_hackathon_reserve',{p_kind:'tinyfish'});
    if(quotaError)return blocked(quotaError.code==='PT429'?'Daily event research limit reached.':'Apply the isolated demo quota migration before TinyFish usage.',quotaError.code==='PT429'?429:503);
    // Only a PUBLIC link and a fixed, task-scoped goal are sent to TinyFish.
    const runId=await startEventResearch(url,key);
    const token=await issueRunToken(runId,userId,key,url);
    return ctx.finish(json({token,sourceUrl:url,status:'RUNNING'}));
  }
  if(req.method==='GET'){
    const search=new URL(req.url).searchParams;
    const token=search.get('token')??'';
    const {runId,sourceUrl}=await verifyRunToken(token,userId,key);
    return ctx.finish(json(await readEventResearch(runId,sourceUrl,key)));
  }
  return blocked('Method not allowed.',405);
 }catch(e:any){
   if(e?.name==='TimeoutError'||e?.name==='AbortError')return blocked('TinyFish is taking longer than expected. Try checking again.',504);
   // Keep provider and user-private errors out of public responses.
   const msg=typeof e?.message==='string'&&(/public|session|structured|expired|verifiable|Invalid|valid event/.test(e.message))?e.message:'Unable to research that event right now.';
   return blocked(msg,400);
 }
}
export {route as POST,route as GET};
