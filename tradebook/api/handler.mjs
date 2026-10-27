import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const cookieName = '__Host-tradebook';
const options = { auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false } };
const fail = (message,status=400) => Object.assign(new Error(message),{status});
export function validateState(body) {
  const {revision,state}=body||{};
  if(!Number.isInteger(revision)||revision<0||!state||state.version!==2||!Array.isArray(state.trades)||!state.settings||typeof state.settings!=='object') throw fail('Invalid journal');
  if(Buffer.byteLength(JSON.stringify(state))>1500000) throw fail('Journal exceeds storage limit',413);
  const records=[...state.trades,...(state.draft?.trade?[state.draft.trade]:[])];
  if(records.some(t=>!t||!Array.isArray(t.images)||t.images.length>4||t.images.some(im=>!im||!/^[a-f0-9]{64}$/.test(im.id)||im.data||im.url!=='/api/images/'+im.id))) throw fail('Invalid screenshot metadata');
  return {revision,state:{version:2,trades:state.trades,settings:state.settings,draft:state.draft||null,updatedAt:new Date().toISOString()}};
}
async function rawBody(req,limit) {
  if(Number(req.headers['content-length'])>limit) throw fail('Upload too large',413);
  if(req.body!==undefined) {
    const b=Buffer.isBuffer(req.body)?req.body:Buffer.from(typeof req.body==='string'?req.body:JSON.stringify(req.body));
    if(b.length>limit)throw fail('Upload too large',413); return b;
  }
  const chunks=[];let length=0;
  for await(const chunk of req){length+=chunk.length;if(length>limit)throw fail('Upload too large',413);chunks.push(chunk)}
  return Buffer.concat(chunks);
}
export function validImage(bytes,type) {
  if(bytes.length<12||bytes.length>4194304)return false;
  return type==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:type==='image/webp'&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
}
const loginPage = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · Tradebook</title><link rel="stylesheet" href="/fonts.css"><link rel="stylesheet" href="/style.css"><body><main style="margin:0;min-height:100vh;display:grid;place-items:center;padding:24px"><section class="panel" style="padding:40px;width:min(100%,440px)"><div class="eyebrow">YOUR PRIVATE TRADING DESK</div><h1>tradebook.</h1><p>Sign in to your personal MNQ journal.</p><form id="login"><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><p id="status" role="status"></p><button class="primary">Sign in</button></form><p class="hint">Only the configured owner can access this journal. Your session expires after one hour; saved trades remain in the cloud.</p></section></main><script src="/login.js"></script></body></html>`;
export default async function handler(req,res) {
  res.setHeader('Cache-Control','private, no-store');
  const json=(value,status=200)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};
  const html=value=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(value)};
  try {
    const requestUrl=new URL(req.url,'https://localhost');
    const path=requestUrl.searchParams.get('route')||requestUrl.pathname;
    if(!['GET','POST','PUT'].includes(req.method))throw fail('Method not allowed',405);
    if(req.method!=='GET') {
      // A browser must supply its origin for every mutation, including login.
      const origin=req.headers.origin; const host=req.headers.host;
      if(!origin||new URL(origin).host!==host||new URL(origin).protocol!=='https:')throw fail('Invalid origin',403);
    }
    if(path==='/login'&&req.method==='GET')return html(loginPage);
    const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key)throw fail('Private cloud setup is not complete yet.',503);
    const auth=createClient(url,key,options);
    if(path==='/api/login'&&req.method==='POST') {
      const input=JSON.parse((await rawBody(req,8192)).toString());
      const {data,error}=await auth.auth.signInWithPassword({email:input.email,password:input.password});
      if(error||!data.session)throw fail('Unable to sign in. Check your credentials.',401);
      const client=createClient(url,key,{...options,global:{headers:{Authorization:`Bearer ${data.session.access_token}`}}});
      const owner=await client.from('tradebook_owner').select('user_id').eq('user_id',data.user.id).maybeSingle();
      if(owner.error||!owner.data)throw fail('This account is not the journal owner.',403);
      res.setHeader('Set-Cookie',`${cookieName}=${data.session.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.min(data.session.expires_in,3600)}`);
      return json({ok:true});
    }
    const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
    const {data,error}=token?await auth.auth.getUser(token):{data:{user:null},error:true};
    if(error||!data.user){if(path==='/'&&req.method==='GET')return html(loginPage);throw fail('Sign in to sync your private journal.',401)}
    const user=data.user.id;
    const client=createClient(url,key,{...options,global:{headers:{Authorization:`Bearer ${token}`}}});
    const owner=await client.from('tradebook_owner').select('user_id').eq('user_id',user).maybeSingle();
    if(owner.error||!owner.data)throw fail('Owner access required.',403);
    if(path==='/'&&req.method==='GET')return html(await readFile(new URL('../journal/index.html',import.meta.url),'utf8'));
    if(path==='/api/logout'&&req.method==='POST') {
      // Removing the HttpOnly session cookie prevents further browser requests.
      res.setHeader('Set-Cookie',`${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
      return json({ok:true});
    }
    if(path==='/api/journal') {
      if(req.method==='GET') {
        const {data,error}=await client.from('tradebook_journals').select('revision,state').eq('user_id',user).maybeSingle();
        if(error)throw fail('Unable to load the cloud journal.',503);return json(data||{revision:0,state:null});
      }
      if(req.method!=='PUT')throw fail('Method not allowed',405);
      const {revision,state}=validateState(JSON.parse((await rawBody(req,1550000)).toString()));
      const row={user_id:user,revision:revision+1,state,updated_at:new Date().toISOString()};
      const result=revision===0?await client.from('tradebook_journals').insert(row).select('revision'):await client.from('tradebook_journals').update(row).eq('user_id',user).eq('revision',revision).select('revision');
      if(result.error?.code==='23505'||(!result.error&&!result.data.length))throw fail('Another device updated the journal. Choose which copy to keep.',409);
      if(result.error)throw fail('Unable to save the cloud journal.',503);return json({revision:revision+1});
    }
    const match=path.match(/^\/api\/images\/([a-f0-9]{64})$/);
    if(match&&req.method==='GET') {
      const {data,error}=await client.storage.from('tradebook-charts').download(user+'/'+match[1]);
      if(error)throw fail('Screenshot unavailable.',404);
      res.setHeader('Content-Type',data.type);return res.end(Buffer.from(await data.arrayBuffer()));
    }
    if(path==='/api/images'&&req.method==='POST') {
      const type=req.headers['content-type'];const bytes=await rawBody(req,4194304);
      if(!validImage(bytes,type))throw fail('Use a PNG, JPEG or WebP screenshot up to 4 MB.',415);
      const id=createHash('sha256').update(bytes).digest('hex');
      const {error}=await client.storage.from('tradebook-charts').upload(user+'/'+id,bytes,{contentType:type,upsert:true});
      if(error)throw fail('Unable to save screenshot.',503);return json({id,url:'/api/images/'+id});
    }
    throw fail('Not found',404);
  }catch(error){json({error:error.status?error.message:'Request could not be completed.'},error.status||500)}
}
