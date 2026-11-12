import assert from 'node:assert/strict';
import {journalApi} from '../worker/journal-api.ts';
const rows=new Map(),files=new Map();
const env={
 DB:{prepare(sql){return {bind(...args){return {
  async first(){return rows.get(args[0])||null},
  async run(){
   if(sql.startsWith('INSERT')){
    if(rows.has(args[0]))return {meta:{changes:0}};
    rows.set(args[0],{revision:1,state_json:args[1]});return {meta:{changes:1}};
   }
   const [state,,user,rev]=args;const row=rows.get(user);
   if(!row||row.revision!==rev)return {meta:{changes:0}};
   rows.set(user,{revision:rev+1,state_json:state});return {meta:{changes:1}};
  }
 }}}}},
 BUCKET:{async put(key,bytes,opts){files.set(key,{body:bytes,httpMetadata:opts.httpMetadata})},async get(key){return files.get(key)}}
};
const request=(path,method='GET',body,user='owner',type='application/json')=>new Request('https://example.test'+path,{method,headers:{...(user?{'oai-authenticated-user-id':user}:{}),'Content-Type':type},...(body===undefined?{}:{body:typeof body==='string'||body instanceof Uint8Array?body:JSON.stringify(body)})});
const state={version:2,trades:[],settings:{},draft:null};
assert.equal((await journalApi(request('/api/journal','GET',undefined,''),env)).status,401);
assert.deepEqual(await (await journalApi(request('/api/journal'),env)).json(),{revision:0,state:null});
assert.equal((await journalApi(request('/api/journal','PUT',{revision:0,state}),env)).status,200);
assert.equal((await journalApi(request('/api/journal','PUT',{revision:0,state}),env)).status,409);
assert.equal((await journalApi(request('/api/journal','PUT',{revision:1,state}),env)).status,200);
assert.equal((await (await journalApi(request('/api/journal','GET',undefined,'other'),env)).json()).state,null);
assert.equal((await journalApi(request('/api/journal','PUT',{revision:2,state:{...state,trades:[{images:[{id:'bad',data:'secret'}]}]}}),env)).status,400);
const image=new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]);
const uploaded=await (await journalApi(request('/api/images','POST',image,'owner','image/png'),env)).json();
assert.match(uploaded.id,/^[a-f0-9]{64}$/);
assert.equal((await journalApi(request(uploaded.url),env)).status,200);
assert.equal((await journalApi(request(uploaded.url,'GET',undefined,'other'),env)).status,404);
assert.equal((await journalApi(request('/api/images','POST',new Uint8Array(12),'owner','image/png'),env)).status,415);
assert.equal((await journalApi(request('/api/images','POST',image,'owner','text/html'),env)).status,415);
const cross=request('/api/journal','PUT',{revision:2,state});cross.headers.set('origin','https://attacker.test');assert.equal((await journalApi(cross,env)).status,403);
console.log('PASS: authentication, user isolation, conflict rejection, image ownership, MIME signatures, cross-origin rejection.');
