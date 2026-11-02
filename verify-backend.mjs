import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { initialState } from './engine.ts';
const local = await readFile(new URL('./.env.local',import.meta.url),'utf8').catch(()=> '');
const values = Object.fromEntries(local.split(/\r?\n/).filter(line=>line.includes('=')).map(line=>{const index=line.indexOf('=');return [line.slice(0,index),line.slice(index+1).trim()];}));
const url=process.env.VITE_SUPABASE_URL||values.VITE_SUPABASE_URL;
const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY||values.VITE_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key)throw new Error('Configure the Supabase URL and public publishable key first.');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const {data,error}=await client.from('study_states').select('user_id').limit(1);
if(!error||error.code!=='42501'||data!==null)throw new Error(`Expected denied anonymous access; received ${error?.code||'unexpected access'}.`);
console.log('PASS: live Supabase denies anonymous reads of student study records.');
const a=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const b=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const run=randomUUID().slice(0,12),nameA=`qa-a-${run}`,nameB=`qa-b-${run}`;
async function signIn(client){const {data,error}=await client.auth.signInAnonymously();assert.equal(error,null,error?.message);assert.ok(data.user?.id);return data.user.id;}
const idA=await signIn(a),idB=await signIn(b);assert.notEqual(idA,idB);
assert.equal((await a.from('study_profiles').insert({user_id:idA,username:nameA})).error,null);
const duplicate=await b.from('study_profiles').insert({user_id:idB,username:nameA.toUpperCase()});
assert.equal(duplicate.error?.code,'23505','Usernames must be case-insensitively unique.');
assert.equal((await b.from('study_profiles').insert({user_id:idB,username:nameB})).error,null);
console.log('PASS: username-only sign-in creates separate identities and rejects duplicate usernames.');
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
