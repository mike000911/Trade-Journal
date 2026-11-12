const response = (data: unknown, status = 200) => Response.json(data, {status, headers: {'Cache-Control':'no-store'}});
const MAX_STATE = 1500000;
export async function journalApi(req: Request, env: Cloudflare.Env) {
  const user = req.headers.get('oai-authenticated-user-id');
  if (!user) return response({error:'Sign in to sync your private journal.'},401);
  const url = new URL(req.url);
  if (!['GET','PUT','POST'].includes(req.method)) return response({error:'Method not allowed'},405);
  if(req.method !== 'GET') {
    const origin=req.headers.get('origin');
    if (origin && origin !== url.origin) return response({error:'Invalid origin'},403);
  }
  if (url.pathname === '/api/journal') {
    if(!env.DB) return response({error:'Cloud database unavailable'},503);
    if(req.method==='GET') {
      const row=await env.DB.prepare('SELECT revision, state_json FROM journals WHERE user_id = ?').bind(user).first<{revision:number,state_json:string}>();
      return response(row?{revision:row.revision,state:JSON.parse(row.state_json)}:{revision:0,state:null});
    }
    if(req.method!=='PUT')return response({error:'Method not allowed'},405);
    const raw=await req.text();
    if(new TextEncoder().encode(raw).length>MAX_STATE)return response({error:'Journal is too large. Export a backup before archiving older trades.'},413);
    let body;try{body=JSON.parse(raw)}catch{return response({error:'Invalid JSON'},400)}
    const {revision,state}=body;
    if(!Number.isInteger(revision)||revision<0||!state||state.version!==2||!Array.isArray(state.trades)||typeof state.settings!=='object')return response({error:'Invalid journal'},400);
    const records=[...state.trades,...(state.draft?.trade?[state.draft.trade]:[])];
    if(records.some(t=>!t||typeof t!=='object'||!Array.isArray(t.images)||t.images.length>4||t.images.some((im:any)=>!im||!/^[a-f0-9]{64}$/.test(im.id)||im.data||im.url!=='/api/images/'+im.id))) return response({error:'Invalid screenshot metadata'},400);
    const content=JSON.stringify({version:2,trades:state.trades,settings:state.settings,draft:state.draft||null,updatedAt:new Date().toISOString()});
    const statement=revision===0?env.DB.prepare('INSERT OR IGNORE INTO journals (user_id,revision,state_json,updated_at) VALUES (?,1,?,?)').bind(user,content,new Date().toISOString()):env.DB.prepare('UPDATE journals SET revision=revision+1, state_json=?, updated_at=? WHERE user_id=? AND revision=?').bind(content,new Date().toISOString(),user,revision);
    const result=await statement.run();
    if(result.meta.changes!==1)return response({error:'Another device updated this journal. Choose which copy to keep.'},409);
    return response({revision:revision+1});
  }
  const imageMatch=url.pathname.match(/^\/api\/images\/([a-f0-9]{64})$/);
  if(imageMatch && req.method==='GET'){
    if(!env.BUCKET)return response({error:'Image storage unavailable'},503);
    const object=await env.BUCKET.get(encodeURIComponent(user)+'/'+imageMatch[1]);
    if(!object)return response({error:'Image not found'},404);
    return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(url.pathname==='/api/images'&&req.method==='POST'){
    if(!env.BUCKET)return response({error:'Image storage unavailable'},503);
    const type=req.headers.get('content-type')||'';
    if(!['image/png','image/jpeg','image/webp'].includes(type))return response({error:'Unsupported image'},415);
    if(Number(req.headers.get('content-length'))>5*1024*1024)return response({error:'Image exceeds 5 MB'},413);
    const bytes=await req.arrayBuffer(),b=new Uint8Array(bytes);
    if(bytes.byteLength>5*1024*1024||bytes.byteLength<12)return response({error:'Invalid image size'},413);
    const valid=type==='image/png'?b.slice(0,8).join(',')==='137,80,78,71,13,10,26,10':type==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';
    if(!valid)return response({error:'Image content does not match its type'},415);
    const hash=await crypto.subtle.digest('SHA-256',bytes),id=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
    await env.BUCKET.put(encodeURIComponent(user)+'/'+id,bytes,{httpMetadata:{contentType:type}});
    return response({id,url:'/api/images/'+id});
  }
  return response({error:'Not found'},404);
}
