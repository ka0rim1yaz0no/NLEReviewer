import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {createInterface} from 'node:readline/promises';
import {initialState} from './engine.ts';
import {mergeStudyStates} from './sync-state.ts';
const entries=(await readFile(new URL('./.env.local',import.meta.url),'utf8')).split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const n=l.indexOf('=');return[l.slice(0,n),l.slice(n+1).trim()];});
const env=Object.fromEntries(entries),client=()=>createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const owner=client(),a=client(),b=client(),other=client(),unsigned=client();
const checks=[];function pass(text){checks.push(text);console.log('PASS: '+text);}
const directory=new URL('./outputs/device-and-content-review/',import.meta.url);await mkdir(directory,{recursive:true});
let id,aId,bId,otherId,name,run,original,otherData;const input=createInterface({input:process.stdin,output:process.stdout});
if(process.argv.includes('--resume')){
 const meta=JSON.parse(await readFile(new URL('shared-qa-profile.json',directory),'utf8'));
 ({id,aId,bId,otherId,name}=meta);run=name.slice(-8);
 const sessions=JSON.parse(await readFile(new URL('shared-qa-sessions.json',directory),'utf8'));
 for(const [index,c] of [owner,a,b,other].entries()){const r=await c.auth.setSession(sessions[index]);assert.equal(r.error,null);}
 original=initialState();original.profile.name=name;otherData=initialState();otherData.profile.name='qa-private-'+run;
}else{
run=randomUUID().slice(0,8);name='qa-roaming-'+run;
const signup=async c=>{const r=await c.auth.signInAnonymously();assert.equal(r.error,null,r.error?.message);return r.data.user.id;};
[id,aId,bId,otherId]=await Promise.all([owner,a,b,other].map(signup));
for(const [c,uid,username] of [[owner,id,name],[other,otherId,'qa-private-'+run]])assert.equal((await c.from('study_profiles').insert({user_id:uid,username})).error,null);
original=initialState();original.profile.name=name;assert.equal((await owner.from('study_states').insert({user_id:id,data:original})).error,null);
otherData=initialState();otherData.profile.name='qa-private-'+run;assert.equal((await other.from('study_states').insert({user_id:otherId,data:otherData})).error,null);
await writeFile(new URL('shared-qa-enable.sql',directory),`insert into public.study_shared_profiles(profile_id,enabled) values ('${id}',true) on conflict(profile_id) do update set enabled=true; select p.username,s.enabled from public.study_profiles p join public.study_shared_profiles s on p.user_id=s.profile_id where p.user_id='${id}';`);
await writeFile(new URL('shared-qa-disable.sql',directory),`update public.study_shared_profiles set enabled=false where profile_id='${id}'; select enabled from public.study_shared_profiles where profile_id='${id}';`);
await writeFile(new URL('shared-qa-profile.json',directory),JSON.stringify({id,name,otherId,aId,bId}));
await writeFile(new URL('shared-qa-sessions.json',directory),JSON.stringify(await Promise.all([owner,a,b,other].map(async c=>(await c.auth.getSession()).data.session))));console.log('QA owner prepared: '+name+' '+id);await input.question('Enable this isolated QA profile, then press Enter: ');
}
console.log('Owner identity:',JSON.stringify((await owner.rpc('read_study_identity')).data));for(const c of [a,b]){const r=await c.rpc('open_shared_study_profile',{p_username:name.toUpperCase()});assert.equal(r.error,null,r.error?.message);console.log('Shared open result:',JSON.stringify(r.data));assert.equal(r.data[0]?.profile_id,id);assert.equal(r.data[0].shared,true);assert.equal((await c.rpc('read_study_identity')).data[0].profile_id,id);}
pass('Two fresh device identities resolve the same canonical shared profile.');
for(const table of ['study_shared_profiles','study_profile_devices','study_sync_receipts']){assert.equal((await a.from(table).select('*')).error?.code,'42501');}
assert.equal((await a.from('study_shared_profiles').insert({profile_id:otherId,enabled:true})).error?.code,'42501');pass('Clients cannot read or edit sharing mappings or save receipts.');
assert.equal((await unsigned.rpc('open_shared_study_profile',{p_username:name})).error?.code,'42501');
assert.equal((await a.from('study_states').upsert({user_id:id,data:original})).error?.code,'42501');
assert.equal((await a.from('study_profiles').insert({user_id:aId,username:'forged-'+run})).error?.code,'42501');
assert.equal((await other.rpc('open_shared_study_profile',{p_username:name})).error?.code,'42501');pass('Shared profiles require the save RPC; a private identity cannot silently become another owner.');
const read=async c=>{const r=await c.from('study_states').select('data,revision').eq('user_id',id).single();assert.equal(r.error,null,r.error?.message);return {revision:Number(r.data.revision),data:r.data.data};};
const base=await read(a),aState=structuredClone(base.data),bState=structuredClone(base.data);aState.notes.deviceA='A';bState.notes.deviceB='B';aState.studySeconds+=20;bState.studySeconds+=30;
const aClient=randomUUID(),bClient=randomUUID();const save=async(c,data,revision,clientId,seq=1,profile=id)=>c.rpc('save_study_progress',{p_profile_id:profile,p_expected_revision:revision,p_data:data,p_client_id:clientId,p_sequence:seq});
const ar=await save(a,aState,base.revision,aClient);assert.equal(ar.error,null,ar.error?.message);assert.equal(ar.data[0].saved,true);
const conflict=await save(b,bState,base.revision,bClient);assert.equal(conflict.error,null,conflict.error?.message);assert.equal(conflict.data[0].saved,false);
const current=conflict.data[0],merged=mergeStudyStates(base.data,bState,current.data),br=await save(b,merged,Number(current.revision),bClient);assert.equal(br.error,null,br.error?.message);assert.equal(br.data[0].saved,true);
const result=await read(owner);assert.equal(result.data.studySeconds,base.data.studySeconds+50);assert.deepEqual(result.data.notes,{...base.data.notes,deviceA:'A',deviceB:'B'});pass('Concurrent revision conflicts preserve both devices’ notes and add each focus-time delta once.');
const replay=await save(a,aState,base.revision,aClient);assert.equal(replay.error,null,replay.error?.message);assert.equal(replay.data[0].saved,true);assert.equal(Number(replay.data[0].revision),result.revision);assert.equal((await read(a)).data.studySeconds,base.data.studySeconds+50);pass('Retrying an acknowledged operation is idempotent and does not overwrite newer progress.');
const badId=await save(a,aState,result.revision,randomUUID(),1,otherId);assert.equal(badId.error?.code,'42501');
assert.deepEqual((await a.from('study_states').select('data').eq('user_id',otherId)).data,[]);assert.deepEqual((await other.from('study_states').select('data').eq('user_id',id)).data,[]);
assert.equal((await other.from('study_states').upsert({user_id:id,data:otherData})).error?.code,'42501');
assert.equal((await other.from('study_states').select('data').eq('user_id',otherId).single()).data.data.profile.name,'qa-private-'+run);pass('Cross-profile reads, writes and stale profile-ID saves are denied; private progress remains separate.');
const invalid=await save(a,{version:1,profile:{},attempts:[]},result.revision,randomUUID());assert.equal(invalid.error?.code,'22023');pass('Incomplete progress payloads are rejected.');
await writeFile(new URL('shared-backend-results.json',directory),JSON.stringify({checkedAt:new Date().toISOString(),profile:id,checks,passed:true},null,2));
console.log('ALL SHARED BACKEND CHECKS PASSED. Disable isolated QA sharing using the prepared SQL.');input.close();for(const c of [owner,a,b,other])await c.auth.signOut();
