import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { initialState } from './engine.ts';
import {validateProtectedContent} from './content-integrity.ts';
import {contentRelease,decodeContentRelease,studyAdditionsRelease,applicationReviewRelease,priorStudyAdditionsRelease} from './content-release.ts';
import {questions as expectedQuestions,clinicalCases as expectedCases,revisedStudyQuestions,applicationReviewedQuestions} from './author-bank.ts';
import studyAdditions from './study-additions-summary.json' with {type:'json'};
const local = await readFile(new URL('./.env.local',import.meta.url),'utf8').catch(()=> '');
const values = Object.fromEntries(local.split(/\r?\n/).filter(line=>line.includes('=')).map(line=>{const index=line.indexOf('=');return [line.slice(0,index),line.slice(index+1).trim()];}));
const url=process.env.VITE_SUPABASE_URL||values.VITE_SUPABASE_URL;
const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY||values.VITE_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key)throw new Error('Configure the Supabase URL and public publishable key first.');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const {data,error}=await client.from('study_states').select('user_id').limit(1);
if(!error||error.code!=='42501'||data!==null)throw new Error(`Expected denied anonymous access; received ${error?.code||'unexpected access'}.`);
console.log('PASS: live Supabase denies anonymous reads of student study records.');
const noAnswers=await client.from('study_content').select('data').limit(1);assert.equal(noAnswers.error?.code,'42501');console.log('PASS: unsigned visitors cannot retrieve questions, answers, rationales, or topic notes.');
const noRelease=await client.from('study_content_releases').select('data').limit(1);assert.equal(noRelease.error?.code,'42501');
const a=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const b=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const run=randomUUID().slice(0,12),nameA=`qa-a-${run}`,nameB=`qa-b-${run}`;
async function signIn(client){const {data,error}=await client.auth.signInAnonymously();assert.equal(error,null,error?.message);assert.ok(data.user?.id);return data.user.id;}
const idA=await signIn(a),idB=await signIn(b);assert.notEqual(idA,idB);
const unclaimed=await a.from('study_content').select('data');assert.equal(unclaimed.error,null);assert.deepEqual(unclaimed.data,[]);console.log('PASS: an anonymous auth token without a claimed username cannot read study content.');
const noClaimRelease=await a.from('study_content_releases').select('id');assert.equal(noClaimRelease.error,null);assert.deepEqual(noClaimRelease.data,[]);
assert.equal((await a.from('study_profiles').insert({user_id:idA,username:nameA})).error,null);
const duplicate=await b.from('study_profiles').insert({user_id:idB,username:nameA.toUpperCase()});
assert.equal(duplicate.error?.code,'23505','Usernames must be case-insensitively unique.');
assert.equal((await b.from('study_profiles').insert({user_id:idB,username:nameB})).error,null);
console.log('PASS: username-only sign-in creates separate identities and rejects duplicate usernames.');
async function readRelease(release,ids){
  const rows=await a.from('study_content_releases').select('id,kind,data').eq('release',release).order('id');
  assert.equal(rows.error,null);
  const manifest=rows.data.find(r=>r.kind==='manifest')?.data;
  const content=await decodeContentRelease(manifest,rows.data.filter(r=>r.kind==='page'),ids);
  return {content,manifest};
}
const releaseStart=performance.now();
const {content}=await readRelease(contentRelease);
assert.deepEqual(content.questions,expectedQuestions);assert.deepEqual(content.cases,expectedCases);
const additions=await readRelease(studyAdditionsRelease);
assert.equal(additions.manifest.digest,studyAdditions.digest);
assert.equal(additions.content.questions.length,studyAdditions.questionCount);
if(revisedStudyQuestions.length)assert.deepEqual(additions.content.questions,revisedStudyQuestions);
console.log(`PASS: loaded and verified ${content.questions.filter(q=>!q.retired).length+additions.content.questions.length} active questions in ${Math.round(performance.now()-releaseStart)} ms.`);
const priorQuestion=applicationReviewedQuestions.find(q=>!q.retired&&q.questionRevision!==5);
const [priorCore,priorAdditions]=await Promise.all([readRelease(applicationReviewRelease,[priorQuestion.id]),readRelease(priorStudyAdditionsRelease,[additions.content.questions[0].id])]);
assert.deepEqual(priorCore.content.questions,[priorQuestion]);
assert.ok(priorAdditions.content.questions[0].questionRevision<6);
console.log('PASS: archived core and supplemental questions are available for saved sessions.');
const withdrawn=await a.from('study_content_releases').select('id').in('release',['2026-11-03-supplemental-1','2026-11-03-supplemental-2','2026-11-03-original-bank-1']);assert.equal(withdrawn.error,null);assert.deepEqual(withdrawn.data,[]);console.log('PASS: withdrawn and superseded candidates are inaccessible to student profiles.');
const releaseWrite=await a.from('study_content_releases').insert({release:contentRelease,id:'forbidden-qa-write',kind:'page',data:''});assert.equal(releaseWrite.error?.code,'42501');
const contentWrite=await a.from('study_content').insert({id:'forbidden-qa-write',kind:'questions',data:[]});assert.equal(contentWrite.error?.code,'42501');console.log('PASS: claimed usernames read the complete verified bank and cannot modify the shared content.');
const stateA=initialState(),stateB=initialState();stateA.profile.name=nameA;stateB.profile.name=nameB;
for(const [owner,id,data]of [[a,idA,stateA],[b,idB,stateB]]){const {error}=await owner.from('study_states').upsert({user_id:id,data});assert.equal(error,null,error?.message);}
for(const [owner,id,other,expected]of [[a,idA,idB,nameA],[b,idB,idA,nameB]]){
  const own=await owner.from('study_states').select('data').eq('user_id',id).single();assert.equal(own.error,null);assert.equal(own.data.data.profile.name,expected);
  const foreign=await owner.from('study_states').select('data').eq('user_id',other);assert.equal(foreign.error,null);assert.deepEqual(foreign.data,[]);
  const foreignName=await owner.from('study_profiles').select('username').eq('user_id',other);assert.equal(foreignName.error,null);assert.deepEqual(foreignName.data,[]);
  const denied=await owner.from('study_states').upsert({user_id:other,data:{...initialState(),profile:{...initialState().profile,name:'unauthorized'}}});assert.equal(denied.error?.code,'42501');
  const forged=await owner.from('study_profiles').insert({user_id:randomUUID(),username:`forged-${run}`});assert.equal(forged.error?.code,'42501');
}
assert.equal((await a.from('study_states').select('data').eq('user_id',idA).single()).data.data.profile.name,nameA);
assert.equal((await b.from('study_states').select('data').eq('user_id',idB).single()).data.data.profile.name,nameB);
console.log('PASS: both profiles can save their own state; cross-profile reads, writes, and identity claims are denied.');
await a.auth.signOut();await b.auth.signOut();
