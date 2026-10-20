import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,readdir,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('recorded CLI persists and reopens only approved facts with explicit capture mode',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'schema-demo-'));
 try{
  const {stdout}=await promisify(execFile)(process.execPath,['scripts/demo-tinyfish.mjs','--example','--fields','title,venue','--out-dir',dir],{cwd:new URL('../',import.meta.url)});
  assert.match(stdout,/RECORDED TINYFISH RESULT/);assert.match(stdout,/Saved and reopened:/);
  const files=await readdir(dir);assert.equal(files.length,1);
  const saved=JSON.parse(await readFile(path.join(dir,files[0]),'utf8'));
  assert.equal(saved.researchMode,'recorded');assert.deepEqual(saved.approvedFields,['title','venue']);
  assert.match(saved.draft.body,/PyCon US 2026/);assert.match(saved.draft.body,/Long Beach Convention Center/);
  assert.match(saved.draft.body,/Source: https:\/\/us.pycon.org\/2026\//);assert.match(saved.draft.body,/Retrieved: 2026-10-20/);
  assert.doesNotMatch(saved.draft.body,/Tutorials|AI Track|Event date:/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
