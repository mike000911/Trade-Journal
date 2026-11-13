import { accessFor, validateSignup } from '../lib/access.mjs';
import { authPage, plansPage, accountPage } from '../lib/pages.mjs';
import { storage } from '../lib/storage.mjs';
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
export function createHandler({ makeClient = createClient, journalStorage = storage, clock = Date.now } = {}) {
return async function handler(req,res) {
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
    if(path==='/login'&&req.method==='GET')return html(authPage());
    if(path==='/signup'&&req.method==='GET')return html(authPage(true));
    if(path==='/plans'&&req.method==='GET')return html(plansPage());
    const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key)throw fail('Private cloud setup is not complete yet.',503);
    const auth=makeClient(url,key,options);
    const setSession = session => res.setHeader('Set-Cookie',`${cookieName}=${session.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.min(session.expires_in,3600)}`);
    if(path==='/api/signup'&&req.method==='POST') {
      const input=validateSignup(JSON.parse((await rawBody(req,8192)).toString()));
      const {data,error}=await auth.auth.signUp({...input,options:{emailRedirectTo:'https://mnq-tradebook.vercel.app/login'}});
      if(error)throw fail(error.status===429?'Too many attempts. Please wait before trying again.':'Unable to create an account. Please try again later or sign in if you already registered.',error.status===429?429:400);
      if(data.session){setSession(data.session);return json({ok:true,redirect:'/'});}
      return json({ok:true,confirmationRequired:true});
    }
    if(path==='/api/login'&&req.method==='POST') {
      const input=JSON.parse((await rawBody(req,8192)).toString());
      const {data,error}=await auth.auth.signInWithPassword({email:input.email,password:input.password});
      if(error||!data.session)throw fail('Unable to sign in. Check your credentials.',401);
      setSession(data.session);
      return json({ok:true});
    }
    const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
    const {data,error}=token?await auth.auth.getUser(token):{data:{user:null},error:true};
    if(error||!data.user){if(['/','/account'].includes(path)&&req.method==='GET')return html(authPage());throw fail('Sign in to sync your private journal.',401)}
    const user=data.user.id;
    const client=makeClient(url,key,{...options,global:{headers:{Authorization:`Bearer ${token}`}}});
    const owner=await client.from('tradebook_owner').select('user_id').eq('user_id',user).maybeSingle();
    if(owner.error)throw fail('Unable to verify account access. Please retry.',503);
    const access=accessFor(data.user,Boolean(owner.data),clock());
    if(path==='/api/account'&&req.method==='GET')return json({userId:user,...access});
    if(path==='/account'&&req.method==='GET')return html(accountPage(access));
    if(path==='/'&&req.method==='GET'){
      if(!access.active)return html(accountPage(access));
      const page=await readFile(new URL('../journal/index.html',import.meta.url),'utf8');
      // UUID and fixed enum only: never interpolate editable profile fields into HTML.
      if(!/^[a-f0-9-]{36}$/.test(user))throw fail('Invalid account.',403);
      return html(page.replace('<head>',`<head><meta name="tradebook-user" content="${user}"><meta name="tradebook-owner" content="${access.plan==='owner'}">`));
    }
    if(path==='/api/logout'&&req.method==='POST') {
      // Removing the HttpOnly session cookie prevents further browser requests.
      res.setHeader('Set-Cookie',`${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
      return json({ok:true});
    }
    if(['/api/journal','/api/images'].includes(path) && req.headers['x-tradebook-user'] && req.headers['x-tradebook-user']!==user)throw fail('Your signed-in account changed. Reload the page before continuing.',403);
    if(path==='/api/export'&&req.method==='GET'){
      res.setHeader('Content-Disposition','attachment; filename="tradebook-journal.json"');
      const saved=await journalStorage.loadJournal(user,client);
      return json(saved.state||{version:2,trades:[],settings:{},draft:null});
    }
    if(req.method!=='GET' && ['/api/journal','/api/images'].includes(path)) {
      if(req.headers['x-tradebook-user']!==user)throw fail('Your signed-in account changed. Reload the page before saving.',403);
      if(!access.active)throw fail('Your 7-day trial has ended. Your journal is preserved. Visit Membership for details.',402);
    }
    if(path==='/api/journal') {
      if(req.method==='GET') {
        return json(await journalStorage.loadJournal(user, client));
      }
      if(req.method!=='PUT')throw fail('Method not allowed',405);
      const {revision,state}=validateState(JSON.parse((await rawBody(req,1550000)).toString()));
      return json(await journalStorage.saveJournal(user, client, revision, state));
    }
    const match=path.match(/^\/api\/images\/([a-f0-9]{64})$/);
    if(match&&req.method==='GET') {
      const image = await journalStorage.loadImage(user, match[1], client);
      res.setHeader('Content-Type',image.type);return res.end(image.bytes);
    }
    if(path==='/api/images'&&req.method==='POST') {
      const type=req.headers['content-type'];const bytes=await rawBody(req,4194304);
      if(!validImage(bytes,type))throw fail('Use a PNG, JPEG or WebP screenshot up to 4 MB.',415);
      const id=createHash('sha256').update(bytes).digest('hex');
      return json(await journalStorage.saveImage(user, id, bytes, type));
    }
    throw fail('Not found',404);
  }catch(error){json({error:error.status?error.message:'Request could not be completed.'},error.status||500)}
};
}
export default createHandler();
