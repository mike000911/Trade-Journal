import test from 'node:test';
import assert from 'node:assert/strict';
import { accessFor, validateSignup } from '../lib/access.mjs';
import { createHandler } from '../api/handler.mjs';
const id='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002',start=Date.parse('2026-11-13T12:00:00Z');
const user={id,created_at:new Date(start).toISOString(),email_confirmed_at:new Date(start).toISOString()};
process.env.SUPABASE_URL='https://test.example';process.env.SUPABASE_PUBLISHABLE_KEY='test';
function fixture({owner=false,now=start,userValue=user,authError=false}={}){
 const calls=[];const makeClient=()=>({auth:{getUser:async()=>({data:{user:userValue},error:authError}),signUp:async input=>{calls.push(['signup',input]);return {data:{user:userValue,session:null}}},signInWithPassword:async()=>({data:{user:userValue,session:{access_token:'test',expires_in:3600}}})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:owner?{user_id:id}:null,error:null})})})})});
 const journalStorage={loadJournal:async uid=>{calls.push(['read',uid]);return {revision:1,state:{version:2,trades:[],settings:{}}}},saveJournal:async uid=>{calls.push(['write',uid]);return {revision:2}}};
 const handler=createHandler({makeClient,journalStorage,clock:()=>now});
 async function request(path,method='GET',body,headers={}){const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},end(v){this.body=v}};await handler({url:path,method,body,headers:{host:'example.com',origin:'https://example.com',cookie:'__Host-tradebook=test','x-tradebook-user':userValue.id,...headers}},res);return res;}
 return {request,calls};
}
test('exact seven-day boundary, verified email, immutable auth dates, permanent owner',()=>{
 assert.equal(accessFor({...user,user_metadata:{plan:'paid',trialEndsAt:'2099-01-01'}},false,start+7*86400000).active,false);
 assert.equal(accessFor(user,false,start+7*86400000-1).active,true);
 assert.equal(accessFor({...user,email_confirmed_at:null},false,start).active,false);
 assert.equal(accessFor({...user,created_at:'bad'},false,start).active,false);
 assert.equal(accessFor(user,true,start+20*86400000).active,true);
});
test('signup validation',()=>{assert.throws(()=>validateSignup({email:'bad',password:'longpassword123'}));assert.throws(()=>validateSignup({email:'person@example.com',password:'short'}));assert.equal(validateSignup({email:' person@example.com ',password:'longpassword123'}).email,'person@example.com');});
test('public signup and plans show honest terms',async()=>{const f=fixture({authError:true});assert.match((await f.request('/signup')).body,/No card required/);assert.match((await f.request('/plans')).body,/Checkout is not available yet/);});
test('signup awaits confirmation without creating a session',async()=>{const f=fixture();const r=await f.request('/api/signup','POST',{email:'test@example.com',password:'longpassword123'});assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).confirmationRequired,true);assert.equal(r.headers['Set-Cookie'],undefined);assert.equal(f.calls[0][0],'signup');});
test('trial login and save; stale cross-account tab blocked',async()=>{const f=fixture();assert.equal((await f.request('/api/login','POST',{email:'x',password:'x'})).statusCode,200);const body={revision:1,state:{version:2,trades:[],settings:{}}};assert.equal((await f.request('/api/journal','PUT',body)).statusCode,200);assert.deepEqual(f.calls.at(-1),['write',id]);assert.equal((await f.request('/api/journal','PUT',body,{'x-tradebook-user':other})).statusCode,403);assert.equal(f.calls.filter(c=>c[0]==='write').length,1);});
test('expired accounts cannot write, can export and logout',async()=>{const f=fixture({now:start+7*86400000});assert.equal((await f.request('/api/journal','PUT',{revision:1,state:{version:2,trades:[],settings:{}}})).statusCode,402);assert.equal((await f.request('/api/images','POST','anything')).statusCode,402);assert.equal((await f.request('/api/export')).statusCode,200);assert.match((await f.request('/')).body,/Your trial has ended/);assert.equal((await f.request('/api/logout','POST')).statusCode,200);assert.equal(f.calls.some(c=>c[0]==='write'),false);});
test('separate users read own namespaces',async()=>{const f=fixture({userValue:{...user,id:other}});await f.request('/api/journal');assert.deepEqual(f.calls,[['read',other]]);});
test('unauthenticated and cross-origin denied',async()=>{const f=fixture({authError:true});assert.equal((await f.request('/api/journal')).statusCode,401);assert.equal((await f.request('/api/signup','POST',{}, {origin:'https://evil.example'})).statusCode,403);});
test('journal HTML supplies server-selected identity',async()=>{const r=await fixture().request('/');assert.match(r.body,new RegExp('name="tradebook-user" content="'+id+'"'));assert.match(r.body,/name="tradebook-owner" content="false"/);});

test('stale tab cannot read another account cloud data',async()=>{const f=fixture();assert.equal((await f.request('/api/journal','GET',undefined,{'x-tradebook-user':other})).statusCode,403);assert.deepEqual(f.calls,[]);});
