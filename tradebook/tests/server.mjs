import test from 'node:test';
import assert from 'node:assert/strict';
import handler,{validateState,validImage} from '../api/handler.mjs';
const state={version:2,trades:[],settings:{},draft:null};
test('snapshot validation rejects foreign screenshot paths and embedded content',()=>{
 assert.equal(validateState({revision:0,state}).revision,0);
 assert.throws(()=>validateState({revision:-1,state}));
 const image={id:'a'.repeat(64),url:'https://external.example/chart'};
 assert.throws(()=>validateState({revision:0,state:{...state,trades:[{images:[image]}]}}));
 assert.throws(()=>validateState({revision:0,state:{...state,trades:[{images:[{...image,url:'/api/images/'+image.id,data:'data:image/png,...'}]}]}}));
});
test('image content and size are checked',()=>{
 const png=Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]);
 assert.equal(validImage(png,'image/png'),true);
 assert.equal(validImage(png,'image/jpeg'),false);
 assert.equal(validImage(Buffer.alloc(4194305),'image/png'),false);
});
test('cross-origin mutations are denied before cloud access',async()=>{
 let payload;const res={setHeader(){},end(value){payload=JSON.parse(value)}};
 await handler({url:'/api/login',method:'POST',headers:{origin:'https://attacker.example',host:'journal.example'}},res);
 assert.equal(res.statusCode,403);assert.equal(payload.error,'Invalid origin');
});
