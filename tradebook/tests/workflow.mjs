import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
import {indexedDB} from 'fake-indexeddb';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),math=require('../public/analytics.js');
for(const [instrument,tick,value] of [['MNQ',.25,.5],['NQ',.25,5],['MES',.25,1.25],['ES',.25,12.5],['YM',1,5],['GC',.1,10],['MGC',.1,1],['CL',.01,10],['MCL',.01,1]]){
 for(const direction of ['long','short']){
 const sign=direction==='long'?1:-1,t={instrument,direction,entry:100,stop:100-sign*tick*4,target:100+sign*tick*8,exit:100+sign*tick*2,contracts:3,fees:1,status:'closed'};
 assert.equal(math.result(t).gross,value*6,instrument);assert.equal(math.result(t).net,value*6-1);assert.equal(math.result(t).risk,value*12);assert(math.validPrice(t.exit,t));assert(!math.validPrice(100+tick/2,t));
 }
}
assert.equal(math.result({entry:100,stop:99,target:102,exit:101,contracts:1,status:'closed'}).gross,2);
assert.throws(()=>math.specification({instrument:'INVALID'}));
assert(math.validPrice(-10.01,{instrument:'CL'}));
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const html=readFileSync(new URL('../journal/index.html',import.meta.url),'utf8');
const dom=new JSDOM(html,{url:'https://journal.test/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
const w=dom.window;const identity=w.document.createElement('meta');identity.name='tradebook-user';identity.content='00000000-0000-4000-8000-000000000001';w.document.head.append(identity);const ownerMeta=w.document.createElement('meta');ownerMeta.name='tradebook-owner';ownerMeta.content='true';w.document.head.append(ownerMeta);w.indexedDB=indexedDB;w.structuredClone=structuredClone;w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;
let remote=null,revision=0;
w.fetch=async(url,opts={})=>{if(url==='/api/journal'){if(opts.method==='PUT'){const p=JSON.parse(opts.body);remote=p.state;revision++;return {ok:true,json:async()=>({revision})}}return {ok:true,json:async()=>({state:remote,revision})}};throw Error('Unexpected URL '+url)};
for(const script of w.document.querySelectorAll('script[src]'))vm.runInContext(readFileSync(new URL('../public/'+script.getAttribute('src'),import.meta.url),'utf8'),dom.getInternalVMContext());
await new Promise(resolve=>setTimeout(resolve,150));
assert(w.eval('ready'),'App boots');assert.equal(w.document.querySelector('#tradeForm').dataset.entryMode,'quick');
const set=(id,value)=>{const el=w.document.getElementById(id);el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));};
set('instrument','GC');assert.equal(w.document.getElementById('entry').step,'0.1');
set('tradeDate','2026-10-28');
const plan=w.document.getElementById('planPremarket');plan.value='Wait for a sweep';plan.dispatchEvent(new w.Event('input',{bubbles:true}));
await new Promise(resolve=>setTimeout(resolve,550));
assert.equal(w.eval("settings.dailyPlans['2026-10-28|GC'].premarket"),'Wait for a sweep');
w.document.getElementById('attachPlan').click();assert.equal(w.document.getElementById('premarket').value,'Wait for a sweep');
const snapshot=w.document.getElementById('planSnapshot').value;
plan.value='A revised plan';plan.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(w.document.getElementById('planSnapshot').value,snapshot);
assert.equal(w.document.getElementById('check_premarket').value,'pending','Plan never checks rules automatically');
w.eval("loadForm({status:'open',direction:'long',images:[],reason:'Legacy MNQ'},null)");assert.equal(w.document.getElementById('instrument').value,'MNQ','Legacy edit uses MNQ, not last selected');
assert.equal(w.document.getElementById('entry').step,'0.25');
w.eval("trades=[{id:'a',instrument:'GC',status:'closed',direction:'long',entry:100,stop:99,target:102,exit:101,contracts:1,images:[],entryTime:'2026-10-28T10:00',exitTime:'2026-10-28T10:05'},{id:'b',status:'closed',direction:'long',entry:100,stop:99,target:102,exit:101,contracts:1,images:[],entryTime:'2026-10-28T11:00',exitTime:'2026-10-28T11:05'}];render()");
set('dashboardInstrument','GC');assert.equal(w.eval('filtered().list.length'),1);assert.equal(w.document.getElementById('total').textContent,'$100.00');
set('historyInstrument','MNQ');assert.equal(w.document.querySelectorAll('#rows tr').length,1);assert(w.document.querySelector('#rows').textContent.includes('MNQ'));
assert(w.eval('csvData()').includes('instrument'));assert(w.eval('csvData()').includes('"GC"'));
const restored=w.eval('cleanWorkflowSettings(settings)');assert.equal(restored.dailyPlans['2026-10-28|GC'].premarket,'A revised plan');
w.document.getElementById('detailedMode').click();assert.equal(w.document.querySelector('#tradeForm').dataset.entryMode,'detailed');
await new Promise(resolve=>setTimeout(resolve,900));await w.eval('queue');assert.deepEqual(errors,[]);w.close();console.log('PASS: all nine instruments, legacy MNQ, quick entry, daily plan persistence/snapshots, filters, CSV and unchanged checklist.');

